import Nav from '@/components/Nav/index.jsx';
import Hero from '@/components/Hero/index.jsx';
import AboutTeaser from '@/components/AboutTeaser/index.jsx';
import Services from '@/components/Services/index.jsx';
import WorkshopsTeaser from '@/components/WorkshopsTeaser/index.jsx';
import Booking from '@/components/Booking/index.jsx';
import CtaStrip from '@/components/CtaStrip/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import LegacyHashRedirect from '@/components/LegacyHashRedirect/index.jsx';
// Home is kept to: who I am → asesorías → talleres → book / next steps.
// The full "Sobre mí" (About) lives on /sobre-mi/, and the FAQ plus "Cómo
// funciona" (HowItWorks) on /preguntas-frecuentes/ (2026-09-29).
// CareerStage ("¿En qué momento de tu carrera estás?") and Insights are no
// longer rendered; both components are kept intact.
import { buildMetadata, DEFAULT_TITLE } from '@/lib/seo.js';

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
      {/* The hero artwork is the largest thing above the fold (the LCP) but
          it's a CSS background, so the browser would only find it after the
          stylesheet. Preload the size each breakpoint actually uses. React
          hoists these into <head>. */}
      <link rel="preload" as="image" href="/images/hero-bg.jpg" media="(min-width: 900px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/images/hero-bg-960.jpg" media="(max-width: 899px)" fetchPriority="high" />
      <LegacyHashRedirect />
      <Nav />
      <main>
        <Hero />
        <AboutTeaser />
        <Services />
        <WorkshopsTeaser />
        <Booking />
        <CtaStrip />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
