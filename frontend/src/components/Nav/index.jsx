import { useState, useEffect } from 'react';
import styles from './Nav.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { getDisplayName } from '../../utils/displayName.js';

const NAV_LINKS = [
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#agenda', label: 'Agendar asesoría', cta: true },
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

  const close = () => setOpen(false);

  return (
    <nav className={[styles.nav, scrolled ? styles.navScrolled : ''].join(' ')}>
      <div className={`wrap ${styles.navInner}`}>
        <a href="#" className={styles.logo}>Fabiola Ledesma</a>

        <button
          className={[styles.hamburger, open ? styles.isOpen : ''].join(' ')}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={[styles.links, open ? styles.open : ''].join(' ')}>
          {NAV_LINKS.map(({ href, label, cta }) => (
            <li key={href}>
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
