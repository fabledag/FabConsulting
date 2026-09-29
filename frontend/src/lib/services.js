/**
 * Single source of truth for the three bookable services.
 *
 * 2026-09-29: the offer went from five to three. The CV and portfolio reviews
 * merged into one `cv` session (LinkedIn included, chosen at booking via
 * `reviewOptions`), and the Mentoría package was dropped. Their old slugs
 * (revision-de-cv-y-linkedin, revision-de-portafolio, mentoria) redirect via
 * LEGACY_SLUGS below.
 *
 * This used to live in three places that had already drifted apart once (the
 * portfolio review silently collapsed into the `cv` key). Everything now reads
 * from here: the landing grid, the booking widget, the per-service SEO pages,
 * the sitemap and the JSON-LD offer catalog.
 *
 * `key` is the contract with the backend — `VALID_SERVICES` in
 * lambda/api/handlers/customerBookings.js must keep matching these exact
 * strings. `slug` is the public URL segment and is free to change, but doing so
 * breaks existing links and search rankings, so treat it as permanent.
 */

export const SERVICES = [
  {
    key: 'session',
    slug: 'conversacion-estrategica',
    anchor: 'servicio-1-1',

    name: 'Conversación estratégica 1:1',
    label: 'Conversación estratégica 1:1 (60 min)',
    tag: 'Más elegida',
    tagPlain: false,

    price: 500,
    display: '$500 MXN',
    duration: '60 min',
    durationLong: '60 minutos',
    durationMinutes: 60,

    // Landing card
    desc: 'Una conversación personalizada para ordenar tus ideas, resolver dudas y definir los siguientes pasos de tu carrera.',
    shortDesc: '60 min · Ordena tus ideas y define tus siguientes pasos',
    forWho: 'Para profesionales que buscan claridad y dirección.',
    topics: ['Crecimiento profesional', 'Cambio de rol', 'Liderazgo', 'Aplicación práctica de IA'],
    includes: [
      'Diagnóstico de tu situación actual',
      'Recomendaciones específicas',
      'Próximos pasos por escrito',
    ],
    cta: 'Agenda una conversación',

    // Dedicated page
    seoTitle: 'Conversación estratégica 1:1 en UX y Product Design',
    seoDescription:
      'Sesión individual de 60 minutos para ordenar tus ideas, resolver dudas de carrera y definir tus siguientes pasos en UX y Product Design. $500 MXN.',
    heroKicker: 'Asesoría individual',
    intro:
      'A veces no necesitas un curso ni otro certificado: necesitas una hora con alguien que ya estuvo del otro lado de la mesa y te ayude a ordenar lo que ya sabes. Esta sesión es exactamente eso.',
    body: [
      {
        h: '¿Para quién es esta sesión?',
        p: 'Para diseñadores y profesionales de producto que sienten que están en un punto de decisión y no tienen con quién pensarlo en voz alta. Puede ser que estés evaluando un cambio de empresa, que te ofrecieron un rol de liderazgo y no sabes si aceptarlo, que llevas meses estancado en el mismo nivel, o que quieres entender cómo la IA está cambiando tu trabajo sin caer en el ruido de LinkedIn.',
      },
      {
        h: '¿Cómo trabajamos en la sesión?',
        p: 'Antes de la sesión me cuentas brevemente qué te gustaría trabajar, así llego con contexto y no gastamos la hora poniéndonos al día. Durante los 60 minutos hacemos un diagnóstico honesto de dónde estás, identificamos qué te está frenando realmente —que casi nunca es lo que uno cree— y definimos acciones concretas. Al terminar te quedan próximos pasos por escrito, no una sensación agradable.',
      },
      {
        h: '¿Qué no es esta sesión?',
        p: 'No es una plática motivacional ni una revisión de tu CV o portafolio (para eso hay una sesión específica). No voy a decirte lo que quieres escuchar: si tu plan tiene un hueco, te lo digo. Tampoco es una sesión genérica con consejos de internet — todo lo que trabajemos parte de tu contexto real.',
      },
    ],
    faq: [
      {
        q: '¿Necesito preparar algo antes?',
        a: 'Solo escribir en dos o tres líneas qué te gustaría resolver, en el formulario de reserva. No necesitas presentaciones ni documentos.',
      },
      {
        q: '¿La sesión es por videollamada?',
        a: 'Sí, es en línea por videollamada. Recibes el enlace por correo al confirmarse tu reserva.',
      },
      {
        q: '¿Puedo tomar varias sesiones?',
        a: 'Claro. Cada sesión se reserva por separado, cuando la necesites, y la siguiente parte de lo que trabajamos en la anterior.',
      },
    ],
  },

  {
    key: 'cv',
    slug: 'revision-de-cv-y-portafolio',
    anchor: 'servicio-revision',

    name: 'Revisión de CV y portafolio',
    label: 'Revisión de CV y portafolio (LinkedIn incluido)',
    tag: 'CV · Portafolio · LinkedIn',
    tagPlain: true,

    price: 700,
    display: '$700 MXN',
    duration: '60 min',
    durationLong: '60 minutos',
    durationMinutes: 60,

    // What the person can ask to review. Picked in the booking form and sent
    // as part of the booking message — it never changes the price.
    reviewOptions: ['CV', 'Portafolio o book', 'LinkedIn'],

    desc: 'Revisamos tu CV, tu portafolio o ambos —y tu LinkedIn si quieres— para que comuniquen con claridad tu experiencia y tu forma de pensar.',
    shortDesc: 'CV, portafolio o ambos · LinkedIn incluido si lo eliges',
    forWho: 'Para quien quiere que su perfil y su trabajo se entiendan a la primera.',
    topics: ['Estructura del CV', 'Narrativa de casos', 'Claridad de logros', 'Coherencia con LinkedIn'],
    includes: [
      'CV, portafolio o ambos',
      'LinkedIn incluido si lo eliges',
      'Lista priorizada de cambios',
    ],
    cta: 'Quiero revisar mi perfil',

    seoTitle: 'Revisión de CV, portafolio y LinkedIn para diseñadores UX',
    seoDescription:
      'Revisión de tu CV, tu portafolio o ambos —con LinkedIn incluido si lo eliges— desde la perspectiva de quien contrata diseñadores. 60 minutos, $700 MXN.',
    heroKicker: 'Revisión de perfil y portafolio',
    intro:
      'He estado del lado que recibe los CVs y revisa los portafolios. Sé cuánto tiempo real se le dedica a cada uno en la primera ronda —mucho menos del que te imaginas— y qué hace que uno pase el filtro. Esta sesión te da esa perspectiva aplicada a tu caso.',
    body: [
      {
        h: '¿Para quién es esta revisión?',
        p: 'Para quien está aplicando y no recibe respuesta, para quien llega a la entrevista y siente que sus casos no se defienden solos, y para quien tiene muy buena experiencia pero no logra que se note al leerla. También para quien está armando su primer portafolio o cambiando de carrera hacia UX.',
      },
      {
        h: 'Tú eliges qué revisamos',
        p: 'Al reservar marcas qué quieres trabajar: tu CV, tu portafolio o book, tu LinkedIn, o cualquier combinación. El precio es el mismo. Si eliges varios, priorizamos juntos en qué invertir más tiempo según el rol al que apuntas.',
      },
      {
        h: '¿Qué revisamos exactamente?',
        p: 'En el CV, la estructura y jerarquía —qué se ve primero y si eso es lo más fuerte que tienes— y cómo están escritos tus logros: la mayoría describe responsabilidades, no resultados. En el portafolio, si cada caso deja claro el problema antes de la solución, si se entiende qué decidiste tú y por qué, y la selección y el orden de los casos. En LinkedIn, la coherencia con tu CV, porque quien te evalúa casi siempre abre los dos.',
      },
      {
        h: '¿Cómo es el proceso?',
        p: 'Me compartes tus materiales al reservar. Llego a la sesión habiéndolos revisado, así que la hora completa se usa en trabajar sobre observaciones concretas y no en leer en silencio. Salimos con una lista priorizada de cambios: qué corregir primero, qué después, y qué está bien y no hay que tocar.',
      },
    ],
    faq: [
      {
        q: '¿Puedo revisar CV y portafolio en la misma sesión?',
        a: 'Sí. Marcas ambos al reservar y repartimos la hora según lo que más te urja. Si alguno necesita más trabajo, lo priorizamos juntos.',
      },
      {
        q: '¿LinkedIn cuesta extra?',
        a: 'No. Está incluido: solo márcalo al reservar y compárteme el enlace a tu perfil.',
      },
      {
        q: '¿En qué formato mando mis materiales?',
        a: 'PDF de preferencia para el CV. El portafolio puede estar en Behance, Notion, Figma, un PDF o un sitio propio: revisamos el contenido, no la plataforma.',
      },
      {
        q: '¿Qué pasa si mi trabajo tiene NDA?',
        a: 'Es muy común y tiene solución. Vemos cómo presentar el caso sin exponer información confidencial: se puede hablar del proceso y las decisiones sin mostrar datos ni pantallas sensibles.',
      },
      {
        q: '¿Reescribes mi CV o mi portafolio por mí?',
        a: 'No. Te doy las observaciones y la dirección concreta para que lo hagas tú — así aprendes el criterio y puedes aplicarlo cada vez que lo actualices.',
      },
    ],
  },

  {
    key: 'mock',
    slug: 'simulacion-de-entrevista',
    anchor: 'servicio-entrevista',

    name: 'Simulación de entrevista',
    label: 'Simulación de entrevista',
    tag: 'Preparación',
    tagPlain: true,

    price: 800,
    display: '$800 MXN',
    duration: '60 min',
    durationLong: '60 minutos',
    durationMinutes: 60,

    desc: 'Realizaremos una entrevista simulada y al finalizar recibirás retroalimentación concreta sobre tus respuestas.',
    shortDesc: 'Práctica real + retroalimentación honesta y específica',
    forWho: 'Para quien tiene una entrevista próxima o quiere prepararse mejor.',
    topics: ['Preguntas de experiencia', 'Preguntas situacionales', 'Manejo de stakeholders', 'Presentación de proyectos'],
    includes: [
      'Entrevista simulada completa',
      'Retroalimentación honesta',
      'Puntos concretos a mejorar',
    ],
    cta: 'Quiero practicar una entrevista',

    seoTitle: 'Simulación de entrevista para roles de UX y Product Design',
    seoDescription:
      'Entrevista simulada con retroalimentación honesta sobre tus respuestas, tu narrativa y tu manejo de preguntas difíciles. 60 minutos, $800 MXN.',
    heroKicker: 'Preparación para entrevista',
    intro:
      'La primera vez que dices una respuesta en voz alta nunca sale bien. El problema es cuando esa primera vez es en la entrevista que te importaba. Esta sesión existe para que esa primera vez sea conmigo.',
    body: [
      {
        h: '¿Para quién es esta sesión?',
        p: 'Para quien ya tiene una entrevista agendada y quiere llegar preparado, para quien lleva varias entrevistas sin avanzar y no sabe qué está fallando, y para quien va a entrevistarse por primera vez en un rol de liderazgo, donde las preguntas cambian por completo.',
      },
      {
        h: '¿Cómo funciona la simulación?',
        p: 'Hacemos una entrevista real, no una plática sobre entrevistas. Te hago preguntas de experiencia, preguntas situacionales y preguntas sobre manejo de stakeholders, del tipo que se usan en procesos de UX y Product Design. Si me dices a qué empresa o rol vas, ajusto las preguntas a ese contexto.',
      },
      {
        h: 'La retroalimentación',
        p: 'Al terminar la simulación revisamos qué funcionó y qué no: dónde te extendiste de más, dónde te quedaste corto, qué respuestas sonaban ensayadas y en qué momentos perdiste a tu interlocutor. Es retroalimentación honesta y específica — sale más barato escucharla aquí que deducirla de un rechazo.',
      },
    ],
    faq: [
      {
        q: '¿Puedo decirte a qué empresa voy?',
        a: 'Sí, y ayuda bastante. Con eso ajusto el tipo de preguntas y el nivel de profundidad al proceso que vas a enfrentar.',
      },
      {
        q: '¿Incluye la presentación de portafolio?',
        a: 'Podemos practicar cómo presentas un caso, sí. Si lo que necesitas es revisar el portafolio en sí —estructura, narrativa, selección de casos— esa es la sesión de revisión de CV y portafolio.',
      },
      {
        q: '¿Y si me bloqueo durante la simulación?',
        a: 'Pasa seguido y no importa: es justo el lugar seguro para que pase. Paramos, vemos qué provocó el bloqueo y lo intentamos otra vez con otro enfoque.',
      },
    ],
  },

];

