function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: '#523AA8',
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
      }}
    >
      <div className="wrap" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      <span
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#ffffff',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em',
          display: 'block',
        }}
      >
        Fabiola Ledesma
      </span>

      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: '480px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
        Senior Design Manager y mentora — asesorías 1:1 para profesionales de UX y Product Design.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <a
          href="mailto:fabledag.21@gmail.com"
          style={{
            color: 'rgba(255,255,255,0.65)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.2s',
          }}
        >
          fabledag.21@gmail.com
        </a>
        <a
          href="https://linkedin.com/in/fabiolaledesma"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'rgba(255,255,255,0.65)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.2s',
          }}
        >
          LinkedIn
        </a>
        <a
          href="#servicios"
          style={{
            color: 'rgba(255,255,255,0.65)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.2s',
          }}
        >
          Agenda tu asesoría
        </a>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.25rem' }}>
        Puedes reagendar o cancelar tu sesión hasta 24h antes desde tu perfil.
      </p>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '1.25rem',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.55)',
          marginBottom: '0.75rem',
        }}
      >
        ¿Buscas consultoría, talleres o servicios para tu empresa? Conoce{' '}
        <a
          href="https://gedx.com.mx"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}
        >
          GEDX en gedx.com.mx
        </a>
        .
      </div>

      <div style={{ fontSize: '0.78rem', opacity: 0.4 }}>
        © {year} Fabiola Ledesma · CDMX
      </div>
      </div>
    </footer>
  );
}

export default Footer;
