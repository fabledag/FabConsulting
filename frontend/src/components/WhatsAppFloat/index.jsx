import styles from './WhatsAppFloat.module.css';
import { WHATSAPP_NUMBER } from '@/lib/config.js';

function WhatsAppFloat() {
  // Only show if WHATSAPP_NUMBER is set and is not the placeholder
  const number = WHATSAPP_NUMBER;

  if (!number || number === '5215500000000' || number.includes('PLACEHOLDER')) {
    return null;
  }

  const href = `https://wa.me/${number}?text=Hola%20Fabiola%2C%20me%20gustar%C3%ADa%20agendar%20una%20asesor%C3%ADa.`;

  return (
    <div className={styles.wrapper} aria-label="Contactar por WhatsApp">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
        aria-label="Abrir WhatsApp"
      >
        <i className="fa-brands fa-whatsapp" aria-hidden="true" style={{ fontSize: '1.75rem' }} />
      </a>
    </div>
  );
}

export default WhatsAppFloat;
