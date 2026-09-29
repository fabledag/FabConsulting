import Link from 'next/link';
import Nav from '@/components/Nav/index.jsx';
import FAQ from '@/components/FAQ/index.jsx';
import HowItWorks from '@/components/HowItWorks/index.jsx';
import CtaStrip from '@/components/CtaStrip/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { FAQ_ITEMS } from '@/lib/faq.js';
import { buildMetadata, absoluteUrl, breadcrumbSchema, faqSchema } from '@/lib/seo.js';
import styles from '../asesorias/asesorias.module.css';

const PATH = '/preguntas-frecuentes';

export const metadata = buildMetadata({
  title: 'Preguntas frecuentes sobre las asesorías',
  description:
    'Cómo elegir tu sesión, cómo se reserva y se paga, reprogramaciones, videollamadas y talleres para empresas: respuestas a las dudas más comunes antes de reservar.',
  path: PATH,
});

// The FAQPage node lives here now (it used to be on the home page) — one
// URL per FAQ set, so search engines don't see the same questions twice.
const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    faqSchema(
      FAQ_ITEMS.map(({ q, plain }) => ({ q, a: plain })),
      `${absoluteUrl(PATH)}#faq`
    ),
    breadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Preguntas frecuentes', path: PATH },
    ]),
  ],
};

export default function PreguntasFrecuentesPage() {
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
              <li aria-current="page">Preguntas frecuentes</li>
            </ol>
          </nav>
        </div>
        <FAQ asPage />
        <HowItWorks />
        <CtaStrip />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
