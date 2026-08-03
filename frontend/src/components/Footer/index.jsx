function Footer() {
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
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          display: 'block',
        }}
      >
        Fabiola Ledesma
      </span>

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
      </div>

      <div style={{ fontSize: '0.78rem', opacity: 0.4 }}>
        © 2025 Fabiola Ledesma · CDMX
      </div>
      </div>
    </footer>
  );
}

export default Footer;
