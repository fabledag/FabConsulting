'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from '@/lib/navigation.js';
import { getLastEmail } from '@/lib/api.js';

/**
 * Reads the magic-link params from the URL.
 *
 * Accepts both shapes: the current `/login/?token=…` and the legacy
 * `/#/login?token=…` that the pre-Next backend used to email out. Links live
 * 15 minutes, so the legacy branch only matters for the handful of emails in
 * flight around a deploy — but dropping it would show those users a spurious
 * "enlace inválido".
 */
function readLinkParams() {
  if (typeof window === 'undefined') return { token: null, redirect: '/profile' };

  const direct = new URLSearchParams(window.location.search);
  let token = direct.get('token');
  let redirect = direct.get('redirect');

  if (!token && window.location.hash.startsWith('#/login')) {
    const legacy = new URLSearchParams(window.location.hash.split('?')[1] || '');
    token = legacy.get('token');
    redirect = redirect || legacy.get('redirect');
  }

  return { token, redirect: redirect || '/profile' };
}

function Login() {
  const { requestLink, verify } = useAuth();
  const navigate = useNavigate();

  // Read after mount: during static export there is no `window`, and reading
  // it at render time would desync the hydrated markup.
  const [{ token, redirect }, setLinkParams] = useState({ token: null, redirect: '/profile' });
  useEffect(() => setLinkParams(readLinkParams()), []);

  const [email, setEmail] = useState('');
  useEffect(() => setEmail(getLastEmail()), []);

  const [status, setStatus] = useState('idle'); // idle | sending | sent | verifying | error
  const [error, setError] = useState('');

  async function handleRequestLink(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      await requestLink(email);
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace.');
      setStatus('error');
    }
  }

  async function handleConfirm() {
    setStatus('verifying');
    try {
      await verify(token);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'El enlace no es válido o ya expiró.');
      setStatus('error');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(82,58,168,0.08)', padding: '2.5rem 2rem' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.25rem',
            padding: '0.4rem 0.9rem',
            border: '1px solid rgba(82,58,168,0.15)',
            borderRadius: '999px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.8rem',
          }}
        >
          ← Regresar
        </a>

        <a href="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--purple-800)', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}>
          Fabiola Ledesma
        </a>

        {token ? (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
              Confirma tu inicio de sesión
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Por seguridad, necesitamos que confirmes con un clic que fuiste tú quien abrió este enlace.
            </p>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleConfirm}
              disabled={status === 'verifying'}
            >
              {status === 'verifying' ? 'Confirmando…' : 'Confirmar inicio de sesión'}
            </button>
            {status === 'error' && (
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#b91c1c' }}>{error}</p>
            )}
          </>
        ) : status === 'sent' ? (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
              Revisa tu correo
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Te enviamos un enlace de acceso a <strong style={{ color: 'var(--text-dark)' }}>{email}</strong>. Ábrelo desde este mismo dispositivo para entrar a tu cuenta.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
              Entra a tu cuenta
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Sin contraseñas — te mandamos un enlace de acceso a tu correo.
            </p>
            <form onSubmit={handleRequestLink}>
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : 'Enviarme el enlace →'}
              </button>
            </form>
            {status === 'error' && (
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#b91c1c' }}>{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
