import Image from 'next/image';
import Link from 'next/link';
import FadeUp from '../FadeUp/index.jsx';
import styles from './AboutTeaser.module.css';

/**
 * "Sobre mí" on the home page: a large stage photo and a short, prominent
 * introduction. The full story, skills and credentials live on /sobre-mi/.
 */
function AboutTeaser() {
  return (
    <section id="presentacion" className={styles.section} aria-labelledby="presentacion-title">
      <div className={`wrap ${styles.inner}`}>
        <FadeUp className={styles.photoWrap}>
          {/* Stage photo (Assets/Fotos/WhatsApp Image 2026-09-26…), cropped to
              3:4 around Fabiola. The studio portrait stays on /sobre-mi/. */}
          <Image
            src="/images/fabiola-escenario.jpg"
            alt="Fabiola Ledesma dando una conferencia en un escenario, con micrófono"
            width={675}
            height={900}
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
