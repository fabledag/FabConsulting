import { useEffect, useState } from 'react';
import FadeUp from '../FadeUp/index.jsx';
import SlotPicker from '../SlotPicker/index.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { apiFetch, getLastEmail } from '../../api.js';
import styles from './Booking.module.css';

const TRUST_ITEMS = [
  {
    icon: 'fa-solid fa-list-check',
    title: '5 pasos, a tu ritmo',
    body: 'Elige tu sesión, revisa los detalles, selecciona fecha y cuéntame brevemente qué te gustaría trabajar.',
  },
  {
    icon: 'fa-solid fa-unlock-keyhole',
    title: 'Sin contraseñas',
    body: 'Confirmas tu cuenta con un enlace a tu correo — no necesitas crear ni recordar ninguna contraseña.',
  },
  {
    icon: 'fa-solid fa-envelope-circle-check',
    title: 'Te aviso en cuanto se confirme',
    body: 'Si pagas con PayPal, tu sesión queda apartada y te confirmo por correo en cuanto recibo el pago. Si usas un crédito de Mentoría, queda confirmada al instante.',
  },
  {
    icon: 'fa-solid fa-calendar-check',
    title: 'Tú tienes el control',
    body: 'Desde tu perfil puedes reagendar o cancelar tu sesión cuando quieras, hasta 24h antes.',
  },
];

const SERVICES = {
  session: {
    name: 'Conversación estratégica 1:1',
    label: 'Conversación estratégica 1:1 (60 min)',
    desc: '60 min · Ordena tus ideas y define tus siguientes pasos',
    price: 800,
    display: '$800 MXN',
    tag: 'Más elegida',
    duration: '60 minutos',
    durationMinutes: 60,
    includes: ['Diagnóstico de tu situación actual', 'Recomendaciones específicas', 'Próximos pasos por escrito'],
  },
  mock: {
    name: 'Simulación de entrevista',
    label: 'Simulación de entrevista',
    desc: 'Práctica real + retroalimentación honesta y específica',
    price: 900,
    display: '$900 MXN',
    tag: 'Preparación',
    tagPlain: true,
    duration: '60 minutos',
    durationMinutes: 60,
    includes: ['Entrevista simulada completa', 'Retroalimentación honesta', 'Puntos concretos a mejorar'],
  },
  cv: {
    name: 'Revisión de CV y LinkedIn',
    label: 'Revisión de CV y LinkedIn',
    desc: 'Feedback directo desde lo que realmente evalúan los hiring managers',
    price: 1000,
    display: '$1,000 MXN',
    tag: 'CV & LinkedIn',
    tagPlain: true,
    duration: '60 minutos',
    durationMinutes: 60,
    includes: ['Estructura y jerarquía del CV', 'Claridad de logros', 'Coherencia CV ↔ LinkedIn'],
  },
  portfolio: {
    name: 'Revisión de portafolio o book',
    label: 'Revisión de portafolio o book',
    desc: 'Analizaremos la estructura, narrativa y presentación de tus casos',
    price: 1200,
    display: '$1,200 MXN',
    tag: 'Portafolio',
    tagPlain: true,
    duration: '60 minutos',
    durationMinutes: 60,
    includes: ['Storytelling y narrativa', 'Estructura de casos', 'Preparación para explicarlo en entrevista'],
  },
  mentoria: {
    name: 'Mentoría',
    label: 'Mentoría · 4 sesiones / 6 meses',
    desc: '4 sesiones a lo largo de 6 meses · Ahorra $400 vs sueltas',
    price: 2800,
    display: '$2,800 MXN',
    tag: 'Acompañamiento continuo',
    tagPlain: true,
    duration: '4 sesiones de 60 min, a lo largo de 6 meses',
    includes: ['Acompañamiento continuo', 'Seguimiento entre sesiones', 'Estrategia de carrera a mediano plazo'],
  },
};

const MODALITY = 'Videollamada — el enlace se comparte por correo al confirmar tu reserva.';
const TIMEZONE = 'Hora Ciudad de México (CST)';
const CANCELLATION_POLICY = 'Puedes reagendar o cancelar tú mismo/a desde tu perfil hasta 24 horas antes de tu sesión.';

const PENDING_SELECTION_KEY = 'pending_booking_selection';
const PRESELECTED_SERVICE_KEY = 'preselected_service';

