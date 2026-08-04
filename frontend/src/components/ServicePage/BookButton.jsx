'use client';

import { useRouter } from 'next/navigation';
import { setPreselectedService } from '@/lib/bookingStorage.js';

/**
 * Sends the visitor from a service page into the booking widget with this
 * service already chosen. Writes the same preselection the landing cards use,
 * then navigates to the homepage's #agenda anchor.
 */
function BookButton({ serviceKey, children, className = 'btn-primary', style }) {
  const router = useRouter();

  function handleClick(e) {
    e.preventDefault();
    setPreselectedService(serviceKey);
    router.push('/#agenda');
  }

  return (
    <a href="/#agenda" className={className} style={style} onClick={handleClick}>
      {children}
    </a>
  );
}

export default BookButton;
