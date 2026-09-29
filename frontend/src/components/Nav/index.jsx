'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Nav.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { getDisplayName } from '../../utils/displayName.js';
import { WORKSHOPS_PATH } from '@/lib/workshops.js';

// `#…` entries are sections of the home page. On any other page they become
// `/#…`, since those sections only exist on home. Full paths are left alone.
// (Kept relative on home itself so a `?utm=…` query isn't dropped by a
// reload on every click.)
const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Asesorías' },
  { href: WORKSHOPS_PATH, label: 'Talleres' },
  { href: '/sobre-mi/', label: 'Sobre mí' },
  { href: '/preguntas-frecuentes/', label: 'Preguntas frecuentes' },
  { href: '#servicios', label: 'Agenda tu sesión', cta: true },
];

function Nav() {
  // Compared without the trailing slash: `trailingSlash: true` URLs vs
  // whatever form usePathname reports.
  const pathname = (usePathname() || '/').replace(/(.)\/$/, '$1');
  const onHome = pathname === '/';
  const resolve = (href) => (href.startsWith('#') && !onHome ? `/${href}` : href);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className={[styles.nav, scrolled ? styles.navScrolled : ''].join(' ')} aria-label="Principal">
      <div className={`wrap ${styles.navInner}`}>
        <a href={resolve('#inicio')} className={styles.logo}>
          {/* Fab Design wordmark (transparent PNG cut from
              Assets/Fotos/logo_horizontal_fab.png). The alt keeps her name
              for screen readers and search engines. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-fab-design.png"
            alt="Fab Design — Fabiola Ledesma"
            width={606}
            height={132}
            className={styles.logoImg}
          />
          <span className={styles.logoTagline}>Consultoría en UX, IA y Product Design</span>
        </a>

        <button
          className={[styles.hamburger, open ? styles.isOpen : ''].join(' ')}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="nav-links"
        >
          <span />
          <span />
          <span />
        </button>

        <ul id="nav-links" className={[styles.links, open ? styles.open : ''].join(' ')}>
          {NAV_LINKS.map(({ href, label, cta }, i) => (
            <li key={`${href}-${i}`}>
              <a
                href={resolve(href)}
                className={[styles.link, cta ? styles.navCta : ''].join(' ')}
                aria-current={!href.startsWith('#') && pathname === href.replace(/\/$/, '') ? 'page' : undefined}
                onClick={close}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href={user ? '/profile/' : '/login/'} className={styles.accountLink} onClick={close}>
              <i className="fa-solid fa-circle-user" aria-hidden="true" />
              {user ? `Mi cuenta · ${getDisplayName(user)}` : 'Iniciar sesión'}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
