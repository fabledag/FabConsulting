import FadeUp from '../FadeUp/index.jsx';
import styles from './Services.module.css';

function Services() {
  return (
    <section className={styles.services} id="servicios">
      <div className={`wrap ${styles.servicesInner}`}>
      {/* Header */}
      <FadeUp className={styles.header}>
        <div>
          <span className={`section-eyebrow ${styles.eyebrow}`}>Servicios</span>
          <h2 className={`section-title ${styles.title}`}>
            Formas en las que
            <br />
            <span style={{ color: 'var(--orange)' }}>puedo</span> <em>ayudarte</em>
          </h2>
          <p className={styles.intro}>
            Sesiones enfocadas para problemas reales. No respuestas genéricas —
            estrategia para tu contexto específico.
          </p>
        </div>
      </FadeUp>

      {/* Cards grid */}
      <div className={styles.grid}>
        {/* Card 1 */}
        <FadeUp className={styles.card}>
          <span className={styles.tag}>Más popular</span>
          <h3 className={styles.cardH3}>Sesión 1:1 (60 min)</h3>
          <p className={styles.cardP}>
            Para resolver un problema específico o darte claridad sobre tu
            situación profesional. Directo al punto.
          </p>
          <div className={styles.priceBlockInline}>
            <span className={styles.priceNumSm}>$800</span>
            <span className={styles.priceUnitSm}>MXN</span>
          </div>
        </FadeUp>

        {/* Card 2 */}
        <FadeUp className={styles.card} delay="0.05s">
          <span className={styles.tag}>Proceso</span>
          <h3 className={styles.cardH3}>Mock Interview</h3>
          <p className={styles.cardP}>
            Simulación real de entrevista UX con feedback honesto y sin rodeos
            sobre lo que realmente necesitas mejorar.
          </p>
          <div className={styles.priceBlockInline}>
            <span className={styles.priceNumSm}>$900</span>
            <span className={styles.priceUnitSm}>MXN</span>
          </div>
        </FadeUp>

        {/* Card 3 — featured */}
        <FadeUp className={`${styles.card} ${styles.cardFeatured}`} delay="0.1s">
          <div className={styles.cardTextGroup}>
            <span className={styles.tag}>Profundo</span>
            <h3 className={styles.cardH3}>Revisión de CV + Portafolio</h3>
            <p className={styles.cardP}>
              Feedback directo, claro y accionable. No desde la teoría — desde lo
              que realmente miran los hiring managers y las empresas donde tú
              quieres estar.
            </p>
          </div>
          <div className={styles.priceBlock}>
            <div className={styles.priceNum}>
              <span className={styles.priceCurrency}>$</span>1,200
            </div>
            <div className={styles.priceUnit}>MXN</div>
          </div>
        </FadeUp>

        {/* Card 4 — wide */}
        <FadeUp className={`${styles.card} ${styles.cardWide}`} delay="0.15s">
          <div className={styles.cardTextGroup}>
            <span className={styles.tag}>Acompañamiento continuo</span>
            <h3 className={styles.cardH3}>Mentoría</h3>
            <p className={styles.cardP}>
              4 sesiones a lo largo de 6 meses. Acompañamiento estratégico para
              diseñadores que quieren cambiar de empresa, pasar a liderazgo o
              replantear su carrera con claridad.{' '}
              <strong style={{ color: 'rgba(176,158,240,0.9)' }}>
                Ahorra $400 vs sesiones sueltas.
              </strong>
            </p>
          </div>
          <div className={styles.priceBlock}>
            <div className={styles.priceFrom}>paquete 4 meses</div>
            <div className={styles.priceNum}>
              <span className={styles.priceCurrency}>$</span>2,800
            </div>
            <div className={styles.priceUnit}>MXN</div>
          </div>
        </FadeUp>
      </div>

      {/* CTA */}
      <div className={styles.footer}>
        <a href="#agenda" className="btn-primary">
          Agendar mi sesión
        </a>
        <p className={styles.note}>Precios + IVA si requieres factura</p>
      </div>
      </div>
    </section>
  );
}

export default Services;
