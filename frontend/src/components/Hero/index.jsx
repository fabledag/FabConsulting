import { WORKSHOPS_PATH } from '@/lib/workshops.js';
import Parallax from '../Parallax/index.jsx';
import styles from './Hero.module.css';

const STATS = [
  { num: '15+', label: 'años diseñando\nproductos E2E' },
  { num: 'BBVA', label: 'Sr. Design Manager\nen banca digital' },
  { num: 'CO23', label: 'Practitioner en\nColectivo23' },
  { num: 'GEDX', label: 'Cofundadora\nagencia digital' },
];

function Hero() {
  return (
    // The abstract background (public/images/hero-bg*.jpg) replaced the
    // "Claridad sobre tu siguiente paso" card on 2026-09-29.
    <section className={styles.hero} id="inicio">
      {/* Desktop: the artwork on its own layer, drifting slower than the page. */}
      <Parallax speed={0.18} minWidth={900} className={styles.heroBg} />
      <div className={`wrap ${styles.heroInner}`}>
      {/* ─── Content ─────────────────────────────────── */}
      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>
          Senior Design Manager · Cofundadora de GEDX · Docente y mentora
        </div>

        <h1 className={styles.h1}>
          Consultoría estratégica en <em className={styles.ux}>UX</em>,{' '}
          <em className={styles.ia}>IA</em> y Product Design
        </h1>

        <p className={styles.sub}>
          Acompaño a profesionales que quieren impulsar su carrera, fortalecer
          su perfil y tomar mejores decisiones — y a equipos que necesitan
          alinear, comunicar y explorar oportunidades con diseño e IA — con
          base en experiencia real en diseño, estrategia y liderazgo.
        </p>

        <div className={styles.actions}>
          <a href="#servicios" className="btn-primary">
            Agenda tu asesoría
          </a>
          <a href={WORKSHOPS_PATH} className="btn-ghost">
            Talleres para empresas →
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
      </div>
    </section>
  );
}

export default Hero;
