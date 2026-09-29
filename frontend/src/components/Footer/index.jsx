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

// `anchorBase="/"` on pages other than home, so #servicios points back there.
function Footer({ anchorBase = '' }) {
  return (
    <footer style={{ backgroundColor: '#523AA8', color: 'rgba(255,255,255,0.75)' }}>
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
          </div>

          {/* Links */}
          <div>
            <div style={columnLabelStyle}>Enlaces</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                LinkedIn
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Instagram
              </a>
              <a href={`${anchorBase}#servicios`} style={linkStyle}>
                Agenda tu asesoría
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
