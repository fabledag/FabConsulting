'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Replaces the old hash-based router (`#/login`) now that CloudFront resolves
 * real paths. The app routes stayed in English (`/login`, `/profile`,
 * `/admin`) on purpose: magic-link emails already in people's inboxes carry
 * `redirect=/profile`, and these pages are noindex anyway, so there is nothing
 * to gain from renaming them and a live flow to break.
 */

/**
 * `output: 'export'` writes every route as `<route>/index.html`, so links must
 * carry the trailing slash or CloudFront answers 404. Query strings and
 * fragments are preserved.
 */
export function withTrailingSlash(path) {
  // Split off the query string / fragment so the slash lands on the path only:
  // "/login?redirect=/profile" → base "/login", suffix "?redirect=/profile".
  const [, base, suffix] = path.match(/^([^?#]*)([?#].*)?$/s) || [null, path, ''];
  const withSlash = base.endsWith('/') ? base : `${base}/`;
  return `${withSlash}${suffix || ''}`;
}

/** Client-side query string. Read from `window` rather than `useSearchParams`
 *  so these pages don't need a Suspense boundary during static export. */
export function getSearch() {
  if (typeof window === 'undefined') return '';
  return window.location.search;
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((path) => router.push(withTrailingSlash(path)), [router]);
}
