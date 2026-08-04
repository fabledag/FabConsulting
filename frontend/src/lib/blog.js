import { API_BASE_URL } from './config.js';

/**
 * Blog data fetched at BUILD time, not in the browser.
 *
 * These run inside `next build` on your machine, so the resulting HTML ships
 * with the full post text baked in — that's what makes posts readable to
 * crawlers that never execute JavaScript, and what makes them rank.
 *
 * The trade-off: publishing a post in the admin panel does not make it appear
 * on the site by itself. The site has to be rebuilt and redeployed —
 * `./deploy.sh` from the repo root does both.
 *
 * Next caches `fetch` results in `.next/cache` across builds, so deploy.sh
 * clears that directory first; otherwise a rebuild could quietly serve the
 * previous run's posts.
 */

/** Never let a blog API hiccup fail the whole site build. */
async function safeFetch(path) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`);
    if (!res.ok) {
      console.warn(`[blog] ${path} responded ${res.status} — continuing without it.`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[blog] ${path} unreachable (${err.message}) — continuing without it.`);
    return null;
  }
}

/** All published posts, newest first. Returns [] if the API is unavailable. */
export async function getPublishedPosts() {
  const data = await safeFetch('/blog?limit=50');
  return data?.posts ?? [];
}

/** One post including its rendered `contentHtml`, or null if missing. */
export async function getPost(slug) {
  const data = await safeFetch(`/blog/${encodeURIComponent(slug)}`);
  return data?.post ?? null;
}

/** Formats an ISO date for display in es-MX. */
export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Mexico_City',
    });
  } catch {
    return '';
  }
}
