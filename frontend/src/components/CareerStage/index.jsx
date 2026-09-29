import FadeUp from '../FadeUp/index.jsx';
import styles from './CareerStage.module.css';

const OPTIONS = [
  { icon: 'fa-solid fa-compass', label: 'Quiero definir mi siguiente paso profesional', href: '#servicio-1-1' },
  { icon: 'fa-solid fa-file-lines', label: 'Necesito mejorar mi CV o LinkedIn', href: '#servicio-revision' },
  { icon: 'fa-solid fa-images', label: 'Quiero fortalecer mi portafolio', href: '#servicio-revision' },
  { icon: 'fa-solid fa-comments', label: 'Necesito prepararme para una entrevista', href: '#servicio-entrevista' },
];

function CareerStage() {
  return (
    <section id="momento-carrera" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <FadeUp>
          <span className="section-eyebrow">Empecemos por aquí</span>
        </FadeUp>
        <FadeUp delay="0.05s">
          <h2 className="section-title">¿En qué momento de tu carrera estás?</h2>
        </FadeUp>

        <div className={styles.grid}>
          {OPTIONS.map(({ icon, label, href }, i) => (
            <FadeUp key={label} delay={`${i * 0.05}s`}>
              <a href={href} className={styles.option}>
                <span className={styles.icon} aria-hidden="true">
                  <i className={icon} />
                </span>
                <span className={styles.label}>{label}</span>
                <i className={`fa-solid fa-arrow-right ${styles.arrow}`} aria-hidden="true" />
              </a>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CareerStage;
