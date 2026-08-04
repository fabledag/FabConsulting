/**
 * Landing-page FAQ content.
 *
 * Lives outside the component because the FAQPage JSON-LD is built in a Server
 * Component while the accordion itself is client-side. `a` may contain JSX for
 * rendering; `plain` is the text-only version that goes into structured data
 * (schema.org answers must be strings).
 */

export const FAQ_ITEMS = [
  {
    q: '¿Cuál sesión debería elegir?',
    plain:
      'Si no tienes claro tu siguiente paso, empieza con la Conversación estratégica 1:1. Si necesitas mejorar tu perfil, elige la revisión de CV y LinkedIn o de portafolio. Si ya tienes una entrevista próxima, la Simulación de entrevista es la más específica para eso.',
  },
  {
    q: '¿Las sesiones son únicamente para diseñadores?',
    plain:
      'Están pensadas principalmente para profesionales de UX, Product Design y disciplinas afines — pero si tu reto es de estrategia, liderazgo o carrera en un contexto de producto digital, también aplican.',
  },
  {
    q: '¿Necesito enviar mi CV o portafolio antes?',
    plain:
      'No es obligatorio. Puedes enviarlo después de reservar, respondiendo al correo de confirmación, o compartirlo directamente al inicio de la sesión.',
  },
  {
    q: '¿Cómo se realiza la videollamada?',
    plain:
      'Después de confirmar tu reserva recibirás por correo el enlace de la videollamada y los detalles para conectarte a la hora acordada.',
  },
  {
    q: '¿Con cuánta anticipación debo reservar?',
    plain:
      'Las sesiones se agendan con al menos 2 días de anticipación, para poder preparar tu caso antes de que nos veamos. El calendario solo te muestra las fechas que ya cumplen ese margen.',
  },
  {
    q: '¿Puedo reprogramar mi sesión?',
    plain:
      'Sí. Puedes reagendar o cancelar tú mismo/a desde tu perfil hasta 24 horas antes de tu sesión. Dentro de esa ventana, escríbeme directamente para ver opciones.',
  },
  {
    q: '¿Qué sucede después de pagar?',
    plain:
      'Tu sesión queda confirmada al instante. El pago se procesa por Mercado Pago y, en cuanto se aprueba, recibes el correo de confirmación y la invitación para tu calendario — sin esperas ni revisiones manuales.',
  },
  {
    q: '¿Cómo puedo pagar?',
    plain:
      'Con tarjeta de crédito o débito, o con tu saldo de Mercado Pago. El cobro se procesa en la plataforma segura de Mercado Pago; el sitio nunca almacena los datos de tu tarjeta.',
  },
  {
    q: '¿Puedo contratar más de una sesión?',
    plain:
      'Sí. Puedes agendar las sesiones sueltas que necesites, o elegir Mentoría si buscas acompañamiento continuo a lo largo de varios meses.',
  },
  {
    q: '¿La asesoría garantiza que conseguiré trabajo?',
    plain:
      'No. Estas sesiones son de acompañamiento y recomendaciones — te ayudo a tomar mejores decisiones y a prepararte, pero no puedo garantizar contrataciones, promociones ni resultados laborales.',
  },
  {
    q: '¿Ofreces servicios para empresas?',
    plain:
      'Este sitio está enfocado en asesorías individuales para profesionales. Para consultoría, talleres o servicios empresariales puedes visitar GEDX en gedx.com.mx.',
    // Rendered version keeps the link clickable.
    hasLink: {
      before: 'Este sitio está enfocado en asesorías individuales para profesionales. Para consultoría, talleres o servicios empresariales puedes visitar ',
      href: 'https://gedx.com.mx',
      label: 'GEDX en gedx.com.mx',
      after: '.',
    },
  },
];
