import { useEffect, useState } from 'react';
import FadeUp from '../FadeUp/index.jsx';
import SlotPicker from '../SlotPicker/index.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { apiFetch, getLastEmail } from '../../api.js';
import styles from './Booking.module.css';

const TRUST_ITEMS = [
  {
    icon: 'fa-solid fa-bullseye',
    title: '100% personalizado',
    body: 'Todo lo que hablemos es para tu situación específica, no respuestas de manual ni consejos genéricos.',
  },
  {
    icon: 'fa-solid fa-lightbulb',
    title: 'Recomendaciones con criterio',
    body: 'Te doy perspectiva real desde +15 años en la industria, no teoría de curso.',
  },
  {
    icon: 'fa-solid fa-envelope',
    title: 'Correo de confirmación automático',
    body: 'Al agendar recibirás un correo con todos los detalles de pago para reservar tu lugar.',
  },
  {
    icon: 'fa-solid fa-lock',
    title: 'Tu sesión se confirma con el pago',
    body: 'Una vez recibido el depósito, te confirmo la sesión y queda tu lugar apartado.',
  },
];

const SERVICES = {
  session: {
    name: 'Sesión 1:1',
    label: 'Sesión 1:1 (60 min)',
    desc: '60 min · Un problema específico o claridad sobre tu carrera',
    price: 800,
    display: '$800 MXN',
    tag: 'Más popular',
  },
  mock: {
    name: 'Mock Interview',
    label: 'Mock Interview',
    desc: 'Simulación real + feedback honesto sin rodeos',
    price: 900,
    display: '$900 MXN',
    tag: 'Proceso',
    tagPlain: true,
  },
  cv: {
    name: 'Revisión CV + Portafolio',
    label: 'Revisión CV + Portafolio',
    desc: 'Feedback directo desde lo que realmente evalúan los hiring managers',
    price: 1200,
    display: '$1,200 MXN',
    tag: 'Profundo',
    tagPlain: true,
  },
  mentoria: {
    name: 'Mentoría',
    label: 'Mentoría · 4 sesiones / 6 meses',
    desc: '4 sesiones a lo largo de 6 meses · Ahorra $400 vs sueltas',
    price: 2800,
    display: '$2,800 MXN',
    tag: 'Continuo',
    tagPlain: true,
  },
};

const PENDING_SELECTION_KEY = 'pending_booking_selection';

