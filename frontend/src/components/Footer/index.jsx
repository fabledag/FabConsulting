import { LINKEDIN_URL, INSTAGRAM_URL } from '@/lib/seo.js';
import { WORKSHOPS_PATH } from '@/lib/workshops.js';

const linkStyle = {
  color: 'rgba(255,255,255,0.7)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  transition: 'color 0.2s',
};

const columnLabelStyle = {
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.45)',
  marginBottom: '0.9rem',
};

function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--purple-800)', color: 'rgba(255,255,255,0.75)' }}>
      <div className="wrap" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                display: 'block',
                marginBottom: '0.6rem',
              }}
            >
              Fabiola Ledesma
            </span>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
              Senior Design Manager y mentora — asesorías 1:1 para profesionales de UX y Product Design.
            </p>
            {/* Social profiles: icon-only, so each link carries its own label. */}
            <div className="footer-social">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn de Fabiola Ledesma"
                title="LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Fabiola Ledesma (@fab_designux)"
                title="Instagram"
              >
                <i className="fa-brands fa-instagram" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <div style={columnLabelStyle}>Enlaces</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
              <a href="/#servicios" style={linkStyle}>
                Agenda tu asesoría
              </a>
              <a href="/sobre-mi/" style={linkStyle}>
                Sobre mí
              </a>
              <a href="/preguntas-frecuentes/" style={linkStyle}>
                Preguntas frecuentes
              </a>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
              Puedes reagendar o cancelar tu sesión hasta 24h antes desde tu perfil.
            </p>
          </div>

          {/* Empresas */}
          <div>
            <div style={columnLabelStyle}>Para empresas</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '0.65rem' }}>
              Talleres de comunicación estratégica y de diseño e IA aplicada al negocio para equipos.
            </p>
            <a href={WORKSHOPS_PATH} style={{ ...linkStyle, color: '#ffffff', fontWeight: 600 }}>
              Talleres para empresas →
            </a>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: '0.9rem 0 0' }}>
              Consultoría y servicios de agencia:{' '}
              <a href="https://gedx.com.mx" target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontSize: '0.78rem' }}>
                GEDX ↗
              </a>
            </p>
          </div>
        </div>

        <style>{`
          .footer-social {
            display: flex;
            gap: 0.6rem;
            margin-top: 1.25rem;
          }
          .footer-social a {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: grid;
            place-items: center;
            font-size: 1.05rem;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.12);
            text-decoration: none;
            transition: background-color 0.2s, transform 0.2s;
          }
          .footer-social a:hover {
            background: rgba(255, 255, 255, 0.24);
            transform: translateY(-1px);
          }
          .footer-social a:focus-visible {
            outline: 3px solid var(--orange);
            outline-offset: 2px;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: left;
          }
          @media (min-width: 640px) {
            .footer-grid {
              grid-template-columns: 1.3fr 1fr 1fr;
              gap: 2.5rem;
            }
          }
        `}</style>
      </div>
    </footer>
  );
}

export default Footer;
