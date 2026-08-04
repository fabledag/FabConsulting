'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { v4: uuidv4 } = require('uuid');

const { sendEmail, emailLayout } = require('../utils/email');
const { createNotification } = require('../utils/notify');
const { isSlotInPast, msUntilSlot } = require('../utils/time');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const sesClient = new SESClient({});

const AVAILABILITY_TABLE = process.env.AVAILABILITY_TABLE;
const BLOCKED_DATES_TABLE = process.env.BLOCKED_DATES_TABLE;
const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE;
const PACKAGES_TABLE = process.env.PACKAGES_TABLE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL;
const SITE_URL = process.env.SITE_URL || 'https://fabiolaledesma.com';

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

/**
 * Pad a number to two digits.
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates a booking request body.
 */
function validateBooking(body) {
  const errors = [];
  if (!body) return ['Faltan datos en la solicitud.'];

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    errors.push('La fecha debe tener el formato AAAA-MM-DD.');
  }
  if (!body.time || !/^\d{2}:\d{2}$/.test(body.time)) {
    errors.push('La hora debe tener el formato HH:MM (por ejemplo "09:00").');
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres.');
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Escribe un correo electrónico válido.');
  }
  if (body.phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(body.phone)) {
    errors.push('El número de teléfono no tiene un formato válido.');
  }
  return errors;
}

/**
 * Builds booking confirmation email for the user.
 */
