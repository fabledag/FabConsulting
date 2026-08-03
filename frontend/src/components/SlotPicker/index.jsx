import { useEffect, useMemo, useState } from 'react';
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
      .catch((err) => {
        if (!cancelled) setError(err.message || 'No se pudo cargar la disponibilidad.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target.year, target.month]);

  return (
    <div>
      <div className={styles.weekNav}>
        <button
          type="button"
          className={styles.weekBtn}
          onClick={() => monthOffset > 0 && setMonthOffset(monthOffset - 1)}
          disabled={monthOffset === 0}
        >
          ‹
        </button>
        <span className={styles.weekLabel}>
          {MONTHS[target.month - 1]} {target.year}
        </span>
        <button type="button" className={styles.weekBtn} onClick={() => setMonthOffset(monthOffset + 1)}>
          ›
        </button>
      </div>

      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando horarios…</p>}
      {error && <p style={{ fontSize: '0.85rem', color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && calendar.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay horarios disponibles este mes.</p>
      )}

      <div className={styles.daysGrid}>
        {calendar.flatMap((day) =>
          day.slots
            .filter((s) => s.available)
            .map((slot) => {
              const key = `${day.date}-${slot.time}`;
              const isSelected = selectedKey === key;
              const dateObj = new Date(`${day.date}T00:00:00`);
              return (
                <div
                  key={key}
                  className={`${styles.daySlot} ${isSelected ? styles.selected : ''}`}
                  onClick={() =>
                    onSelect({
                      key,
                      date: day.date,
                      time: slot.time,
                      dateLabel: `${DAY_NAMES[dateObj.getDay()]} ${dateObj.getDate()} ${MONTHS[dateObj.getMonth()].slice(0, 3)}`,
                      timeLabel: slot.time,
                    })
                  }
                >
                  <div className={styles.dayName}>{DAY_NAMES[dateObj.getDay()]}</div>
                  <div className={styles.dayDate}>{dateObj.getDate()}</div>
                  <div className={styles.dayTime}>{slot.time}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

export default SlotPicker;
