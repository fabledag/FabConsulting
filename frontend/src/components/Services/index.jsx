'use client';

import Link from 'next/link';
import FadeUp from '../FadeUp/index.jsx';
import { SERVICES } from '@/lib/services.js';
import { setPreselectedService } from '@/lib/bookingStorage.js';
import styles from './Services.module.css';

function selectService(key) {
  setPreselectedService(key);
}

function Services() {
  return (
    <section className={styles.services} id="servicios">
      <div className={`wrap ${styles.servicesInner}`}>
      {/* Header */}
      <FadeUp className={styles.header}>
        <div>
          <span className={`section-eyebrow ${styles.eyebrow}`}>Asesorías</span>
          <h2 className={`section-title ${styles.title}`}>
            Elige la sesión
            <br />
            que <em>necesitas</em>
          </h2>
          <p className={styles.intro}>
            Sesiones enfocadas para profesionales. No respuestas genéricas —
            estrategia para tu contexto específico.
          </p>
        </div>
      </FadeUp>

      {/* Cards grid */}
      <div className={styles.grid}>
        {SERVICES.map(({ anchor, key, slug, tag, tagPlain, name, desc, forWho, topics, duration, display, cta }, i) => (
          <FadeUp key={key} id={anchor} className={styles.card} delay={`${i * 0.05}s`}>
            <span className={`${styles.tag} ${tagPlain ? styles.tagPlain : ''}`}>{tag}</span>
            <h3 className={styles.cardH3}>{name}</h3>
            <p className={styles.cardP}>{desc}</p>
            <p className={styles.cardForWho}>{forWho}</p>

            <div className={styles.topicsList}>
              {topics.map((t) => (
                <span key={t} className={styles.topicTag}>{t}</span>
              ))}
            </div>

            <div className={styles.cardMeta}>
              <span>{duration}</span>
            </div>

            <div className={styles.priceRow}>
              <div className={styles.priceBlockInline}>
                <span className={styles.priceNumSm}>{display.replace(' MXN', '')}</span>
                <span className={styles.priceUnitSm}>MXN</span>
              </div>
            </div>

            <a
              href="#agenda"
              className="btn-primary"
              style={{ justifyContent: 'center', width: '100%' }}
              onClick={() => selectService(key)}
            >
              {cta}
            </a>

            {/* Internal link to the dedicated page. Doubles as the crawl path
                that lets search engines discover /asesorias/* at all. */}
            <Link href={`/asesorias/${slug}/`} className={styles.detailsLink}>
              Conoce los detalles de esta sesión
            </Link>
          </FadeUp>
        ))}
      </div>

      <p className={styles.resultsNote}>
        No saldrás solo con consejos: terminaremos la sesión con recomendaciones claras y próximos pasos que puedas aplicar.
      </p>
      </div>
    </section>
  );
}

export default Services;
