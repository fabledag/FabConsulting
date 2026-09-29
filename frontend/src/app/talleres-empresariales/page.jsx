import Link from 'next/link';
import Nav from '@/components/Nav/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import WorkshopCta from '@/components/Workshops/WorkshopCta.jsx';
import WorkshopInquiryForm from '@/components/Workshops/WorkshopInquiryForm.jsx';
import { WORKSHOPS, WORKSHOP_PROCESS, SCOPE_NOTE, WORKSHOPS_PATH } from '@/lib/workshops.js';
import { buildMetadata, absoluteUrl, breadcrumbSchema } from '@/lib/seo.js';
import styles from '@/components/Workshops/Workshops.module.css';

export const metadata = buildMetadata({
  title: 'Talleres para empresas: comunicación estratégica, diseño e IA',
  description:
    'Talleres para equipos de diseño, producto, innovación y negocio: comunicación estratégica para presentar propuestas y alinear áreas, y diseño estratégico e IA aplicada a un reto concreto.',
  path: WORKSHOPS_PATH,
  keywords: [
    'talleres para empresas',
    'taller de comunicación estratégica',
    'taller de IA aplicada al negocio',
    'taller de diseño estratégico',
    'capacitación equipos de producto',
    'Fabiola Ledesma',
  ],
});

const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      '@id': `${absoluteUrl(WORKSHOPS_PATH)}#talleres`,
      name: 'Talleres para empresas',
      itemListElement: WORKSHOPS.map((w, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Service',
          name: w.name,
          description: w.desc,
          serviceType: 'Taller para empresas',
          audience: { '@type': 'BusinessAudience', audienceType: w.forWho },
          provider: { '@id': `${absoluteUrl('/')}#fabiola` },
          url: `${absoluteUrl(WORKSHOPS_PATH)}#${w.anchor}`,
        },
      })),
    },
    breadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Talleres para empresas', path: WORKSHOPS_PATH },
    ]),
  ],
};

export default function TalleresEmpresariales() {
  return (
    <div className={styles.page}>
      <JsonLd schema={pageSchema} />
      <Nav />

      <main>
        <div className="wrap">
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <ol>
              <li><Link href="/">Inicio</Link></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">Talleres para empresas</li>
            </ol>
          </nav>

          <header className={styles.header}>
            <span className="section-eyebrow">Para equipos</span>
            <h1 className={styles.title}>
              Talleres para <em>empresas</em>
            </h1>
            <p className={styles.intro}>
              Talleres para equipos de diseño, producto, innovación y negocio que necesitan alinear
              decisiones, presentar propuestas con claridad o explorar cómo el diseño y la IA pueden
              aportar a un reto concreto. Cada taller se adapta al contexto del equipo y se trabaja
              sobre casos propios.
            </p>
            <div className={styles.headerActions}>
              <a href="#solicitud" className="btn-primary">
                Solicita información
              </a>
              <a href="#talleres" className="btn-ghost">
                Ver los talleres
              </a>
            </div>
          </header>
        </div>

        <section id="talleres" className={styles.workshopsSection} aria-labelledby="talleres-title">
          <div className="wrap">
            <h2 id="talleres-title" className={`section-title ${styles.sectionTitleLight}`}>
              Dos talleres, <em>un mismo enfoque práctico</em>
            </h2>

            <div className={styles.grid}>
              {WORKSHOPS.map((w) => (
                <article key={w.key} id={w.anchor} className={styles.card} aria-labelledby={`${w.anchor}-title`}>
                  <span className={styles.tag}>Taller</span>
                  <h3 id={`${w.anchor}-title`} className={styles.cardTitle}>{w.name}</h3>
                  <p className={styles.cardDesc}>{w.desc}</p>

                  <div className={styles.cardBlock}>
                    <h4 className={styles.cardLabel}>Dirigido a</h4>
                    <p>{w.forWho}</p>
                  </div>

                  <div className={styles.cardBlock}>
                    <h4 className={styles.cardLabel}>Temas</h4>
                    <ul className={styles.topics}>
                      {w.topics.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={`${styles.cardBlock} ${styles.exercise}`}>
                    <h4 className={styles.cardLabel}>Ejercicio de aplicación propuesto</h4>
                    <p>{w.exercise}</p>
                  </div>

                  <WorkshopCta workshopKey={w.key} className={`btn-primary ${styles.cardCta}`}>
                    Me interesa este taller
                  </WorkshopCta>
                </article>
              ))}
            </div>

            <p className={styles.scopeNote}>{SCOPE_NOTE}</p>
          </div>
        </section>

        <section id="como-lo-trabajamos" className={styles.processSection} aria-labelledby="proceso-title">
          <div className="wrap">
            <span className="section-eyebrow">Cómo lo trabajamos</span>
            <h2 id="proceso-title" className="section-title">
              Del reto del equipo a <em>próximos pasos</em>
            </h2>
            <ol className={styles.process}>
              {WORKSHOP_PROCESS.map(({ title, desc }, i) => (
                <li key={title} className={styles.processStep}>
                  <span className={styles.processNum} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.processTitle}>{title}</h3>
                  <p className={styles.processDesc}>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="solicitud" className={styles.formSection} aria-labelledby="solicitud-title">
          <div className={`wrap ${styles.formWrap}`}>
            <div className={styles.formIntro}>
              <span className="section-eyebrow">Solicitud</span>
              <h2 id="solicitud-title" className="section-title">
                Cuéntanos sobre <em>tu equipo</em>
              </h2>
              <p>
                Comparte el contexto y lo que necesitan lograr. Con esa información preparo una
                propuesta de alcance y dinámica para conversarla contigo.
              </p>
              <p className={styles.formIntroNote}>{SCOPE_NOTE}</p>
              <p className={styles.formIntroNote}>
                ¿Buscas una asesoría individual? <Link href="/#servicios">Conoce las asesorías 1:1</Link>.
              </p>
            </div>
            <WorkshopInquiryForm />
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
