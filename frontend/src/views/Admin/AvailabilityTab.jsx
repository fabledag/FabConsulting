'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApiFetch } from '@/lib/adminApi.js';
import { apiFetch } from '@/lib/api.js';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function card(children) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
      {children}
    </div>
  );
}

function pillButton(danger = false) {
  return {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    padding: '0.4rem 0.9rem',
    fontSize: '0.78rem',
    color: danger ? '#b91c1c' : 'var(--purple-800)',
    cursor: 'pointer',
  };
}

function inputStyle() {
  return { padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' };
}

function WeeklyRulesSection({ onUnauthorized }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ dayOfWeek: '1', timeSlot: '09:00', durationMinutes: 60, active: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApiFetch('/admin/availability');
      setRules(data.rules || []);
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo cargar la disponibilidad.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApiFetch('/admin/availability', {
        method: 'POST',
        body: {
          dayOfWeek: Number(form.dayOfWeek),
          timeSlot: form.timeSlot,
          durationMinutes: Number(form.durationMinutes),
          active: form.active,
        },
      });
      await load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo guardar el horario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rule) {
    setError('');
    try {
      await adminApiFetch(`/admin/availability/${rule.dayOfWeek}:${rule.timeSlot}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo eliminar el horario.');
    }
  }

  return card(
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--purple-900)', marginBottom: '1rem' }}>Horarios semanales</h2>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando…</p>}
      {!loading && rules.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>No hay horarios configurados.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {rules.map((r) => (
          <div key={`${r.dayOfWeek}:${r.timeSlot}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
              <strong>{DAY_NAMES[r.dayOfWeek]}</strong> · {r.timeSlot} · {r.durationMinutes} min
              {!r.active && <span style={{ color: 'var(--text-muted)' }}> (inactivo)</span>}
            </div>
            <button style={pillButton(true)} onClick={() => handleDelete(r)}>Eliminar</button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))} style={inputStyle()}>
          {DAY_NAMES.map((name, i) => (
            <option key={i} value={i}>{name}</option>
          ))}
        </select>
        <input type="time" value={form.timeSlot} onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))} style={inputStyle()} />
        <input
          type="number"
          min={15}
          max={480}
          value={form.durationMinutes}
          onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
          style={{ ...inputStyle(), width: '90px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          Activo
        </label>
        <button className="btn-primary" type="submit" disabled={saving} style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem' }}>
          {saving ? 'Guardando…' : 'Guardar horario'}
        </button>
      </form>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Si el día y hora ya existen, se actualiza en vez de duplicarse.
      </p>
    </>
  );
}

function BlockedDatesSection({ onUnauthorized }) {
  const today = useMemo(() => new Date(), []);
  const [monthOffset, setMonthOffset] = useState(0);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const target = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, [today, monthOffset]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/availability?year=${target.year}&month=${target.month}`);
      setDays(data.calendar || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el calendario.');
    } finally {
      setLoading(false);
    }
  }, [target.year, target.month]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBlock(date) {
    const reason = window.prompt(`¿Motivo para bloquear ${date}? (opcional)`) || '';
    setError('');
    try {
      await adminApiFetch('/admin/block-date', { method: 'POST', body: { date, reason } });
      await load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo bloquear la fecha.');
    }
  }

  async function handleUnblock(date) {
    setError('');
    try {
      await adminApiFetch(`/admin/block-date/${date}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo desbloquear la fecha.');
    }
  }

  return card(
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--purple-900)', marginBottom: '1rem' }}>Fechas bloqueadas</h2>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button style={pillButton()} onClick={() => monthOffset > 0 && setMonthOffset(monthOffset - 1)} disabled={monthOffset === 0}>‹</button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {MONTHS[target.month - 1]} {target.year}
        </span>
        <button style={pillButton()} onClick={() => setMonthOffset(monthOffset + 1)}>›</button>
      </div>

      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '360px', overflowY: 'auto' }}>
        {days.map((day) => (
          <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.85rem' }}>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-dark)' }}>
              {day.date} {day.blocked && <span style={{ color: '#b91c1c', fontSize: '0.72rem', fontWeight: 600 }}>· Bloqueada</span>}
            </div>
            {day.blocked ? (
              <button style={pillButton()} onClick={() => handleUnblock(day.date)}>Desbloquear</button>
            ) : (
              <button style={pillButton(true)} onClick={() => handleBlock(day.date)}>Bloquear</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function AvailabilityTab({ onUnauthorized }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WeeklyRulesSection onUnauthorized={onUnauthorized} />
      <BlockedDatesSection onUnauthorized={onUnauthorized} />
    </div>
  );
}

export default AvailabilityTab;
