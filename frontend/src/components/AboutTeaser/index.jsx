import Image from 'next/image';
import Link from 'next/link';
import FadeUp from '../FadeUp/index.jsx';
import styles from './AboutTeaser.module.css';

/**
 * "Sobre mí" on the home page: a large portrait and a short, prominent
 * introduction. The full story, skills and credentials live on /sobre-mi/.
 */
function AboutTeaser() {
  return (
    <section id="presentacion" className={styles.section} aria-labelledby="presentacion-title">
      <div className={`wrap ${styles.inner}`}>
        <FadeUp className={styles.photoWrap}>
          <Image
            src="/fabiola.jpg"
            alt="Fabiola Ledesma, Senior Design Manager y consultora en UX, IA y Product Design"
            width={1086}
            height={1448}
            sizes="(min-width: 900px) 420px, 90vw"
            className={styles.photo}
          />
          <span className={styles.photoBadge}>
            <strong>15+</strong> años diseñando productos digitales
          </span>
        </FadeUp>

        <FadeUp delay="0.05s" className={styles.copy}>
          <span className="section-eyebrow">Sobre mí</span>
          <h2 id="presentacion-title" className={styles.title}>
            Hola, soy Fabiola. <em>Diseño, lidero y enseño.</em>
          </h2>
          <p className={styles.lead}>
            Llevo más de 15 años diseñando productos digitales de punta a punta y más de 8
            liderando equipos de diseño en banca digital.
          </p>
          <p>
            Formo talento en Colectivo23 y cofundé la agencia GEDX. En cada sesión y en cada taller
            comparto una perspectiva práctica y directa, adaptada al momento de cada persona y de
            cada equipo.
          </p>
          <blockquote className={styles.quote}>
            “Muchas personas talentosas no avanzan no por falta de habilidades, sino por falta de
            claridad.”
          </blockquote>
          <Link href="/sobre-mi/" className={`btn-primary ${styles.cta}`}>
            Conoce mi trayectoria →
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

export default AboutTeaser;
