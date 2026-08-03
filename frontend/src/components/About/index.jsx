import FadeUp from '../FadeUp/index.jsx';
import fabiolaImg from '../../assets/fabiola.jpg';

const LOGOS = [
  { label: 'BBVA' },
  { label: 'Colectivo23' },
  { label: 'Toyota' },
  { label: 'GEDX ↗', href: 'https://gedx.com.mx/' },
];

const SKILLS = [
  {
    title: 'Estrategia',
    tags: ['Product Strategy', 'Product Roadmaps', 'Stakeholder Management', 'Portfolio Prioritization'],
  },
  {
    title: 'Diseño & Research',
    tags: ['Service Design', 'User Research', 'Design Thinking', 'Agile Delivery'],
  },
];

const CREDENTIALS = [
  {
    icon: 'fa-solid fa-graduation-cap',
    title: 'Licenciatura en Diseño Gráfico',
    sub: 'UNITEC · Cédula profesional #575338',
  },
  {
    icon: 'fa-solid fa-building-columns',
    title: 'Negociación y manejo de conflictos',
    sub: 'Tecnológico de Monterrey',
  },
  {
    icon: 'fa-solid fa-robot',
    title: 'AI Tools for Business Strategy',
    sub: 'Colectivo23',
  },
  {
    icon: 'fa-solid fa-laptop',
    title: 'UX Management',
    sub: 'Interaction Design Foundation',
  },
  {
    icon: 'fa-solid fa-handshake',
    title: 'Practitioner en Colectivo23',
    sub: 'Formación de talento digital · desde jun 2025',
  },
];

function About() {
  return (
    <section
      id="sobre-mi"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
      <FadeUp>
        <span className="section-eyebrow">Sobre mí</span>
      </FadeUp>

      <FadeUp delay="0.05s">
        <h2
          className="section-title about-title-lg"
          dangerouslySetInnerHTML={{
            __html: 'No es teoría.<br>Es <em>experiencia real</em>.',
          }}
        />
      </FadeUp>

      {/* Grid: photo | text | credentials */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
        }}
        className="about-grid-responsive"
      >
        {/* Photo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            className="about-photo-frame"
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'var(--purple-100)',
              border: '4px solid #ffffff',
              boxShadow: '0 0 0 3px var(--purple-200)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={fabiolaImg}
              alt="Fabiola Ledesma"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              background: 'var(--purple-50)',
              padding: '0.28rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid var(--border)',
            }}
          >
            <span className="availability-dot" />
            <strong style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.78rem' }}>
              Disponible
            </strong>
            <span> para asesorías</span>
          </div>
        </div>

        {/* Text */}
        <FadeUp style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '1rem' }}>
              Tengo más de <strong style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                15 años diseñando productos digitales end-to-end
              </strong>{' '}
              en sectores como banca, consumo y servicios. Llevo más de 8 años en BBVA,
              liderando equipos de diseño donde las decisiones impactan a miles de usuarios.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              También formo talento en Colectivo23, ayudando a otros a cerrar la brecha
              entre lo que saben hacer y el impacto que pueden generar.
            </p>
          </div>

          <blockquote
            style={{
              borderLeft: '3px solid var(--purple-600)',
              paddingLeft: '1rem',
              margin: '1.25rem 0',
              fontSize: '0.95rem',
              color: 'var(--purple-800)',
              fontStyle: 'italic',
              fontFamily: "'Fraunces', Georgia, serif",
              lineHeight: 1.5,
            }}
          >
            "Muchas personas talentosas no avanzan no por falta de habilidades,
            sino por falta de claridad."
          </blockquote>

          <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7, marginBottom: '1rem' }}>
            Mi enfoque no es solo "mejorar tu CV". Es ayudarte a tomar decisiones
            más inteligentes, con claridad y dirección.
          </p>

          {/* Logo pills */}
          <div style={{ marginTop: '1.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--purple-400)', marginBottom: '0.75rem' }}>
              Dónde he trabajado
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {LOGOS.map(({ label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: 'var(--purple-50)',
                    color: 'var(--purple-800)',
                    border: '1px solid var(--purple-100)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.7rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </a>
              ) : (
                <span
                  key={label}
                  style={{
                    display: 'inline-block',
                    background: 'var(--purple-50)',
                    color: 'var(--purple-800)',
                    border: '1px solid var(--purple-100)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.7rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
              )
            )}
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(82,58,168,0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--purple-400)', marginBottom: '1rem' }}>
              Especialidades
            </div>
            <div className="skills-block-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {SKILLS.map(({ title, tags }) => (
              <div key={title}>
                <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--purple-400)', marginBottom: '0.75rem' }}>
                  {title}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--purple-800)',
                        background: 'var(--purple-50)',
                        border: '1px solid var(--purple-100)',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '999px',
                        fontWeight: 400,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>
        </FadeUp>

        {/* Credentials */}
        <FadeUp delay="0.1s" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--purple-400)', marginBottom: '0.25rem' }}>
            Formación y certificaciones
          </div>
          {CREDENTIALS.map(({ icon, title, sub }) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                background: 'var(--cream)',
                borderRadius: '8px',
                padding: '0.875rem 1rem',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: '1rem',
                  flexShrink: 0,
                  width: '1.75rem',
                  textAlign: 'center',
                  marginTop: '2px',
                  color: 'var(--purple-600)',
                }}
              >
                <i className={icon} aria-hidden="true" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-dark)',
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.15rem',
                    lineHeight: 1.3,
                  }}
                >
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </FadeUp>
      </div>

      {/* Responsive grid overrides via embedded style */}
      <style>{`
        .about-title-lg {
          font-size: 2.3rem;
        }
        @media (min-width: 900px) {
          .about-title-lg {
            font-size: 2.75rem;
          }
        }
        @media (min-width: 640px) {
          .about-grid-responsive {
            grid-template-columns: 220px 1fr !important;
            gap: 2.5rem !important;
            align-items: start !important;
          }
        }
        @media (min-width: 900px) {
          .about-grid-responsive {
            grid-template-columns: 240px 1fr 280px !important;
            gap: 3rem !important;
          }
          .about-photo-frame {
            width: 220px !important;
            height: 220px !important;
          }
        }
        @media (max-width: 640px) {
          .skills-block-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </div>
    </section>
  );
}

export default About;
