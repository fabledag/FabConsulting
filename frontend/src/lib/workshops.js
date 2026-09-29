/**
 * Talleres para empresas — content only.
 *
 * Deliberately separate from lib/services.js: SERVICES feeds the booking
 * widget, checkout and the backend's VALID_SERVICES contract. Workshops are
 * never booked or paid online — they start as an inquiry through the form on
 * /talleres-empresariales/ — so nothing in the booking, payment or credits
 * code should ever import this file.
 *
 * No prices, duration, seats or modality on purpose: those are agreed per
 * team (see SCOPE_NOTE).
 */

export const WORKSHOPS_PATH = '/talleres-empresariales/';

export const SCOPE_NOTE =
  'El alcance, la duración y la modalidad se acuerdan según el objetivo y el contexto del equipo.';

export const WORKSHOPS = [
  {
    key: 'comunicacion-estrategica',
    anchor: 'taller-comunicacion-estrategica',
    icon: 'fa-solid fa-comments',
    short: 'Estructurar mensajes y propuestas que faciliten decisiones.',
    name: 'Comunicación estratégica para equipos',
    desc: 'Un taller para estructurar mensajes, presentar propuestas y facilitar conversaciones que ayuden a tomar decisiones.',
    forWho:
      'Equipos de diseño, producto, negocio y líderes que necesitan presentar iniciativas o alinear a distintas áreas.',
    topics: [
      'Comprender a la audiencia y sus necesidades.',
      'Estructurar una propuesta con claridad.',
      'Conectar argumentos, evidencia y valor para el negocio.',
      'Abordar preguntas y objeciones con empatía.',
    ],
    exercise:
      'El equipo trabaja una propuesta real y construye una narrativa adaptada a la audiencia y a la decisión que busca facilitar.',
  },
  {
    key: 'diseno-estrategico-ia',
    anchor: 'taller-diseno-estrategico-ia',
    icon: 'fa-solid fa-wand-magic-sparkles',
    short: 'Identificar oportunidades de IA y diseñar un primer experimento.',
    name: 'Diseño estratégico e IA aplicada al negocio',
    desc: 'Un taller para identificar oportunidades y explorar cómo el diseño y la IA pueden contribuir a resolver un reto concreto.',
    forWho: 'Equipos de producto, diseño, innovación y negocio.',
    topics: [
      'Definir el problema y el resultado deseado.',
      'Identificar oportunidades de aplicación de IA.',
      'Priorizar según valor, viabilidad y riesgo.',
      'Diseñar un primer experimento y sus criterios de evaluación.',
    ],
    exercise:
      'El equipo define una oportunidad priorizada y un primer plan de experimentación, con supuestos y criterios de éxito.',
  },
];

export const WORKSHOPS_BY_KEY = Object.fromEntries(WORKSHOPS.map((w) => [w.key, w]));

export const WORKSHOP_PROCESS = [
  {
    icon: 'fa-solid fa-magnifying-glass',
    title: 'Entendemos el reto',
    desc: 'Nos compartes el contexto, los participantes y lo que necesitan lograr.',
  },
  {
    icon: 'fa-solid fa-clipboard-list',
    title: 'Definimos una propuesta',
    desc: 'Acordamos objetivos, alcance y dinámica de trabajo.',
  },
  {
    icon: 'fa-solid fa-people-group',
    title: 'Trabajamos sobre un caso',
    desc: 'Combinamos conceptos, ejercicios y conversación para llevar el aprendizaje a una situación del equipo.',
  },
  {
    icon: 'fa-solid fa-flag-checkered',
    title: 'Cerramos con próximos pasos',
    desc: 'Recuperamos los aprendizajes y definimos cómo continuar aplicándolos.',
  },
];

/** How the workshops work, as short selling points. Describes the format
 *  only — no outcomes are promised. */
export const WORKSHOP_VALUES = [
  { icon: 'fa-solid fa-briefcase', label: 'Sobre casos reales del equipo' },
  { icon: 'fa-solid fa-sliders', label: 'Adaptados a su contexto' },
  { icon: 'fa-solid fa-hand-pointer', label: 'Prácticos y participativos' },
];

export const WORKSHOP_AUDIENCES = ['Diseño', 'Producto', 'Innovación', 'Negocio', 'Liderazgo'];
