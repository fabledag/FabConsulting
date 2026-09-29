'use strict';

/**
 * Payment handling for Mercado Pago Checkout Pro.
 *
 * Two responsibilities:
 *   1. Hand a checkout URL to a customer who wants to pay.
 *   2. Receive the webhook and confirm what was paid for.
 *
 * SECURITY
 * The webhook is a public, unauthenticated endpoint. Two rules make it safe:
 *   - Every notification's signature is verified (utils/mercadopago.js).
 *   - The payment's status is re-read from Mercado Pago's API. The webhook body
 *     is only ever used to learn *which* payment to go and check — its contents
 *     are never trusted, so a forged "approved" achieves nothing.
 *
 * IDEMPOTENCY
 * Mercado Pago retries notifications, and sends several for one payment as it
 * changes state. Confirming twice would double-count a Mentoría credit or
 * re-send invitations, so every transition is guarded by a conditional write
 * that only applies when the record isn't already in the target state.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const { createPreference, getPayment, verifyWebhookSignature, isConfigured } = require('../utils/mercadopago');
const { sendBookingInvites } = require('../utils/bookingCalendar');
const { createNotification } = require('../utils/notify');
const { sendEmail, emailLayout, escapeHtml, SITE_URL } = require('../utils/email');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE;
const PACKAGES_TABLE = process.env.PACKAGES_TABLE;

const SERVICE_PRICES = {
  session: 500,
  cv: 600,
  portfolio: 700,
  mock: 550,
  mentoria: 1800,
};

const SERVICE_LABELS = {
  session: 'Conversación estratégica 1:1',
  cv: 'Revisión de CV y LinkedIn',
  portfolio: 'Revisión de portafolio o book',
  mock: 'Simulación de entrevista',
  mentoria: 'Mentoría — 4 sesiones en 6 meses',
};


/**
 * Looks a booking up by its id.
 *
 * Uses the `id-index` GSI rather than a filtered Scan. The original version did
 * `Scan` + `FilterExpression` + `Limit: 1`, which looks right and is not:
 * DynamoDB applies Limit BEFORE the filter, so it examined one arbitrary item,
 * filtered it out, and reported the booking as missing. With a single row in
 * the table it happened to work; with three, paid bookings silently failed to
 * confirm.
 */
async function findBookingById(bookingId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: BOOKINGS_TABLE,
      IndexName: 'id-index',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': bookingId },
    })
  );
  return (result.Items || [])[0] || null;
}

/* ── Creating a checkout ────────────────────────────────────────────────── */

/**
 * POST /me/payments/checkout
 * Body: { bookingId } or { packageId }
 *
 * Prices come from this file, never from the request — otherwise a customer
 * could post their own amount and pay $1 for a $1,800 package.
 */
