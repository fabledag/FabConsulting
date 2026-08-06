'use strict';

/**
 * iCalendar (.ics) invitations for confirmed sessions.
 *
 * WHY .ics AND NOT THE GOOGLE CALENDAR API
 * Fabiola's calendar lives on a personal Gmail account, not Google Workspace.
 * A service account with domain-wide delegation — the usual server-to-server
 * route — only works for Workspace domains, so the API path would require a
 * user OAuth consent flow plus a stored refresh token that silently expires
 * while a Cloud project sits in "testing". An emailed invitation needs no
 * credentials at all, and Gmail adds incoming invitations to the calendar
 * automatically. Fewer moving parts, nothing to renew.
 *
 * PRIVACY NOTE
 * Two separate invitations are generated rather than one shared event: the
 * customer's copy never lists Fabiola's personal Gmail as an attendee. She
 * deliberately removed that address from the site footer, so it must not leak
 * through a calendar invite either. The trade-off is that RSVP status doesn't
 * sync back — she sees the booking in the admin panel instead.
 */

const { slotTimestamp } = require('./time');

const ORGANIZER_NAME = 'Fabiola Ledesma';

/** iCalendar timestamp in UTC: 20260806T210000Z */
function toIcsUtc(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escapes a value for an iCalendar text field: backslashes, semicolons,
 * commas and newlines are all significant in the format.
 */
function escapeIcs(value) {
  if (!value) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * RFC 5545 says lines must not exceed 75 octets; longer ones are folded onto
 * continuation lines starting with a space. Gmail tolerates long lines, but
 * other clients don't, and descriptions here are easily longer than that.
 */
function foldLine(line) {
  if (Buffer.byteLength(line, 'utf8') <= 75) return line;
  const out = [];
  let current = '';
  for (const char of line) {
    if (Buffer.byteLength(current + char, 'utf8') > 73) {
      out.push(current);
      current = ' ';
    }
    current += char;
  }
  if (current.trim()) out.push(current);
  return out.join('\r\n');
}

/**
 * Builds a METHOD:REQUEST invitation for one booking.
 *
 * `attendees` is a list of { email, name }. Give the recipient's own address
 * only — see the privacy note above.
 */
function buildInvite({
  booking,
  serviceLabel,
  durationMinutes = 60,
  organizerEmail,
  attendees = [],
  description = '',
  sequence = 0,
  cancelled = false,
}) {
  const startMs = slotTimestamp(booking.date, booking.time);
  if (Number.isNaN(startMs)) return null;
  const endMs = startMs + durationMinutes * 60000;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fabiola Ledesma//Reservas//ES',
    'CALSCALE:GREGORIAN',
    `METHOD:${cancelled ? 'CANCEL' : 'REQUEST'}`,
    'BEGIN:VEVENT',
    // Stable per booking, so a later update or cancellation replaces the
    // original event instead of creating a second one.
    `UID:booking-${booking.id}@fabdesign.digital`,
    `DTSTAMP:${toIcsUtc(Date.now())}`,
    `DTSTART:${toIcsUtc(startMs)}`,
    `DTEND:${toIcsUtc(endMs)}`,
    `SUMMARY:${escapeIcs(serviceLabel)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'LOCATION:Videollamada',
    `ORGANIZER;CN=${escapeIcs(ORGANIZER_NAME)}:mailto:${organizerEmail}`,
    // PARTSTAT=ACCEPTED;RSVP=FALSE on purpose. With NEEDS-ACTION + RSVP=TRUE,
    // Gmail mails the RSVP back to the ORGANIZER — no-reply@fabdesign.digital,
    // an address the domain cannot receive on. Every accept/decline then bounced
    // around for 21 hours and landed in the inbox as a delivery-delay notice.
    // Nothing is lost: RSVP status never synced back anyway (see note above),
    // the booking state lives in the admin panel.
    ...attendees.map(
      (a) =>
        `ATTENDEE;CN=${escapeIcs(a.name || a.email)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${a.email}`
    ),
    `SEQUENCE:${sequence}`,
    `STATUS:${cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    'TRANSP:OPAQUE',
    // A reminder an hour before. Gmail honours this on import.
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de sesión',
    'TRIGGER:-PT60M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n');
}

module.exports = { buildInvite, escapeIcs };
