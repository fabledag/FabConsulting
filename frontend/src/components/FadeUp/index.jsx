import { useEffect, useRef } from 'react';

/**
 * FadeUp — wraps children in a div that fades + slides up when it enters the viewport.
 * Props:
 *   delay  — CSS transition-delay (e.g. '0.1s')
 *   as     — HTML tag to render (default 'div')
 *   className — extra classes
 */
function FadeUp({ children, delay = '0s', as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('fade-up-visible');
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`fade-up-base ${className}`}
      style={{
        transitionDelay: delay,
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Inject the .fade-up-visible rule once into the document head
if (typeof document !== 'undefined') {
  const id = '__fadeup-styles__';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `.fade-up-visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(s);
  }
}

export default FadeUp;
