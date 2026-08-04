import FadeUp from '../FadeUp/index.jsx';
import styles from './Services.module.css';

const SERVICES = [
  {
    id: 'servicio-1-1',
    key: 'session',
    tag: 'Más elegida',
    name: 'Conversación estratégica 1:1',
    desc: 'Una conversación personalizada para ordenar tus ideas, resolver dudas y definir los siguientes pasos de tu carrera.',
    forWho: 'Para profesionales que buscan claridad y dirección.',
    topics: ['Crecimiento profesional', 'Cambio de rol', 'Liderazgo', 'Aplicación práctica de IA'],
    duration: '60 min',
    price: '$800',
    cta: 'Agenda una conversación',
  },
  {
    id: 'servicio-cv',
    key: 'cv',
    tag: 'CV & LinkedIn',
    tagPlain: true,
    name: 'Revisión de CV y LinkedIn',
    desc: 'Revisaremos cómo comunicas tu experiencia, tus logros y tu propuesta de valor para que tu perfil sea más claro y competitivo.',
    forWho: 'Para quien quiere que su perfil comunique mejor su experiencia.',
    topics: ['Estructura del CV', 'Claridad de logros', 'Coherencia con LinkedIn', 'Priorización de información'],
    duration: '60 min',
    price: '$1,000',
    cta: 'Quiero revisar mi perfil',
  },
  {
    id: 'servicio-portafolio',
    key: 'portfolio',
    tag: 'Portafolio',
    tagPlain: true,
    name: 'Revisión de portafolio o book',
    desc: 'Analizaremos la estructura, narrativa y presentación de tus casos para que tu portafolio comunique mejor tu forma de pensar.',
    forWho: 'Para quien quiere que su portafolio comunique mejor su trabajo.',
    topics: ['Storytelling', 'Contexto del problema', 'Resultados', 'Preparación para explicarlo en entrevista'],
    duration: '60 min',
    price: '$1,200',
    cta: 'Quiero revisar mi portafolio',
  },
  {
    id: 'servicio-entrevista',
    key: 'mock',
    tag: 'Preparación',
    tagPlain: true,
    name: 'Simulación de entrevista',
    desc: 'Realizaremos una entrevista simulada y al finalizar recibirás retroalimentación concreta sobre tus respuestas.',
    forWho: 'Para quien tiene una entrevista próxima o quiere prepararse mejor.',
    topics: ['Preguntas de experiencia', 'Preguntas situacionales', 'Manejo de stakeholders', 'Presentación de proyectos'],
    duration: '60 min',
    price: '$900',
    cta: 'Quiero practicar una entrevista',
  },
  {
    id: 'servicio-mentoria',
    key: 'mentoria',
    tag: 'Acompañamiento continuo',
    tagPlain: true,
    name: 'Mentoría',
    desc: 'Acompañamiento estratégico continuo para diseñadores que quieren cambiar de rol, pasar a liderazgo o replantear su carrera con claridad.',
    forWho: 'Para quien busca acompañamiento a lo largo de varios meses.',
    topics: ['Seguimiento continuo', 'Estrategia de carrera', 'Liderazgo', 'Ahorra $400 vs sesiones sueltas'],
    duration: '4 sesiones · 6 meses',
    price: '$2,800',
    cta: 'Quiero acompañamiento continuo',
  },
];

function selectService(key) {
  sessionStorage.setItem('preselected_service', key);
}

function Services() {
  return (
    <section className={styles.services} id="servicios">
      <div className={`wrap ${styles.servicesInner}`}>
      {/* Header */}
      <FadeUp className={styles.header}>
        <div>
          <span className={`section-eyebrow ${styles.eyebrow}`}>Asesorías</span>
          <h2 className={`section-title ${styles.title}`}>
            Elige la sesión
            <br />
            que <em>necesitas</em>
          </h2>
          <p className={styles.intro}>
            Sesiones enfocadas para profesionales. No respuestas genéricas —
            estrategia para tu contexto específico.
          </p>
        </div>
      </FadeUp>

      {/* Cards grid */}
      <div className={styles.grid}>
        {SERVICES.map(({ id, key, tag, tagPlain, name, desc, forWho, topics, duration, price, cta }, i) => (
          <FadeUp key={id} id={id} className={styles.card} delay={`${i * 0.05}s`}>
            <span className={`${styles.tag} ${tagPlain ? styles.tagPlain : ''}`}>{tag}</span>
            <h3 className={styles.cardH3}>{name}</h3>
            <p className={styles.cardP}>{desc}</p>
            <p className={styles.cardForWho}>{forWho}</p>

            <div className={styles.topicsList}>
              {topics.map((t) => (
                <span key={t} className={styles.topicTag}>{t}</span>
              ))}
            </div>

            <div className={styles.cardMeta}>
              <span>{duration}</span>
            </div>

            <div className={styles.priceRow}>
              <div className={styles.priceBlockInline}>
                <span className={styles.priceNumSm}>{price}</span>
                <span className={styles.priceUnitSm}>MXN</span>
              </div>
            </div>

            <a
              href="#agenda"
              className="btn-primary"
              style={{ justifyContent: 'center', width: '100%' }}
              onClick={() => selectService(key)}
            >
              {cta}
            </a>
          </FadeUp>
        ))}
      </div>

      <p className={styles.resultsNote}>
        No saldrás solo con consejos: terminaremos la sesión con recomendaciones claras y próximos pasos que puedas aplicar.
      </p>
      </div>
    </section>
  );
}

export default Services;
