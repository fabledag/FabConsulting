import Link from 'next/link';
import FabIcon from '../FabIcon/index.jsx';
import { WORKSHOPS_PATH } from '@/lib/workshops.js';
import { SERVICES } from '@/lib/services.js';
import styles from './CtaStrip.module.css';

/**
 * Closing "siguientes pasos": the two ways to work together, plus a pointer
 * to the FAQ page. Used on home and on the content pages, so the section
 * link is `/#servicios` (on home that's a plain same-page scroll).
 */
// Read from services.js so a price change never leaves this line stale.
const FROM_PRICE = Math.min(...SERVICES.map((s) => s.price)).toLocaleString('en-US');

function CtaStrip() {
  return (
    <section className={styles.section} aria-labelledby="siguientes-pasos-title">
      <div className={`wrap ${styles.inner}`}>
        <h2 id="siguientes-pasos-title" className={styles.title}>
          ¿Lista o listo para dar tu <em>siguiente paso</em>?
        </h2>
        <p className={styles.sub}>Elige cómo quieres que trabajemos juntos.</p>

        <div className={styles.paths}>
          <a href="/#servicios" className={styles.path}>
            <span className={styles.pathIcon}><FabIcon name="para-ti" size={36} tone="crema" /></span>
            <span className={styles.pathBody}>
              <span className={styles.pathTitle}>Para ti</span>
              <span className={styles.pathDesc}>Asesorías 1:1 desde ${FROM_PRICE} MXN</span>
            </span>
            <span className={styles.pathCta}>Agenda tu asesoría →</span>
          </a>
          <Link href={WORKSHOPS_PATH} className={styles.path}>
            <span className={styles.pathIcon}><FabIcon name="para-tu-equipo" size={36} tone="crema" /></span>
            <span className={styles.pathBody}>
              <span className={styles.pathTitle}>Para tu equipo</span>
              <span className={styles.pathDesc}>Talleres a la medida del contexto del equipo</span>
            </span>
            <span className={styles.pathCta}>Talleres para empresas →</span>
          </Link>
        </div>

        <p className={styles.faq}>
          ¿Tienes dudas? <Link href="/preguntas-frecuentes/">Revisa las preguntas frecuentes</Link>
        </p>
      </div>
    </section>
  );
}

export default CtaStrip;
