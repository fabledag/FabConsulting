import Image from 'next/image';
import Link from 'next/link';
import FadeUp from '../FadeUp/index.jsx';
import styles from './AboutTeaser.module.css';

/**
 * Short "Sobre mí" for the home page. The full story, skills and credentials
 * live on /sobre-mi/; this keeps home to a quick introduction.
 */
function AboutTeaser() {
  return (
    <section id="presentacion" className={styles.section} aria-labelledby="presentacion-title">
      <div className={`wrap ${styles.inner}`}>
        <FadeUp className={styles.photoWrap}>
          <Image
            src="/fabiola.jpg"
            alt="Fabiola Ledesma, Senior Design Manager y consultora en UX, IA y Product Design"
            width={160}
            height={160}
            className={styles.photo}
          />
        </FadeUp>

        <FadeUp delay="0.05s" className={styles.copy}>
          <span className="section-eyebrow">Sobre mí</span>
          <h2 id="presentacion-title" className={styles.title}>
            Hola, soy Fabiola. <em>Diseño, lidero y enseño.</em>
          </h2>
          <p>
            Llevo más de 15 años diseñando productos digitales de punta a punta y más de 8 liderando
            equipos de diseño en banca digital. Formo talento en Colectivo23 y cofundé la agencia
            GEDX. En cada sesión comparto una perspectiva práctica y directa, adaptada a tu momento.
          </p>
          <Link href="/sobre-mi/" className={styles.link}>
            Conoce mi trayectoria <span aria-hidden="true">→</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

export default AboutTeaser;
