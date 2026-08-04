import Link from 'next/link';
import Nav from '../Nav/index.jsx';
import Footer from '../Footer/index.jsx';
import WhatsAppFloat from '../WhatsAppFloat/index.jsx';
import BookButton from './BookButton.jsx';
import { SERVICES } from '@/lib/services.js';
import styles from './ServicePage.module.css';

/**
 * Renders one dedicated service page. Deliberately a Server Component: all the
 * prose ships inside the exported HTML, which is the entire point of these
 * pages — crawlers that don't run JS (GPTBot, ClaudeBot, PerplexityBot) get the
 * full text, not an empty root div.
 */
function ServicePage({ service }) {
  const others = SERVICES.filter((s) => s.key !== service.key);

  return (
    <div className={styles.page}>
      <Nav />

      <div className="wrap">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/">Inicio</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/asesorias/">Asesorías</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{service.name}</li>
          </ol>
        </nav>
      </div>

      <header className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div>
            <span className={styles.kicker}>{service.heroKicker}</span>
            <h1 className={styles.title}>{service.name}</h1>
            <p className={styles.intro}>{service.intro}</p>
          </div>

          <aside className={styles.factsCard} aria-label="Detalles de la sesión">
            <div className={styles.priceRow}>
              <span className={styles.priceNum}>{service.display.replace(' MXN', '')}</span>
              <span className={styles.priceUnit}>MXN</span>
            </div>
            <p className={styles.factsMeta}>{service.durationLong}</p>

            <ul className={styles.factsList}>
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <BookButton
              serviceKey={service.key}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {service.cta}
            </BookButton>
          </aside>
        </div>
      </header>

      <main className={`wrap ${styles.body}`}>
        {service.body.map(({ h, p }) => (
          <section key={h} className={styles.section}>
            <h2>{h}</h2>
            <p>{p}</p>
          </section>
        ))}

        {service.faq?.length > 0 && (
          <section className={styles.faq} id="faq">
            <h2>Preguntas sobre esta sesión</h2>
            {service.faq.map(({ q, a }) => (
              <div key={q} className={styles.faqItem}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </section>
        )}

        <section className={styles.cta}>
          <h2>¿Te hace sentido esta sesión?</h2>
          <p>
            Agenda en menos de dos minutos. Eliges fecha, me cuentas brevemente qué
            quieres trabajar y recibes la confirmación por correo.
          </p>
          <BookButton serviceKey={service.key}>{service.cta}</BookButton>
        </section>

        <section className={styles.others}>
          <h2>Otras asesorías</h2>
          <div className={styles.othersGrid}>
            {others.map((s) => (
              <Link key={s.key} href={`/asesorias/${s.slug}/`} className={styles.otherCard}>
                <span className={styles.otherName}>{s.name}</span>
                <span className={styles.otherMeta}>
                  {s.duration} · {s.display}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default ServicePage;
