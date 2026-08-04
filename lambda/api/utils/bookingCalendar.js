'use strict';

/**
 * Sends the calendar invitations for a booking.
 *
 * Business rule (Fabiola, 2026-08-04): the session lands on her calendar when
 * it is CONFIRMED — i.e. when Mercado Pago's webhook reports the payment as
 * approved, or instantly when a Mentoría credit is redeemed. Pending, unpaid bookings never create
 * calendar events; she still hears about those by email.
 *
 * Two separate invites go out (see utils/calendar.js for why): hers lists the
 * customer as an attendee, the customer's does not expose her personal Gmail.
 * Both share a UID, so a later cancellation replaces the right event.
 */

const { buildInvite } = require('./calendar');
const { sendEmailWithInvite, emailLayout, escapeHtml, SITE_URL, FROM_EMAIL } = require('./email');
const { formatDateEs } = require('./time');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const SERVICE_LABELS = {
  session: 'Conversación estratégica 1:1',
  mock: 'Simulación de entrevista',
  cv: 'Revisión de CV y LinkedIn',
  portfolio: 'Revisión de portafolio o book',
  mentoria: 'Mentoría',
};

function serviceLabel(service) {
  return SERVICE_LABELS[service] || 'Sesión';
}

/**
 * Fires the invitations. Never throws: a calendar problem must not roll back a
 * booking that is already confirmed and paid. Failures are logged instead.
 */
async function sendBookingInvites(booking, { durationMinutes = 60, cancelled = false } = {}) {
  if (!FROM_EMAIL) {
    console.error('sendBookingInvites: FROM_EMAIL not set, skipping.');
    return;
  }

  const label = serviceLabel(booking.service);
  const customerName = booking.name || booking.email;
  const when = `${formatDateEs(booking.date)} a las ${booking.time} (hora CDMX)`;
  const summary = `${label} — ${customerName}`;

  const notes = [
    `Servicio: ${label}`,
    `Cliente: ${customerName} (${booking.email})`,
    booking.linkedin ? `LinkedIn: ${booking.linkedin}` : null,
    booking.message ? `Quiere trabajar: ${booking.message}` : null,
    `Reserva: ${booking.id}`,
  ]
    .filter(Boolean)
    .join('\n');

  const verb = cancelled ? 'cancelada' : 'confirmada';

  // ── 1. Fabiola's copy — includes the customer as an attendee ──────────────
  if (ADMIN_EMAIL) {
    try {
      const ics = buildInvite({
        booking,
        serviceLabel: summary,
        durationMinutes,
        organizerEmail: FROM_EMAIL,
        attendees: [
          { email: ADMIN_EMAIL, name: 'Fabiola Ledesma' },
          { email: booking.email, name: customerName },
        ],
        description: notes,
        cancelled,
        sequence: cancelled ? 1 : 0,
      });

      if (ics) {
        await sendEmailWithInvite({
          to: ADMIN_EMAIL,
          replyTo: booking.email,
          subject: `${cancelled ? 'Cancelada' : 'Nueva sesión'}: ${label} — ${customerName} — ${booking.date} ${booking.time}`,
          method: cancelled ? 'CANCEL' : 'REQUEST',
          ics,
          text: `Sesión ${verb}.\n\n${notes}\n\nCuándo: ${when}`,
          html: emailLayout({
            headerSubtitle: `Sesión ${verb}`,
            bodyHtml: `
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">
                ${cancelled ? 'Se canceló una sesión' : 'Tienes una sesión confirmada'}
              </h2>
              <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
                ${cancelled ? 'El evento se quitó de tu calendario.' : 'Ya quedó en tu calendario.'}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:20px;">
                <tr><td style="padding:20px 24px;color:#374151;font-size:15px;line-height:1.9;">
                  <strong>Servicio:</strong> ${escapeHtml(label)}<br/>
                  <strong>Cuándo:</strong> ${escapeHtml(when)}<br/>
                  <strong>Cliente:</strong> ${escapeHtml(customerName)}<br/>
                  <strong>Correo:</strong> <a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a>
                  ${booking.linkedin ? `<br/><strong>LinkedIn:</strong> ${escapeHtml(booking.linkedin)}` : ''}
                  ${booking.message ? `<br/><strong>Quiere trabajar:</strong> ${escapeHtml(booking.message)}` : ''}
                </td></tr>
              </table>
            `,
            ctaUrl: `${SITE_URL}/admin/`,
            ctaLabel: 'Abrir el panel',
          }),
        });
      }
    } catch (err) {
      console.error('sendBookingInvites (admin) error:', err);
    }
  }

  // ── 2. Customer's copy — no personal address of Fabiola's exposed ─────────
  try {
    const ics = buildInvite({
      booking,
      serviceLabel: `${label} con Fabiola Ledesma`,
      durationMinutes,
      organizerEmail: FROM_EMAIL,
      attendees: [{ email: booking.email, name: customerName }],
      description: `${label} con Fabiola Ledesma.\nEl enlace de la videollamada llega por correo antes de la sesión.`,
      cancelled,
      sequence: cancelled ? 1 : 0,
    });

    if (ics) {
      await sendEmailWithInvite({
        to: booking.email,
        subject: cancelled
          ? `Sesión cancelada — ${booking.date} ${booking.time}`
          : `Tu sesión quedó agendada — ${booking.date} ${booking.time}`,
        method: cancelled ? 'CANCEL' : 'REQUEST',
        ics,
        text: cancelled ? `Tu sesión del ${when} fue cancelada.` : `Tu sesión quedó agendada para el ${when}.`,
        html: emailLayout({
          headerSubtitle: cancelled ? 'Sesión cancelada' : 'Sesión agendada',
          bodyHtml: `
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">
              ${cancelled ? 'Tu sesión fue cancelada' : `¡Listo${booking.name ? `, ${escapeHtml(booking.name.split(' ')[0])}` : ''}!`}
            </h2>
            <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
              ${
                cancelled
                  ? 'El evento se quitó de tu calendario. Puedes agendar de nuevo cuando quieras.'
                  : 'Tu sesión está confirmada y la agregamos a tu calendario. Te enviaré el enlace de la videollamada antes de que nos veamos.'
              }
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:20px;">
              <tr><td style="padding:20px 24px;color:#374151;font-size:15px;line-height:1.9;">
                <strong>Servicio:</strong> ${escapeHtml(label)}<br/>
                <strong>Cuándo:</strong> ${escapeHtml(when)}<br/>
                <strong>Dónde:</strong> Videollamada
              </td></tr>
            </table>
            ${cancelled ? '' : '<p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">Puedes reagendar o cancelar desde tu perfil hasta 24 horas antes.</p>'}
          `,
          ctaUrl: cancelled ? `${SITE_URL}/#agenda` : `${SITE_URL}/profile/`,
          ctaLabel: cancelled ? 'Agendar otra sesión' : 'Ver mi sesión',
        }),
      });
    }
  } catch (err) {
    console.error('sendBookingInvites (customer) error:', err);
  }
}

module.exports = { sendBookingInvites, serviceLabel };
