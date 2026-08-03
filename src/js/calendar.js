/**
 * Calendar Widget for Fabiola Ledesma Booking System
 * Vanilla JS — no dependencies required
 */

(function () {
  'use strict';

  const SERVICES = [
    { value: 'diseno-estrategico', label: 'Consultoría Diseño Estratégico' },
    { value: 'ux-leadership', label: 'UX Leadership Coaching' },
    { value: 'workshop-corporativo', label: 'Workshop Corporativo' },
    { value: 'evaluacion-producto', label: 'Evaluación de Producto' },
    { value: 'consultoria-b2b', label: 'Consultoría B2B' },
  ];

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  function getApiBase() {
    return (window.API_BASE_URL || '').replace(/\/$/, '');
  }

  // ─── State ────────────────────────────────────────────────────────────────

  function createState() {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1, // 1-based
      selectedDate: null,          // 'YYYY-MM-DD'
      selectedSlot: null,          // 'HH:MM'
      availability: {},            // { 'YYYY-MM-DD': ['09:00','10:00',...] }
      loading: false,
      slotsLoading: false,
      bookingState: 'idle',        // 'idle' | 'submitting' | 'success' | 'error'
      bookingError: null,
      bookingResult: null,
    };
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  async function fetchAvailability(year, month) {
    const url = `${getApiBase()}/availability?year=${year}&month=${month}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    // Transform API shape { calendar: [{date, slots:[{time,available}]}] }
    // into the map shape { 'YYYY-MM-DD': ['HH:MM', ...] } used by the widget
    const availability = {};
    for (const day of (data.calendar || [])) {
      const available = (day.slots || []).filter(s => s.available).map(s => s.time);
      if (available.length > 0) availability[day.date] = available;
    }
    return { availability };
  }

  async function submitBooking(payload) {
    const url = `${getApiBase()}/book`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    return data;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function toDateStr(year, month, day) {
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  function todayStr() {
    const t = new Date();
    return toDateStr(t.getFullYear(), t.getMonth() + 1, t.getDate());
  }

  function formatDisplayDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${d} de ${MONTH_NAMES[m - 1]} de ${y}`;
  }

  function formatTime(slot) {
    const [h] = slot.split(':').map(Number);
    const suffix = h < 12 ? 'am' : 'pm';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:00 ${suffix}`;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  function renderSkeleton() {
    return `
      <div class="cal-skeleton">
        ${Array.from({ length: 35 }).map(() => '<div class="cal-skeleton-cell"></div>').join('')}
      </div>`;
  }

  function renderCalendarGrid(state) {
    const { year, month, availability, selectedDate } = state;
    const today = todayStr();

    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    let html = `
      <div class="cal-grid" role="grid" aria-label="Calendario ${MONTH_NAMES[month - 1]} ${year}">
        ${DAY_NAMES.map(d => `<div class="cal-day-name" role="columnheader">${d}</div>`).join('')}`;

    // empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-cell cal-empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toDateStr(year, month, day);
      const isPast = dateStr < today;
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const slots = availability[dateStr] || [];
      const hasSlots = slots.length > 0;

      let cls = 'cal-cell';
      if (isPast) cls += ' cal-past';
      else if (isSelected) cls += ' cal-selected';
      else if (hasSlots) cls += ' cal-available';
      else cls += ' cal-unavailable';
      if (isToday) cls += ' cal-today';

      const disabled = isPast || !hasSlots;
      const ariaLabel = `${day} de ${MONTH_NAMES[month - 1]}${hasSlots ? `, ${slots.length} horario${slots.length > 1 ? 's' : ''} disponible${slots.length > 1 ? 's' : ''}` : ', sin disponibilidad'}`;

      html += `
        <button
          class="${cls}"
          data-date="${dateStr}"
          ${disabled ? 'disabled aria-disabled="true"' : ''}
          aria-label="${ariaLabel}"
          ${isSelected ? 'aria-pressed="true"' : 'aria-pressed="false"'}
        >
          ${day}
        </button>`;
    }

    html += '</div>';
    return html;
  }

  function renderTimeSlots(state) {
    const { selectedDate, availability, selectedSlot, slotsLoading } = state;
    if (!selectedDate) return '';

    if (slotsLoading) {
      return `<div class="cal-slots-section">
        <p class="cal-slots-loading">Cargando horarios...</p>
      </div>`;
    }

    const slots = availability[selectedDate] || [];

    return `
      <div class="cal-slots-section">
        <h3 class="cal-slots-title">Horarios para el ${formatDisplayDate(selectedDate)}</h3>
        ${slots.length === 0
          ? '<p class="cal-no-slots">No hay horarios disponibles para este día.</p>'
          : `<div class="cal-slots-grid" role="group" aria-label="Horarios disponibles">
              ${slots.map(slot => {
                const isActive = slot === selectedSlot;
                return `<button
                  class="cal-slot-btn${isActive ? ' cal-slot-selected' : ''}"
                  data-slot="${slot}"
                  aria-pressed="${isActive}"
                >${formatTime(slot)}</button>`;
              }).join('')}
            </div>`
        }
      </div>`;
  }

  function renderBookingForm(state) {
    const { selectedDate, selectedSlot, bookingState, bookingError, bookingResult } = state;
    if (!selectedDate || !selectedSlot) return '';

    if (bookingState === 'success' && bookingResult) {
      return `
        <div class="cal-confirmation">
          <div class="cal-confirmation-icon" aria-hidden="true">✓</div>
          <h3 class="cal-confirmation-title">¡Reserva confirmada!</h3>
          <p>Tu cita ha sido agendada para el <strong>${formatDisplayDate(selectedDate)}</strong> a las <strong>${formatTime(selectedSlot)}</strong>.</p>
          <p>Recibirás un correo de confirmación en <strong>${bookingResult.email || ''}</strong>.</p>
          <p class="cal-confirmation-ref">Referencia: <code>${bookingResult.bookingId || bookingResult.id || 'N/A'}</code></p>
          <button class="cal-btn-secondary" id="cal-new-booking">Agendar otra cita</button>
        </div>`;
    }

    const serviceOptions = SERVICES.map(s =>
      `<option value="${s.value}">${s.label}</option>`
    ).join('');

    const isSubmitting = bookingState === 'submitting';

    return `
      <div class="cal-form-section">
        <h3 class="cal-form-title">Completa tu reserva</h3>
        <p class="cal-form-subtitle">${formatDisplayDate(selectedDate)} · ${formatTime(selectedSlot)}</p>

        ${bookingError ? `<div class="cal-error" role="alert">${bookingError}</div>` : ''}

        <form id="cal-booking-form" novalidate>
          <div class="cal-field">
            <label for="cal-nombre" class="cal-label">Nombre completo <span aria-hidden="true">*</span></label>
            <input
              type="text"
              id="cal-nombre"
              name="nombre"
              class="cal-input"
              placeholder="Tu nombre"
              required
              autocomplete="name"
              ${isSubmitting ? 'disabled' : ''}
            />
          </div>

          <div class="cal-field">
            <label for="cal-email" class="cal-label">Email <span aria-hidden="true">*</span></label>
            <input
              type="email"
              id="cal-email"
              name="email"
              class="cal-input"
              placeholder="tu@email.com"
              required
              autocomplete="email"
              ${isSubmitting ? 'disabled' : ''}
            />
          </div>

          <div class="cal-field">
            <label for="cal-telefono" class="cal-label">Teléfono <span aria-hidden="true">*</span></label>
            <input
              type="tel"
              id="cal-telefono"
              name="telefono"
              class="cal-input"
              placeholder="+52 55 0000 0000"
              required
              autocomplete="tel"
              ${isSubmitting ? 'disabled' : ''}
            />
          </div>

          <div class="cal-field">
            <label for="cal-servicio" class="cal-label">Servicio <span aria-hidden="true">*</span></label>
            <select
              id="cal-servicio"
              name="servicio"
              class="cal-input"
              required
              ${isSubmitting ? 'disabled' : ''}
            >
              <option value="">Selecciona un servicio...</option>
              ${serviceOptions}
            </select>
          </div>

          <div class="cal-field">
            <label for="cal-mensaje" class="cal-label">Mensaje <span class="cal-optional">(opcional)</span></label>
            <textarea
              id="cal-mensaje"
              name="mensaje"
              class="cal-input cal-textarea"
              rows="3"
              placeholder="Cuéntame sobre tu proyecto o inquietud..."
              ${isSubmitting ? 'disabled' : ''}
            ></textarea>
          </div>

          <button
            type="submit"
            class="cal-btn-primary"
            ${isSubmitting ? 'disabled' : ''}
          >
            ${isSubmitting
              ? '<span class="cal-spinner" aria-hidden="true"></span> Enviando...'
              : 'Confirmar reserva'}
          </button>
        </form>
      </div>`;
  }

  function renderStyles() {
    if (document.getElementById('cal-styles')) return;
    const style = document.createElement('style');
    style.id = 'cal-styles';
    style.textContent = `
      .cal-widget { font-family: inherit; color: #1e293b; }
      .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
      .cal-month-label { font-size: 1.1rem; font-weight: 600; color: #1e293b; }
      .cal-nav-btn {
        background: none; border: 1px solid #e2e8f0; border-radius: 0.375rem;
        cursor: pointer; padding: 0.375rem 0.625rem; font-size: 1rem;
        color: #475569; transition: background 0.15s, border-color 0.15s;
      }
      .cal-nav-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
      .cal-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
      .cal-day-name { text-align: center; font-size: 0.7rem; font-weight: 600; color: #94a3b8; padding: 0.25rem 0 0.5rem; text-transform: uppercase; }
      .cal-cell {
        aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
        border-radius: 50%; font-size: 0.875rem; border: none; cursor: pointer;
        transition: background 0.15s, color 0.15s; background: transparent;
        position: relative;
      }
      .cal-empty { background: transparent !important; cursor: default; }
      .cal-past { color: #cbd5e1; cursor: not-allowed; }
      .cal-unavailable { color: #94a3b8; cursor: not-allowed; }
      .cal-available { background: #fce4ee; color: #A84F6F; font-weight: 600; cursor: pointer; }
      .cal-available:hover { background: #f9c6d8; }
      .cal-selected { background: #C96A8A !important; color: #fff !important; font-weight: 700; }
      .cal-today { box-shadow: 0 0 0 2px #C96A8A; }
      .cal-today.cal-past { box-shadow: 0 0 0 2px #cbd5e1; }
      .cal-skeleton { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
      .cal-skeleton-cell { aspect-ratio: 1; border-radius: 50%; background: #e2e8f0; animation: cal-pulse 1.5s ease-in-out infinite; }
      @keyframes cal-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      .cal-loading { text-align: center; padding: 2rem; color: #64748b; }

      .cal-slots-section { margin-top: 1.25rem; }
      .cal-slots-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; color: #334155; }
      .cal-slots-loading { color: #64748b; font-size: 0.875rem; }
      .cal-no-slots { color: #94a3b8; font-size: 0.875rem; }
      .cal-slots-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .cal-slot-btn {
        padding: 0.375rem 0.75rem; border-radius: 1rem; border: 1.5px solid #E8A0BA;
        background: #fff; color: #A84F6F; font-size: 0.85rem; cursor: pointer;
        transition: all 0.15s; font-weight: 500;
      }
      .cal-slot-btn:hover { background: #fce4ee; }
      .cal-slot-selected { background: #C96A8A !important; color: #fff !important; border-color: #C96A8A !important; }

      .cal-form-section { margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
      .cal-form-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; color: #1e293b; }
      .cal-form-subtitle { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }
      .cal-field { margin-bottom: 1rem; }
      .cal-label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
      .cal-optional { font-weight: 400; color: #9ca3af; }
      .cal-input {
        width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db;
        border-radius: 0.375rem; font-size: 0.9rem; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box; font-family: inherit; color: #1e293b;
        background: #fff;
      }
      .cal-input:focus { border-color: #C96A8A; box-shadow: 0 0 0 3px rgba(201,106,138,0.15); }
      .cal-input:disabled { background: #f9fafb; color: #9ca3af; }
      .cal-textarea { resize: vertical; min-height: 80px; }
      .cal-btn-primary {
        width: 100%; padding: 0.625rem 1.25rem; background: #C96A8A; color: #fff;
        border: none; border-radius: 0.5rem; font-size: 0.95rem; font-weight: 600;
        cursor: pointer; transition: background 0.15s; display: flex; align-items: center;
        justify-content: center; gap: 0.5rem;
      }
      .cal-btn-primary:hover:not(:disabled) { background: #A84F6F; }
      .cal-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .cal-btn-secondary {
        margin-top: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; color: #334155;
        border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.9rem;
        cursor: pointer; transition: background 0.15s;
      }
      .cal-btn-secondary:hover { background: #e2e8f0; }
      .cal-spinner {
        width: 1em; height: 1em; border: 2px solid rgba(255,255,255,0.4);
        border-top-color: #fff; border-radius: 50%;
        animation: cal-spin 0.6s linear infinite; display: inline-block;
      }
      @keyframes cal-spin { to { transform: rotate(360deg); } }
      .cal-error {
        background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
        border-radius: 0.375rem; padding: 0.625rem 0.75rem; font-size: 0.875rem;
        margin-bottom: 1rem;
      }
      .cal-confirmation { text-align: center; padding: 1.5rem 0; }
      .cal-confirmation-icon {
        width: 3rem; height: 3rem; background: #22c55e; color: #fff;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; margin: 0 auto 1rem; font-weight: 700;
      }
      .cal-confirmation-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #166534; }
      .cal-confirmation p { font-size: 0.9rem; color: #374151; margin-bottom: 0.5rem; }
      .cal-confirmation-ref { font-size: 0.8rem; color: #6b7280; }
      .cal-confirmation code { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
    `;
    document.head.appendChild(style);
  }

  // ─── Main Widget ──────────────────────────────────────────────────────────

  function initCalendar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[Calendar] Container #${containerId} not found`);
      return;
    }

    renderStyles();

    const state = createState();

    function render() {
      const today = new Date();
      const isCurrentMonth =
        state.year === today.getFullYear() && state.month === today.getMonth() + 1;

      container.innerHTML = `
        <div class="cal-widget" role="application" aria-label="Calendario de reservas">
          <div class="cal-header">
            <button class="cal-nav-btn" id="cal-prev" aria-label="Mes anterior" ${isCurrentMonth ? 'disabled' : ''}>&#8592;</button>
            <span class="cal-month-label" aria-live="polite">${MONTH_NAMES[state.month - 1]} ${state.year}</span>
            <button class="cal-nav-btn" id="cal-next" aria-label="Mes siguiente">&#8594;</button>
          </div>

          ${state.loading
            ? `<div class="cal-loading" role="status" aria-live="polite">${renderSkeleton()}</div>`
            : renderCalendarGrid(state)}

          ${renderTimeSlots(state)}
          ${renderBookingForm(state)}
        </div>`;

      attachEvents();
    }

    function attachEvents() {
      const prevBtn = document.getElementById('cal-prev');
      const nextBtn = document.getElementById('cal-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (state.month === 1) { state.month = 12; state.year--; }
          else { state.month--; }
          state.selectedDate = null;
          state.selectedSlot = null;
          loadAvailability();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (state.month === 12) { state.month = 1; state.year++; }
          else { state.month++; }
          state.selectedDate = null;
          state.selectedSlot = null;
          loadAvailability();
        });
      }

      container.querySelectorAll('.cal-cell:not([disabled]):not(.cal-empty)').forEach(btn => {
        btn.addEventListener('click', () => {
          const date = btn.dataset.date;
          state.selectedDate = date;
          state.selectedSlot = null;
          state.bookingState = 'idle';
          state.bookingError = null;
          render();
          // Scroll slots into view on mobile
          const slotsEl = container.querySelector('.cal-slots-section');
          if (slotsEl) slotsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });

      container.querySelectorAll('.cal-slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.selectedSlot = btn.dataset.slot;
          state.bookingState = 'idle';
          state.bookingError = null;
          render();
          const formEl = container.querySelector('.cal-form-section');
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });

      const bookingForm = document.getElementById('cal-booking-form');
      if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
      }

      const newBookingBtn = document.getElementById('cal-new-booking');
      if (newBookingBtn) {
        newBookingBtn.addEventListener('click', () => {
          state.selectedDate = null;
          state.selectedSlot = null;
          state.bookingState = 'idle';
          state.bookingError = null;
          state.bookingResult = null;
          render();
        });
      }
    }

    async function handleBookingSubmit(e) {
      e.preventDefault();
      const form = e.target;

      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const telefono = form.telefono.value.trim();
      const servicio = form.servicio.value;
      const mensaje = form.mensaje ? form.mensaje.value.trim() : '';

      // Basic validation
      if (!nombre || !email || !telefono || !servicio) {
        state.bookingError = 'Por favor completa todos los campos requeridos.';
        state.bookingState = 'idle';
        render();
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        state.bookingError = 'Por favor ingresa un email válido.';
        state.bookingState = 'idle';
        render();
        return;
      }

      state.bookingState = 'submitting';
      state.bookingError = null;
      render();

      const payload = {
        date: state.selectedDate,
        time: state.selectedSlot,
        nombre,
        email,
        telefono,
        servicio,
        mensaje,
      };

      try {
        const result = await submitBooking(payload);
        state.bookingState = 'success';
        state.bookingResult = { ...result, email };
      } catch (err) {
        state.bookingState = 'error';
        state.bookingError = err.message || 'Ocurrió un error al procesar tu reserva. Intenta de nuevo.';
      }

      render();
    }

    async function loadAvailability() {
      state.loading = true;
      render();
      try {
        const data = await fetchAvailability(state.year, state.month);
        state.availability = data.availability || data || {};
      } catch (err) {
        console.error('[Calendar] Failed to load availability:', err);
        state.availability = {};
      } finally {
        state.loading = false;
        render();
      }
    }

    // Initial load
    loadAvailability();
  }

  // Export
  window.initCalendar = initCalendar;
})();
