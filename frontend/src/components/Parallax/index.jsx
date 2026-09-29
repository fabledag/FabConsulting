'use client';

import { useEffect, useRef } from 'react';

/**
 * Subtle scroll parallax: shifts its content vertically in proportion to how
 * far its *parent* is from the middle of the viewport.
 *
 *   speed > 0  → lags behind the scroll (reads as further away; backgrounds)
 *   speed < 0  → runs slightly ahead (reads as closer; floating cards/photos)
 *
 * The parent is what gets measured, not this element, so the measurement
 * doesn't feed back on the movement it causes. Work only happens while the
 * parent is on screen, batched to one requestAnimationFrame per frame, and
 * it's off entirely with `prefers-reduced-motion` or below `minWidth`.
 * Server-rendered output is just the plain wrapper, so the static HTML and
 * hydration are unaffected.
 */
export default function Parallax({ speed = 0.1, minWidth = 0, className, style, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const anchor = el?.parentElement;
    if (!el || !anchor) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia(`(min-width: ${minWidth}px)`);
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      if (reduce.matches || !wide.matches) {
        el.style.transform = '';
        return;
      }
      const r = anchor.getBoundingClientRect();
      const offset = (window.innerHeight / 2 - (r.top + r.height / 2)) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { rootMargin: '120px 0px' }
    );
    io.observe(anchor);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduce.addEventListener('change', update);
    wide.addEventListener('change', update);
    update();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', update);
      wide.removeEventListener('change', update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed, minWidth]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', ...style }}>
      {children}
    </div>
  );
}
