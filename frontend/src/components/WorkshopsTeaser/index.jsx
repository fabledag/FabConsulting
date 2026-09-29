import Link from 'next/link';
import FadeUp from '../FadeUp/index.jsx';
import { WORKSHOPS, WORKSHOPS_PATH } from '@/lib/workshops.js';
import styles from './WorkshopsTeaser.module.css';

/**
 * Home-page summary of the business workshops. Sits after the Services
 * catalog and before "Sobre mí" — never between a Services card and the
 * booking widget. It only links out to /talleres-empresariales/; nothing here
 * touches the booking preselection.
 */
function WorkshopsTeaser() {
  return (
    <section id="talleres" className={styles.section} aria-labelledby="talleres-teaser-title">
      <div className={`wrap ${styles.inner}`}>
        <FadeUp className={styles.header}>
          <span className="section-eyebrow">Para empresas</span>
          <h2 id="talleres-teaser-title" className="section-title">
            Talleres para <em>equipos</em>
          </h2>
          <p className={styles.intro}>
            Para equipos de diseño, producto, innovación y negocio. Cada taller se adapta al
            contexto del equipo y se trabaja sobre casos propios.
          </p>
        </FadeUp>

        <div className={styles.grid}>
          {WORKSHOPS.map((w, i) => (
            <FadeUp key={w.key} className={styles.card} delay={`${i * 0.05}s`}>
              <h3 className={styles.cardTitle}>{w.name}</h3>
              <p className={styles.cardDesc}>{w.desc}</p>
              <Link href={`${WORKSHOPS_PATH}#${w.anchor}`} className={styles.cardLink}>
                Ver temas y ejercicio
                <span aria-hidden="true"> →</span>
              </Link>
            </FadeUp>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href={WORKSHOPS_PATH} className="btn-primary">
            Talleres para empresas
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WorkshopsTeaser;