async function createCheckout(email, body) {
  if (!isConfigured()) {
    return { statusCode: 503, body: { error: 'Los pagos en línea no están disponibles por ahora. Escríbeme y lo resolvemos.' } };
  }
  if (!body || (!body.bookingId && !body.packageId)) {
    return { statusCode: 400, body: { error: 'Falta la referencia de lo que vas a pagar.' } };
  }

  try {
    if (body.bookingId) {
      const booking = await findBookingById(body.bookingId);
      if (!booking) return { statusCode: 404, body: { error: 'No encontramos esa reserva.' } };
      if (booking.email !== email) {
        return { statusCode: 403, body: { error: 'Esta reserva no está asociada a tu cuenta.' } };
      }
      if (booking.status === 'confirmed') {
        return { statusCode: 409, body: { error: 'Esta sesión ya está confirmada.' } };
      }
      if (booking.status === 'cancelled') {
        return { statusCode: 409, body: { error: 'Esta reserva está cancelada.' } };
      }

      const price = SERVICE_PRICES[booking.service];
      if (!price) return { statusCode: 400, body: { error: 'No pudimos determinar el precio de esta sesión.' } };

      const { preferenceId, checkoutUrl } = await createPreference({
        title: SERVICE_LABELS[booking.service] || 'Sesión',
        description: `${booking.date} a las ${booking.time} (hora CDMX)`,
        amountMXN: price,
        externalReference: booking.id,
        payerEmail: email,
        payerName: booking.name,
        kind: 'booking',
      });

      await ddb.send(
        new UpdateCommand({
          TableName: BOOKINGS_TABLE,
          Key: { id: booking.id, date: booking.date },
          UpdateExpression: 'SET mpPreferenceId = :p, updatedAt = :now',
          ExpressionAttributeValues: { ':p': preferenceId, ':now': new Date().toISOString() },
        })
      );

      return { statusCode: 200, body: { checkoutUrl, preferenceId } };
    }

    // Package (Mentoría)
    const pkgResult = await ddb.send(new GetCommand({ TableName: PACKAGES_TABLE, Key: { id: body.packageId } }));
    const pkg = pkgResult.Item;
    if (!pkg) return { statusCode: 404, body: { error: 'No encontramos ese paquete.' } };
    if (pkg.email !== email) {
      return { statusCode: 403, body: { error: 'Este paquete no está asociado a tu cuenta.' } };
    }
    if (pkg.status === 'active') {
      return { statusCode: 409, body: { error: 'Este paquete ya está activo.' } };
    }

    const { preferenceId, checkoutUrl } = await createPreference({
      title: SERVICE_LABELS.mentoria,
      description: '4 sesiones de 60 minutos, a lo largo de 6 meses',
      amountMXN: SERVICE_PRICES.mentoria,
      externalReference: pkg.id,
      payerEmail: email,
      kind: 'package',
    });

    await ddb.send(
      new UpdateCommand({
        TableName: PACKAGES_TABLE,
        Key: { id: pkg.id },
        UpdateExpression: 'SET mpPreferenceId = :p, updatedAt = :now',
        ExpressionAttributeValues: { ':p': preferenceId, ':now': new Date().toISOString() },
      })
    );

    return { statusCode: 200, body: { checkoutUrl, preferenceId } };
  } catch (err) {
    console.error('createCheckout error:', err);
    return { statusCode: 500, body: { error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' } };
  }
}

/* ── Webhook ────────────────────────────────────────────────────────────── */

/**
 * POST /payments/webhook
 *
 * Always answers 200, even when ignoring the notification: a non-2xx makes
 * Mercado Pago retry for hours, and there is nothing to retry for a duplicate
 * or an irrelevant event.
 */
async function handleWebhook({ body, headers, queryParams }) {
  const ok = { statusCode: 200, body: { received: true } };

  try {
    const type = body?.type || body?.topic || queryParams?.type;
    if (type !== 'payment') return ok; // merchant_order etc. — nothing to do

    const dataId = body?.data?.id || queryParams?.['data.id'] || queryParams?.id;
    if (!dataId) return ok;

    const lower = Object.fromEntries(Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    const valid = verifyWebhookSignature({
      signatureHeader: lower['x-signature'],
      requestId: lower['x-request-id'],
      dataId,
    });
    if (!valid) {
      console.warn('[mp] firma inválida, notificación descartada:', dataId);
      return ok; // don't tell a prober whether it guessed right
    }

    // Authoritative state — the notification body is never trusted.
    const payment = await getPayment(dataId);
    if (payment.status !== 'approved') {
      console.log(`[mp] pago ${dataId} en estado ${payment.status}, sin acción.`);
      return ok;
    }

    const reference = payment.external_reference;
    const kind = payment.metadata?.kind || 'booking';
    if (!reference) {
      console.warn('[mp] pago aprobado sin external_reference:', dataId);
      return ok;
    }

    if (kind === 'package') await confirmPackage(reference, payment);
    else await confirmBooking(reference, payment);

    return ok;
  } catch (err) {
    console.error('handleWebhook error:', err);
    return ok; // swallow: retries won't fix a bug, and MP would hammer us
  }
}

/** Marks a booking confirmed exactly once, then sends the calendar invites. */
async function confirmBooking(bookingId, payment) {
  const booking = await findBookingById(bookingId);
  if (!booking) {
    console.warn('[mp] pago aprobado para una reserva inexistente:', bookingId);
    return;
  }
  if (booking.status === 'cancelled') {
    console.warn('[mp] pago aprobado para una reserva cancelada:', bookingId);
    return;
  }

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: BOOKINGS_TABLE,
        Key: { id: booking.id, date: booking.date },
        UpdateExpression: 'SET #status = :confirmed, mpPaymentId = :pid, paidAt = :now, updatedAt = :now',
        // The guard that makes this idempotent: a repeat notification finds the
        // booking already confirmed and stops here.
        ConditionExpression: '#status <> :confirmed',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':confirmed': 'confirmed',
          ':pid': String(payment.id),
          ':now': new Date().toISOString(),
        },
      })
    );
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.log('[mp] reserva ya confirmada, notificación duplicada ignorada:', bookingId);
      return;
    }
    throw err;
  }

  await sendBookingInvites(
    { ...booking, status: 'confirmed' },
    { durationMinutes: booking.durationMinutes || 60 }
  );

  await createNotification(booking.email, {
    type: 'booking_confirmed',
    title: 'Pago recibido — sesión confirmada',
    body: `${booking.date} ${booking.time}`,
    relatedBookingId: booking.id,
  });
}

/** Activates a Mentoría package exactly once and grants its credits. */
async function confirmPackage(packageId, payment) {
  const res = await ddb.send(new GetCommand({ TableName: PACKAGES_TABLE, Key: { id: packageId } }));
  const pkg = res.Item;
  if (!pkg) {
    console.warn('[mp] pago aprobado para un paquete inexistente:', packageId);
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime());
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: PACKAGES_TABLE,
        Key: { id: packageId },
        UpdateExpression:
          'SET #status = :active, totalCredits = :four, remainingCredits = :four, usedCredits = :zero, activatedAt = :now, expiresAt = :exp, mpPaymentId = :pid, updatedAt = :now',
        ConditionExpression: '#status <> :active',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'active',
          ':four': 4,
          ':zero': 0,
          ':now': now.toISOString(),
          ':exp': expiresAt.toISOString(),
          ':pid': String(payment.id),
        },
      })
    );
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.log('[mp] paquete ya activo, notificación duplicada ignorada:', packageId);
      return;
    }
    throw err;
  }

  try {
    await sendEmail({
      to: pkg.email,
      subject: 'Tu Mentoría está activa — 4 sesiones disponibles',
      html: emailLayout({
        headerSubtitle: 'Mentoría activada',
        bodyHtml: `
          <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">¡Recibimos tu pago!</h2>
          <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
            Tu paquete de Mentoría quedó activo. Tienes <strong>4 sesiones</strong> disponibles
            para agendar cuando te haga sentido, durante los próximos 6 meses.
          </p>
          <p style="margin:0;color:#6b7280;font-size:13px;">
            Vigencia hasta el ${escapeHtml(expiresAt.toISOString().slice(0, 10))}.
          </p>
        `,
        ctaUrl: `${SITE_URL}/profile/`,
        ctaLabel: 'Agendar mi primera sesión',
      }),
    });
  } catch (emailErr) {
    console.error('confirmPackage email error:', emailErr);
  }

  await createNotification(pkg.email, {
    type: 'package_activated',
    title: 'Mentoría activada — 4 sesiones disponibles',
    body: 'Ya puedes agendar tus sesiones.',
    relatedPackageId: packageId,
  });
}

module.exports = { createCheckout, handleWebhook };
