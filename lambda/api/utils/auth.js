'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET;
const MAGIC_TOKEN_EXPIRES_IN = '15m';
const SESSION_TOKEN_EXPIRES_IN = '30d';

/**
 * Signs a short-lived, single-purpose token for the magic-link email.
 * The `jti` is also stored server-side (fabiola-magic-links) so it can be
 * marked used and rejected on replay — a JWT alone can't enforce single-use.
 */
function signMagicToken(email) {
  const jti = uuidv4();
  const token = jwt.sign(
    { email, purpose: 'magic', jti },
    JWT_SECRET,
    { expiresIn: MAGIC_TOKEN_EXPIRES_IN }
  );
  return { token, jti };
}

function signSessionToken(email) {
  return jwt.sign({ email, role: 'customer' }, JWT_SECRET, { expiresIn: SESSION_TOKEN_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Middleware-style check for /me/* routes. Unlike admin's requireAuth
 * (which only needs to know "allowed or not"), customer routes need the
 * authenticated email back to scope every query — so this returns claims
 * on success instead of null.
 */
function requireCustomerAuth(event) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set.');
    return { errorResponse: { statusCode: 500, body: { error: 'Error de configuración del servidor.' } } };
  }

  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { errorResponse: { statusCode: 401, body: { error: 'Tu sesión no es válida. Vuelve a iniciar sesión.' } } };
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'customer') {
      return { errorResponse: { statusCode: 403, body: { error: 'No tienes permisos para hacer esto.' } } };
    }
    return { email: decoded.email };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { errorResponse: { statusCode: 401, body: { error: 'Session expired. Please log in again.' } } };
    }
    return { errorResponse: { statusCode: 401, body: { error: 'Tu sesión no es válida. Vuelve a iniciar sesión.' } } };
  }
}

module.exports = { signMagicToken, signSessionToken, verifyToken, requireCustomerAuth };
