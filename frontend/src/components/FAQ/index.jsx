import { useState } from 'react';
import FadeUp from '../FadeUp/index.jsx';
import styles from './FAQ.module.css';

const QUESTIONS = [
  {
    q: '¿Cuál sesión debería elegir?',
    a: 'Si no tienes claro tu siguiente paso, empieza con la Conversación estratégica 1:1. Si necesitas mejorar tu perfil, elige la revisión de CV y LinkedIn o de portafolio. Si ya tienes una entrevista próxima, la Simulación de entrevista es la más específica para eso.',
  },
  {
    q: '¿Las sesiones son únicamente para diseñadores?',
    a: 'Están pensadas principalmente para profesionales de UX, Product Design y disciplinas afines — pero si tu reto es de estrategia, liderazgo o carrera en un contexto de producto digital, también aplican.',
  },
  {
    q: '¿Necesito enviar mi CV o portafolio antes?',
    a: 'No es obligatorio. Puedes enviarlo después de reservar, respondiendo al correo de confirmación, o compartirlo directamente al inicio de la sesión.',
  },
  {
    q: '¿Cómo se realiza la videollamada?',
    a: 'Después de confirmar tu reserva recibirás por correo el enlace de la videollamada y los detalles para conectarte a la hora acordada.',
  },
  {
    q: '¿Puedo reprogramar mi sesión?',
    a: 'Sí. Puedes reagendar o cancelar tú mismo/a desde tu perfil hasta 24 horas antes de tu sesión. Dentro de esa ventana, escríbeme directamente para ver opciones.',
  },
  {
    q: '¿Qué sucede después de pagar?',
    a: 'Tu sesión queda confirmada de inmediato. Recibirás un correo con la fecha, hora, enlace de videollamada y los detalles de tu reserva.',
  },
  {
    q: '¿Puedo contratar más de una sesión?',
    a: 'Sí. Puedes agendar las sesiones sueltas que necesites, o elegir Mentoría si buscas acompañamiento continuo a lo largo de varios meses.',
  },
  {
    q: '¿La asesoría garantiza que conseguiré trabajo?',
    a: 'No. Estas sesiones son de acompañamiento y recomendaciones — te ayudo a tomar mejores decisiones y a prepararte, pero no puedo garantizar contrataciones, promociones ni resultados laborales.',
  },
  {
    q: '¿Ofreces servicios para empresas?',
    a: (
      <>
        Este sitio está enfocado en asesorías individuales para profesionales. Para consultoría,
        talleres o servicios empresariales puedes visitar{' '}
        <a href="https://gedx.com.mx" target="_blank" rel="noopener noreferrer">
          GEDX en gedx.com.mx
        </a>
        .
      </>
    ),
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <FadeUp style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">Preguntas frecuentes</span>
        </FadeUp>
        <FadeUp delay="0.05s" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Antes de reservar</h2>
        </FadeUp>

        <div className={styles.list}>
          {QUESTIONS.map(({ q, a }, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const triggerId = `faq-trigger-${i}`;
            return (
              <div key={q} className={styles.item}>
                <h3 style={{ margin: 0 }}>
                  <button
                    id={triggerId}
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span>{q}</span>
                    <i className={`fa-solid fa-plus ${styles.icon} ${isOpen ? styles.iconOpen : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                {isOpen && (
                  <div id={panelId} role="region" aria-labelledby={triggerId} className={styles.panel}>
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