function Booking() {
  const { user, requestLink } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [email, setEmail] = useState(getLastEmail);
  const [linkStatus, setLinkStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const [activePackage, setActivePackage] = useState(null);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { booking, paypalUrl? }

  const canGoToStep2 = Boolean(selectedService);
  const canGoToStep3 = Boolean(selectedSlot);

  // Restore an in-progress selection after the magic-link round trip.
  useEffect(() => {
    if (!user) return;
    const saved = sessionStorage.getItem(PENDING_SELECTION_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.selectedService) setSelectedService(parsed.selectedService);
      if (parsed.selectedSlot) setSelectedSlot(parsed.selectedSlot);
      setStep(3);
    } catch {
      // ignore malformed storage
    } finally {
      sessionStorage.removeItem(PENDING_SELECTION_KEY);
    }
  }, [user]);

  // When logged in and reaching step 3 for the mentoria service, check credits.
  useEffect(() => {
    if (!user || step !== 3 || selectedService !== 'mentoria') {
      setActivePackage(null);
      return;
    }
    setLoadingPackages(true);
    apiFetch('/me/packages', { auth: true })
      .then((data) => {
        const active = (data.packages || []).find((p) => p.status === 'active' && p.remainingCredits > 0);
        setActivePackage(active || null);
      })
      .catch(() => setActivePackage(null))
      .finally(() => setLoadingPackages(false));
  }, [user, step, selectedService]);

  async function handleRequestLink(e) {
    e.preventDefault();
    if (!email) return;
    setLinkStatus('sending');
    setError('');
    sessionStorage.setItem(PENDING_SELECTION_KEY, JSON.stringify({ selectedService, selectedSlot }));
    try {
      await requestLink(email, '/');
      setLinkStatus('sent');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace.');
      setLinkStatus('idle');
    }
  }

  async function handleBookWithCredit() {
    setSubmitting(true);
    setError('');
    try {
      const data = await apiFetch('/me/bookings', {
        method: 'POST',
        auth: true,
        body: { date: selectedSlot.date, time: selectedSlot.time, service: selectedService, packageId: activePackage.id },
      });
      setResult({ booking: data.booking });
    } catch (err) {
      setError(err.message || 'No se pudo agendar la sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBuyPackage() {
    setSubmitting(true);
    setError('');
    try {
      const data = await apiFetch('/me/packages', { method: 'POST', auth: true, body: { packageType: 'mentoria-4x6' } });
      window.open(data.paypalUrl, '_blank', 'noopener,noreferrer');
      setResult({ package: data.package, paypalUrl: data.paypalUrl });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar la compra del paquete.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBookAndPay() {
    setSubmitting(true);
    setError('');
    try {
      const data = await apiFetch('/me/bookings', {
        method: 'POST',
        auth: true,
        body: { date: selectedSlot.date, time: selectedSlot.time, service: selectedService },
      });
      const svc = SERVICES[selectedService];
      const note = encodeURIComponent(`${svc.label} - ${data.booking.id}`);
      const paypalUrl = `https://paypal.me/fabledag/${svc.price}MXN?note=${note}`;
      window.open(paypalUrl, '_blank', 'noopener,noreferrer');
      setResult({ booking: data.booking, paypalUrl });
    } catch (err) {
      setError(err.message || 'No se pudo agendar la sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="agenda" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div className={styles.bookingInnerResponsive}>
          {/* Info column */}
          <div>
            <FadeUp>
              <span className="section-eyebrow">Agenda</span>
            </FadeUp>
            <FadeUp delay="0.05s">
              <h2 className="section-title">
                Agenda tu
                <br />
                <em>sesión</em>
              </h2>
            </FadeUp>
            <FadeUp delay="0.1s">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                Elige el tipo de sesión que necesitas, tu horario, y confirma con tu cuenta. Podrás reagendar o
                cancelar tú mismo/a desde tu perfil cuando quieras (hasta 24h antes).
              </p>
            </FadeUp>
            <FadeUp delay="0.15s">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {TRUST_ITEMS.map(({ icon, title, body }) => (
                  <div key={title} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.2rem', flexShrink: 0, width: '2rem', textAlign: 'center', marginTop: '1px', color: 'var(--purple-600)' }}>
                      <i className={icon} aria-hidden="true" />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.2rem', fontWeight: 600 }}>
                        {title}
                      </strong>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Booking form column */}
          <FadeUp delay="0.2s">
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(82,58,168,0.06)' }}>
              <div className={styles.steps}>
                <div className={`${styles.step} ${step === 1 ? styles.active : ''} ${step > 1 ? styles.done : ''}`}>
                  <span className={styles.stepNum}>1</span>
                  <span className={styles.stepLabel}>Servicio</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step === 2 ? styles.active : ''} ${step > 2 ? styles.done : ''}`}>
                  <span className={styles.stepNum}>2</span>
                  <span className={styles.stepLabel}>Fecha</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
                  <span className={styles.stepNum}>3</span>
                  <span className={styles.stepLabel}>Confirmar</span>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <div className={styles.stepTitle}>¿Qué tipo de sesión necesitas?</div>
                  <p className={styles.stepSubtitle}>Elige el servicio que mejor se adapta a lo que buscas</p>
                  <div className={styles.serviceOptions}>
                    {Object.entries(SERVICES).map(([key, svc]) => (
                      <div
                        key={key}
                        className={`${styles.serviceOption} ${selectedService === key ? styles.selected : ''}`}
                        onClick={() => setSelectedService(key)}
                      >
                        <div className={styles.soptTop}>
                          <span className={`${styles.soptTag} ${svc.tagPlain ? styles.soptTagPlain : ''}`}>{svc.tag}</span>
                        </div>
                        <div className={styles.soptName}>{svc.name}</div>
                        <div className={styles.soptDesc}>{svc.desc}</div>
                        <div className={styles.soptPrice}>
                          {svc.display.split(' ')[0]} <span>MXN</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className={styles.formSubmit} disabled={!canGoToStep2} onClick={() => setStep(2)}>
                    Elegir fecha →
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <div className={styles.stepTitle}>Elige tu fecha y horario</div>
                  <p className={styles.stepSubtitle}>Hora Ciudad de México (CST)</p>
                  <SlotPicker selectedKey={selectedSlot?.key} onSelect={setSelectedSlot} />
                  <div className={styles.actionsRow}>
                    <button className={styles.btnBack} onClick={() => setStep(1)}>
                      ← Regresar
                    </button>
                    <button className={styles.formSubmit} disabled={!canGoToStep3} onClick={() => setStep(3)}>
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && !result && (
                <div>
                  {!user ? (
                    <>
                      <div className={styles.stepTitle}>Entra a tu cuenta para confirmar</div>
                      <p className={styles.stepSubtitle}>
                        Sin contraseñas — te mandamos un enlace de acceso a tu correo. Tu selección queda guardada.
                      </p>
                      {linkStatus === 'sent' ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                          Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este dispositivo para volver aquí y terminar de agendar.
                        </p>
                      ) : (
                        <form onSubmit={handleRequestLink}>
                          <input
                            type="email"
                            required
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          />
                          <button className={styles.formSubmit} type="submit" disabled={linkStatus === 'sending'}>
                            {linkStatus === 'sending' ? 'Enviando…' : 'Enviarme el enlace →'}
                          </button>
                        </form>
                      )}
                      <button className={styles.btnBack} style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => setStep(2)}>
                        ← Cambiar fecha
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.stepTitle}>Confirma tu sesión</div>
                      <div className={styles.paymentSummary}>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Servicio</span>
                          <span className={styles.psValue}>{SERVICES[selectedService].label}</span>
                        </div>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Fecha</span>
                          <span className={styles.psValue}>{selectedSlot.dateLabel}</span>
                        </div>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Horario</span>
                          <span className={styles.psValue}>{selectedSlot.timeLabel} (CST)</span>
                        </div>
                      </div>

                      {selectedService === 'mentoria' && loadingPackages && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Revisando tus créditos…</p>
                      )}

                      {selectedService === 'mentoria' && !loadingPackages && activePackage && (
                        <button className={styles.formSubmit} disabled={submitting} onClick={handleBookWithCredit}>
                          {submitting ? 'Agendando…' : `Usar 1 de tus ${activePackage.remainingCredits} sesiones disponibles →`}
                        </button>
                      )}

                      {selectedService === 'mentoria' && !loadingPackages && !activePackage && (
                        <button className={`${styles.formSubmit} ${styles.paypalSubmit}`} disabled={submitting} onClick={handleBuyPackage}>
                          {submitting ? 'Procesando…' : `Comprar el paquete completo — ${SERVICES.mentoria.display} →`}
                        </button>
                      )}

                      {selectedService !== 'mentoria' && (
                        <button className={`${styles.formSubmit} ${styles.paypalSubmit}`} disabled={submitting} onClick={handleBookAndPay}>
                          {submitting ? 'Procesando…' : `Agendar y pagar con PayPal — ${SERVICES[selectedService].display} →`}
                        </button>
                      )}

                      <button className={styles.btnBack} style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => setStep(2)}>
                        ← Cambiar fecha
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Confirmation */}
              {result && (
                <div>
                  <div className={styles.stepTitle}>
                    {result.booking?.status === 'confirmed' ? '¡Sesión confirmada!' : 'Todo listo'}
                  </div>
                  <p className={styles.stepSubtitle}>
                    {result.booking?.status === 'confirmed'
                      ? 'Tu sesión quedó confirmada usando uno de tus créditos.'
                      : result.paypalUrl
                        ? 'Completa el pago en la pestaña de PayPal que se abrió para confirmar tu lugar.'
                        : 'Revisa tu correo para los siguientes pasos.'}
                  </p>
                  <a href="/#/profile" className={styles.formSubmit} style={{ display: 'block', textAlign: 'center' }}>
                    Ver mi perfil →
                  </a>
                </div>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

export default Booking;
