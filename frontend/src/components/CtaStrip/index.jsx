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
        dangerouslySetInnerHTML={{
          __html:
            'Si sabes que necesitas cambiar algo<br><em style="font-style:italic;color:#FF8A47">pero no tienes claridad de cómo…</em>',
        }}
      />
      <p
        style={{
          fontSize: '0.95rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '1.75rem',
          lineHeight: 1.5,
        }}
      >
        Lo vemos juntas. Sin rodeos.
      </p>
      <a href="#agenda" className="btn-primary">
        Agenda tu sesión →
      </a>
      </div>
    </section>
  );
}

export default CtaStrip;
