/**
 * Main JavaScript for Fabiola Ledesma Landing Page
 */

(function () {
  'use strict';

  // ─── Utility ──────────────────────────────────────────────────────────────

  function getApiBase() {
    return (window.API_BASE_URL || '').replace(/\/$/, '');
  }

  function formatDate(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, c => map[c]);
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  function initNav() {
    const nav = document.getElementById('main-nav') || document.querySelector('nav');
    if (!nav) return;

    // Sticky nav with shadow on scroll
    function updateNav() {
      if (window.scrollY > 20) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle') || document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.getElementById('mobile-menu') || document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on nav link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    // Active link on scroll (IntersectionObserver)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    if (sections.length && navLinks.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              navLinks.forEach(link => {
                link.classList.toggle(
                  'active',
                  link.getAttribute('href') === `#${entry.target.id}`
                );
              });
            }
          });
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      sections.forEach(s => observer.observe(s));
    }
  }

  // ─── Scroll Animations ────────────────────────────────────────────────────

  function initScrollAnimations() {
    const animatedEls = document.querySelectorAll('[data-animate], .animate-on-scroll');
    if (!animatedEls.length) return;

    if (!('IntersectionObserver' in window)) {
      animatedEls.forEach(el => el.classList.add('animated'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Stagger delay via data-delay attribute
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
              entry.target.classList.add('animated');
            }, Number(delay));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    animatedEls.forEach(el => observer.observe(el));
  }

  // ─── Testimonials Carousel ────────────────────────────────────────────────

  function initTestimonialsCarousel() {
    const carousel = document.getElementById('testimonials-carousel') || document.querySelector('[data-carousel]');
    if (!carousel) return;

    const track = carousel.querySelector('[data-carousel-track]') || carousel.querySelector('.carousel-track');
    const slides = track ? track.children : carousel.querySelectorAll('[data-slide]');
    if (!slides.length) return;

    const prevBtn = document.getElementById('carousel-prev') || carousel.querySelector('[data-carousel-prev]');
    const nextBtn = document.getElementById('carousel-next') || carousel.querySelector('[data-carousel-next]');
    const dotsContainer = carousel.querySelector('[data-carousel-dots]');

    let current = 0;
    let autoTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    function getTotal() { return slides.length; }

    function goTo(index) {
      const total = getTotal();
      current = ((index % total) + total) % total;

      Array.from(slides).forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== current));
        slide.classList.toggle('carousel-active', i === current);
      });

      if (dotsContainer) {
        dotsContainer.querySelectorAll('[data-dot]').forEach((dot, i) => {
          dot.classList.toggle('dot-active', i === current);
          dot.setAttribute('aria-current', String(i === current));
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 5000);
    }
    function stopAuto() {
      clearInterval(autoTimer);
    }

    // Build dots
    if (dotsContainer) {
      Array.from(slides).forEach((_, i) => {
        const dot = document.createElement('button');
        dot.dataset.dot = i;
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); });
        dotsContainer.appendChild(dot);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopAuto(); startAuto(); });

    // Touch / swipe support
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) next(); else prev();
        stopAuto(); startAuto();
      }
    }, { passive: true });

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);

    // Keyboard nav
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { prev(); stopAuto(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
    });

    goTo(0);
    startAuto();
  }

  // ─── Contact Form ─────────────────────────────────────────────────────────

  function initContactForm() {
    const form = document.getElementById('contact-form') || document.querySelector('[data-contact-form]');
    if (!form) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const statusEl = form.querySelector('[data-form-status]') || document.getElementById('form-status');

    function setStatus(type, msg) {
      if (!statusEl) return;
      statusEl.className = `form-status form-status--${type}`;
      statusEl.textContent = msg;
      statusEl.hidden = false;
      if (type === 'success') {
        setTimeout(() => { statusEl.hidden = true; }, 7000);
      }
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.setAttribute('aria-busy', String(loading));
      const btnText = submitBtn.querySelector('[data-btn-text]') || submitBtn;
      if (loading) {
        submitBtn.dataset.originalText = submitBtn.dataset.originalText || btnText.textContent;
        if (btnText !== submitBtn) btnText.textContent = 'Enviando...';
        else submitBtn.textContent = 'Enviando...';
      } else {
        if (submitBtn.dataset.originalText) {
          if (btnText !== submitBtn) btnText.textContent = submitBtn.dataset.originalText;
          else submitBtn.textContent = submitBtn.dataset.originalText;
        }
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {};
      new FormData(form).forEach((val, key) => { data[key] = val; });

      setLoading(true);
      if (statusEl) statusEl.hidden = true;

      try {
        const res = await fetch(`${getApiBase()}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Error ${res.status}`);
        }

        form.reset();
        setStatus('success', 'Tu mensaje fue enviado. Te contactaremos pronto.');
      } catch (err) {
        setStatus('error', err.message || 'Hubo un error. Intenta de nuevo o escríbenos por WhatsApp.');
      } finally {
        setLoading(false);
      }
    });
  }

  // ─── Booking Modal ────────────────────────────────────────────────────────

  function initBookingModal() {
    const modal = document.getElementById('booking-modal') || document.querySelector('[data-booking-modal]');
    if (!modal) return;

    const openBtns = document.querySelectorAll('[data-open-booking], [data-booking-trigger]');
    const closeBtns = modal.querySelectorAll('[data-close-modal], [data-modal-close]');
    const calendarContainerId = modal.dataset.calendarId || 'calendar-widget';

    let calendarInitialized = false;

    function openModal() {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.classList.add('modal-open');
      // Focus trap — focus first focusable element
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();

      // Initialize calendar once
      if (!calendarInitialized && typeof window.initCalendar === 'function') {
        window.initCalendar(calendarContainerId);
        calendarInitialized = true;
      }
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      modal.classList.remove('modal-open');
    }

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // Focus trap
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // ─── Blog Preview ─────────────────────────────────────────────────────────

  function createSkeletonCard() {
    return `
      <article class="blog-card blog-card--skeleton" aria-hidden="true">
        <div class="blog-card__cover blog-card__cover--skeleton"></div>
        <div class="blog-card__content">
          <div class="blog-card__tags">
            <span class="skeleton-tag"></span>
          </div>
          <div class="skeleton-title"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-excerpt skeleton-excerpt--short"></div>
          <div class="skeleton-meta"></div>
        </div>
      </article>`;
  }

  function createBlogCard(post) {
    const tags = Array.isArray(post.tags) ? post.tags : (post.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const coverImg = post.coverImage || post.cover_image || '';
    const slug = post.slug || '';
    const blogBase = '/blog/';

    return `
      <article class="blog-card animate-on-scroll">
        <a href="${blogBase}post.html?slug=${encodeURIComponent(slug)}" class="blog-card__cover-link" tabindex="-1" aria-hidden="true">
          <div class="blog-card__cover" ${coverImg ? `style="background-image:url('${escapeHtml(coverImg)}')"` : ''}>
            ${!coverImg ? '<span class="blog-card__cover-placeholder" aria-hidden="true">FL</span>' : ''}
          </div>
        </a>
        <div class="blog-card__content">
          ${tags.length ? `<div class="blog-card__tags">${tags.map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
          <h3 class="blog-card__title">
            <a href="${blogBase}post.html?slug=${encodeURIComponent(slug)}">${escapeHtml(post.title || '')}</a>
          </h3>
          <p class="blog-card__excerpt">${escapeHtml(post.excerpt || '')}</p>
          <div class="blog-card__meta">
            <time datetime="${escapeHtml(post.publishedAt || post.created_at || '')}">${formatDate(post.publishedAt || post.created_at || new Date())}</time>
            <a href="${blogBase}post.html?slug=${encodeURIComponent(slug)}" class="blog-card__read-more">Leer más &rarr;</a>
          </div>
        </div>
      </article>`;
  }

  async function initBlogPreview() {
    const container = document.getElementById('blog-posts-preview');
    if (!container) return;

    // Show 3 skeleton cards
    container.innerHTML = [1, 2, 3].map(() => createSkeletonCard()).join('');

    try {
      const res = await fetch(`${getApiBase()}/blog/posts?limit=3&published=true`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const posts = Array.isArray(data) ? data : (data.posts || data.items || []);

      if (!posts.length) {
        container.innerHTML = '<p class="blog-empty">Próximamente nuevos artículos.</p>';
        return;
      }

      container.innerHTML = posts.slice(0, 3).map(createBlogCard).join('');
      initScrollAnimations();
    } catch (err) {
      console.error('[Blog] Failed to load posts:', err);
      container.innerHTML = '<p class="blog-empty">No se pudieron cargar los artículos.</p>';
    }
  }

  // ─── Floating WhatsApp ────────────────────────────────────────────────────

  function initFloatingWhatsApp() {
    const number = window.WHATSAPP_NUMBER || '';
    if (!number) return;

    // Don't duplicate
    if (document.getElementById('whatsapp-float')) return;

    const href = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent('Hola Fabiola, me gustaría agendar una consultoría.')}`;

    const btn = document.createElement('a');
    btn.id = 'whatsapp-float';
    btn.href = href;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Contáctame por WhatsApp');
    btn.className = 'whatsapp-float';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      <span class="whatsapp-float__pulse" aria-hidden="true"></span>`;

    const style = document.createElement('style');
    style.textContent = `
      .whatsapp-float {
        position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1000;
        width: 3.5rem; height: 3.5rem; background: #25D366; color: #fff;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.18); text-decoration: none;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .whatsapp-float:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.22); }
      .whatsapp-float:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
      .whatsapp-float__pulse {
        position: absolute; inset: 0; border-radius: 50%;
        background: #25D366; animation: wa-pulse 2.5s ease-out infinite; z-index: -1;
      }
      @keyframes wa-pulse {
        0% { transform: scale(1); opacity: 0.7; }
        70% { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(btn);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    initNav();
    initScrollAnimations();
    initTestimonialsCarousel();
    initContactForm();
    initBookingModal();
    initBlogPreview();
    initFloatingWhatsApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual use if needed
  window.FabLedesma = {
    init,
    initNav,
    initScrollAnimations,
    initTestimonialsCarousel,
    initContactForm,
    initBookingModal,
    initBlogPreview,
    initFloatingWhatsApp,
  };
})();
