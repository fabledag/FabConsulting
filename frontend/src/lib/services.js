/**
 * Single source of truth for the five bookable services.
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

    price: 800,
    display: '$800 MXN',
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
      'Sesión individual de 60 minutos para ordenar tus ideas, resolver dudas de carrera y definir tus siguientes pasos en UX y Product Design. $800 MXN.',
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
        p: 'No es una plática motivacional ni una revisión de tu CV (para eso hay una sesión específica). No voy a decirte lo que quieres escuchar: si tu plan tiene un hueco, te lo digo. Tampoco es una sesión genérica con consejos de internet — todo lo que trabajemos parte de tu contexto real.',
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
        a: 'Claro. Si sabes de antemano que quieres acompañamiento continuo, la Mentoría (4 sesiones en 6 meses) sale $400 más barata que comprarlas por separado.',
      },
    ],
  },

  {
    key: 'cv',
    slug: 'revision-de-cv-y-linkedin',
    anchor: 'servicio-cv',

    name: 'Revisión de CV y LinkedIn',
    label: 'Revisión de CV y LinkedIn',
    tag: 'CV & LinkedIn',
    tagPlain: true,

    price: 1000,
    display: '$1,000 MXN',
    duration: '60 min',
    durationLong: '60 minutos',
    durationMinutes: 60,

    desc: 'Revisaremos cómo comunicas tu experiencia, tus logros y tu propuesta de valor para que tu perfil sea más claro y competitivo.',
    shortDesc: 'Feedback directo desde lo que realmente evalúan los hiring managers',
    forWho: 'Para quien quiere que su perfil comunique mejor su experiencia.',
    topics: ['Estructura del CV', 'Claridad de logros', 'Coherencia con LinkedIn', 'Priorización de información'],
    includes: [
      'Estructura y jerarquía del CV',
      'Claridad de logros',
      'Coherencia CV ↔ LinkedIn',
    ],
    cta: 'Quiero revisar mi perfil',

    seoTitle: 'Revisión de CV y LinkedIn para diseñadores UX',
    seoDescription:
      'Revisión profesional de tu CV y perfil de LinkedIn con feedback desde la perspectiva de quien contrata diseñadores. Sesión de 60 minutos, $1,000 MXN.',
    heroKicker: 'Revisión de perfil',
    intro:
      'He estado del lado que recibe los CVs. Sé cuánto tiempo real se le dedica a cada uno en la primera ronda —mucho menos del que te imaginas— y qué hace que uno pase el filtro. Esta sesión te da esa perspectiva aplicada a tu perfil.',
    body: [
      {
        h: '¿Para quién es esta revisión?',
        p: 'Para quien está aplicando y no recibe respuesta, para quien lleva años sin actualizar su CV y no sabe por dónde empezar, y para quien tiene muy buena experiencia pero no logra que se note al leerla. Si sientes que tu perfil te describe pero no te vende, esta sesión es para ti.',
      },
      {
        h: '¿Qué revisamos exactamente?',
        p: 'Revisamos la estructura y jerarquía de tu CV: qué se ve primero y si eso es lo más fuerte que tienes. Revisamos cómo están escritos tus logros —la mayoría de los CVs describen responsabilidades, no resultados, y esa es la diferencia entre avanzar o no. Y revisamos la coherencia entre tu CV y tu LinkedIn, porque quien te evalúa casi siempre abre los dos.',
      },
      {
        h: '¿Cómo es el proceso?',
        p: 'Me compartes tu CV y el enlace a tu LinkedIn al reservar. Llego a la sesión habiéndolos revisado, así que la hora completa se usa en trabajar sobre observaciones concretas y no en leer en silencio. Salimos con una lista priorizada de cambios: qué corregir primero, qué después, y qué está bien y no hay que tocar.',
      },
    ],
    faq: [
      {
        q: '¿En qué formato mando mi CV?',
        a: 'PDF de preferencia. Si tu CV está en Figma, Notion o Google Docs, un enlace con permisos de lectura funciona igual.',
      },
      {
        q: '¿Reescribes mi CV por mí?',
        a: 'No. Te doy las observaciones y la dirección concreta para que lo reescribas tú — así aprendes el criterio y puedes aplicarlo cada vez que lo actualices, no solo esta vez.',
      },
      {
        q: '¿Sirve si estoy cambiando de carrera hacia UX?',
        a: 'Sí, y es uno de los casos donde más ayuda. La dificultad ahí es traducir experiencia de otra industria a un lenguaje que un equipo de diseño reconozca, y eso se trabaja bien en una sesión.',
      },
    ],
  },

  {
    key: 'portfolio',
    slug: 'revision-de-portafolio',
    anchor: 'servicio-portafolio',

    name: 'Revisión de portafolio o book',
    label: 'Revisión de portafolio o book',
    tag: 'Portafolio',
    tagPlain: true,

    price: 1200,
    display: '$1,200 MXN',
    duration: '60 min',
    durationLong: '60 minutos',
    durationMinutes: 60,

    desc: 'Analizaremos la estructura, narrativa y presentación de tus casos para que tu portafolio comunique mejor tu forma de pensar.',
    shortDesc: 'Analizaremos la estructura, narrativa y presentación de tus casos',
    forWho: 'Para quien quiere que su portafolio comunique mejor su trabajo.',
    topics: ['Storytelling', 'Contexto del problema', 'Resultados', 'Preparación para explicarlo en entrevista'],
    includes: [
      'Storytelling y narrativa',
      'Estructura de casos',
      'Preparación para explicarlo en entrevista',
    ],
    cta: 'Quiero revisar mi portafolio',

    seoTitle: 'Revisión de portafolio UX y Product Design',
    seoDescription:
      'Revisión de la estructura, narrativa y presentación de tus casos de estudio para que tu portafolio comunique cómo piensas. 60 minutos, $1,200 MXN.',
    heroKicker: 'Revisión de portafolio',
    intro:
      'Un portafolio no se evalúa por lo bonito que se ve, sino por lo que revela sobre cómo piensas. La mayoría de los portafolios que reviso tienen buen trabajo adentro y una narrativa que no lo deja ver.',
    body: [
      {
        h: '¿Para quién es esta revisión?',
        p: 'Para quien tiene el portafolio listo pero no consigue entrevistas, para quien llega a la entrevista y siente que sus casos no se defienden solos, y para quien tiene proyectos fuertes pero no sabe cuáles poner ni en qué orden. También para quien está armando el primero y quiere evitar los errores clásicos desde el inicio.',
      },
      {
        h: '¿Qué revisamos exactamente?',
        p: 'Revisamos si cada caso deja claro el problema antes de mostrar la solución —el error más común es saltar directo a las pantallas. Revisamos la narrativa: si se entiende qué decidiste tú, por qué, y qué pasó después. Revisamos si hay resultados o solo entregables. Y revisamos la selección y el orden de los casos, porque el primero decide si alguien sigue leyendo.',
      },
      {
        h: 'Preparación para defenderlo en vivo',
        p: 'Un portafolio no termina en el sitio web: termina cuando lo presentas. Dedicamos parte de la sesión a cómo contar cada caso en voz alta, qué preguntas te van a hacer y cómo responder cuando te cuestionen una decisión. Es la parte que casi nadie practica y la que más pesa en la entrevista final.',
      },
    ],
    faq: [
      {
        q: '¿Qué pasa si mi trabajo tiene NDA?',
        a: 'Es muy común y tiene solución. En la sesión vemos cómo presentar el caso sin exponer información confidencial: se puede hablar del proceso y las decisiones sin mostrar datos ni pantallas sensibles.',
      },
      {
        q: '¿Sirve si mi portafolio está en Behance o Notion?',
        a: 'Sí. Revisamos el contenido y la narrativa, no la plataforma. Behance, Notion, Figma, un PDF o un sitio propio funcionan igual.',
      },
      {
        q: '¿Cuántos casos debería tener?',
        a: 'Es justo una de las cosas que definimos en la sesión, porque depende del rol al que apuntas. La respuesta casi nunca es "más".',
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

    price: 900,
    display: '$900 MXN',
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
      'Entrevista simulada con retroalimentación honesta sobre tus respuestas, tu narrativa y tu manejo de preguntas difíciles. 60 minutos, $900 MXN.',
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
        a: 'Podemos practicar cómo presentas un caso, sí. Si lo que necesitas es revisar el portafolio en sí —estructura, narrativa, selección de casos— esa es la sesión de revisión de portafolio.',
      },
      {
        q: '¿Y si me bloqueo durante la simulación?',
        a: 'Pasa seguido y no importa: es justo el lugar seguro para que pase. Paramos, vemos qué provocó el bloqueo y lo intentamos otra vez con otro enfoque.',
      },
    ],
  },

  {
    key: 'mentoria',
    slug: 'mentoria',
    anchor: 'servicio-mentoria',

    name: 'Mentoría',
    label: 'Mentoría · 4 sesiones / 6 meses',
    tag: 'Acompañamiento continuo',
    tagPlain: true,

    price: 2800,
    display: '$2,800 MXN',
    duration: '4 sesiones · 6 meses',
    durationLong: '4 sesiones de 60 min, a lo largo de 6 meses',
    durationMinutes: 60,
    sessions: 4,

    desc: 'Acompañamiento estratégico continuo para diseñadores que quieren cambiar de rol, pasar a liderazgo o replantear su carrera con claridad.',
    shortDesc: '4 sesiones a lo largo de 6 meses · Ahorra $400 vs sueltas',
    forWho: 'Para quien busca acompañamiento a lo largo de varios meses.',
    topics: ['Seguimiento continuo', 'Estrategia de carrera', 'Liderazgo', 'Ahorra $400 vs sesiones sueltas'],
    includes: [
      'Acompañamiento continuo',
      'Seguimiento entre sesiones',
      'Estrategia de carrera a mediano plazo',
    ],
    cta: 'Quiero acompañamiento continuo',

    seoTitle: 'Mentoría en UX y Product Design — 4 sesiones en 6 meses',
    seoDescription:
      'Acompañamiento estratégico continuo para diseñadores que buscan cambiar de rol, pasar a liderazgo o replantear su carrera. 4 sesiones en 6 meses, $2,800 MXN.',
    heroKicker: 'Acompañamiento continuo',
    intro:
      'Los cambios de carrera que funcionan no pasan en una hora. Pasan a lo largo de meses, con ajustes en el camino y alguien que te sostenga el criterio cuando dudas. Para eso existe la mentoría.',
    body: [
      {
        h: '¿Para quién es la mentoría?',
        p: 'Para quien va tras un cambio que toma tiempo: pasar de diseñador individual a rol de liderazgo, moverse de una industria a otra, o replantear una carrera que ya no tiene sentido como está. Si tu objetivo se resuelve con una conversación, la sesión individual te conviene más. Si tu objetivo es un proceso, esto es lo que necesitas.',
      },
      {
        h: '¿Cómo se distribuyen las sesiones?',
        p: 'Son 4 sesiones de 60 minutos que tú agendas dentro de un periodo de 6 meses, al ritmo que te sirva. Hay quien las usa cada mes y medio para sostener un plan largo, y quien concentra dos al inicio de una búsqueda intensa y guarda las otras dos para negociar la oferta. Tú decides cuándo, según cómo avance tu proceso.',
      },
      {
        h: '¿Qué pasa entre sesiones?',
        p: 'Cada sesión cierra con acciones concretas, y la siguiente empieza revisando qué pasó con ellas. Ese seguimiento es la diferencia real entre la mentoría y cuatro sesiones sueltas: hay continuidad, hay memoria de lo que ya intentamos, y hay a quién rendirle cuentas.',
      },
      {
        h: 'Cómo funciona la compra',
        p: 'Compras el paquete una sola vez y quedan 4 créditos en tu cuenta. Desde tu perfil agendas cada sesión cuando la necesites, sin volver a pagar. El paquete cuesta $2,800 contra $3,200 si compraras las cuatro por separado.',
      },
    ],
    faq: [
      {
        q: '¿Tengo que agendar las 4 sesiones desde el inicio?',
        a: 'No. Al activarse tu paquete quedan 4 créditos disponibles en tu perfil y agendas cada sesión cuando te haga sentido, dentro de los 6 meses.',
      },
      {
        q: '¿Puedo usar las sesiones para temas distintos?',
        a: 'Sí. Es común usar una para revisar el CV, otra para simular una entrevista y las demás para estrategia. La ventaja es que quien te acompaña ya conoce tu contexto completo.',
      },
      {
        q: '¿Qué pasa si no uso las 4 sesiones en 6 meses?',
        a: 'Escríbeme antes de que venza. Si hubo una razón de fuerza mayor lo vemos caso por caso — la idea es acompañarte, no que pierdas lo que pagaste.',
      },
      {
        q: '¿Cómo se confirma mi paquete?',
        a: 'Al comprarlo recibes las instrucciones de pago. En cuanto confirmo el pago activo tu paquete y te llega un correo avisándote que ya tienes tus 4 créditos disponibles.',
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
    },
  ])
);

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);
