'use strict';

/**
 * Heads-up email to Fabiola when someone books but hasn't paid yet.
 *
 * Until 2026-08-04 the customer-account booking flow emailed only the
 * customer — Fabiola found out about new reservations only by opening the
 * admin panel. No calendar invite is sent here on purpose: unpaid bookings
 * must not land on her calendar (her rule). The invite goes out when she
 * confirms the payment, from utils/bookingCalendar.js.
 */

const { sendEmail, emailLayout, escapeHtml, SITE_URL } = require('./email');
const { serviceLabel } = require('./bookingCalendar');
const { formatDateEs } = require('./time');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function notifyAdminOfPendingBooking(booking) {
  if (!ADMIN_EMAIL) return;

  const label = serviceLabel(booking.service);
  const customerName = booking.name || booking.email;
  const when = `${formatDateEs(booking.date)} a las ${booking.time} (hora CDMX)`;

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: booking.email,
      subject: `Reserva pendiente de pago: ${label} — ${customerName} — ${booking.date} ${booking.time}`,
      html: emailLayout({
        headerSubtitle: 'Nueva reserva — falta el pago',
        bodyHtml: `
          <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">
            Alguien apartó un horario
          </h2>
          <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
            La sesión está <strong>pendiente de pago</strong>, así que todavía no entra a tu
            calendario. En cuanto confirmes el pago en el panel, se te agenda automáticamente
            y al cliente también.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:20px;">
            <tr><td style="padding:20px 24px;color:#374151;font-size:15px;line-height:1.9;">
              <strong>Servicio:</strong> ${escapeHtml(label)}<br/>
              <strong>Cuándo:</strong> ${escapeHtml(when)}<br/>
              <strong>Cliente:</strong> ${escapeHtml(customerName)}<br/>
              <strong>Correo:</strong> <a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a>
              ${booking.linkedin ? `<br/><strong>LinkedIn:</strong> ${escapeHtml(booking.linkedin)}` : ''}
              ${booking.message ? `<br/><strong>Quiere trabajar:</strong> ${escapeHtml(booking.message)}` : ''}
              <br/><strong>Reserva:</strong> ${escapeHtml(booking.id)}
            </td></tr>
          </table>
        `,
        ctaUrl: `${SITE_URL}/admin/`,
        ctaLabel: 'Confirmar el pago',
      }),
    });
  } catch (err) {
    console.error('notifyAdminOfPendingBooking error:', err);
  }
}

module.exports = { notifyAdminOfPendingBooking };
