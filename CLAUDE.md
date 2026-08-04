# Instrucciones del proyecto — FabWebsite

## Arquitectura del sitio (desde la migración a Next.js, 2026-08-04)

El frontend es **Next.js 16 (App Router) con export estático** (`output: 'export'`),
no una SPA de Vite. Se construye en local y se publica como HTML plano en S3
(`fabiolaledesma-website`) detrás de CloudFront (`E18GECI52IMNB3`). **No hay
servidor Node en producción**: todo se pre-renderiza en el build.

La razón de la migración fue SEO y descubribilidad por IAs. Antes, el HTML
servido era `<div id="root"></div>` — cero contenido para GPTBot, ClaudeBot o
PerplexityBot, que no ejecutan JavaScript.

### Estructura

```
frontend/
  next.config.js          output:'export' + trailingSlash:true
  src/
    app/                  rutas (App Router)
      page.jsx            landing
      asesorias/          índice + [slug] (5 páginas de servicio)
      blog/               índice + [slug] (pre-renderizado desde la API)
      login|profile|admin páginas de cuenta, todas noindex
      sitemap.js          sitemap.xml generado
      robots.js           robots.txt generado
      llms.txt/route.js   resumen del sitio para asistentes de IA
    components/           componentes de UI
    views/                Login/Profile/Admin (antes src/pages, renombrado
                          para no colisionar con el Pages Router de Next)
    lib/
      services.js         FUENTE ÚNICA de los 5 servicios
      seo.js              metadatos y JSON-LD
      faq.js, blog.js, navigation.js, api.js, adminApi.js
```

### Reglas al tocar este código

- **Los 5 servicios se editan solo en `src/lib/services.js`.** Landing, booking,
  páginas dedicadas, sitemap, JSON-LD y llms.txt leen todos de ahí. El campo
  `key` es el contrato con `VALID_SERVICES` del backend; el `slug` es la URL
  pública y cambiarlo rompe enlaces y posicionamiento.
- **`trailingSlash: true` está acoplado a la función CloudFront**
  `fabiola-edge-router` (código en `infra/fabiola-edge-router.js`). Esa función
  hace el redirect www→apex *y* resuelve `/ruta/` → `/ruta/index.html`.
  CloudFront solo admite **una** función por evento `viewer-request`: por eso
  ambas responsabilidades viven en el mismo archivo. Cambiar el flag sin
  actualizar la función deja todas las URLs limpias en 404.
- Los componentes con estado, eventos o acceso a `window` necesitan
  `'use client'`. Aun así se pre-renderizan: el HTML sale completo igual.
- Nunca leer `window`/`localStorage` durante el render — solo dentro de
  `useEffect`, o el build falla y la hidratación se desincroniza.
- El contenido colapsado (acordeón del FAQ) debe renderizarse siempre y
  ocultarse con `hidden`, nunca montarse condicionalmente: si no está en el
  HTML, los buscadores y las IAs no lo ven.

### Publicar un artículo del blog

Escribirlo en el panel admin **no basta**: los posts se pre-renderizan en el
build. Hay que ejecutar `./deploy.sh`, que reconstruye y vuelve a subir. Ese
script limpia `.next/cache` primero para que Next vuelva a pedir los posts a la
API en lugar de reutilizar los del build anterior.

## Flujo de trabajo obligatorio para cambios

Cada vez que la usuaria pida un cambio o ajuste (código, contenido, configuración, etc.) y ese cambio quede implementado, al terminar SIEMPRE debo, sin pedir confirmación adicional cada vez:

1. **Memorizar** — guardar en el sistema de memoria lo que sea relevante para sesiones futuras (qué cambió, por qué, pendientes nuevos), siguiendo las reglas normales de qué vale la pena memorizar.
2. **Commitear** — crear un commit de git con un mensaje claro que describa el cambio.
3. **Pushear** — hacer `git push` al remoto.

Esta autorización es permanente para este proyecto y cubre commit + push de trabajo ya solicitado explícitamente por la usuaria. No aplica a acciones fuera de ese alcance (p. ej. force-push, borrar ramas, tocar infraestructura AWS compartida — ver memoria `feedback_shared_aws_account`) — esas siguen requiriendo confirmación explícita caso por caso.

Si un cambio queda a medias, con errores de build, o la usuaria pide explícitamente no commitear todavía, esta regla no aplica hasta que el cambio esté completo y verificado.

## Despliegue a producción — siempre preguntar

`git push` a `main` (repo) NO implica desplegar a producción. Si el proyecto tiene un paso de deploy propio (p. ej. `lambda/deploy.sh`, `frontend/deploy.sh`, invalidación de CloudFront, o cualquier acción que publique lo trabajado en `fabdesign.digital`), esa acción **nunca es automática**: siempre debo preguntar a la usuaria antes de lanzar a producción, aunque el cambio ya esté commiteado y pusheado. Esto aplica cada vez que el trabajo hecho en la sesión requiera ese paso para verse reflejado en el sitio en vivo.
