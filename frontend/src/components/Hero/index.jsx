import styles from './Hero.module.css';
import fabiolaImg from '../../assets/fabiola.jpg';

const STATS = [
  { num: '15+', label: 'años diseñando\nproductos E2E' },
  { num: 'BBVA', label: 'Sr. Design Manager\nen banca digital' },
  { num: 'CO23', label: 'Practitioner en\nColectivo23' },
  { num: 'GEDX', label: 'Cofundadora\nagencia digital' },
];

const CARD_SERVICES = [
  'Crecimiento profesional',
  'CV, LinkedIn y portafolio',
  'Aplicación práctica de IA',
  'Transiciones de carrera',
  'Simulación de entrevistas',
];

function Hero() {
  return (
    <section className={styles.hero} id="inicio">
      <div className={`wrap ${styles.heroInner}`}>
      {/* ─── Content ─────────────────────────────────── */}
      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>
          Senior Design Manager · Cofundadora de GEDX · Docente y mentora
        </div>

        <h1 className={styles.h1}>
          Consultoría estratégica en <em>UX, IA</em> y Product Design
        </h1>

        <p className={styles.sub}>
          Acompaño a profesionales que quieren impulsar su carrera, fortalecer
          su perfil y tomar mejores decisiones — con sesiones personalizadas
          basadas en experiencia real en diseño, estrategia y liderazgo.
        </p>

        <div className={styles.actions}>
          <a href="#servicios" className="btn-primary">
            Agenda tu asesoría
          </a>
          <a href="#servicios" className="btn-ghost">
            Conoce las sesiones →
          </a>
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

          <div className={styles.cardPhotoRow}>
            <img src={fabiolaImg} alt="Fabiola Ledesma" className={styles.cardPhoto} />
            <div>
              <div className={styles.cardName}>Fabiola Ledesma</div>
              <div className={styles.cardRole}>Senior Design Manager</div>
            </div>
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
            <span className="availability-dot" />
            <span className={styles.availStrong}>Disponible</span>
            <span className={styles.availText}> · respondo en &lt;24h</span>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

export default Hero;
