import { useEffect, useState } from 'react';

// Hash-based routing (e.g. "#/login?token=xyz"), so /login and /profile
// never hit the server — only "/" is ever requested, which always works
// regardless of CloudFront path-rewrite config. Plain in-page anchors like
// "#agenda" (used for scrolling to homepage sections) are left alone: only
// hashes starting with "#/" are treated as app routes.
function parseHash() {
  const raw = window.location.hash;
  if (!raw.startsWith('#/')) {
    return { path: '/', search: '' };
  }
  const withoutHash = raw.slice(1);
  const [path, search] = withoutHash.split('?');
  return { path: path || '/', search: search ? `?${search}` : '' };
}

export function getPath() {
  return parseHash().path;
}

export function getSearch() {
  return parseHash().search;
}

export function navigate(path) {
  const target = `#${path}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

export function useRoute() {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}
