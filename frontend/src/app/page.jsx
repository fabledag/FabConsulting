import Nav from '@/components/Nav/index.jsx';
import Hero from '@/components/Hero/index.jsx';
import CareerStage from '@/components/CareerStage/index.jsx';
import About from '@/components/About/index.jsx';
import HowItWorks from '@/components/HowItWorks/index.jsx';
import Services from '@/components/Services/index.jsx';
import WorkshopsTeaser from '@/components/WorkshopsTeaser/index.jsx';
import Booking from '@/components/Booking/index.jsx';
import FAQ from '@/components/FAQ/index.jsx';
import CtaStrip from '@/components/CtaStrip/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
// Insights ("Cosas que nadie te dice") was removed from the public flow per
// the 2026-08-03 redesign brief. Component kept intact, just not rendered.
import { FAQ_ITEMS } from '@/lib/faq.js';
import { buildMetadata, faqSchema, DEFAULT_TITLE } from '@/lib/seo.js';

export const metadata = buildMetadata({
  title: DEFAULT_TITLE,
  path: '/',
  keywords: [
    'asesoría UX',
    'mentoría UX México',
    'consultoría Product Design',
    'revisión de portafolio UX',
    'revisión de CV UX',
    'simulación de entrevista UX',
    'carrera UX',
    'IA aplicada a producto',
    'Fabiola Ledesma',
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd schema={{ '@context': 'https://schema.org', ...faqSchema(FAQ_ITEMS.map(({ q, plain }) => ({ q, a: plain }))) }} />
      <Nav />
      <main>
        <Hero />
        <CareerStage />
        <Services />
        <WorkshopsTeaser />
        <About />
        <HowItWorks />
        <Booking />
        <FAQ />
        <CtaStrip />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
