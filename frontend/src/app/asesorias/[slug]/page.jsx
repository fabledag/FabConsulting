import Link from 'next/link';
import { notFound } from 'next/navigation';
import ServicePage from '@/components/ServicePage/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { SERVICES, LEGACY_SLUGS, getServiceBySlug } from '@/lib/services.js';
import { buildMetadata, serviceSchema } from '@/lib/seo.js';

/**
 * Tells the static export which /asesorias/* pages to write out: the current
 * services plus the retired slugs, which become forwarding pages. There's no
 * server to answer a 301, so they use an instant meta refresh and point
 * crawlers at the new URL (canonical + noindex).
 */
export function generateStaticParams() {
  return [...SERVICES.map((s) => ({ slug: s.slug })), ...Object.keys(LEGACY_SLUGS).map((slug) => ({ slug }))];
}

// `params` is a Promise as of Next 15 — it must be awaited before use.
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const movedTo = LEGACY_SLUGS[slug];
  if (movedTo) {
    const target = getServiceBySlug(movedTo);
    return buildMetadata({
      title: target.seoTitle,
      description: target.seoDescription,
      path: `/asesorias/${movedTo}`,
      noindex: true,
    });
  }

  const service = getServiceBySlug(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/asesorias/${service.slug}`,
  });
}

function MovedPage({ to }) {
  const target = getServiceBySlug(to);
  const href = `/asesorias/${to}/`;
  return (
    <main className="wrap" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      {/* Relative on purpose, so a local build doesn't bounce to production. */}
      <meta httpEquiv="refresh" content={`0; url=${href}`} />
      <h1 className="section-title">Esta página cambió de lugar</h1>
      <p>
        Continúa en <Link href={href}>{target.name}</Link> o revisa{' '}
        <Link href="/asesorias/">todas las asesorías</Link>.
      </p>
    </main>
  );
}

export default async function ServiceRoute({ params }) {
  const { slug } = await params;

  if (LEGACY_SLUGS[slug]) return <MovedPage to={LEGACY_SLUGS[slug]} />;

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd schema={serviceSchema(service)} />
      <ServicePage service={service} />
    </>
  );
}
