import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api.js';
import styles from './SlotPicker.module.css';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Reusable calendar/slot picker backed by the real GET /availability
 * endpoint. Used both for new bookings (Booking) and reschedules (Profile).
 */
function SlotPicker({ onSelect, selectedKey }) {
  const today = useMemo(() => new Date(), []);
  const [monthOffset, setMonthOffset] = useState(0);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryTick, setRetryTick] = useState(0);

  const target = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, [today, monthOffset]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch(`/availability?year=${target.year}&month=${target.month}`)
      .then((data) => {
        if (!cancelled) setCalendar((data.calendar || []).filter((d) => d.slots.some((s) => s.available)));
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos consultar los horarios disponibles. Revisa tu conexión e inténtalo nuevamente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target.year, target.month, retryTick]);

  const handleRetry = useCallback(() => setRetryTick((t) => t + 1), []);

  return (
    <div>
      <div className={styles.weekNav}>
        <button
          type="button"
          className={styles.weekBtn}
          onClick={() => monthOffset > 0 && setMonthOffset(monthOffset - 1)}
          disabled={monthOffset === 0}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className={styles.weekLabel} aria-live="polite">
          {MONTHS[target.month - 1]} {target.year}
        </span>
        <button type="button" className={styles.weekBtn} onClick={() => setMonthOffset(monthOffset + 1)} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      {loading && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} role="status">
          Cargando horarios disponibles…
        </p>
      )}

      {!loading && error && (
        <div style={{ fontSize: '0.85rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem 1rem' }} role="alert">
          <p style={{ margin: '0 0 0.6rem' }}>{error}</p>
          <button type="button" className={styles.weekBtn} style={{ width: 'auto', padding: '0.4rem 0.9rem', borderRadius: '999px' }} onClick={handleRetry}>
            Volver a intentar
          </button>
        </div>
      )}

      {!loading && !error && calendar.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No hay horarios disponibles este mes — prueba con el mes siguiente.
        </p>
      )}

      {!loading && !error && (
        <div className={styles.daysGrid}>
          {calendar.flatMap((day) =>
            day.slots
              .filter((s) => s.available)
              .map((slot) => {
                const key = `${day.date}-${slot.time}`;
                const isSelected = selectedKey === key;
                const dateObj = new Date(`${day.date}T00:00:00`);
                const dateLabel = `${DAY_NAMES[dateObj.getDay()]} ${dateObj.getDate()} ${MONTHS[dateObj.getMonth()].slice(0, 3)}`;
                return (
                  <button
                    type="button"
                    key={key}
                    className={`${styles.daySlot} ${isSelected ? styles.selected : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`${dateLabel}, ${slot.time}${isSelected ? ', seleccionado' : ''}`}
                    onClick={() =>
                      onSelect({
                        key,
                        date: day.date,
                        time: slot.time,
                        dateLabel,
                        timeLabel: slot.time,
                      })
                    }
                  >
                    <div className={styles.dayName}>{DAY_NAMES[dateObj.getDay()]}</div>
                    <div className={styles.dayDate}>{dateObj.getDate()}</div>
                    <div className={styles.dayTime}>{slot.time}</div>
                  </button>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

export default SlotPicker;
