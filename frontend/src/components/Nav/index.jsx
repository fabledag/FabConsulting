import { useState, useEffect } from 'react';
import styles from './Nav.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { getDisplayName } from '../../utils/displayName.js';

const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Asesorías' },
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#faq', label: 'Preguntas frecuentes' },
  { href: '#servicios', label: 'Agenda tu sesión', cta: true },
];

function Nav() {
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
        <a href="#inicio" className={styles.logo}>Fabiola Ledesma</a>

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
                href={href}
                className={[styles.link, cta ? styles.navCta : ''].join(' ')}
                onClick={close}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href={user ? '/#/profile' : '/#/login'} className={styles.accountLink} onClick={close}>
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
