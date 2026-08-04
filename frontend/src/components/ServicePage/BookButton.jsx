'use client';

import { useRouter } from 'next/navigation';

/**
 * Sends the visitor from a service page into the booking widget with this
 * service already chosen. Writes the same `preselected_service` sessionStorage
 * key the landing cards use, then navigates to the homepage's #agenda anchor.
 */
function BookButton({ serviceKey, children, className = 'btn-primary', style }) {
  const router = useRouter();

  function handleClick(e) {
    e.preventDefault();
    try {
      sessionStorage.setItem('preselected_service', serviceKey);
    } catch {
      // Private browsing can block sessionStorage; the booking step just
      // starts unselected instead of failing the navigation.
    }
    router.push('/#agenda');
  }

  return (
    <a href="/#agenda" className={className} style={style} onClick={handleClick}>
      {children}
    </a>
  );
}

export default BookButton;
