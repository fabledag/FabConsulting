'use strict';

/**
 * Time helpers anchored to America/Mexico_City.
 *
 * WHY THIS EXISTS
 * Lambda runs in UTC. Slots are stored as wall-clock strings ("2026-08-04",
 * "11:00") that mean *Mexico City* time. The old code did
 * `new Date(`${date}T${time}:00`)`, which Node parses in the runtime's zone —
 * UTC — so an 11:00 CDMX slot became 11:00 UTC, i.e. 05:00 CDMX. Six hours
 * adrift. In the afternoon that made valid, still-future slots compare as past
 * and the booking was rejected with "Cannot book a slot in the past".
 *
 * Mexico abolished DST in 2022 (fixed UTC-6), but the offset is derived via
 * Intl rather than hardcoded so this keeps working if that ever changes.
 */

const TIME_ZONE = 'America/Mexico_City';

/**
 * Minimum notice before a session, in whole calendar days.
 *
 * Business rule set by Fabiola (2026-08-04): "reservas con mínimo dos días de
 * anticipación". Counted in calendar days, not rolling hours — if today is the
 * 4th, the earliest bookable date is the 6th, at any of its times. That's what
 * "dos días de anticipación" means in plain Spanish, and it's what the site
 * tells visitors, so keep the two in step if this ever changes.
 */
const MIN_LEAD_DAYS = 2;

/** Offset of Mexico City from UTC, in minutes, at a given instant. */
function offsetMinutesAt(instant) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value]));
  // Intl can render midnight as hour "24"; normalise it.
  const hour = p.hour === '24' ? 0 : Number(p.hour);
  const asIfUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second));
  return (asIfUtc - instant.getTime()) / 60000;
}

/**
 * Converts a Mexico City wall-clock date+time into a real UTC timestamp (ms).
 * Iterates twice so a slot sitting near a DST boundary resolves correctly.
 */
function slotTimestamp(date, time) {
  const naive = Date.parse(`${date}T${time}:00Z`);
  if (Number.isNaN(naive)) return NaN;
  let guess = naive;
  for (let i = 0; i < 2; i += 1) {
    guess = naive - offsetMinutesAt(new Date(guess)) * 60000;
  }
  return guess;
}

/** Current date and time in Mexico City, as comparable strings. */
function nowInMexicoCity() {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(now).map((x) => [x.type, x.value]));
  const hour = p.hour === '24' ? '00' : p.hour;
  return {
    date: `${p.year}-${p.month}-${p.day}`, // YYYY-MM-DD, string-comparable
    time: `${hour}:${p.minute}`, // HH:MM, string-comparable
    timestamp: now.getTime(),
  };
}

/** True when the slot has already started in Mexico City. */
function isSlotInPast(date, time) {
  const ts = slotTimestamp(date, time);
  if (Number.isNaN(ts)) return true;
  return ts <= Date.now();
}

/**
 * Earliest date a visitor may book, as YYYY-MM-DD: today in Mexico City plus
 * MIN_LEAD_DAYS. Anything before this is refused by the API and never listed
 * by /availability.
 */
function earliestBookableDate() {
  const { date } = nowInMexicoCity();
  const [y, m, d] = date.split('-').map(Number);
  // Built in UTC purely as a calendar calculation — no clock involved, so the
  // zone can't shift the result.
  const shifted = new Date(Date.UTC(y, m - 1, d + MIN_LEAD_DAYS));
  const p = (n) => String(n).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${p(shifted.getUTCMonth() + 1)}-${p(shifted.getUTCDate())}`;
}

/** Human-readable Spanish date ("jueves 6 de agosto"), for error messages. */
function formatDateEs(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** True when the date is sooner than the required notice allows. */
function isBeforeMinimumNotice(date) {
  return date < earliestBookableDate();
}

/** Milliseconds from now until the slot starts (negative once it has passed). */
function msUntilSlot(date, time) {
  return slotTimestamp(date, time) - Date.now();
}

module.exports = {
  TIME_ZONE,
  MIN_LEAD_DAYS,
  slotTimestamp,
  nowInMexicoCity,
  isSlotInPast,
  msUntilSlot,
  earliestBookableDate,
  isBeforeMinimumNotice,
  formatDateEs,
};
