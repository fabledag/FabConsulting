'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';
import { useNavigate } from '@/lib/navigation.js';
import AdminAuthGate from './AdminAuthGate.jsx';
import BookingsTab from './BookingsTab.jsx';
import PackagesTab from './PackagesTab.jsx';
import AvailabilityTab from './AvailabilityTab.jsx';
import BlogTab from './BlogTab.jsx';

const TABS = [
  { key: 'bookings', label: 'Reservas' },
  { key: 'packages', label: 'Mentoría' },
  { key: 'availability', label: 'Disponibilidad' },
  { key: 'blog', label: 'Blog' },
];

function Admin() {
  const { loggedIn, login, logout, requestPasswordReset, resetPassword } = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');

  // Checked before `loggedIn` so clicking the emailed reset link still shows
  // the reset form even if there's a stale admin session in this browser.
  // Read after mount — `window` doesn't exist while the page is pre-rendered.
  const [resetToken, setResetToken] = useState(null);
  useEffect(() => {
    setResetToken(new URLSearchParams(window.location.search).get('token'));
  }, []);

  if (resetToken) {
    return (
      <AdminAuthGate
        initialView="reset"
        token={resetToken}
        resetPassword={resetPassword}
        onResetDone={() => navigate('/admin')}
      />
    );
  }

  if (!loggedIn) {
    return <AdminAuthGate initialView="login" onLogin={login} requestPasswordReset={requestPasswordReset} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="wrap" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <a href="/" style={{ color: 'var(--purple-800)', fontWeight: 700, textDecoration: 'none' }}>
            ← Fabiola Ledesma
          </a>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.5rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            Cerrar sesión
          </button>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.8rem', color: 'var(--purple-900)', marginBottom: '1.5rem' }}>
          Panel de administración
        </h1>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                border: tab === key ? 'none' : '1px solid var(--border)',
                background: tab === key ? 'var(--purple-800)' : '#ffffff',
                color: tab === key ? '#ffffff' : 'var(--text-muted)',
                borderRadius: '999px',
                padding: '0.5rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && <BookingsTab onUnauthorized={logout} />}
        {tab === 'packages' && <PackagesTab onUnauthorized={logout} />}
        {tab === 'availability' && <AvailabilityTab onUnauthorized={logout} />}
        {tab === 'blog' && <BlogTab onUnauthorized={logout} />}
      </div>
    </div>
  );
}

export default Admin;
