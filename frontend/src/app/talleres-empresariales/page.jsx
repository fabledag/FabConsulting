import Link from 'next/link';
import Image from 'next/image';
import Nav from '@/components/Nav/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import WorkshopCta from '@/components/Workshops/WorkshopCta.jsx';
import WorkshopInquiryForm from '@/components/Workshops/WorkshopInquiryForm.jsx';
import {
  WORKSHOPS,
  WORKSHOP_PROCESS,
  WORKSHOP_VALUES,
  WORKSHOP_AUDIENCES,
  SCOPE_NOTE,
  WORKSHOPS_PATH,
} from '@/lib/workshops.js';
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
        {/* ── Hero ── */}
        <section className={styles.hero} aria-labelledby="talleres-h1">
          <div className={`wrap ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
                <ol>
                  <li><Link href="/">Inicio</Link></li>
                  <li aria-hidden="true">›</li>
                  <li aria-current="page">Talleres para empresas</li>
                </ol>
              </nav>

              <span className={styles.heroEyebrow}>
                <i className="fa-solid fa-building" aria-hidden="true" /> Talleres para empresas
              </span>
              <h1 id="talleres-h1" className={styles.title}>
                Talleres para <em>equipos</em> que necesitan alinear y avanzar
              </h1>
              <p className={styles.intro}>
                Talleres para equipos de diseño, producto, innovación y negocio que necesitan alinear
                decisiones, presentar propuestas con claridad o explorar cómo el diseño y la IA pueden
                aportar a un reto concreto.
              </p>

              <ul className={styles.values}>
                {WORKSHOP_VALUES.map(({ icon, label }) => (
                  <li key={label}>
                    <i className={icon} aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>

              <div className={styles.headerActions}>
                <a href="#solicitud" className={styles.ctaPrimary}>
                  Solicita una propuesta
                </a>
                <a href="#talleres" className={styles.ctaGhost}>
                  Ver los talleres
                </a>
              </div>
            </div>

            <aside className={styles.heroCard} aria-label="Quién facilita los talleres">
              <div className={styles.heroCardTop}>
                <Image
                  src="/fabiola.jpg"
                  alt="Fabiola Ledesma"
                  width={64}
                  height={64}
                  className={styles.heroPhoto}
                  priority
                />
                <div>
                  <div className={styles.heroCardName}>Fabiola Ledesma</div>
                  <div className={styles.heroCardRole}>Facilitadora · Senior Design Manager</div>
                </div>
              </div>
              <ul className={styles.heroFacts}>
                <li><strong>15+</strong> años diseñando productos digitales</li>
                <li><strong>8+</strong> años liderando equipos de diseño en banca digital</li>
                <li>Formación de talento digital en <strong>Colectivo23</strong></li>
              </ul>
              <div className={styles.heroCardFoot}>
                <span className={styles.heroCardLabel}>Ideal para equipos de</span>
                <div className={styles.audiences}>
                  {WORKSHOP_AUDIENCES.map((a) => (
                    <span key={a}>{a}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Talleres ── */}
        <section id="talleres" className={styles.workshopsSection} aria-labelledby="talleres-title">
          <div className="wrap">
            <div className={styles.sectionHead}>
              <span className="section-eyebrow">Los talleres</span>
              <h2 id="talleres-title" className="section-title">
                Dos talleres, <em>un mismo enfoque práctico</em>
              </h2>
            </div>

            <div className={styles.grid}>
              {WORKSHOPS.map((w, i) => (
                <article key={w.key} id={w.anchor} className={styles.card} aria-labelledby={`${w.anchor}-title`}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardIcon} aria-hidden="true">
                      <i className={w.icon} />
                    </span>
                    <span className={styles.cardNum}>Taller {String(i + 1).padStart(2, '0')}</span>
                  </div>
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
                        <li key={t}>
                          <i className="fa-solid fa-check" aria-hidden="true" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.exercise}>
                    <h4 className={styles.cardLabel}>
                      <i className="fa-solid fa-pen-ruler" aria-hidden="true" /> Ejercicio de aplicación propuesto
                    </h4>
                    <p>{w.exercise}</p>
                  </div>

                  <WorkshopCta workshopKey={w.key} className={`btn-primary ${styles.cardCta}`}>
                    Me interesa este taller
                  </WorkshopCta>
                </article>
              ))}
            </div>

            <p className={styles.scopeNote}>
              <i className="fa-solid fa-circle-info" aria-hidden="true" /> {SCOPE_NOTE}
            </p>
          </div>
        </section>

        {/* ── Proceso ── */}
        <section id="como-lo-trabajamos" className={styles.processSection} aria-labelledby="proceso-title">
          <div className="wrap">
            <div className={styles.sectionHeadLight}>
              <span className={styles.darkEyebrow}>Cómo lo trabajamos</span>
              <h2 id="proceso-title" className={styles.darkTitle}>
                Del reto del equipo a <em>próximos pasos</em>
              </h2>
            </div>
            <ol className={styles.process}>
              {WORKSHOP_PROCESS.map(({ icon, title, desc }, i) => (
                <li key={title} className={styles.processStep}>
                  <div className={styles.processTop}>
                    <span className={styles.processIcon} aria-hidden="true">
                      <i className={icon} />
                    </span>
                    <span className={styles.processNum} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className={styles.processTitle}>{title}</h3>
                  <p className={styles.processDesc}>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Solicitud ── */}
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
              <ul className={styles.formSteps}>
                <li><i className="fa-solid fa-envelope-open-text" aria-hidden="true" /> Te respondo por correo</li>
                <li><i className="fa-solid fa-comments" aria-hidden="true" /> Conversamos el objetivo</li>
                <li><i className="fa-solid fa-file-signature" aria-hidden="true" /> Recibes una propuesta</li>
              </ul>
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
