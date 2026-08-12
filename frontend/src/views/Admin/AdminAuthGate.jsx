'use client';

import { useState } from 'react';

function shell(children) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(82,58,168,0.08)', padding: '2.5rem 2rem' }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--purple-800)', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}>
          Fabiola Ledesma
        </a>
        {children}
      </div>
    </div>
  );
}

function fieldStyle() {
  return {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
}

function LoginForm({ onLogin, onForgot }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await onLogin(password);
    } catch (err) {
      setError(err.message || 'Contraseña incorrecta.');
      setStatus('error');
    }
  }

  return shell(
    <>
      <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
        Panel de administración
      </h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Acceso solo para Fabiola.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={fieldStyle()}
        />
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#b91c1c' }}>{error}</p>
      )}
      <button
        onClick={onForgot}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '1.25rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
      >
        ¿Olvidaste tu contraseña?
      </button>
    </>
  );
}

function ForgotPasswordForm({ requestPasswordReset, onBack }) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  async function handleClick() {
    setStatus('sending');
    setError('');
    try {
      await requestPasswordReset();
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace.');
      setStatus('error');
    }
  }

  return shell(
    status === 'sent' ? (
      <>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
          Revisa tu correo
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Te enviamos un enlace para restablecer tu contraseña. Ábrelo desde este mismo dispositivo.
        </p>
      </>
    ) : (
      <>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
          Restablecer contraseña
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Te mandamos un enlace de acceso a tu correo de administradora.
        </p>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleClick} disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Enviarme un enlace →'}
        </button>
        {status === 'error' && (
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#b91c1c' }}>{error}</p>
        )}
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '1.25rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          ← Volver a iniciar sesión
        </button>
      </>
    )
  );
}

function ResetPasswordForm({ token, resetPassword, onDone }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const canSubmit = newPassword.length >= 8 && newPassword === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setError('');
    try {
      await resetPassword(token, newPassword);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return shell(
      <>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
          Contraseña actualizada
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Ya puedes iniciar sesión con tu contraseña nueva.
        </p>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onDone}>
          Ir al login
        </button>
      </>
    );
  }

  return shell(
    <>
      <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', color: 'var(--purple-900)', marginBottom: '0.75rem' }}>
        Elige tu contraseña nueva
      </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          required
          placeholder="Contraseña nueva"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={fieldStyle()}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.6rem', marginBottom: '1rem' }}>
          Mínimo 8 caracteres.
        </p>
        <input
          type="password"
          required
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={fieldStyle()}
        />
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={!canSubmit || status === 'submitting'}>
          {status === 'submitting' ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#b91c1c' }}>{error}</p>
      )}
    </>
  );
}

function AdminAuthGate({ initialView, token, onLogin, requestPasswordReset, resetPassword, onResetDone }) {
  const [view, setView] = useState(initialView);

  if (view === 'reset') {
    return <ResetPasswordForm token={token} resetPassword={resetPassword} onDone={onResetDone} />;
  }
  if (view === 'forgot') {
    return <ForgotPasswordForm requestPasswordReset={requestPasswordReset} onBack={() => setView('login')} />;
  }
  return <LoginForm onLogin={onLogin} onForgot={() => setView('forgot')} />;
}

export default AdminAuthGate;
