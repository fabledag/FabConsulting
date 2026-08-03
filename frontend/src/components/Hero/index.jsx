import styles from './Hero.module.css';

const STATS = [
  { num: '15+', label: 'años diseñando\nproductos E2E' },
  { num: 'BBVA', label: 'Sr. Design Manager\nen banca digital' },
  { num: 'CO23', label: 'Practitioner en\nColectivo23' },
  { num: 'GEDX', label: 'Cofundadora\nagencia digital' },
];

const CARD_SERVICES = [
  'Crecimiento profesional',
  'Búsqueda de trabajo / CV',
  'Decisiones en producto y UX',
  'Transiciones de carrera',
  'Mock interviews',
];

function Hero() {
  return (
    <section className={styles.hero} id="inicio">
      <div className={`wrap ${styles.heroInner}`}>
      {/* ─── Content ─────────────────────────────────── */}
      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>
          Sr. Design Manager · +15 años de experiencia
        </div>

        <h1 className={styles.h1}>
          Te ayudo a tomar <em>mejores decisiones</em> en tu carrera UX
        </h1>

        <p className={styles.sub}>
          Acompaño a diseñadores y profesionales a crecer, cambiar de trabajo o
          desbloquear su siguiente nivel — con claridad y estrategia real.
        </p>

        <div className={styles.actions}>
          <a href="#agenda" className="btn-primary">
            Agendar mi asesoría
          </a>
          <a href="#servicios" className="btn-ghost">
            Ver servicios →
          </a>
        </div>

        <div className={styles.urgency}>
          <span className={styles.urgencyDot} />
          <span>3 espacios disponibles esta semana</span>
        </div>

        <div className={styles.stats}>
          {STATS.map(({ num, label }) => (
            <div key={num}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLabel}>
                {label.split('\n').map((l, i) => (
                  <span key={i}>
                    {l}
                    {i === 0 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Visual / Card (desktop only) ───────────── */}
      <div className={styles.heroVisual}>
        <div className={styles.card}>
          <div className={styles.floatingBadge}>
            <strong>15+</strong> años de experiencia
          </div>

          <div className={styles.cardTag}>Asesoría 1:1</div>

          <h3>
            Claridad sobre tu siguiente paso
          </h3>

          <p>
            Sesiones estratégicas para diseñadores que quieren avanzar con
            dirección.
          </p>

          <ul className={styles.serviceList}>
            {CARD_SERVICES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <div className={styles.cardFooter}>
            <div>
              <span className="availability-dot" />
              <span className={styles.availStrong}>Disponible</span>
              <span className={styles.availText}> · respondo en &lt;24h</span>
            </div>
            <a
              href="#agenda"
              className="btn-primary"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }}
            >
              Agendar →
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

export default Hero;
