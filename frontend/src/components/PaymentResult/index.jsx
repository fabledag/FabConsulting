'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../Nav/index.jsx';
import Footer from '../Footer/index.jsx';
import { apiFetch } from '@/lib/api.js';
import styles from './PaymentResult.module.css';

/**
 * Landing page after Mercado Pago's checkout.
 *
 * The webhook is what actually confirms the booking, and it can land a moment
 * after the buyer is redirected here. So on the success screen we poll the
 * customer's own bookings for a few seconds rather than asserting a state we
 * haven't verified — telling someone "confirmed" before it is would be worse
 * than making them wait two seconds.
 */

const COPY = {
  exito: {
    emoji: '✅',
    title: '¡Listo! Recibimos tu pago',
    body: 'Tu sesión quedó confirmada. Te llegará un correo con los detalles y la invitación para tu calendario.',
    cta: { href: '/profile/', label: 'Ver mi sesión' },
  },
  pendiente: {
    emoji: '⏳',
    title: 'Tu pago está en proceso',
    body: 'Mercado Pago todavía está procesando el cobro. En cuanto se apruebe, tu sesión se confirma sola y te llega un correo. No necesitas hacer nada más.',
    cta: { href: '/profile/', label: 'Ver mis reservas' },
  },
  error: {
    emoji: '⚠️',
    title: 'No se pudo completar el pago',
    body: 'El cobro no se realizó, así que tu sesión no quedó confirmada. Tu horario sigue apartado un momento — puedes intentarlo de nuevo desde tu perfil.',
    cta: { href: '/profile/', label: 'Reintentar el pago' },
  },
};

function PaymentResult({ variant }) {
  const copy = COPY[variant];
  const [confirmed, setConfirmed] = useState(false);
  const [checking, setChecking] = useState(variant === 'exito');

  useEffect(() => {
    if (variant !== 'exito') return undefined;

    let cancelled = false;
    let attempts = 0;

    // Give the webhook a few seconds to arrive before giving up quietly.
    async function poll() {
      attempts += 1;
      try {
        const data = await apiFetch('/me/bookings?scope=upcoming', { auth: true });
        const hit = (data.bookings || []).some((b) => b.status === 'confirmed');
        if (!cancelled && hit) {
          setConfirmed(true);
          setChecking(false);
          return;
        }
      } catch {
        // Not logged in on this device, or offline — the email still arrives.
      }
      if (!cancelled && attempts < 5) setTimeout(poll, 2000);
      else if (!cancelled) setChecking(false);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [variant]);

  return (
    <div className={styles.page}>
      <Nav />
      <main className={`wrap ${styles.main}`}>
        <div className={styles.card}>
          <div className={styles.emoji} aria-hidden="true">{copy.emoji}</div>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.body}>{copy.body}</p>

          {variant === 'exito' && checking && (
            <p className={styles.note} role="status">
              Confirmando con Mercado Pago…
            </p>
          )}
          {variant === 'exito' && !checking && !confirmed && (
            <p className={styles.note}>
              Si tu sesión aún no aparece en tu perfil, dale un minuto — la confirmación
              puede tardar un momento en llegar. El correo te avisará en cuanto esté lista.
            </p>
          )}

          <div className={styles.actions}>
            <Link href={copy.cta.href} className="btn-primary">{copy.cta.label}</Link>
            <Link href="/" className="btn-ghost">Ir al inicio</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PaymentResult;
