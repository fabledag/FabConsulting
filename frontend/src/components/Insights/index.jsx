import FadeUp from '../FadeUp/index.jsx';

const INSIGHTS = [
  {
    num: '01',
    title: 'Por qué tu CV no está funcionando (aunque creas que sí)',
    body: 'El problema casi nunca está en el diseño. Está en lo que priorizas — y en lo que das por sentado que quién contrata ya sabe.',
  },
  {
    num: '02',
    title: 'El error más común en entrevistas de UX',
    body: 'Hablar de proceso en lugar de impacto. Los equipos no contratan diseño bonito — contratan criterio y decisiones que movieron métricas.',
  },
  {
    num: '03',
    title: 'Por qué ser "bueno diseñando" no es suficiente',
    body: 'Las habilidades técnicas te abren la puerta. Lo que te hace crecer es tu capacidad de tomar decisiones con el negocio, no solo con el usuario.',
  },
  {
    num: '04',
    title: 'Cómo crecer en UX (spoiler: no es solo Figma)',
    body: 'El siguiente nivel en UX no es dominar más herramientas. Es aprender a comunicar, defender tu trabajo y conectar diseño con valor de negocio.',
  },
  {
    num: '05',
    title: 'Lo que separa a un designer senior de uno mid',
    body: 'No es la cantidad de proyectos. Es la claridad con que articulas tus decisiones, manejas ambigüedad y co-creas con equipos de negocio.',
  },
];

function Insights() {
  return (
    <section
      style={{
        backgroundColor: 'var(--purple-50)',
      }}
    >
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
      <FadeUp>
        <span className="section-eyebrow">Contenido</span>
      </FadeUp>

      <FadeUp delay="0.05s">
        <h2 className="section-title">
          Cosas que normalmente
          <br />
          <em>nadie te dice</em>
        </h2>
      </FadeUp>

      <div className="insights-grid-responsive">
        {INSIGHTS.map(({ num, title, body }, i) => (
          <FadeUp
            key={num}
            delay={`${i * 0.06}s`}
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '1.5rem',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.6rem',
                fontWeight: 600,
                color: 'var(--purple-200)',
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
              {body}
            </p>
          </FadeUp>
        ))}

        {/* CTA card */}
        <FadeUp
          delay="0.3s"
          style={{
            background: 'var(--purple-50)',
            borderColor: 'var(--purple-100)',
            borderRadius: '10px',
            padding: '1.5rem',
            border: '1px solid var(--purple-100)',
          }}
        >
          <div
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.6rem',
              fontWeight: 600,
              color: 'var(--purple-200)',
              lineHeight: 1,
              marginBottom: '0.75rem',
              letterSpacing: '-0.03em',
            }}
          >
            →
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
            ¿Reconoces alguna de estas situaciones?
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}
          >
            Si sientes que estás estancado, que no estás avanzando o que necesitas
            claridad — es para eso que existen las asesorías.
          </p>
          <a
            href="#agenda"
            className="btn-primary"
            style={{
              display: 'inline-block',
              marginTop: '1.25rem',
              fontSize: '0.85rem',
              padding: '0.7rem 1.5rem',
            }}
          >
            Quiero claridad →
          </a>
        </FadeUp>
      </div>

      <style>{`
        .insights-grid-responsive {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        @media (min-width: 640px) {
          .insights-grid-responsive {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 900px) {
          .insights-grid-responsive {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>
      </div>
    </section>
  );
}

export default Insights;
