import FadeUp from '../FadeUp/index.jsx';

const STEPS = [
  {
    num: '01',
    title: 'Entendemos tu contexto',
    desc: 'Qué estás viviendo, qué quieres lograr y dónde estás atorado. Sin suposiciones.',
  },
  {
    num: '02',
    title: 'Identificamos el problema real',
    desc: 'Muchas veces no es lo que crees. Vemos más allá de los síntomas.',
  },
  {
    num: '03',
    title: 'Definimos una estrategia clara',
    desc: 'Sin teoría innecesaria. Solo lo que sí te va a servir en tu contexto específico.',
  },
  {
    num: '04',
    title: 'Te llevas un plan accionable',
    desc: 'Saldrás con claridad y pasos concretos, no con más dudas.',
  },
];

function HowItWorks() {
  return (
    <section
      id="como-funciona"
      style={{ backgroundColor: 'var(--cream)' }}
    >
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
      <FadeUp>
        <span className="section-eyebrow">Cómo funciona</span>
      </FadeUp>

      <FadeUp delay="0.05s">
        <h2 className="section-title">
          Así es una <em>asesoría conmigo</em>
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
          height: 230px;
        }
      `}</style>
      </div>
    </section>
  );
}

export default HowItWorks;
