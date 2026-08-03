---
name: Estado del proyecto FabLedesma
description: Estado actual de infraestructura, stack técnico y pendientes del website de Fabiola Ledesma
type: project
originSessionId: 0c649927-b417-4cf2-a261-ea9ccf97d782
---
Website de Fabiola Ledesma — mentora UX/Design Manager.

**Why:** Proyecto activo con infraestructura AWS ya desplegada y sitio en producción en fabdesign.digital.

## Dominio en producción (desde 2026-04-30)
- **URL principal**: `https://fabdesign.digital` — sitio en vivo
- `http://fabdesign.digital` → 301 → `https://fabdesign.digital`
- `https://www.fabdesign.digital` → 301 → `https://fabdesign.digital` (vía CloudFront Function)
- Certificado ACM: `arn:aws:acm:us-east-1:975050366655:certificate/e519fa78-45d5-4a76-946e-98347eff5ce5` — estado: ISSUED
- Route53 Hosted Zone: `Z066110318B1L8CR6WHHG`
- CloudFront Function: `www-to-apex-redirect` (viewer-request, LIVE)

## Stack técnico actual
- **Frontend**: React + Vite + Tailwind CSS
- **Fuente**: `FabLedesma/frontend/` — cada sección es un componente React con CSS module local
- **Build**: `cd frontend && npm run build` → genera `frontend/dist/`
- **Deploy**: `bash deploy.sh` desde raíz — compila y sube a S3 + invalida CloudFront

## Estructura frontend
```
frontend/
  src/
    components/    ← Nav, Hero, About, HowItWorks, Services, Insights, Booking, CtaStrip, Footer, WhatsAppFloat, FadeUp, SlotPicker
    pages/         ← Login, Profile (rutas por hash: /#/login, /#/profile — ver nota de ruteo abajo)
    context/       ← AuthContext.jsx (login por enlace mágico, token en localStorage)
    hooks/         ← useAuth.js
    styles/        ← globals.css (Tailwind directives + CSS vars + @layer components)
    App.jsx        ← AuthProvider + router por hash (useRoute() en router.js)
    router.js      ← ruteo hecho a mano por hash (#/login, #/profile) — NO usa react-router
    api.js         ← apiFetch/token/último-correo helpers
    config.js      ← constantes planas: API_BASE_URL, WHATSAPP_NUMBER, SITE_NAME
  public/
    robots.txt     ← permite todos los bots + AI crawlers, apunta a fabdesign.digital
    sitemap.xml    ← URLs con fabdesign.digital
    manifest.json  ← PWA básico
    favicon.svg    ← ícono "F" morado
```

**Nota de ruteo (2026-08-02)**: `/login` y `/profile` son rutas 100% client-side vía hash (`fabdesign.digital/#/login`), no rutas reales de servidor. Se eligió así porque la función de CloudFront (`fabiola-path-rewrite`) que reescribiría rutas sin extensión a `index.html` existe pero algo externo (posible IaC de otro proyecto en esta misma cuenta AWS compartida) revierte su asociación a la distribución cada vez que se intenta activar. El widget viejo `calendar.js` (`public/js/calendar.js`) fue eliminado — tenía un bug real (mandaba campos en español que el backend no reconocía) y quedó totalmente reemplazado por el flujo de `Booking` + `SlotPicker` conectado a la API real.

## SEO implementado (2026-04-30)
- `index.html`: meta description, canonical, Open Graph, Twitter Card, JSON-LD
- JSON-LD: entidades `Person` (Fabiola + credenciales + LinkedIn) y `ProfessionalService` (4 servicios con precios MXN)
- robots.txt: AI crawlers habilitados (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Applebot, Bytespider)
- **Pendiente**: imagen `og-image.jpg` (1200×630px) con foto de Fabiola en `frontend/public/`

## Paleta de colores actual (purple/morado)
- `purple-800: #523AA8` — color de botones primarios
- `purple-900: #1E1145` — fondos oscuros (Services, CtaStrip)
- `purple-600: #7C5DC4`
- `purple-50/100/200` — backgrounds y borders claros
- `orange: #FF8A47` — SOLO para nav-cta, floating badge, accents (NO botones)
- `cream: #FAF9F6` — background base

## Infraestructura (cuenta AWS 975050366655, us-east-1 — **cuenta compartida con otros proyectos de Fab, ver nota abajo**)
- S3: `fabiolaledesma-website`
- CloudFront ID: `E18GECI52IMNB3` — aliases: `fabdesign.digital`, `www.fabdesign.digital`
- API Gateway: `nj3n9glw9d` → `https://nj3n9glw9d.execute-api.us-east-1.amazonaws.com/prod`
- Lambda: `fabiola-ledesma-api` (Node 20.x) — deploy con `bash lambda/deploy.sh` (antes no existía este script)
- DynamoDB: `fabiola-availability`, `fabiola-blocked-dates`, `fabiola-bookings` (+ GSIs `email-date-index`, `id-index`), `fabiola-blog-posts`, `fabiola-users`, `fabiola-magic-links` (TTL), `fabiola-packages` (GSI `email-index`), `fabiola-notifications`
- SES: dominio `fabdesign.digital` verificado con DKIM + SPF (Route53). `FROM_EMAIL=no-reply@fabdesign.digital`, `ADMIN_EMAIL=geo.distor@gmail.com` (solo recibe, no envía). Cuenta SES en `EnforcementStatus: PROBATION` por historial de rebotes — debería mejorar con el tiempo, no es urgente pero vale monitorear.

⚠️ **Esta cuenta AWS es compartida** con otros clientes de Fab (identidades SES de `gedx.com.mx`, `tanquegroup.com`, `sanofi.com`, `ai-raab.com`, etc., y CloudFront Functions de otros proyectos). Solo tocar recursos con prefijo `fabiola-*` o los IDs listados arriba — nunca comandos `list-*`/scan de cuenta completa.

## Cuentas de cliente / self-service (agregado 2026-08-01/02)
Sistema completo de login sin contraseña (enlace mágico por correo), créditos canjeables para el paquete de Mentoría, y reagendar/cancelar self-service (hasta 24h antes de la sesión) — ver handlers nuevos en `lambda/api/handlers/{auth,profile,customerBookings,packages,notifications}.js` y `lambda/api/utils/`. **No existe panel de admin (UI) todavía** — confirmar pagos de paquetes/bookings solo es posible vía API directa (`PUT /admin/packages/{id}`, `PUT /admin/bookings/{id}`) con el JWT de admin.

## Pendientes
1. Subir `og-image.jpg` (1200×630px) a `frontend/public/` y hacer deploy
2. Reemplazar número WhatsApp placeholder `5215500000000` por el real de Fabiola (`frontend/src/config.js`)
3. Registrar en Google Search Console con `fabdesign.digital`
4. Panel de admin (UI) para confirmar pagos de paquetes/bookings — hoy solo vía API
5. Revisar si `CtaStrip` tiene el mismo bug de cascada CSS que tenía `Services` (texto blanco perdiendo contra `.section-title` global) — solo se confirmó y arregló en Services
6. Investigar por qué la asociación de la CloudFront Function `fabiola-path-rewrite` se revierte sola en la distribución `E18GECI52IMNB3` (posiblemente otro pipeline de otro proyecto en la cuenta) — no bloquea nada hoy porque el ruteo de /login y /profile se hizo por hash, pero si algún día se quiere ruteo por path real hay que resolver esto primero

**How to apply:** El source está en `frontend/` — editar componentes ahí, no en `src/` (legacy). Siempre `bash deploy.sh` para build + deploy del frontend, `bash lambda/deploy.sh` para el backend.
