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
