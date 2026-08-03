import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { apiFetch } from '../../api.js';
import { navigate } from '../../router.js';
import SlotPicker from '../../components/SlotPicker/index.jsx';
import { getDisplayName } from '../../utils/displayName.js';

const SERVICE_LABELS = {
  session: 'Sesión 1:1',
  mock: 'Mock Interview',
  cv: 'Revisión CV + Portafolio',
  mentoria: 'Mentoría',
};

function card(children, extra = {}) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', ...extra }}>
      {children}
    </div>
  );
}

function Profile() {
  const { user, loading: authLoading, logout, refreshProfile } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [b, p, n] = await Promise.all([
        apiFetch('/me/bookings?scope=upcoming', { auth: true }),
        apiFetch('/me/packages', { auth: true }),
        apiFetch('/me/notifications', { auth: true }),
      ]);
      setBookings(b.bookings || []);
      setPackages(p.packages || []);
      setNotifications(n.notifications || []);
    } catch (err) {
      setActionError(err.message || 'No se pudo cargar tu información.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/profile');
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      loadAll();
    }
  }, [user, loadAll]);

  // The name isn't collected at signup (magic-link login only asks for
  // email) — auto-save a guessed first name from the email once, so the
  // profile always shows something saved instead of an empty editable field.
  useEffect(() => {
    if (user && !user.name) {
      apiFetch('/me', { method: 'PUT', auth: true, body: { name: getDisplayName(user) } })
        .then(refreshProfile)
        .catch(() => {});
    }
  }, [user, refreshProfile]);

  async function handleCancel(booking) {
    if (!window.confirm(`¿Cancelar tu sesión del ${booking.date} a las ${booking.time}?`)) return;
    setActionError('');
    try {
      await apiFetch(`/me/bookings/${booking.id}/cancel`, { method: 'POST', auth: true });
      await loadAll();
    } catch (err) {
      setActionError(err.message || 'No se pudo cancelar la sesión.');
    }
  }

  async function handleReschedule(booking, slot) {
    setActionError('');
    try {
      await apiFetch(`/me/bookings/${booking.id}/reschedule`, {
        method: 'PUT',
        auth: true,
        body: { date: slot.date, time: slot.time },
      });
      setReschedulingId(null);
      await loadAll();
    } catch (err) {
      setActionError(err.message || 'No se pudo reagendar la sesión.');
    }
  }

  async function handleMarkRead(notif) {
    if (notif.read) return;
    try {
      await apiFetch(`/me/notifications/${notif.id}/read`, { method: 'PUT', auth: true });
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    } catch {
      // non-critical, ignore
    }
  }

  async function handleSavePhone(e) {
    e.preventDefault();
    setSavingProfile(true);
    setActionError('');
    try {
      await apiFetch('/me', { method: 'PUT', auth: true, body: { phone } });
      await refreshProfile();
    } catch (err) {
      setActionError(err.message || 'No se pudo guardar tu teléfono.');
    } finally {
      setSavingProfile(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="wrap" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '860px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
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

        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.8rem', color: 'var(--purple-900)', marginBottom: '2rem' }}>
          Hola{getDisplayName(user) ? `, ${getDisplayName(user)}` : ''}
        </h1>

        {actionError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {actionError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming sessions */}
          {card(
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--purple-900)', marginBottom: '1rem' }}>Tus próximas sesiones</h2>
              {loadingData && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando…</p>}
              {!loadingData && bookings.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes sesiones agendadas.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                          {SERVICE_LABELS[b.service] || b.service}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {b.date} · {b.time} — <span style={{ textTransform: 'capitalize' }}>{b.status}</span>
                        </div>
                      </div>
                      {b.canModify ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setReschedulingId(reschedulingId === b.id ? null : b.id)}
                            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', color: 'var(--purple-800)', cursor: 'pointer' }}
                          >
                            Reagendar
                          </button>
                          <button
                            onClick={() => handleCancel(b)}
                            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', color: '#b91c1c', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '220px', textAlign: 'right' }}>
                          Faltan menos de 24h — escríbele a Fabiola directamente para cambios.
                        </div>
                      )}
                    </div>
                    {reschedulingId === b.id && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <SlotPicker onSelect={(slot) => handleReschedule(b, slot)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Credits / packages */}
          {card(
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--purple-900)', marginBottom: '1rem' }}>Tus créditos</h2>
              {!loadingData && packages.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Aún no tienes un paquete de Mentoría.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: packages.length ? '1rem' : 0 }}>
                {packages.map((p) => (
                  <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Mentoría</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.status.replace('_', ' ')}</div>
                    </div>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.3rem', color: 'var(--purple-800)' }}>
                      {p.remainingCredits}/{p.totalCredits}
                    </div>
                  </div>
                ))}
              </div>
              <a href="/#agenda" className="btn-ghost" style={{ display: 'inline-flex' }}>
                Comprar Mentoría →
              </a>
            </>
          )}

          {/* Notifications */}
          {card(
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--purple-900)', marginBottom: '1rem' }}>Notificaciones</h2>
              {!loadingData && notifications.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes notificaciones.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n)}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      cursor: n.read ? 'default' : 'pointer',
                      background: n.read ? 'transparent' : 'var(--purple-50)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.body}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Profile info */}
          {card(
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--purple-900)', marginBottom: '1rem' }}>Tu información</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>
                    Correo
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>{user.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>
                    Nombre
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>{user.name || getDisplayName(user)}</div>
                </div>
              </div>
              <form onSubmit={handleSavePhone} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px' }}>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', fontFamily: 'inherit' }}
                />
                <button className="btn-primary" style={{ alignSelf: 'flex-start' }} type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Guardando…' : 'Guardar teléfono'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
