'use client';

/**
 * Storage for an in-progress reservation.
 *
 * Uses localStorage, NOT sessionStorage. The magic-link round trip is the whole
 * reason this exists, and clicking a link in Gmail opens a NEW TAB —
 * sessionStorage is per-tab, so the selection was silently lost exactly when it
 * needed to survive. Users came back logged in, with the booking form reset to
 * step 1 and no idea what had happened.
 *
 * localStorage still doesn't cross devices: opening the email on a phone after
 * starting on a laptop can't be recovered, which is why the confirm step tells
 * people to open the link on the same device.
 */

const PRESELECTED_KEY = 'preselected_service';
const PENDING_KEY = 'pending_booking_selection';

// Private browsing and hardened privacy settings can make storage throw on
// access, so every call is defensive — losing a preselection is a small
// annoyance, but an exception here would break the booking flow entirely.
function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// Fired alongside the write so a Booking widget that's already mounted (a
// card on the same page as #agenda) picks the service up immediately. On a
// fresh page load there's no listener yet and Booking reads storage on mount.
export const PRESELECT_EVENT = 'booking:preselect';

/** Service chosen from a landing card or a /asesorias page. */
export function setPreselectedService(key) {
  write(PRESELECTED_KEY, key);
  try {
    // The key rides along too, for when storage itself is blocked.
    window.dispatchEvent(new CustomEvent(PRESELECT_EVENT, { detail: key }));
  } catch {
    /* ignore */
  }
}

export function takePreselectedService() {
  const value = read(PRESELECTED_KEY);
  if (value) remove(PRESELECTED_KEY);
  return value;
}

/** Full in-progress selection, saved before sending the magic link. */
export function savePendingSelection(selection) {
  write(PENDING_KEY, JSON.stringify(selection));
}

export function takePendingSelection() {
  const raw = read(PENDING_KEY);
  if (!raw) return null;
  remove(PENDING_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * The booking choice, carried in the magic link itself.
 *
 * localStorage only survives in the browser where the booking started. When
 * the email is opened on another device — or in Gmail's in-app browser —
 * the person arrived logged in to an empty widget, went back to the email,
 * and hit "Este enlace ya fue usado" (seen in production on 2026-10-01). So
 * the link also carries service + date + time (+ what to review): nothing
 * personal, just enough to put them back on the confirm step.
 *
 * Format: `<service>_<YYYY-MM-DD>_<HH:MM>[_<i-j-k>]`, review items as
 * indexes into that service's reviewOptions.
 */
export const BOOKING_PARAM = 'reserva';

export function encodeBookingChoice({ selectedService, selectedSlot, reviewItems = [], reviewOptions = [] }) {
  if (!selectedService || !selectedSlot) return '';
  const idx = reviewItems.map((r) => reviewOptions.indexOf(r)).filter((i) => i >= 0);
  return [selectedService, selectedSlot.date, selectedSlot.time, ...(idx.length ? [idx.join('-')] : [])].join('_');
}

export function decodeBookingChoice(raw, services) {
  if (!raw) return null;
  const [service, date, time, idx] = raw.split('_');
  const svc = services[service];
  if (!svc || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) return null;
  const options = svc.reviewOptions || [];
  const reviewItems = (idx || '')
    .split('-')
    .map(Number)
    .filter((i) => Number.isInteger(i) && options[i])
    .map((i) => options[i]);
  return { selectedService: service, date, time, reviewItems };
}