function buildUserBookingEmail(booking) {
  const { name, date, time, service, durationMinutes } = booking;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de consulta</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Fabiola Ledesma · Consultoría</h1>
              <p style="margin:6px 0 0;color:#a0a0c0;font-size:14px;">Solicitud de consulta recibida</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">
                ¡Tu consulta fue agendada, ${escapeHtml(name)}!
              </h2>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
                Recibí tu solicitud de consulta. Te confirmaré la disponibilidad a la brevedad.
              </p>
              <!-- Booking details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Detalles de la consulta</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#374151;font-size:15px;">
                          <strong>Fecha:</strong> ${escapeHtml(date)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#374151;font-size:15px;">
                          <strong>Hora:</strong> ${escapeHtml(time)}
                        </td>
                      </tr>
                      ${durationMinutes ? `<tr><td style="padding:6px 0;color:#374151;font-size:15px;"><strong>Duración:</strong> ${durationMinutes} minutos</td></tr>` : ''}
                      ${service ? `<tr><td style="padding:6px 0;color:#374151;font-size:15px;"><strong>Servicio:</strong> ${escapeHtml(service)}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
                Si necesitás realizar algún cambio, no dudes en contactarme.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                <a href="${SITE_URL}" style="color:#4f46e5;text-decoration:none;">${SITE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Builds admin notification email for a new booking.
 */
function buildAdminBookingEmail(booking) {
  const { name, email, phone, date, time, service, message, id } = booking;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Nueva reserva</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Nueva solicitud de consulta</h1>
              <p style="margin:6px 0 0;color:#a0a0c0;font-size:13px;">ID: ${escapeHtml(id)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><strong>Nombre:</strong> ${escapeHtml(name)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
                ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><strong>Teléfono:</strong> ${escapeHtml(phone)}</td></tr>` : ''}
                <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><strong>Fecha:</strong> ${escapeHtml(date)}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><strong>Hora:</strong> ${escapeHtml(time)}</td></tr>
                ${service ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><strong>Servicio:</strong> ${escapeHtml(service)}</td></tr>` : ''}
                ${message ? `<tr><td style="padding:8px 0;"><strong>Mensaje:</strong><br/><span style="white-space:pre-wrap;">${escapeHtml(message)}</span></td></tr>` : ''}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <a href="${SITE_URL}/admin/" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:500;">
                Ver en el panel de admin
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Checks whether a date/time slot can be booked: not in the past, date not
 * blocked, a weekly availability rule exists and is active, and no other
 * active booking already occupies it. Shared by the anonymous /book flow
 * and the customer-authenticated /me/bookings flow.
 */
async function checkSlotAvailable(date, time) {
  // Slots are Mexico City wall-clock times; Lambda runs in UTC. Comparing them
  // naively made afternoon slots look six hours in the past. See utils/time.js.
  if (isSlotInPast(date, time)) {
    return { ok: false, statusCode: 400, error: 'Ese horario ya pasó. Elige uno disponible.' };
  }

  // 1. Check if the date is blocked
  const blockedResult = await ddb.send(
    new GetCommand({ TableName: BLOCKED_DATES_TABLE, Key: { date } })
  );
  if (blockedResult.Item) {
    return { ok: false, statusCode: 409, error: 'Esa fecha no está disponible para reservas.' };
  }

  // 2. Check weekly availability rule exists for this day/time
  // Day-of-week must also come from the Mexico City calendar date, not from a
  // UTC-parsed Date, or slots near midnight resolve to the wrong weekday.
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  const pk = `WEEKLY#${dow}`;
  const availResult = await ddb.send(
    new GetCommand({ TableName: AVAILABILITY_TABLE, Key: { pk, sk: time } })
  );
  if (!availResult.Item || !availResult.Item.active) {
    return { ok: false, statusCode: 409, error: 'Ese horario no está disponible.' };
  }
  const durationMinutes = availResult.Item.durationMinutes || 60;

  // 3. Check no existing active booking for date+time
  const existingResult = await ddb.send(
    new ScanCommand({
      TableName: BOOKINGS_TABLE,
      FilterExpression: '#date = :date AND #time = :time AND #status <> :cancelled',
      ExpressionAttributeNames: { '#date': 'date', '#time': 'time', '#status': 'status' },
      ExpressionAttributeValues: { ':date': date, ':time': time, ':cancelled': 'cancelled' },
      Limit: 1,
    })
  );
  if (existingResult.Items && existingResult.Items.length > 0) {
    return { ok: false, statusCode: 409, error: 'Ese horario acaba de ocuparse. Por favor elige otro.' };
  }

  return { ok: true, durationMinutes };
}

/**
 * POST /book
 */
async function createBooking(body) {
  const errors = validateBooking(body);
  if (errors.length) return { statusCode: 400, body: { errors } };

  const { date, time, name, email, phone = '', service = '', message = '' } = body;

  try {
    const availability = await checkSlotAvailable(date, time);
    if (!availability.ok) {
      return { statusCode: availability.statusCode, body: { error: availability.error } };
    }
    const { durationMinutes } = availability;

    // 4. Create the booking
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const booking = {
      id,
      date,
      time,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service: service.trim(),
      message: message.trim(),
      status: 'pending',
      durationMinutes,
      createdAt,
    };

    await ddb.send(new PutCommand({ TableName: BOOKINGS_TABLE, Item: booking }));

    // 5. Send emails (best-effort, don't fail the booking if emails error)
    if (ADMIN_EMAIL && FROM_EMAIL) {
      try {
        await sesClient.send(
          new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: { ToAddresses: [ADMIN_EMAIL] },
            Message: {
              Subject: { Data: `Nueva consulta: ${name} — ${date} ${time}`, Charset: 'UTF-8' },
              Body: { Html: { Data: buildAdminBookingEmail(booking), Charset: 'UTF-8' } },
            },
          })
        );
        await sesClient.send(
          new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: { ToAddresses: [email] },
            Message: {
              Subject: { Data: 'Tu consulta fue recibida — Fabiola Ledesma', Charset: 'UTF-8' },
              Body: { Html: { Data: buildUserBookingEmail(booking), Charset: 'UTF-8' } },
            },
          })
        );
      } catch (emailErr) {
        console.error('Email send error (booking confirmed but email failed):', emailErr);
      }
    }

    return {
      statusCode: 201,
      body: {
        message: 'Booking created successfully.',
        booking: {
          id: booking.id,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          durationMinutes: booking.durationMinutes,
        },
      },
    };
  } catch (err) {
    console.error('createBooking error:', err);
    return { statusCode: 500, body: { error: 'No se pudo crear la reserva. Inténtalo de nuevo.' } };
  }
}

/**
 * GET /admin/bookings?date=YYYY-MM-DD&status=pending&page=1&limit=20
 */
