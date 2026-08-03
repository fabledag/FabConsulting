---
name: Lecciones sobre colores y estilos en este proyecto
description: Qué respetar y qué evitar al modificar estilos en el sitio React/Tailwind
type: feedback
originSessionId: 0c649927-b417-4cf2-a261-ea9ccf97d782
---
## Paleta vigente (desde 2026-04-30)
El sitio usa un sistema de diseño purple/morado — NO la paleta rosa pastel anterior.

- Botones primarios: `bg-purple-800` (#523AA8) — **NUNCA naranja para botones**
- Orange (#FF8A47): SOLO para nav-cta badge, floating badge del hero, service tags
- Naranja en botones fue rechazado explícitamente por el usuario

**Why:** El usuario dijo "me cambiaste el color de los botones, les pusiste un naranja todo feo, debes respetar los estilos base". El sistema base usa morado como primario.

**How to apply:** Antes de cambiar cualquier color de botón, verificar que sea `bg-purple-800` o más oscuro. Orange es solo para acentos decorativos.

## Stack actual — dónde están los estilos
El sitio es ahora React + Vite + Tailwind CSS (migrado 2026-04-30).

1. `frontend/src/styles/globals.css` — Tailwind directives + CSS variables + `@layer components` (btn-primary, btn-ghost, section-eyebrow, section-title)
2. Cada componente tiene su CSS Module local: `ComponentName.module.css`
3. Tailwind config: `frontend/tailwind.config.js` — paleta de colores extendida
4. Los colores en CSS modules usan `var(--purple-800)` etc. definidos en globals

**Why:** El usuario pidió explícitamente "cada sección tendra sus estilos locales y un manejador de estilos globales, utilizemos tailwinds css para su mejor manejo"

**How to apply:** Al agregar estilos: primero intentar Tailwind en className, luego CSS module del componente para estilos complejos, NUNCA inline styles excepto valores dinámicos.

## Lecciones del sitio monolítico anterior (legacy)
Al cambiar colores en el HTML estático anterior, revisar MÚLTIPLES lugares:
- tailwind.config inline en index.html
- Inline style= en elementos
- Clases Tailwind hardcodeadas
- Bloques `<style>` en cada página
- JS que inyecta CSS como strings (calendar.js, gradients)
- css/style.css variables y valores hardcodeados

(Ya no aplica — el site es React ahora, pero útil si se toca el legacy en `src/`)

## CSS Module del calendario
`calendar.js` fue eliminado (2026-08-02) — ya no aplica esta nota, el widget de calendario/booking es 100% React ahora (`components/Booking` + `components/SlotPicker`).

## Bug real de cascada CSS: módulo vs `.section-title` global (encontrado 2026-08-02)
En `Services`, el `<h2 className={`section-title ${styles.title}`}>` debía mostrar texto blanco (`.title{color:#fff}` en el CSS module) sobre el fondo oscuro `#1E1145`, pero el texto salía en `var(--purple-900)` (el mismo color que el fondo, invisible) porque en el CSS final compilado la regla global `.section-title` (definida en `globals.css` dentro de `@layer components`, que Tailwind aplana a CSS plano en el build) queda DESPUÉS del CSS module en el bundle — mismo specificity, gana la que está más abajo.

**Why:** Vite bundlea el CSS module del componente antes que los estilos globales en algunos casos, invirtiendo el orden esperado. No es un problema de `@layer` (Tailwind lo aplana, no quedan cascade layers reales en el CSS final).

**How to apply:** Si un componente usa el patrón `className={`section-title ${styles.algo}`}` para overridear color sobre fondo oscuro (Services, CtaStrip usan este patrón) y el texto no se ve como se espera, sospechar de esto primero. El arreglo más confiable es un `style={{color: '...'}}` inline en el elemento específico (gana siempre, sin depender del orden del bundle) en vez de confiar en que el CSS module gane. Ya se arregló así en Services (palabra "puedo" → `var(--orange)` inline); **CtaStrip no se revisó, podría tener el mismo problema**.

## Paleta — tokens agregados 2026-08-01
Se agregaron `--purple-700: #654BBC` y `--purple-400: #9B85D6` a `globals.css` (no existían antes) para el flujo de booking/perfil nuevo — úsalos para estados hover/acento intermedios en vez de inventar hex nuevos.
