import Link from 'next/link';
import Nav from '@/components/Nav/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { getPublishedPosts, formatDate } from '@/lib/blog.js';
import { buildMetadata, absoluteUrl, breadcrumbSchema, SITE_URL } from '@/lib/seo.js';
import styles from './blog.module.css';

export const metadata = buildMetadata({
  title: 'Blog sobre carrera, UX y Product Design',
  description:
    'Artículos sobre carrera en UX, portafolio, entrevistas, liderazgo de diseño y aplicación práctica de IA en producto digital.',
  path: '/blog',
});

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${absoluteUrl('/blog')}#blog`,
        name: 'Blog de Fabiola Ledesma',
        description:
          'Artículos sobre carrera en UX, portafolio, entrevistas, liderazgo de diseño y aplicación práctica de IA.',
        url: absoluteUrl('/blog'),
        inLanguage: 'es-MX',
        author: { '@id': `${SITE_URL}/#fabiola` },
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: absoluteUrl(`/blog/${p.slug}`),
          ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
        })),
      },
      breadcrumbSchema([
        { name: 'Inicio', path: '/' },
        { name: 'Blog', path: '/blog' },
      ]),
    ],
  };

  return (
    <div className={styles.page}>
      <JsonLd schema={schema} />
      <Nav />

      <main className="wrap">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/">Inicio</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">Blog</li>
          </ol>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.intro}>
            Notas sobre carrera en UX, portafolio, entrevistas, liderazgo de diseño
            y cómo la IA está cambiando el trabajo de producto.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className={styles.empty}>
            Aún no hay artículos publicados. Vuelve pronto.
          </p>
        ) : (
          <div className={styles.list}>
            {posts.map((post) => (
              <article key={post.slug} className={styles.card}>
                {post.publishedAt && (
                  <time className={styles.date} dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                <h2 className={styles.cardTitle}>
                  <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
                </h2>
                {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
                {post.tags?.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.map((t) => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                )}
                <Link href={`/blog/${post.slug}/`} className={styles.readLink}>
                  Leer el artículo →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
