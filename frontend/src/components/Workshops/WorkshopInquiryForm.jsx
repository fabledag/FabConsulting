'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api.js';
import { WORKSHOPS, WORKSHOPS_BY_KEY } from '@/lib/workshops.js';
import { WORKSHOP_INTEREST_EVENT } from './WorkshopCta.jsx';
import styles from './Workshops.module.css';

/**
 * Business inquiry for a workshop.
 *
 * Posts to the existing public POST /contact endpoint, which only sends two
 * emails (to Fabiola, with Reply-To set to the sender, and a confirmation to
 * the sender). It never touches users, bookings, availability, payments or
 * credits — and this form sends no auth token, so a logged-in visitor's
 * account isn't involved either.
 *
 * /contact only knows name/email/phone/service/message, so the company fields
 * travel inside `service` and `message`. Its server-side checks cover name,
 * email, phone and message length; the company-specific rules below are
 * client-side only.
 */

const TEAM_SIZES = ['1 a 10 personas', '11 a 30 personas', '31 a 100 personas', 'Más de 100 personas'];
const UNDECIDED = 'sin-definir';

// Mirrors validateContact() in lambda/api/handlers/contact.js.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,20}$/;

const EMPTY = {
  name: '',
  email: '',
  company: '',
  role: '',
  teamSize: '',
  phone: '',
  workshop: '',
  goal: '',
  website: '', // honeypot — hidden from people, bots tend to fill it
};

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Escribe tu nombre.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Escribe un correo válido.';
  if (v.company.trim().length < 2) e.company = 'Escribe el nombre de la empresa u organización.';
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = 'Revisa el formato del teléfono.';
  if (!v.workshop) e.workshop = 'Elige un taller o la opción “Aún no lo sé”.';
  if (v.goal.trim().length < 10) e.goal = 'Cuéntanos en al menos 10 caracteres qué necesita lograr el equipo.';
  return e;
}

function buildPayload(v) {
  const workshopName = v.workshop === UNDECIDED ? 'Aún no lo sé' : WORKSHOPS_BY_KEY[v.workshop]?.name;
  const lines = [`Taller de interés: ${workshopName}`, `Empresa: ${v.company.trim()}`];
  if (v.role.trim()) lines.push(`Cargo: ${v.role.trim()}`);
  if (v.teamSize) lines.push(`Tamaño del equipo: ${v.teamSize}`);
  lines.push('', 'Qué necesita lograr el equipo:', v.goal.trim());

  return {
    name: v.name.trim(),
    email: v.email.trim(),
    phone: v.phone.trim(),
    service: `Taller para empresas — ${workshopName}`,
    message: lines.join('\n'),
  };
}

export default function WorkshopInquiryForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [serverError, setServerError] = useState('');
  const successRef = useRef(null);
  const errorRef = useRef(null);

  // "Me interesa este taller" buttons preselect the workshop here.
  useEffect(() => {
    const onInterest = (e) => {
      if (WORKSHOPS_BY_KEY[e.detail]) {
        setValues((v) => ({ ...v, workshop: e.detail }));
        setErrors((err) => ({ ...err, workshop: undefined }));
      }
    };
    window.addEventListener(WORKSHOP_INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(WORKSHOP_INTEREST_EVENT, onInterest);
  }, []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`wi-${firstInvalid}`)?.focus();
      return;
    }

    setStatus('sending');
    setServerError('');

    // A filled honeypot is almost certainly a bot. Nothing is sent, and we
    // don't pretend it was: success is only ever shown for a real 2xx.
    if (values.website) {
      setServerError('No pudimos enviar tu solicitud. Inténtalo de nuevo.');
      setStatus('error');
      return;
    }

    try {
      await apiFetch('/contact', { method: 'POST', body: buildPayload(values) });
      setStatus('success');
    } catch (err) {
      setServerError(
        err.status === 400 && err.message
          ? err.message
          : 'No pudimos enviar tu solicitud en este momento. Inténtalo de nuevo más tarde o escríbeme por WhatsApp.'
      );
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.formSuccess} role="status">
        <h3 ref={successRef} tabIndex={-1} className={styles.formSuccessTitle}>
          Solicitud recibida
        </h3>
        <p>
          Gracias, {values.name.trim().split(' ')[0]}. Revisaré el contexto de tu equipo y te escribiré a{' '}
          <strong>{values.email.trim()}</strong> para conversar sobre el alcance.
        </p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setValues(EMPTY);
            setStatus('idle');
          }}
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const fieldProps = (field) => ({
    id: `wi-${field}`,
    name: field,
    value: values[field],
    onChange: set(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `wi-${field}-error` : undefined,
    className: styles.input,
  });

  const fieldError = (field) =>
    errors[field] ? (
      <span id={`wi-${field}-error`} className={styles.fieldError}>
        {errors[field]}
      </span>
    ) : null;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="wi-name">Nombre *</label>
          <input {...fieldProps('name')} autoComplete="name" maxLength={100} required />
          {fieldError('name')}
        </div>

        <div className={styles.field}>
          <label htmlFor="wi-email">Correo de trabajo *</label>
          <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={200} required />
          {fieldError('email')}
        </div>

        <div className={styles.field}>
          <label htmlFor="wi-company">Empresa u organización *</label>
          <input {...fieldProps('company')} autoComplete="organization" maxLength={150} required />
          {fieldError('company')}
        </div>

        <div className={styles.field}>
          <label htmlFor="wi-role">
            Cargo <span className={styles.optional}>(opcional)</span>
          </label>
          <input {...fieldProps('role')} autoComplete="organization-title" maxLength={150} />
        </div>

        <div className={styles.field}>
          <label htmlFor="wi-workshop">Taller de interés *</label>
          <select {...fieldProps('workshop')} required>
            <option value="">Selecciona una opción</option>
            {WORKSHOPS.map((w) => (
              <option key={w.key} value={w.key}>
                {w.name}
              </option>
            ))}
            <option value={UNDECIDED}>Aún no lo sé</option>
          </select>
          {fieldError('workshop')}
        </div>

        <div className={styles.field}>
          <label htmlFor="wi-teamSize">
            Tamaño del equipo <span className={styles.optional}>(opcional)</span>
          </label>
          <select {...fieldProps('teamSize')}>
            <option value="">Selecciona una opción</option>
            {TEAM_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="wi-phone">
            Teléfono <span className={styles.optional}>(opcional)</span>
          </label>
          <input {...fieldProps('phone')} type="tel" autoComplete="tel" maxLength={20} />
          {fieldError('phone')}
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="wi-goal">¿Qué necesita lograr el equipo? *</label>
          <textarea
            {...fieldProps('goal')}
            rows={5}
            maxLength={2000}
            placeholder="Cuéntanos brevemente el contexto, quiénes participarían y el resultado que buscan."
            required
          />
          {fieldError('goal')}
        </div>

        {/* Honeypot: off-screen and out of the tab order. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="wi-website">No llenes este campo</label>
          <input
            id="wi-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set('website')}
          />
        </div>
      </div>

      {status === 'error' && (
        <p ref={errorRef} tabIndex={-1} className={styles.formError} role="alert">
          {serverError}
        </p>
      )}

      <p className={styles.formNote}>
        Enviar este formulario no crea una cuenta, una reserva ni un cobro. Solo me llega tu solicitud para
        responderte por correo.
      </p>

      <button type="submit" className="btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
