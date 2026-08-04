'use client';

/**
 * Spanish labels and colours for booking/package states, plus date helpers.
 *
 * The states are stored in English because they're the API's contract
 * (`pending`, `confirmed`, …). Screens used to render them raw with
 * `text-transform: capitalize`, so both Fabiola and her customers saw
 * "Pending" and "Confirmed" in an otherwise fully Spanish interface.
 */

export const BOOKING_STATUS = {
  pending: { label: 'Pendiente de pago', color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  confirmed: { label: 'Confirmada', color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
  cancelled: { label: 'Cancelada', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
};

export const PACKAGE_STATUS = {
  pending_payment: { label: 'Pendiente de pago', color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  active: { label: 'Activo', color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
  cancelled: { label: 'Cancelado', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  expired: { label: 'Vencido', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
};

/** Falls back to the raw value rather than hiding an unexpected state. */
export function statusInfo(map, value) {
  return map[value] || { label: value || '—', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' };
}

/** "4 de agosto de 2026, 13:45" in Mexico City time. */
export function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

/**
 * "hace 5 minutos" / "hace 3 días". Answers "is this new?" at a glance, which
 * is what matters when scanning a list of reservations.
 */
export function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 0) return 'en el futuro';
  if (seconds < 60) return 'hace unos segundos';

  const units = [
    { limit: 3600, div: 60, one: 'minuto', many: 'minutos' },
    { limit: 86400, div: 3600, one: 'hora', many: 'horas' },
    { limit: 2592000, div: 86400, one: 'día', many: 'días' },
    { limit: 31536000, div: 2592000, one: 'mes', many: 'meses' },
  ];
  for (const u of units) {
    if (seconds < u.limit) {
      const n = Math.floor(seconds / u.div);
      return `hace ${n} ${n === 1 ? u.one : u.many}`;
    }
  }
  const years = Math.floor(seconds / 31536000);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

/** Shared pill style for a status badge. */
export function badgeStyle(info) {
  return {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: info.color,
    background: info.bg,
    border: `1px solid ${info.border}`,
    borderRadius: '999px',
    padding: '0.15rem 0.6rem',
    whiteSpace: 'nowrap',
  };
}
