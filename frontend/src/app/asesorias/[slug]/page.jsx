import { notFound } from 'next/navigation';
import ServicePage from '@/components/ServicePage/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { SERVICES, getServiceBySlug } from '@/lib/services.js';
import { buildMetadata, serviceSchema } from '@/lib/seo.js';

/** Tells the static export which /asesorias/* pages to write out. */
export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

// `params` is a Promise as of Next 15 — it must be awaited before use.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/asesorias/${service.slug}`,
  });
}

export default async function ServiceRoute({ params }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd schema={serviceSchema(service)} />
      <ServicePage service={service} />
    </>
  );
}
