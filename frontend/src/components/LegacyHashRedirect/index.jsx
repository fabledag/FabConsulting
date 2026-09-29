'use client';

import { useEffect } from 'react';

/**
 * "Sobre mí" and the FAQ used to be sections of the home page. Links that
 * still carry those fragments (bookmarks, shared URLs, old AI answers) land
 * here with nothing to scroll to, so send them to the new pages. Only the
 * fragment is inspected, so it runs client-side after load.
 */
const MOVED = {
  '#sobre-mi': '/sobre-mi/',
  '#faq': '/preguntas-frecuentes/',
  '#como-funciona': '/preguntas-frecuentes/#como-funciona',
  '#momento-carrera': '/#servicios',
};

export default function LegacyHashRedirect() {
  useEffect(() => {
    const target = MOVED[window.location.hash];
    if (target) window.location.replace(target);
  }, []);
  return null;
}