function googleCalendarUrl(svc, slot) {
  if (!svc.durationMinutes || !slot) return null;
  const start = new Date(`${slot.date}T${slot.time}:00`);
  const end = new Date(start.getTime() + svc.durationMinutes * 60000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: svc.name,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: 'Sesión con Fabiola Ledesma. El enlace de videollamada llega por correo.',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function Booking() {
  const { user, requestLink } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [name, setName] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [message, setMessage] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  const [email, setEmail] = useState(getLastEmail);
  const [emailTouched, setEmailTouched] = useState(false);
  const [linkStatus, setLinkStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const [activePackage, setActivePackage] = useState(null);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { booking, paypalUrl? }

  const canGoToStep2 = Boolean(selectedService);
  const canGoToStep3 = Boolean(selectedSlot);
  const nameError = nameTouched && name.trim().length < 2 ? 'Escribe tu nombre para continuar.' : '';
  const canGoToStep5 = name.trim().length >= 2;
  const emailError = emailTouched && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Revisa que el correo tenga un formato válido.' : '';

  // Pick up a service chosen from a Services card / career-stage link.
  useEffect(() => {
    const preselected = sessionStorage.getItem(PRESELECTED_SERVICE_KEY);
    if (preselected && SERVICES[preselected]) {
      setSelectedService(preselected);
      setStep(2);
    }
    if (preselected) sessionStorage.removeItem(PRESELECTED_SERVICE_KEY);
  }, []);

  // Restore an in-progress selection after the magic-link round trip.
  useEffect(() => {
    if (!user) return;
    const saved = sessionStorage.getItem(PENDING_SELECTION_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.selectedService) setSelectedService(parsed.selectedService);
      if (parsed.selectedSlot) setSelectedSlot(parsed.selectedSlot);
      if (parsed.name) setName(parsed.name);
      if (parsed.linkedin) setLinkedin(parsed.linkedin);
      if (parsed.message) setMessage(parsed.message);
      setStep(5);
    } catch {
      // ignore malformed storage
    } finally {
      sessionStorage.removeItem(PENDING_SELECTION_KEY);
    }
  }, [user]);

  // When logged in and reaching the confirm step for mentoria, check credits.
  useEffect(() => {
    if (!user || step !== 5 || selectedService !== 'mentoria') {
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

  // Prefill for returning, already-logged-in users so they don't retype it.
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user]);

  async function handleRequestLink(e) {
    e.preventDefault();
    if (!email) return;
    setLinkStatus('sending');
    setError('');
    sessionStorage.setItem(PENDING_SELECTION_KEY, JSON.stringify({ selectedService, selectedSlot, name, linkedin, message }));
    try {
      await requestLink(email, '/');
      setLinkStatus('sent');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace.');
      setLinkStatus('idle');
    }
  }

  // Best-effort: keep the account's name in sync with what was typed in the
  // reservation form. Never blocks or fails the booking/purchase itself.
  function syncProfileName() {
    if (name.trim() && name.trim() !== user?.name) {
      apiFetch('/me', { method: 'PUT', auth: true, body: { name: name.trim() } }).catch(() => {});
    }
  }

  async function handleBookWithCredit() {
    setSubmitting(true);
    setError('');
    syncProfileName();
    try {
      const data = await apiFetch('/me/bookings', {
        method: 'POST',
        auth: true,
        body: {
          date: selectedSlot.date,
          time: selectedSlot.time,
          service: selectedService,
          name: name.trim(),
          linkedin: linkedin.trim(),
          message: message.trim(),
          packageId: activePackage.id,
        },
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
    syncProfileName();
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
    syncProfileName();
    try {
      const data = await apiFetch('/me/bookings', {
        method: 'POST',
        auth: true,
        body: {
          date: selectedSlot.date,
          time: selectedSlot.time,
          service: selectedService,
          name: name.trim(),
          linkedin: linkedin.trim(),
          message: message.trim(),
        },
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
                Elige tu sesión, revisa los detalles, selecciona fecha y horario, cuéntame qué te gustaría trabajar
                y confirma con tu cuenta — sin contraseñas, con un enlace a tu correo.
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
                  <span className={styles.stepLabel}>Resumen</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step === 3 ? styles.active : ''} ${step > 3 ? styles.done : ''}`}>
                  <span className={styles.stepNum}>3</span>
                  <span className={styles.stepLabel}>Fecha</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step === 4 ? styles.active : ''} ${step > 4 ? styles.done : ''}`}>
                  <span className={styles.stepNum}>4</span>
                  <span className={styles.stepLabel}>Tus datos</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step === 5 ? styles.active : ''}`}>
                  <span className={styles.stepNum}>5</span>
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
                  <div className={styles.serviceOptions} role="radiogroup" aria-label="Tipo de sesión">
                    {Object.entries(SERVICES).map(([key, svc]) => (
                      <div
                        key={key}
                        role="radio"
                        tabIndex={0}
                        aria-checked={selectedService === key}
                        className={`${styles.serviceOption} ${selectedService === key ? styles.selected : ''}`}
                        onClick={() => setSelectedService(key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedService(key);
                          }
                        }}
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
                    Continuar →
                  </button>
                </div>
              )}

              {/* STEP 2 — summary before showing the calendar */}
              {step === 2 && selectedService && (
                <div>
                  <div className={styles.stepTitle}>{SERVICES[selectedService].name}</div>
                  <p className={styles.stepSubtitle}>{SERVICES[selectedService].desc}</p>

                  <div className={styles.paymentSummary}>
                    <div className={styles.psRow}>
                      <span className={styles.psLabel}>Duración</span>
                      <span className={styles.psValue}>{SERVICES[selectedService].duration}</span>
                    </div>
                    <div className={styles.psRow}>
                      <span className={styles.psLabel}>Precio</span>
                      <span className={styles.psValue}>{SERVICES[selectedService].display}</span>
                    </div>
                    <div className={styles.psRow}>
                      <span className={styles.psLabel}>Modalidad</span>
                      <span className={styles.psValue}>Virtual</span>
                    </div>
                    <div className={styles.psRow}>
                      <span className={styles.psLabel}>Zona horaria</span>
                      <span className={styles.psValue}>{TIMEZONE}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--purple-800)', marginBottom: '0.4rem' }}>
                      Qué incluye
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {SERVICES[selectedService].includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {MODALITY}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {CANCELLATION_POLICY}
                  </p>

                  <div style={{ background: 'var(--purple-50)', border: '1px solid var(--purple-100)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--purple-800)', marginBottom: '0.2rem' }}>
                      No necesitas tener todo preparado
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Puedes reservar aunque todavía no tengas completamente claro qué necesitas. Al inicio de la
                      sesión definiremos juntos el objetivo y las prioridades.
                    </span>
                  </div>

                  <div className={styles.actionsRow}>
                    <button className={styles.btnBack} onClick={() => setStep(1)}>
                      ← Regresar
                    </button>
                    <button className={styles.formSubmit} onClick={() => setStep(3)}>
                      Elegir fecha y horario →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — date & time */}
              {step === 3 && (
                <div>
                  <div className={styles.stepTitle}>Elige tu fecha y horario</div>
                  <p className={styles.stepSubtitle}>{TIMEZONE}</p>
                  <SlotPicker selectedKey={selectedSlot?.key} onSelect={setSelectedSlot} />
                  <div className={styles.actionsRow}>
                    <button className={styles.btnBack} onClick={() => setStep(2)}>
                      ← Regresar
                    </button>
                    <button className={styles.formSubmit} disabled={!canGoToStep3} onClick={() => setStep(4)}>
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 — contact details */}
              {step === 4 && (
                <div>
                  <div className={styles.stepTitle}>Tus datos</div>
                  <p className={styles.stepSubtitle}>Solo lo necesario para preparar tu sesión.</p>

                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="booking-name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--purple-800)', marginBottom: '0.4rem' }}>
                      Nombre
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setNameTouched(true)}
                      aria-invalid={Boolean(nameError)}
                      aria-describedby={nameError ? 'booking-name-error' : undefined}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: `1px solid ${nameError ? '#dc2626' : 'var(--border)'}`,
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                    {nameError && (
                      <p id="booking-name-error" role="alert" style={{ fontSize: '0.78rem', color: '#dc2626', margin: '0.4rem 0 0' }}>
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="booking-linkedin" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--purple-800)', marginBottom: '0.4rem' }}>
                      LinkedIn <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
                    </label>
                    <input
                      id="booking-linkedin"
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/tu-perfil"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label htmlFor="booking-message" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--purple-800)', marginBottom: '0.4rem' }}>
                      ¿Qué te gustaría trabajar en esta sesión? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
                    </label>
                    <textarea
                      id="booking-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div className={styles.actionsRow}>
                    <button className={styles.btnBack} onClick={() => setStep(3)}>
                      ← Regresar
                    </button>
                    <button
                      className={styles.formSubmit}
                      onClick={() => {
                        setNameTouched(true);
                        if (canGoToStep5) setStep(5);
                      }}
                    >
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 — confirm / login / pay */}
              {step === 5 && !result && (
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
                          <label htmlFor="booking-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--purple-800)', marginBottom: '0.4rem' }}>
                            Correo electrónico
                          </label>
                          <input
                            id="booking-email"
                            type="email"
                            required
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            aria-invalid={Boolean(emailError)}
                            aria-describedby={emailError ? 'booking-email-error' : undefined}
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${emailError ? '#dc2626' : 'var(--border)'}`, fontSize: '0.9rem', marginBottom: emailError ? '0.4rem' : '1rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          />
                          {emailError && (
                            <p id="booking-email-error" role="alert" style={{ fontSize: '0.78rem', color: '#dc2626', margin: '0 0 1rem' }}>
                              {emailError}
                            </p>
                          )}
                          <button className={styles.formSubmit} type="submit" disabled={linkStatus === 'sending'}>
                            {linkStatus === 'sending' ? 'Enviando…' : 'Enviarme el enlace →'}
                          </button>
                        </form>
                      )}
                      <button className={styles.btnBack} style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => setStep(4)}>
                        ← Regresar
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

                      <button className={styles.btnBack} style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => setStep(3)}>
                        ← Cambiar fecha
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Confirmation */}
              {result && (() => {
                const isConfirmed = result.booking?.status === 'confirmed';
                const svc = selectedService ? SERVICES[selectedService] : null;
                const calUrl = svc && !result.package ? googleCalendarUrl(svc, selectedSlot) : null;
                return (
                  <div>
                    <div className={styles.stepTitle}>
                      {isConfirmed ? '¡Tu sesión está confirmada!' : '¡Ya casi! Falta tu pago'}
                    </div>
                    <p className={styles.stepSubtitle}>
                      {isConfirmed
                        ? 'Me dará mucho gusto acompañarte. Recibirás por correo la confirmación, el enlace de la videollamada y los detalles de tu reserva.'
                        : 'Completa el pago en la pestaña de PayPal que se abrió para confirmar tu lugar. En cuanto lo recibamos, tu sesión queda apartada.'}
                    </p>

                    {selectedSlot && svc && !result.package && (
                      <div className={styles.paymentSummary}>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Sesión</span>
                          <span className={styles.psValue}>{svc.name}</span>
                        </div>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Fecha</span>
                          <span className={styles.psValue}>{selectedSlot.dateLabel}</span>
                        </div>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Horario</span>
                          <span className={styles.psValue}>{selectedSlot.timeLabel} (CST)</span>
                        </div>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>Duración</span>
                          <span className={styles.psValue}>{svc.duration}</span>
                        </div>
                        <div className={styles.psRow}>
                          <span className={styles.psLabel}>{isConfirmed ? 'Pagado' : 'Precio'}</span>
                          <span className={styles.psValue}>{svc.display}</span>
                        </div>
                      </div>
                    )}

                    {calUrl && (
                      <a
                        href={calUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnBack}
                        style={{ display: 'block', textAlign: 'center', marginBottom: '0.75rem' }}
                      >
                        + Agregar a Google Calendar
                      </a>
                    )}

                    <div style={{ background: 'var(--purple-50)', border: '1px solid var(--purple-100)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
                      <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--purple-800)', marginBottom: '0.2rem' }}>
                        No necesitas llegar con todo resuelto
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Durante la sesión definiremos juntos qué vale la pena priorizar.
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-dark)' }}>¿Quieres compartir tu CV, portafolio o contexto antes de la sesión?</strong>{' '}
                      Puedes responder al correo de confirmación y adjuntarlo ahí — es completamente opcional.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {CANCELLATION_POLICY}
                    </p>

                    <a href="/#/profile" className={styles.formSubmit} style={{ display: 'block', textAlign: 'center' }}>
                      Ver mi perfil →
                    </a>
                  </div>
                );
              })()}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

export default Booking;
