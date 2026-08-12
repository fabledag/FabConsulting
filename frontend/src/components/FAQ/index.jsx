'use client';

import { useState } from 'react';
import FadeUp from '../FadeUp/index.jsx';
import { FAQ_ITEMS } from '@/lib/faq.js';
import styles from './FAQ.module.css';

function Answer({ item }) {
  if (item.hasLink) {
    const { before, href, label, after } = item.hasLink;
    return (
      <>
        {before}
        <a href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
        {after}
      </>
    );
  }
  return item.plain;
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <FadeUp style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">Preguntas frecuentes</span>
        </FadeUp>
        <FadeUp delay="0.05s" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Antes de reservar</h2>
        </FadeUp>

        <div className={styles.list}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const triggerId = `faq-trigger-${i}`;
            return (
              <div key={item.q} className={styles.item}>
                <h3 style={{ margin: 0 }}>
                  <button
                    id={triggerId}
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <i className={`fa-solid fa-plus ${styles.icon} ${isOpen ? styles.iconOpen : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                {/* Always rendered, toggled with `hidden`, rather than mounted
                    on open. The answers have to exist in the exported HTML —
                    conditionally rendering them meant crawlers (and the FAQ
                    rich result) only ever saw the questions. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={styles.panel}
                  hidden={!isOpen}
                >
                  <Answer item={item} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
