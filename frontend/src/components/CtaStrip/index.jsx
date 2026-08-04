function CtaStrip() {
  return (
    <section
      style={{
        background: '#1E1145',
        color: '#ffffff',
        textAlign: 'center',
      }}
    >
      <div className="wrap" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h2
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '1.6rem',
          fontWeight: 600,
          color: '#ffffff',
          lineHeight: 1.25,
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}
      >
        ¿Lista o listo para trabajar en tu <em style={{ fontStyle: 'italic', color: '#FF8A47' }}>siguiente paso</em>?
      </h2>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '1.75rem',
          lineHeight: 1.5,
        }}
      >
        Elige la sesión que mejor se adapte a lo que necesitas y reserva un horario.
      </p>
      <a href="#servicios" className="btn-primary">
        Agenda tu asesoría →
      </a>
      </div>
    </section>
  );
}

export default CtaStrip;
