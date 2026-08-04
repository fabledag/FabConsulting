'use strict';

/**
 * Mercado Pago integration — Checkout Pro.
 *
 * Replaces the manual paypal.me link, where Fabiola had to spot the payment and
 * confirm each booking by hand. A payment now confirms the booking by itself
 * via webhook.
 *
 * Uses the REST API through Node 20's built-in fetch rather than the
 * `mercadopago` SDK: two endpoints are all this needs, and the Lambda bundle
 * stays dependency-free.
 *
 * ENVIRONMENT
 *   MP_ACCESS_TOKEN    server-side secret — never goes near the frontend
 *   MP_WEBHOOK_SECRET  signing key from the webhook config, used to verify
 *                      notifications are genuinely from Mercado Pago
 * Both are set on the Lambda's environment, never committed.
 */

const crypto = require('crypto');

const MP_API = 'https://api.mercadopago.com';
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;
const SITE_URL = process.env.SITE_URL || 'https://fabdesign.digital';

/** True when credentials are present, so callers can fall back gracefully. */
function isConfigured() {
  return Boolean(ACCESS_TOKEN);
}

async function mpFetch(path, { method = 'GET', body, idempotencyKey } = {}) {
  if (!ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN no está configurado.');

  const res = await fetch(`${MP_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      // Mercado Pago retries; this stops a retry creating a second preference.
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(data.message || `Mercado Pago respondió ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Payment types Fabiola does NOT accept.
 *
 * Her decision (2026-08-04): immediate methods only, so a slot is never held
 * for money that hasn't actually arrived.
 *   - `ticket`        cash at OXXO and similar — clears in 1-3 days
 *   - `atm`           bank-counter transfer — same problem
 *   - `bank_transfer` SPEI. Usually minutes, but "usually" isn't immediate, and
 *                     she asked for card only after seeing it in the checkout.
 *
 * What remains: credit, debit and prepaid cards, plus Mercado Pago balance
 * (`account_money`), which settles instantly and shares none of the problem
 * above — excluding it would only cost sales.
 */
const EXCLUDED_PAYMENT_TYPES = [{ id: 'ticket' }, { id: 'atm' }, { id: 'bank_transfer' }];

/**
 * Creates a Checkout Pro preference and returns the URL to send the buyer to.
 *
 * `externalReference` is the booking or package id — it comes back untouched
 * on the webhook and is how a payment is matched to what was bought.
 */
async function createPreference({
  title,
  description,
  amountMXN,
  externalReference,
  payerEmail,
  payerName,
  kind = 'booking', // 'booking' | 'package'
}) {
  const preference = {
    items: [
      {
        id: externalReference,
        title,
        description,
        category_id: 'services',
        quantity: 1,
        currency_id: 'MXN',
        unit_price: Number(amountMXN),
      },
    ],
    payer: {
      email: payerEmail,
      ...(payerName ? { name: payerName } : {}),
    },
    external_reference: externalReference,
    // `metadata` survives the round trip and tells the webhook which flow this
    // payment belongs to without having to look it up twice.
    metadata: { kind, reference: externalReference },
    payment_methods: {
      excluded_payment_types: EXCLUDED_PAYMENT_TYPES,
      installments: 1, // no deferred payments — keeps settlement immediate
    },
    back_urls: {
      success: `${SITE_URL}/pago/exito/`,
      pending: `${SITE_URL}/pago/pendiente/`,
      failure: `${SITE_URL}/pago/error/`,
    },
    auto_return: 'approved',
    binary_mode: true, // resolve to approved/rejected, never leave it hanging
    statement_descriptor: 'FABDESIGN',
    notification_url: `${process.env.API_BASE_URL || ''}/payments/webhook`,
  };

  const data = await mpFetch('/checkout/preferences', {
    method: 'POST',
    body: preference,
    idempotencyKey: `pref-${externalReference}`,
  });

  return {
    preferenceId: data.id,
    // `init_point` is the live checkout; `sandbox_init_point` only exists on
    // test credentials, so falling back to it keeps sandbox runs working.
    checkoutUrl: data.init_point || data.sandbox_init_point,
  };
}

/** Fetches the authoritative state of a payment. Never trust the webhook body. */
async function getPayment(paymentId) {
  return mpFetch(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Verifies a webhook actually came from Mercado Pago.
 *
 * Without this, anyone who found the URL could POST a fake "approved" and book
 * themselves a paid session for free. MP signs with:
 *   manifest = "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 *   v1 = HMAC-SHA256(manifest, secret)
 * where ts and v1 come from the `x-signature` header.
 */
function verifyWebhookSignature({ signatureHeader, requestId, dataId }) {
  // MP_WEBHOOK_SECRET may hold several comma-separated keys. Mercado Pago's
  // panel shows a secret per application, and it wasn't clear whether the test
  // and production tabs issue the same one — accepting a list means a
  // mismatch can't silently reject real payments, and it also allows rotating
  // a key without a window where notifications bounce.
  const secrets = String(WEBHOOK_SECRET || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (secrets.length === 0) {
    console.warn('[mp] MP_WEBHOOK_SECRET no configurado — no se puede verificar la firma.');
    return false;
  }
  if (!signatureHeader || !dataId) return false;

  const parts = Object.fromEntries(
    String(signatureHeader)
      .split(',')
      .map((p) => p.split('=').map((s) => s.trim()))
      .filter((p) => p.length === 2)
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Mercado Pago's documented manifest. Two variants are accepted because the
  // `request-id` segment is omitted when the header is absent — some
  // notifications arrive without it, and building the string with an empty
  // value then produces a different digest than the one MP signed.
  const id = String(dataId).toLowerCase();
  const candidates = [
    `id:${id};request-id:${requestId || ''};ts:${ts};`,
    `id:${id};ts:${ts};`,
  ];

  for (const secret of secrets) {
    for (const manifest of candidates) {
      const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
      // Constant-time compare, so a wrong signature can't be brute-forced by
      // measuring how long the comparison takes.
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(v1, 'utf8');
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
    }
  }

  // Logged without the secret or the expected digest: enough to see which
  // component is off, nothing an attacker could use to forge a signature.
  console.warn(
    `[mp] firma no coincide — dataId=${id} requestId=${requestId || '(ausente)'} ts=${ts} v1len=${v1.length}`
  );
  return false;
}

module.exports = {
  isConfigured,
  createPreference,
  getPayment,
  verifyWebhookSignature,
  EXCLUDED_PAYMENT_TYPES,
};
