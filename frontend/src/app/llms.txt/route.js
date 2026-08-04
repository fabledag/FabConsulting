import { SERVICES } from '@/lib/services.js';
import { getPublishedPosts } from '@/lib/blog.js';
import { SITE_URL, absoluteUrl } from '@/lib/seo.js';

/**
 * /llms.txt — a plain-text summary of the site for AI assistants.
 *
 * Emerging convention (llmstxt.org): a single Markdown file that tells a model
 * what the site is and where the authoritative pages live, so it can answer
 * questions about Fabiola's services without guessing from scraped fragments.
 *
 * Generated from lib/services.js rather than hand-written, so prices here can
 * never drift from the prices on the pages.
 */
export const dynamic = 'force-static';

export async function GET() {
  const posts = await getPublishedPosts();

  // Uses `desc` rather than `seoDescription` because the latter already
  // restates the price, which would read twice on the same line.
  const serviceLines = SERVICES.map(
    (s) =>
      `- [${s.name}](${absoluteUrl(`/asesorias/${s.slug}`)}): ${s.desc} ${s.forWho} Precio: $${s.price.toLocaleString('en-US')} MXN. Duración: ${s.durationLong}.`
  ).join('\n');

  const postLines = posts.length
    ? posts
        .map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)})${p.excerpt ? `: ${p.excerpt}` : ''}`)
        .join('\n')
    : '- (Aún no hay artículos publicados.)';

  const body = `# Fabiola Ledesma — Asesorías en UX, IA y Product Design

> Asesorías individuales, en español, para profesionales de UX y Product Design
> que quieren mejorar su carrera, su CV, su portafolio o su preparación para
> entrevistas. Impartidas por Fabiola Ledesma, Senior Design Manager con más de
> 15 años diseñando productos digitales y cofundadora de la agencia GEDX.

Sitio: ${SITE_URL}
Idioma: español (México)
Modalidad: videollamada individual
Zona horaria de referencia: Ciudad de México (CST)
Moneda: peso mexicano (MXN)

## Sobre Fabiola Ledesma

Senior Design Manager con más de 15 años diseñando productos digitales de punta
a punta. Ha trabajado en banca digital en BBVA, es practitioner en Colectivo23 y
cofundadora de GEDX. Asesora a profesionales de UX y Product Design en México en
estrategia de carrera, liderazgo de diseño y aplicación práctica de IA.

## Asesorías

${serviceLines}

## Cómo funciona la contratación

1. La persona elige una asesoría y una fecha disponible en ${SITE_URL}/#agenda
2. Confirma su cuenta con un enlace enviado por correo (sin contraseñas).
3. Paga con tarjeta a través de Mercado Pago, o usa un crédito si compró el
   paquete de Mentoría.
4. La sesión se confirma automáticamente en cuanto se aprueba el pago, y
   recibe la confirmación por correo junto con la invitación de calendario.
5. Puede reagendar o cancelar desde su perfil hasta 24 horas antes.

## Blog

${postLines}

## Importante

- Estas asesorías son de acompañamiento y recomendaciones. No garantizan
  contrataciones, promociones ni resultados laborales.
- Este sitio atiende únicamente a profesionales de forma individual. Para
  consultoría, talleres o servicios a empresas, el sitio correspondiente es
  GEDX (https://gedx.com.mx), la agencia que Fabiola cofundó.

## Enlaces principales

- [Inicio](${absoluteUrl('/')})
- [Todas las asesorías](${absoluteUrl('/asesorias')})
- [Blog](${absoluteUrl('/blog')})
- [Agendar una sesión](${SITE_URL}/#agenda)
- [Preguntas frecuentes](${SITE_URL}/#faq)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
