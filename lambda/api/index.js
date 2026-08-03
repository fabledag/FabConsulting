'use strict';

/**
 * Fabiola Ledesma Consulting API
 * Single Lambda function with internal routing.
 * Runtime: Node.js 20.x
 */

const { submitContact } = require('./handlers/contact');
const {
  getPublicAvailability,
  adminGetAvailability,
  adminSetAvailability,
  adminDeleteAvailability,
  adminBlockDate,
  adminUnblockDate,
} = require('./handlers/availability');
const { createBooking, adminGetBookings, adminUpdateBooking } = require('./handlers/bookings');
const {
  getPublishedPosts,
  getPostBySlug,
  adminGetAllPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
} = require('./handlers/blog');
const { login, requireAuth, requestPasswordReset, resetPassword } = require('./handlers/admin');
const { requestMagicLink, verifyMagicLink } = require('./handlers/auth');
const { getProfile, updateProfile } = require('./handlers/profile');
const {
  listMyBookings,
  createCustomerBooking,
  rescheduleMyBooking,
  cancelMyBooking,
} = require('./handlers/customerBookings');
const {
  listMyPackages,
  createPendingPackage,
  adminListPendingPackages,
  adminConfirmPackage,
} = require('./handlers/packages');
const { listMyNotifications, markNotificationRead } = require('./handlers/notifications');
const { requireCustomerAuth } = require('./utils/auth');

// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------
// Production origin plus local dev ports, so `npm run dev` can talk to the
// real API. Lambda processes one invocation at a time per execution
// environment, so a module-level "current request" value is safe here.
const ALLOWED_ORIGINS = [
  process.env.SITE_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

let currentAllowOrigin = process.env.SITE_URL || '*';

function baseCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': currentAllowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/**
 * Build a Lambda response object.
 * @param {number} statusCode
 * @param {object} body
 * @param {object} [extraHeaders]
 */
function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...baseCorsHeaders(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Wrap a handler result (which may return {statusCode, body}) into a Lambda response.
 */
function wrap(result) {
  return response(result.statusCode, result.body);
}

/**
 * Safely parse JSON request body. Returns null on empty/invalid.
 */
function parseBody(event) {
  if (!event.body) return null;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Extract path parameters from a parameterized route.
 * e.g. matchRoute('/blog/{slug}', '/blog/hello-world') → { slug: 'hello-world' }
 * Returns null if the path doesn't match the template.
 */
function matchRoute(template, path) {
  const templateParts = template.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (templateParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < templateParts.length; i++) {
    const t = templateParts[i];
    const p = pathParts[i];
    if (t.startsWith('{') && t.endsWith('}')) {
      params[t.slice(1, -1)] = decodeURIComponent(p);
    } else if (t !== p) {
      return null;
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

async function router(event) {
  // Reflect the request's Origin if it's an allowed one (prod domain or local
  // dev), otherwise fall back to the production origin.
  const requestOrigin = event.headers?.origin || event.headers?.Origin;
  currentAllowOrigin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : process.env.SITE_URL || '*';

  // Normalize: API Gateway v1 uses path + httpMethod; v2 uses rawPath + requestContext.http.method
  const rawPath =
    event.rawPath ||
    event.path ||
    event.requestContext?.http?.path ||
    '/';

  // API Gateway proxy already strips the stage name; use path as-is
  const path = rawPath;

  const method =
    event.httpMethod ||
    event.requestContext?.http?.method ||
    'GET';

  const queryParams = event.queryStringParameters || {};
  const body = parseBody(event);

  // ── OPTIONS preflight ──────────────────────────────────────────────────────
  if (method === 'OPTIONS') {
    return response(204, {});
  }

  // ── Public routes ──────────────────────────────────────────────────────────

  // POST /contact
  if (method === 'POST' && path === '/contact') {
    return wrap(await submitContact(body));
  }

  // GET /availability
  if (method === 'GET' && path === '/availability') {
    return wrap(await getPublicAvailability(queryParams));
  }

  // POST /book
  if (method === 'POST' && path === '/book') {
    return wrap(await createBooking(body));
  }

  // GET /blog
  if (method === 'GET' && path === '/blog') {
    return wrap(await getPublishedPosts(queryParams));
  }

  // GET /blog/{slug}
  const blogSlugMatch = matchRoute('/blog/{slug}', path);
  if (method === 'GET' && blogSlugMatch) {
    return wrap(await getPostBySlug(blogSlugMatch.slug));
  }

  // POST /auth/request-link
  if (method === 'POST' && path === '/auth/request-link') {
    return wrap(await requestMagicLink(body));
  }

  // POST /auth/verify
  if (method === 'POST' && path === '/auth/verify') {
    return wrap(await verifyMagicLink(body));
  }

  // ── Customer routes (require customer JWT) ──────────────────────────────────
  if (path.startsWith('/me')) {
    const auth = requireCustomerAuth(event);
    if (auth.errorResponse) return wrap(auth.errorResponse);
    const { email } = auth;

    if (method === 'GET' && path === '/me') return wrap(await getProfile(email));
    if (method === 'PUT' && path === '/me') return wrap(await updateProfile(email, body));

    if (method === 'GET' && path === '/me/bookings') return wrap(await listMyBookings(email, queryParams));
    if (method === 'POST' && path === '/me/bookings') return wrap(await createCustomerBooking(email, body));

    const reschedMatch = matchRoute('/me/bookings/{id}/reschedule', path);
    if (method === 'PUT' && reschedMatch) return wrap(await rescheduleMyBooking(email, reschedMatch.id, body));

    const cancelMatch = matchRoute('/me/bookings/{id}/cancel', path);
    if (method === 'POST' && cancelMatch) return wrap(await cancelMyBooking(email, cancelMatch.id));

    if (method === 'GET' && path === '/me/packages') return wrap(await listMyPackages(email));
    if (method === 'POST' && path === '/me/packages') return wrap(await createPendingPackage(email, body));

    if (method === 'GET' && path === '/me/notifications') return wrap(await listMyNotifications(email, queryParams));
    const notifMatch = matchRoute('/me/notifications/{id}/read', path);
    if (method === 'PUT' && notifMatch) return wrap(await markNotificationRead(email, notifMatch.id));
  }

  // ── Admin routes (require JWT) ─────────────────────────────────────────────

  // POST /admin/login (no auth required)
  if (method === 'POST' && path === '/admin/login') {
    return wrap(await login(body));
  }

  // POST /admin/request-password-reset (no auth required)
  if (method === 'POST' && path === '/admin/request-password-reset') {
    return wrap(await requestPasswordReset());
  }

  // POST /admin/reset-password (no auth required)
  if (method === 'POST' && path === '/admin/reset-password') {
    return wrap(await resetPassword(body));
  }

  // All /admin/* routes below require authentication
  if (path.startsWith('/admin/') || path === '/admin') {
    const authError = requireAuth(event);
    if (authError) return wrap(authError);

    // GET /admin/availability
    if (method === 'GET' && path === '/admin/availability') {
      return wrap(await adminGetAvailability());
    }

    // POST /admin/availability
    if (method === 'POST' && path === '/admin/availability') {
      return wrap(await adminSetAvailability(body));
    }

    // DELETE /admin/availability/{id}
    const adminAvailDeleteMatch = matchRoute('/admin/availability/{id}', path);
    if (method === 'DELETE' && adminAvailDeleteMatch) {
      return wrap(await adminDeleteAvailability(adminAvailDeleteMatch.id));
    }

    // POST /admin/block-date
    if (method === 'POST' && path === '/admin/block-date') {
      return wrap(await adminBlockDate(body));
    }

    // DELETE /admin/block-date/{date}
    const adminBlockDateDeleteMatch = matchRoute('/admin/block-date/{date}', path);
    if (method === 'DELETE' && adminBlockDateDeleteMatch) {
      return wrap(await adminUnblockDate(adminBlockDateDeleteMatch.date));
    }

    // GET /admin/bookings
    if (method === 'GET' && path === '/admin/bookings') {
      return wrap(await adminGetBookings(queryParams));
    }

    // PUT /admin/bookings/{id}
    const adminBookingMatch = matchRoute('/admin/bookings/{id}', path);
    if (method === 'PUT' && adminBookingMatch) {
      return wrap(await adminUpdateBooking(adminBookingMatch.id, body));
    }

    // GET /admin/packages
    if (method === 'GET' && path === '/admin/packages') {
      return wrap(await adminListPendingPackages(queryParams));
    }

    // PUT /admin/packages/{id}
    const adminPackageMatch = matchRoute('/admin/packages/{id}', path);
    if (method === 'PUT' && adminPackageMatch) {
      return wrap(await adminConfirmPackage(adminPackageMatch.id, body));
    }

    // GET /admin/blog
    if (method === 'GET' && path === '/admin/blog') {
      return wrap(await adminGetAllPosts(queryParams));
    }

    // POST /admin/blog
    if (method === 'POST' && path === '/admin/blog') {
      return wrap(await adminCreatePost(body));
    }

    // PUT /admin/blog/{id}
    const adminBlogMatch = matchRoute('/admin/blog/{id}', path);
    if (method === 'PUT' && adminBlogMatch) {
      return wrap(await adminUpdatePost(adminBlogMatch.id, body));
    }

    // DELETE /admin/blog/{id}
    if (method === 'DELETE' && adminBlogMatch) {
      return wrap(await adminDeletePost(adminBlogMatch.id));
    }
  }

  // ── 404 fallback ───────────────────────────────────────────────────────────
  return response(404, { error: `Cannot ${method} ${path}` });
}

// ---------------------------------------------------------------------------
// Lambda entry point
// ---------------------------------------------------------------------------

exports.handler = async (event, context) => {
  // Log minimal request info (avoid logging sensitive data)
  console.log(JSON.stringify({
    method: event.httpMethod || event.requestContext?.http?.method,
    path: event.rawPath || event.path,
    requestId: context?.awsRequestId,
  }));

  try {
    return await router(event);
  } catch (err) {
    console.error('Unhandled error in router:', err);
    return response(500, { error: 'Internal server error.' });
  }
};
