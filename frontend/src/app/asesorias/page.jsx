import Link from 'next/link';
import Nav from '@/components/Nav/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { SERVICES } from '@/lib/services.js';
import { buildMetadata, absoluteUrl, breadcrumbSchema } from '@/lib/seo.js';
import styles from './asesorias.module.css';

export const metadata = buildMetadata({
  title: 'Asesorías en UX, IA y Product Design',
  description:
    'Cinco asesorías individuales para profesionales de UX y Product Design: conversación estratégica, revisión de CV y LinkedIn, revisión de portafolio, simulación de entrevista y mentoría continua.',
  path: '/asesorias',
});

const itemListSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      '@id': `${absoluteUrl('/asesorias')}#list`,
      name: 'Asesorías individuales',
      itemListElement: SERVICES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.name,
        url: absoluteUrl(`/asesorias/${s.slug}`),
      })),
    },
    breadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Asesorías', path: '/asesorias' },
    ]),
  ],
};

export default function AsesoriasIndex() {
  return (
    <div className={styles.page}>
      <JsonLd schema={itemListSchema} />
      <Nav />

      <main className="wrap">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/">Inicio</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">Asesorías</li>
          </ol>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Asesorías en UX, IA y Product Design</h1>
          <p className={styles.intro}>
            Cinco formas de trabajar juntos, según lo que necesites resolver ahora.
            Todas son sesiones individuales por videollamada, en español, pensadas
            para profesionales de UX y Product Design.
          </p>
        </header>

        <div className={styles.grid}>
          {SERVICES.map((s) => (
            <article key={s.key} className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Link href={`/asesorias/${s.slug}/`}>{s.name}</Link>
              </h2>
              <p className={styles.cardDesc}>{s.desc}</p>
              <p className={styles.cardFor}>{s.forWho}</p>
              <div className={styles.cardMeta}>
                <span className={styles.cardPrice}>{s.display}</span>
                <span className={styles.cardDuration}>{s.duration}</span>
              </div>
              <Link href={`/asesorias/${s.slug}/`} className={styles.cardLink}>
                Ver los detalles →
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
