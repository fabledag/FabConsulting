import Link from 'next/link';
import Nav from '@/components/Nav/index.jsx';
import About from '@/components/About/index.jsx';
import CtaStrip from '@/components/CtaStrip/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { buildMetadata, absoluteUrl, breadcrumbSchema } from '@/lib/seo.js';
import styles from '../asesorias/asesorias.module.css';

const PATH = '/sobre-mi';

export const metadata = buildMetadata({
  title: 'Sobre mí — Senior Design Manager en UX e IA',
  description:
    'Senior Design Manager con 15+ años diseñando productos digitales y 8 liderando equipos de diseño en banca digital. Mentora en Colectivo23 y cofundadora de GEDX.',
  path: PATH,
});

const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': `${absoluteUrl(PATH)}#pagina`,
      url: absoluteUrl(PATH),
      name: 'Sobre Fabiola Ledesma',
      mainEntity: { '@id': `${absoluteUrl('/')}#fabiola` },
    },
    breadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Sobre mí', path: PATH },
    ]),
  ],
};

export default function SobreMiPage() {
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
              <li aria-current="page">Sobre mí</li>
            </ol>
          </nav>
        </div>
        <About asPage />
        <CtaStrip />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
