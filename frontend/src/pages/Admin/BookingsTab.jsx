import { useCallback, useEffect, useState } from 'react';
import { adminApiFetch } from '../../adminApi.js';

const SERVICE_LABELS = {
  session: 'Sesión 1:1',
  mock: 'Mock Interview',
  cv: 'Revisión CV + Portafolio',
  mentoria: 'Mentoría',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'cancelled', label: 'Cancelada' },
];

function card(children) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
      {children}
    </div>
  );
}

function inputStyle() {
  return { padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' };
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

function BookingsTab({ onUnauthorized }) {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (date) params.set('date', date);
    if (status) params.set('status', status);
    try {
      const data = await adminApiFetch(`/admin/bookings?${params.toString()}`);
      setBookings(data.bookings || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudieron cargar las reservas.');
    } finally {
      setLoading(false);
    }
  }, [date, status, page, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(booking, newStatus) {
    setError('');
    try {
      await adminApiFetch(`/admin/bookings/${booking.id}`, { method: 'PUT', body: { status: newStatus } });
      await load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo actualizar la reserva.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
          style={inputStyle()}
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          style={inputStyle()}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando…</p>}
      {!loading && bookings.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay reservas con estos filtros.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {bookings.map((b) =>
          card(
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                  {SERVICE_LABELS[b.service] || b.service} — {b.name || b.email}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {b.date} · {b.time} — <span style={{ textTransform: 'capitalize' }}>{b.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {b.email}{b.phone ? ` · ${b.phone}` : ''}
                </div>
                {b.message && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    "{b.message}"
                  </div>
                )}
                {b.packageId && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--purple-600)', marginTop: '0.25rem' }}>
                    Vía paquete de Mentoría
                  </div>
                )}
                {b.rescheduledFromId && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Reagendada desde otra sesión
                  </div>
                )}
                {b.rescheduledToId && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Reagendada hacia otra sesión
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                {b.status === 'pending' && (
                  <>
                    <button style={pillButton()} onClick={() => handleStatusChange(b, 'confirmed')}>Confirmar</button>
                    <button style={pillButton(true)} onClick={() => handleStatusChange(b, 'cancelled')}>Cancelar</button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <button style={pillButton(true)} onClick={() => handleStatusChange(b, 'cancelled')}>Cancelar</button>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
          <button style={pillButton()} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Página {pagination.page} de {pagination.pages}
          </span>
          <button style={pillButton()} disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}

export default BookingsTab;
