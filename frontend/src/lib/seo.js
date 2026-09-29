/**
 * Site-wide SEO constants and JSON-LD builders.
 *
 * Everything structured-data related lives here so the schema stays consistent
 * across pages and there's one place to fix when a price, title or bio changes.
 * Prices are pulled from lib/services.js rather than repeated, because the
 * old hand-written JSON-LD in index.html had already drifted out of sync with
 * the real prices once.
 */

import { SERVICES } from './services.js';

export const SITE_URL = 'https://fabdesign.digital';
export const SITE_NAME = 'Fabiola Ledesma';
export const AUTHOR = 'Fabiola Ledesma';
export const LOCALE = 'es_MX';
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Public profiles. Footer, JSON-LD sameAs and llms.txt all read from here. */
export const LINKEDIN_URL = 'https://linkedin.com/in/fabiolaledesma';
export const INSTAGRAM_URL = 'https://www.instagram.com/fab_designux/';

export const DEFAULT_TITLE = 'Fabiola Ledesma | Asesorías en UX, IA y Product Design';
export const DEFAULT_DESCRIPTION =
  'Asesorías personalizadas para profesionales que quieren mejorar su carrera, CV, portafolio o preparación para entrevistas en UX y Product Design.';

/** Canonical absolute URL for a route. Keeps the trailing slash that the
 *  static export emits, so canonical tags match the real served URL. */
export function absoluteUrl(path = '/') {
  if (path === '/') return `${SITE_URL}/`;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean.endsWith('/') ? clean : `${clean}/`}`;
}

/**
 * Builds a Next.js Metadata object with the OG/Twitter pairs filled in.
 * `noindex` is used for the account pages, which must never be indexed.
 */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = OG_IMAGE,
  type = 'website',
  noindex = false,
  publishedTime,
  keywords,
}) {
  const url = absoluteUrl(path);
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;

  return {
    // `absolute` bypasses the layout's `%s | Fabiola Ledesma` template. Without
    // it the brand lands twice ("Tu perfil | Fabiola Ledesma | Fabiola
    // Ledesma"), since fullTitle already appended it.
    title: { absolute: fullTitle },
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: LOCALE,
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE_NAME} — Asesorías en UX, IA y Product Design` }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

/* ── JSON-LD builders ──────────────────────────────────────────────────── */

export const personSchema = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#fabiola`,
  name: 'Fabiola Ledesma',
  jobTitle: 'Senior Design Manager y Consultora en UX, IA y Product Design',
  description:
    'Senior Design Manager con más de 15 años diseñando productos digitales. Cofundadora de GEDX. Asesora a profesionales de UX y Product Design en México en estrategia, carrera y aplicación práctica de IA.',
  url: `${SITE_URL}/`,
  image: OG_IMAGE,
  sameAs: [LINKEDIN_URL, INSTAGRAM_URL, 'https://gedx.com.mx'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ciudad de México',
    addressRegion: 'CDMX',
    addressCountry: 'MX',
  },
  knowsAbout: [
    'UX Design',
    'Design Management',
    'UX Leadership',
    'Career Mentoring',
    'Producto Digital',
    'Portafolio UX',
    'Entrevistas de diseño',
    'Design Thinking',
    'Inteligencia Artificial aplicada a producto',
  ],
  alumniOf: [
    { '@type': 'EducationalOrganization', name: 'UNITEC' },
    { '@type': 'EducationalOrganization', name: 'Tecnológico de Monterrey' },
    { '@type': 'EducationalOrganization', name: 'Interaction Design Foundation' },
  ],
};

function offerFor(service) {
  return {
    '@type': 'Offer',
    name: service.name,
    description: service.desc,
    price: String(service.price),
    priceCurrency: 'MXN',
    availability: 'https://schema.org/InStock',
    url: absoluteUrl(`/asesorias/${service.slug}`),
  };
}

export const professionalServiceSchema = {
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#servicio`,
  name: 'Fabiola Ledesma — Asesorías en UX, IA y Product Design',
  description:
    'Asesorías individuales para profesionales que quieren mejorar su carrera, CV, portafolio o preparación para entrevistas en UX y Product Design.',
  url: `${SITE_URL}/`,
  image: OG_IMAGE,
  provider: { '@id': `${SITE_URL}/#fabiola` },
  areaServed: { '@type': 'Country', name: 'México' },
  serviceType: 'Asesoría en UX y Product Design',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${SITE_URL}/#agenda`,
    availableLanguage: 'Spanish',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Asesorías individuales',
    itemListElement: SERVICES.map(offerFor),
  },
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  inLanguage: 'es-MX',
  publisher: { '@id': `${SITE_URL}/#fabiola` },
};

/** Service-specific schema for a /asesorias/[slug] page. */
export function serviceSchema(service) {
  const url = absoluteUrl(`/asesorias/${service.slug}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: service.name,
        description: service.seoDescription,
        url,
        serviceType: service.name,
        provider: { '@id': `${SITE_URL}/#fabiola` },
        areaServed: { '@type': 'Country', name: 'México' },
        audience: { '@type': 'Audience', audienceType: 'Profesionales de UX y Product Design' },
        offers: offerFor(service),
      },
      breadcrumbSchema([
        { name: 'Inicio', path: '/' },
        { name: 'Asesorías', path: '/asesorias' },
        { name: service.name, path: `/asesorias/${service.slug}` },
      ]),
      ...(service.faq?.length ? [faqSchema(service.faq, `${url}#faq`)] : []),
    ],
  };
}

export function faqSchema(items, id) {
  return {
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(({ name, path }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

export function blogPostingSchema(post) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#post`,
        headline: post.title,
        description: post.excerpt || post.title,
        url,
        inLanguage: 'es-MX',
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        author: { '@id': `${SITE_URL}/#fabiola` },
        publisher: { '@id': `${SITE_URL}/#fabiola` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
      },
      breadcrumbSchema([
        { name: 'Inicio', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  };
}
