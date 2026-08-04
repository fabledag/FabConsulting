'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApiFetch } from '@/lib/adminApi.js';
import { PACKAGE_STATUS, statusInfo, badgeStyle, timeAgo } from '@/lib/status.js';

const PACKAGE_LABELS = {
  'mentoria-4x6': 'Mentoría · 4 sesiones / 6 meses',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending_payment', label: 'Pendiente de pago' },
  { value: 'active', label: 'Activo' },
  { value: 'cancelled', label: 'Cancelado' },
];

function card(children) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
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

function PackagesTab({ onUnauthorized }) {
  const [packages, setPackages] = useState([]);
  const [status, setStatus] = useState('pending_payment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    try {
      const data = await adminApiFetch(`/admin/packages${params.toString() ? `?${params}` : ''}`);
      setPackages(data.packages || []);
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudieron cargar los paquetes.');
    } finally {
      setLoading(false);
    }
  }, [status, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(pkg, newStatus) {
    setError('');
    try {
      await adminApiFetch(`/admin/packages/${pkg.id}`, { method: 'PUT', body: { status: newStatus } });
      await load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo actualizar el paquete.');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
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
      {!loading && packages.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay paquetes con este filtro.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {packages.map((p) =>
          card(
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                  {PACKAGE_LABELS[p.packageType] || p.packageType} — {p.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  <span style={badgeStyle(statusInfo(PACKAGE_STATUS, p.status))}>
                    {statusInfo(PACKAGE_STATUS, p.status).label}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>${p.pricePaidMXN} MXN</span>
                  {p.mpPaymentId && (
                    <span style={{ fontSize: '0.72rem', color: '#065f46' }}>· pagado en línea</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Créditos: {p.usedCredits}/{p.totalCredits} usados · {p.remainingCredits} disponibles
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Comprado {timeAgo(p.purchasedAt)} ({p.purchasedAt?.slice(0, 10)})
                  {p.confirmedAt && ` · Confirmado: ${p.confirmedAt.slice(0, 10)}`}
                  {p.expiresAt && ` · Vence: ${p.expiresAt.slice(0, 10)}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                {p.status === 'pending_payment' && (
                  <>
                    <button style={pillButton()} onClick={() => handleStatusChange(p, 'active')}>Activar</button>
                    <button style={pillButton(true)} onClick={() => handleStatusChange(p, 'cancelled')}>Cancelar</button>
                  </>
                )}
                {p.status === 'active' && (
                  <button style={pillButton(true)} onClick={() => handleStatusChange(p, 'cancelled')}>Cancelar</button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PackagesTab;
