import { SERVICES } from '@/lib/services.js';
import { getPublishedPosts } from '@/lib/blog.js';
import { absoluteUrl } from '@/lib/seo.js';
import { WORKSHOPS_PATH } from '@/lib/workshops.js';

/**
 * Generated at build time into /sitemap.xml, replacing the old hand-maintained
 * public/sitemap.xml — which had gone stale (it still listed `#anchor` URLs as
 * if they were separate pages, which they never were, and a 2026-04-30 lastmod
 * for every entry).
 *
 * Account pages are deliberately absent: they're noindex.
 */
// Required by `output: 'export'` — the sitemap is written once at build time.
export const dynamic = 'force-static';

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1.0 },
    { url: absoluteUrl('/asesorias'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl(WORKSHOPS_PATH), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/sobre-mi'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/preguntas-frecuentes'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.7 },
  ].map((r) => ({ ...r, lastModified: now }));

  const serviceRoutes = SERVICES.map((s) => ({
    url: absoluteUrl(`/asesorias/${s.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const posts = await getPublishedPosts();
  const postRoutes = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updatedAt || p.publishedAt || now,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...postRoutes];
}
