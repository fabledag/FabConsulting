import FadeUp from '../FadeUp/index.jsx';

const STEPS = [
  {
    num: '01',
    title: 'Elige tu sesión',
    desc: 'Selecciona el tipo de acompañamiento que mejor corresponde con tu necesidad.',
  },
  {
    num: '02',
    title: 'Reserva un horario',
    desc: 'Consulta la disponibilidad y elige la fecha que mejor te funcione.',
  },
  {
    num: '03',
    title: 'Comparte tu contexto',
    desc: 'Después de reservar podrás enviar tu CV, portafolio, perfil o una breve explicación de lo que quieres trabajar.',
  },
  {
    num: '04',
    title: 'Recibe recomendaciones',
    desc: 'Trabajaremos sobre tu caso y terminaremos con recomendaciones y próximos pasos.',
  },
];

function HowItWorks() {
  return (
    <section
      id="como-funciona"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
      <FadeUp>
        <span className="section-eyebrow">Cómo funciona</span>
      </FadeUp>

      <FadeUp delay="0.05s">
        <h2 className="section-title">
          Así será <em>tu experiencia</em>
        </h2>
      </FadeUp>

      <div className="hiw-steps-grid">
        {STEPS.map(({ num, title, desc }, i) => (
          <FadeUp key={num} delay={`${i * 0.08}s`} className="hiw-card-wrap">
            <div
              className="hiw-card"
              style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '1.5rem',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  color: 'var(--purple-100)',
                  lineHeight: 1,
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.03em',
                }}
              >
                {num}
              </div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--purple-900)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                }}
              >
                {desc}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>

      <style>{`
        .hiw-steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        @media (min-width: 640px) {
          .hiw-steps-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }
        }
        @media (min-width: 900px) {
          .hiw-steps-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
        }
        .hiw-card {
          height: 260px;
        }
      `}</style>
      </div>
    </section>
  );
}

export default HowItWorks;
