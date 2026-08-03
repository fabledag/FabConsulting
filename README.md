# FabLedesma — Fabiola Ledesma Consulting

Sitio web de Fabiola Ledesma (Sr. Design Manager, mentora UX/carrera) — en producción en [fabdesign.digital](https://fabdesign.digital).

## Stack

- **Frontend**: React + Vite + Tailwind CSS (`frontend/`) — SPA con ruteo por hash (`#/login`, `#/profile`, `#/admin`), sin dependencias de routing externas.
- **Backend**: un solo AWS Lambda (`lambda/api/`) con router interno hecho a mano, sin framework — Node.js 20.x.
- **Infra**: API Gateway, DynamoDB, S3 + CloudFront (sitio estático), SES (correo transaccional con dominio propio verificado + DKIM).

## Funcionalidad

- Sitio público: landing, servicios, agenda de citas.
- **Cuentas de cliente**: login sin contraseña (enlace mágico por correo), créditos canjeables para el paquete de Mentoría, reagendar/cancelar citas uno mismo (hasta 24h antes), notificaciones por correo y en el perfil.
- **Panel de administración** (`/#/admin`): confirmar pagos de reservas y paquetes, gestionar disponibilidad semanal y fechas bloqueadas, CMS básico de blog, recuperación de contraseña por correo.

## Estructura

```
frontend/          App React (Vite) — código fuente activo, editar aquí
  src/
    components/     Secciones de la landing pública
    pages/          Login, Profile, Admin (+ pestañas del admin)
    context/         AuthContext (clientes)
    hooks/          useAuth, useAdminAuth
    api.js / adminApi.js   Clientes de API separados (cliente vs admin)
    router.js       Ruteo por hash hecho a mano

lambda/api/         Backend — Lambda único, Node 20.x
  handlers/          Un archivo por dominio (bookings, packages, blog, admin, auth...)
  utils/             Helpers compartidos (auth JWT, email, notificaciones)
  index.js           Router interno

infra/              Policies IAM y config de CloudFront (referencia, no se aplican automático)
src/                Sitio estático legacy (pre-migración a React) — no se edita, solo referencia
claude-memory/      Notas de contexto del proyecto para trabajo asistido
```

## Desarrollo local

```bash
cd frontend
npm install
npm run dev
```

El frontend local apunta directo a la API de producción (no hay backend de desarrollo separado) — ver `frontend/src/config.js`.

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
- No hay página pública de blog todavía — el CMS del panel de admin ya funciona, falta la vista pública.
