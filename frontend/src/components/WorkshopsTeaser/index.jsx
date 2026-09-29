import Link from 'next/link';
import FadeUp from '../FadeUp/index.jsx';
import FabIcon from '../FabIcon/index.jsx';
import { WORKSHOPS, WORKSHOPS_PATH, WORKSHOP_VALUES, WORKSHOP_AUDIENCES } from '@/lib/workshops.js';
import styles from './WorkshopsTeaser.module.css';

/**
 * Home-page pitch for the business workshops. Sits after the Services
 * catalog; it only links out to /talleres-empresariales/ and never touches
 * the booking preselection.
 */
function WorkshopsTeaser() {
  return (
    <section id="talleres" className={styles.section} aria-labelledby="talleres-teaser-title">
      <div className={`wrap ${styles.inner}`}>
        <FadeUp className={styles.pitch}>
          <span className={styles.eyebrow}>
            <FabIcon name="empresa" size={18} /> Para empresas
          </span>
          <h2 id="talleres-teaser-title" className={styles.title}>
            Talleres para <em>equipos</em> que necesitan alinear y avanzar
          </h2>
          <p className={styles.intro}>
            Sesiones prácticas para equipos de diseño, producto, innovación y negocio, trabajadas
            sobre los retos reales del equipo.
          </p>

          <ul className={styles.values}>
            {WORKSHOP_VALUES.map(({ icon, label }) => (
              <li key={label}>
                <FabIcon name={icon} size={24} tone="crema" />
                {label}
              </li>
            ))}
          </ul>

          <div className={styles.audiences}>
            <span className={styles.audiencesLabel}>Ideal para equipos de</span>
            {WORKSHOP_AUDIENCES.map((a) => (
              <span key={a} className={styles.audience}>{a}</span>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href={`${WORKSHOPS_PATH}#solicitud`} className={styles.ctaPrimary}>
              Solicita una propuesta
            </Link>
            <Link href={WORKSHOPS_PATH} className={styles.ctaGhost}>
              Ver los talleres
            </Link>
          </div>
        </FadeUp>

        <div className={styles.cards}>
          {WORKSHOPS.map((w, i) => (
            <FadeUp key={w.key} delay={`${0.08 + i * 0.08}s`}>
              <Link href={`${WORKSHOPS_PATH}#${w.anchor}`} className={styles.card}>
                <span className={styles.cardIcon}>
                  <FabIcon name={w.icon} size={44} />
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.cardKicker}>Taller {String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.cardTitle}>{w.name}</span>
                  <span className={styles.cardDesc}>{w.short}</span>
                </span>
                <i className={`fa-solid fa-arrow-right ${styles.cardArrow}`} aria-hidden="true" />
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorkshopsTeaser;
