'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { sendEmail, emailLayout, SITE_URL } = require('../utils/email');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_TABLE = process.env.ADMIN_TABLE;
const RESET_TOKENS_TABLE = process.env.ADMIN_RESET_TOKENS_TABLE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const JWT_EXPIRES_IN = '8h';
const RESET_TOKEN_EXPIRES_IN = '15m';

/**
 * POST /admin/login
 * Validates password against the hash stored in fabiola-admin, returns a
 * signed JWT on success. The hash lives in DynamoDB (not an env var) so
 * resetPassword() below can update it with a normal UpdateCommand.
 */
async function login(body) {
  if (!body || !body.password) {
    return {
      statusCode: 400,
      body: { error: 'Password is required.' },
    };
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set.');
    return {
      statusCode: 500,
      body: { error: 'Server configuration error.' },
    };
  }

  let passwordHash;
  try {
    const result = await ddb.send(new GetCommand({ TableName: ADMIN_TABLE, Key: { id: 'admin' } }));
    passwordHash = result.Item?.passwordHash;
  } catch (err) {
    console.error('Admin lookup error:', err);
    return { statusCode: 500, body: { error: 'Authentication error.' } };
  }

  if (!passwordHash) {
    console.error('No admin password hash found in fabiola-admin.');
    return { statusCode: 500, body: { error: 'Server configuration error.' } };
  }

  let isValid = false;
  try {
    isValid = await bcrypt.compare(body.password, passwordHash);
  } catch (err) {
    console.error('bcrypt compare error:', err);
    return {
      statusCode: 500,
      body: { error: 'Authentication error.' },
    };
  }

  if (!isValid) {
    return {
      statusCode: 401,
      body: { error: 'Invalid credentials.' },
    };
  }

  const token = jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    statusCode: 200,
    body: {
      token,
      expiresIn: JWT_EXPIRES_IN,
      message: 'Login successful.',
    },
  };
}

/**
 * POST /admin/request-password-reset
 * No body — there is exactly one admin account, always ADMIN_EMAIL.
 * Always returns 200 (matches the customer magic-link pattern for
 * consistency, though here it's not an anti-enumeration measure since
 * there's only one account). Deliberately has no CAPTCHA/rate-limit —
 * worst case is repeated emails to ADMIN_EMAIL, not a real security hole.
 */
async function requestPasswordReset() {
  if (!JWT_SECRET || !ADMIN_EMAIL) {
    console.error('JWT_SECRET or ADMIN_EMAIL environment variable is not set.');
    return { statusCode: 500, body: { error: 'Server configuration error.' } };
  }

  try {
    const jti = uuidv4();
    const token = jwt.sign({ purpose: 'admin-reset', jti }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRES_IN });
    const now = new Date().toISOString();
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

    await ddb.send(
      new PutCommand({
        TableName: RESET_TOKENS_TABLE,
        Item: { tokenId: jti, createdAt: now, expiresAt, used: false },
      })
    );

    const resetUrl = `${SITE_URL}/#/admin?token=${token}`;

    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: 'Restablece tu contraseña — Panel de administración',
        html: emailLayout({
          headerSubtitle: 'Restablecer contraseña de admin',
          bodyHtml: `
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
              Da clic en el botón para elegir una contraseña nueva. Este enlace expira en 15 minutos y solo puede usarse una vez.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
              Si tú no solicitaste esto, puedes ignorar este correo.
            </p>
          `,
          ctaUrl: resetUrl,
          ctaLabel: 'Restablecer contraseña',
        }),
      });
    } catch (emailErr) {
      console.error('requestPasswordReset email send error:', emailErr);
    }
  } catch (err) {
    console.error('requestPasswordReset error:', err);
  }

  return {
    statusCode: 200,
    body: { message: 'Te enviamos un enlace de restablecimiento a tu correo.' },
  };
}

/**
 * POST /admin/reset-password
 * Body: { token, newPassword }. Does not issue a session token — the admin
 * logs in fresh with the new password afterward.
 */
async function resetPassword(body) {
  if (!body || !body.token || !body.newPassword) {
    return { statusCode: 400, body: { error: 'token and newPassword are required.' } };
  }
  if (body.newPassword.length < 8) {
    return { statusCode: 400, body: { error: 'La contraseña debe tener al menos 8 caracteres.' } };
  }

  let decoded;
  try {
    decoded = jwt.verify(body.token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { statusCode: 401, body: { error: 'Este enlace ya expiró. Solicita uno nuevo.' } };
    }
    return { statusCode: 401, body: { error: 'Enlace inválido.' } };
  }

  if (decoded.purpose !== 'admin-reset' || !decoded.jti) {
    return { statusCode: 401, body: { error: 'Enlace inválido.' } };
  }

  try {
    const existing = await ddb.send(
      new GetCommand({ TableName: RESET_TOKENS_TABLE, Key: { tokenId: decoded.jti } })
    );
    if (!existing.Item) {
      return { statusCode: 401, body: { error: 'Enlace inválido o expirado.' } };
    }
    if (existing.Item.used) {
      return { statusCode: 401, body: { error: 'Este enlace ya fue usado. Solicita uno nuevo.' } };
    }

    await ddb.send(
      new UpdateCommand({
        TableName: RESET_TOKENS_TABLE,
        Key: { tokenId: decoded.jti },
        UpdateExpression: 'SET used = :true, usedAt = :now',
        ConditionExpression: 'used = :false',
        ExpressionAttributeValues: { ':true': true, ':false': false, ':now': new Date().toISOString() },
      })
    );
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 401, body: { error: 'Este enlace ya fue usado. Solicita uno nuevo.' } };
    }
    console.error('resetPassword token check error:', err);
    return { statusCode: 500, body: { error: 'No se pudo verificar el enlace.' } };
  }

  try {
    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await ddb.send(
      new UpdateCommand({
        TableName: ADMIN_TABLE,
        Key: { id: 'admin' },
        UpdateExpression: 'SET passwordHash = :hash, updatedAt = :now',
        ExpressionAttributeValues: { ':hash': passwordHash, ':now': new Date().toISOString() },
      })
    );
  } catch (err) {
    console.error('resetPassword update error:', err);
    return { statusCode: 500, body: { error: 'No se pudo actualizar la contraseña.' } };
  }

  return { statusCode: 200, body: { message: 'Contraseña actualizada correctamente.' } };
}

/**
 * Middleware: verifies the Authorization Bearer JWT.
 * Returns null if valid, or an error response object if invalid.
 */
function requireAuth(event) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set.');
    return {
      statusCode: 500,
      body: { error: 'Server configuration error.' },
    };
  }

  const authHeader =
    event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: { error: 'Authorization header missing or malformed.' },
    };
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return {
        statusCode: 403,
        body: { error: 'Insufficient permissions.' },
      };
    }
    // Auth passed — return null to indicate success
    return null;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: { error: 'Token has expired. Please log in again.' },
      };
    }
    return {
      statusCode: 401,
      body: { error: 'Invalid token.' },
    };
  }
}

module.exports = { login, requireAuth, requestPasswordReset, resetPassword };
