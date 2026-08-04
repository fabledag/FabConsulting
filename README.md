# FabLedesma — Fabiola Ledesma Consulting

Sitio web de Fabiola Ledesma (Sr. Design Manager, mentora UX/carrera) — en producción en [fabdesign.digital](https://fabdesign.digital).

## Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS (`frontend/`) — export estático (`output: 'export'`), pre-renderizado en el build. URLs reales (`/asesorias/mentoria/`, `/blog/…`), sin servidor Node en producción.
- **Backend**: un solo AWS Lambda (`lambda/api/`) con router interno hecho a mano, sin framework — Node.js 20.x.
- **Infra**: API Gateway, DynamoDB, S3 + CloudFront (sitio estático), SES (correo transaccional con dominio propio verificado + DKIM).

## Funcionalidad

- Sitio público: landing, páginas dedicadas por asesoría, blog y agenda de citas — todo pre-renderizado como HTML plano para buscadores y crawlers de IA.
- **Cuentas de cliente**: login sin contraseña (enlace mágico por correo), créditos canjeables para el paquete de Mentoría, reagendar/cancelar citas uno mismo (hasta 24h antes), notificaciones por correo y en el perfil.
- **Panel de administración** (`/admin/`): confirmar pagos de reservas y paquetes, gestionar disponibilidad semanal y fechas bloqueadas, CMS básico de blog, recuperación de contraseña por correo.

## Estructura

```
frontend/          App Next.js — código fuente activo, editar aquí
  next.config.js    output:'export' + trailingSlash:true
  src/
    app/            Rutas (App Router): landing, asesorias/, blog/,
                    login|profile|admin, sitemap.js, robots.js, llms.txt
    components/     Secciones de la landing y de las páginas de servicio
    views/          Login, Profile, Admin (+ pestañas del admin)
    context/        AuthContext (clientes)
    hooks/          useAuth, useAdminAuth
    lib/
      services.js   FUENTE ÚNICA de los 5 servicios
      seo.js        Metadatos y JSON-LD
      blog.js       Fetch de posts en build time
      api.js / adminApi.js   Clientes de API separados (cliente vs admin)

lambda/api/         Backend — Lambda único, Node 20.x
  handlers/          Un archivo por dominio (bookings, packages, blog, admin, auth...)
  utils/             Helpers compartidos (auth JWT, email, notificaciones)
  index.js           Router interno

infra/              Policies IAM y CloudFront Functions — incluye
                    fabiola-edge-router.js (redirect www→apex + ruteo de URLs limpias)
src/                Sitio estático legacy (pre-React) — no se edita, solo referencia
claude-memory/      Notas de contexto del proyecto para trabajo asistido
```

## Desarrollo local

```bash
cd frontend
npm install
npm run dev
```

El frontend local apunta directo a la API de producción (no hay backend de desarrollo separado) — ver `frontend/src/lib/config.js`.

## Deploy

```bash
# Frontend (build + S3 + invalidación CloudFront)
bash deploy.sh

# Backend (solo si se tocó lambda/api/)
bash lambda/deploy.sh
```

Ninguno de los dos scripts crea infraestructura nueva — tablas de DynamoDB, funciones de CloudFront, dominios SES, etc. se dan de alta manualmente vía AWS CLI cuando se necesitan (ver `claude-memory/project_status.md` para el detalle de lo que ya existe).

## Notas

- La cuenta de AWS usada aquí es compartida con otros proyectos — cualquier cambio de infraestructura debe limitarse a recursos con prefijo `fabiola-*` / `fabdesign.digital`.
- El blog se pre-renderiza en el build: publicar un post en el panel admin **no** lo hace visible por sí solo, hay que volver a correr `bash deploy.sh`.
- `trailingSlash: true` en `next.config.js` está acoplado a la función CloudFront `fabiola-edge-router`. CloudFront solo admite una función por evento `viewer-request`, por eso el redirect www→apex y el ruteo de rutas viven juntos en `infra/fabiola-edge-router.js`.
