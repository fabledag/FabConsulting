'use client';

/**
 * "Me interesa este taller": jumps to the inquiry form and preselects the
 * workshop there. A plain #solicitud anchor, so it still scrolls before
 * hydration and works from the keyboard; the event only adds the preselection.
 */

export const WORKSHOP_INTEREST_EVENT = 'workshop-interest';

export default function WorkshopCta({ workshopKey, className, children }) {
  return (
    <a
      href="#solicitud"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(WORKSHOP_INTEREST_EVENT, { detail: workshopKey }))}
    >
      {children}
    </a>
  );
}