/** Lookup by public URL slug — used by the /asesorias/[slug] pages. */
export function getServiceBySlug(slug) {
  return SERVICES.find((s) => s.slug === slug) || null;
}

/** Lookup by backend key — used by the booking flow. */
export function getServiceByKey(key) {
  return SERVICES.find((s) => s.key === key) || null;
}

/**
 * The shape Booking/index.jsx consumed before this file existed, kept so the
 * booking widget keeps working unchanged: an object keyed by service key.
 */
export const SERVICES_BY_KEY = Object.fromEntries(
  SERVICES.map((s) => [
    s.key,
    {
      name: s.name,
      label: s.label,
      desc: s.shortDesc,
      price: s.price,
      display: s.display,
      tag: s.tag,
      tagPlain: s.tagPlain,
      duration: s.durationLong,
      durationMinutes: s.durationMinutes,
      includes: s.includes,
      reviewOptions: s.reviewOptions,
    },
  ])
);

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

/**
 * Service pages that no longer exist, and where they point now. Each still
 * gets a static page that forwards visitors (and tells crawlers the canonical
 * URL), so links and search results pointing at them keep working.
 */
export const LEGACY_SLUGS = {
  'revision-de-cv-y-linkedin': 'revision-de-cv-y-portafolio',
  'revision-de-portafolio': 'revision-de-cv-y-portafolio',
  mentoria: 'conversacion-estrategica',
};