async function adminGetBookings(queryParams) {
  const page = Math.max(1, parseInt(queryParams?.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(queryParams?.limit || 20, 10)));
  const filterDate = queryParams?.date;
  const filterStatus = queryParams?.status;

  const filterParts = [];
  const exprNames = {};
  const exprValues = {};

  if (filterDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(filterDate)) {
      return { statusCode: 400, body: { error: 'date filter must be YYYY-MM-DD.' } };
    }
    filterParts.push('#date = :date');
    exprNames['#date'] = 'date';
    exprValues[':date'] = filterDate;
  }

  if (filterStatus) {
    if (!VALID_STATUSES.includes(filterStatus)) {
      return { statusCode: 400, body: { error: `status must be one of: ${VALID_STATUSES.join(', ')}.` } };
    }
    filterParts.push('#status = :status');
    exprNames['#status'] = 'status';
    exprValues[':status'] = filterStatus;
  }

  const params = { TableName: BOOKINGS_TABLE };
  if (filterParts.length) {
    params.FilterExpression = filterParts.join(' AND ');
    params.ExpressionAttributeNames = exprNames;
    params.ExpressionAttributeValues = exprValues;
  }

  try {
    // DynamoDB Scan — for production with large datasets consider a GSI + Query pattern
    const result = await ddb.send(new ScanCommand(params));
    const allItems = (result.Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const total = allItems.length;
    const start = (page - 1) * limit;
    const bookings = allItems.slice(start, start + limit);

    return {
      statusCode: 200,
      body: {
        bookings,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  } catch (err) {
    console.error('adminGetBookings error:', err);
    return { statusCode: 500, body: { error: 'No se pudieron cargar las reservas.' } };
  }
}

/**
 * PUT /admin/bookings/{id}
 * Updates booking status. Body: { status: "confirmed" | "cancelled" | "pending" }
 */
async function adminUpdateBooking(id, body) {
  if (!id) return { statusCode: 400, body: { error: 'Falta el identificador de la reserva.' } };
  if (!body || !body.status) return { statusCode: 400, body: { error: 'status is required.' } };
  if (!VALID_STATUSES.includes(body.status)) {
    return { statusCode: 400, body: { error: `status must be one of: ${VALID_STATUSES.join(', ')}.` } };
  }

  try {
    // First fetch the item to get its sort key (date)
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: BOOKINGS_TABLE,
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':id': id },
        Limit: 1,
      })
    );

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return { statusCode: 404, body: { error: 'No encontramos esa reserva.' } };
    }

    const existingBooking = scanResult.Items[0];
    const previousStatus = existingBooking.status;
    const updatedAt = new Date().toISOString();

    await ddb.send(
      new UpdateCommand({
        TableName: BOOKINGS_TABLE,
        Key: { id: existingBooking.id, date: existingBooking.date },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': body.status, ':updatedAt': updatedAt },
      })
    );

    // Refund the mentoria credit when an admin cancels a booking that was
    // paid for with one — mirrors the refund a customer gets when they
    // cancel it themselves (see cancelMyBooking in customerBookings.js).
    if (body.status === 'cancelled' && previousStatus !== 'cancelled' && existingBooking.packageId) {
      try {
        await ddb.send(
          new UpdateCommand({
            TableName: PACKAGES_TABLE,
            Key: { id: existingBooking.packageId },
            UpdateExpression: 'SET usedCredits = usedCredits - :one, remainingCredits = remainingCredits + :one',
            ExpressionAttributeValues: { ':one': 1 },
          })
        );
      } catch (creditErr) {
        console.error('adminUpdateBooking credit refund error:', creditErr);
      }
    }

    // Notify the customer once their booking is actually confirmed. Credit-paid
    // mentoria bookings are already confirmed instantly by createCustomerBooking
    // (and already email the customer there) — this only fires for the PayPal
    // path, which previously sat at "pending" until an admin flipped it with
    // no signal to the customer at all.
    if (body.status === 'confirmed' && previousStatus !== 'confirmed' && existingBooking.email) {
      try {
        await sendEmail({
          to: existingBooking.email,
          subject: `Sesión confirmada — ${existingBooking.date} ${existingBooking.time}`,
          html: emailLayout({
            headerSubtitle: 'Sesión confirmada',
            bodyHtml: `
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                Confirmamos tu pago. Tu sesión ya quedó apartada.
              </p>
              <p style="margin:0;color:#374151;font-size:15px;"><strong>Fecha:</strong> ${existingBooking.date}</p>
              <p style="margin:0;color:#374151;font-size:15px;"><strong>Hora:</strong> ${existingBooking.time}</p>
            `,
            ctaUrl: `${SITE_URL}/profile/`,
            ctaLabel: 'Ver mi reserva',
          }),
        });
      } catch (emailErr) {
        console.error('adminUpdateBooking confirmation email error:', emailErr);
      }

      await createNotification(existingBooking.email, {
        type: 'booking_confirmed',
        title: 'Sesión confirmada',
        body: `${existingBooking.date} ${existingBooking.time}`,
        relatedBookingId: existingBooking.id,
        relatedPackageId: existingBooking.packageId || null,
      });
    }

    return {
      statusCode: 200,
      body: { message: 'Booking updated.', id, status: body.status },
    };
  } catch (err) {
    console.error('adminUpdateBooking error:', err);
    return { statusCode: 500, body: { error: 'No se pudo actualizar la reserva.' } };
  }
}

module.exports = { createBooking, adminGetBookings, adminUpdateBooking, checkSlotAvailable };
