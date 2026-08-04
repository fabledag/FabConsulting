'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const { signMagicToken, signSessionToken, verifyToken } = require('../utils/auth');
const { sendEmail, emailLayout } = require('../utils/email');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const USERS_TABLE = process.env.USERS_TABLE;
const MAGIC_LINKS_TABLE = process.env.MAGIC_LINKS_TABLE;
const SITE_URL = process.env.SITE_URL || 'https://fabiolaledesma.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /auth/request-link
 * Always responds 200 with a generic message regardless of whether the
 * email/send succeeded, to avoid leaking which addresses have accounts.
 */
async function requestMagicLink(body) {
  if (!body || !body.email || !EMAIL_RE.test(body.email)) {
    return { statusCode: 400, body: { error: 'Escribe un correo electrónico válido.' } };
  }

  const email = body.email.trim().toLowerCase();
  const now = new Date().toISOString();

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: 'SET createdAt = if_not_exists(createdAt, :now), updatedAt = :now',
        ExpressionAttributeValues: { ':now': now },
      })
    );

    const { token, jti } = signMagicToken(email);
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

    await ddb.send(
      new PutCommand({
        TableName: MAGIC_LINKS_TABLE,
        Item: { tokenId: jti, email, createdAt: now, expiresAt, used: false },
      })
    );

    // Only allow same-site relative paths (must start with a single "/",
    // never "//") to avoid this becoming an open-redirect vector.
    const redirectPath =
      typeof body.redirectPath === 'string' && /^\/(?!\/)/.test(body.redirectPath)
        ? body.redirectPath
        : null;

    // Real path, not a hash route: since the Next.js migration the site is a
    // static export and the `fabiola-edge-router` CloudFront function resolves
    // /login/ to its index.html. The trailing slash matters — without it the
    // function issues a 301 to the slashed form, which costs a round trip.
    //
    // The login page still accepts the old `/#/login?token=` shape, so links
    // emailed before this deploy keep working until they expire.
    const loginUrl = `${SITE_URL}/login/?token=${token}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ''}`;

    // People who requested this from the booking widget are mid-reservation and
    // waiting to finish it. A generic "Iniciar sesión" email left them unsure
    // whether clicking would take them back to their booking at all, so the
    // copy states plainly what happens next.
    const fromBooking = redirectPath && redirectPath.includes('#agenda');

    try {
      await sendEmail({
        to: email,
        subject: fromBooking
          ? 'Confirma tu correo para terminar de agendar — Fabiola Ledesma'
          : 'Tu enlace de acceso — Fabiola Ledesma',
        html: emailLayout({
          headerTitle: 'Fabiola Ledesma · Consultoría',
          headerSubtitle: fromBooking ? 'Termina de agendar tu sesión' : 'Enlace de acceso a tu cuenta',
          bodyHtml: fromBooking
            ? `
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Ya casi está tu sesión</h2>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
              Da clic en el botón para confirmar tu correo. Te llevará de vuelta a tu
              reserva —con el servicio y el horario que elegiste ya guardados— para que
              solo la confirmes.
            </p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
              <strong>Ábrelo en el mismo dispositivo</strong> donde empezaste a agendar.
              El enlace expira en 15 minutos y solo puede usarse una vez.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
              Si tú no solicitaste esto, puedes ignorar este correo.
            </p>
          `
            : `
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Confirma tu inicio de sesión</h2>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
              Da clic en el botón para entrar a tu cuenta. Este enlace expira en 15 minutos y solo puede usarse una vez.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
              Si tú no solicitaste este acceso, puedes ignorar este correo.
            </p>
          `,
          ctaUrl: loginUrl,
          ctaLabel: fromBooking ? 'Volver a mi reserva' : 'Iniciar sesión',
        }),
      });
    } catch (emailErr) {
      console.error('requestMagicLink email send error:', emailErr);
    }
  } catch (err) {
    console.error('requestMagicLink error:', err);
  }

  return {
    statusCode: 200,
    body: { message: 'Si el correo es válido, te enviamos un enlace de acceso.' },
  };
}

/**
 * POST /auth/verify
 * Consumes a magic-link token (single use, enforced via fabiola-magic-links)
 * and issues a longer-lived customer session token.
 */
async function verifyMagicLink(body) {
  if (!body || !body.token) {
    return { statusCode: 400, body: { error: 'Falta el token.' } };
  }

  let decoded;
  try {
    decoded = verifyToken(body.token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { statusCode: 401, body: { error: 'Este enlace ya expiró. Solicita uno nuevo.' } };
    }
    return { statusCode: 401, body: { error: 'Enlace inválido.' } };
  }

  if (decoded.purpose !== 'magic' || !decoded.jti || !decoded.email) {
    return { statusCode: 401, body: { error: 'Enlace inválido.' } };
  }

  try {
    const existing = await ddb.send(
      new GetCommand({ TableName: MAGIC_LINKS_TABLE, Key: { tokenId: decoded.jti } })
    );
    if (!existing.Item) {
      return { statusCode: 401, body: { error: 'Enlace inválido o expirado.' } };
    }
    if (existing.Item.used) {
      return { statusCode: 401, body: { error: 'Este enlace ya fue usado. Solicita uno nuevo.' } };
    }

    await ddb.send(
      new UpdateCommand({
        TableName: MAGIC_LINKS_TABLE,
        Key: { tokenId: decoded.jti },
        UpdateExpression: 'SET used = :true, usedAt = :now',
        ConditionExpression: 'used = :false',
        ExpressionAttributeValues: {
          ':true': true,
          ':false': false,
          ':now': new Date().toISOString(),
        },
      })
    );
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 401, body: { error: 'Este enlace ya fue usado. Solicita uno nuevo.' } };
    }
    console.error('verifyMagicLink error:', err);
    return { statusCode: 500, body: { error: 'No se pudo verificar el enlace.' } };
  }

  const email = decoded.email;
  const now = new Date().toISOString();
  let userItem = null;

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: 'SET lastLoginAt = :now, createdAt = if_not_exists(createdAt, :now), updatedAt = :now',
        ExpressionAttributeValues: { ':now': now },
      })
    );
    const userResult = await ddb.send(new GetCommand({ TableName: USERS_TABLE, Key: { email } }));
    userItem = userResult.Item || null;
  } catch (err) {
    console.error('verifyMagicLink user upsert error:', err);
  }

  const sessionToken = signSessionToken(email);

  return {
    statusCode: 200,
    body: {
      token: sessionToken,
      user: { email, name: userItem?.name || '', phone: userItem?.phone || '' },
    },
  };
}

module.exports = { requestMagicLink, verifyMagicLink };
