import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav/index.jsx';
import Footer from '@/components/Footer/index.jsx';
import WhatsAppFloat from '@/components/WhatsAppFloat/index.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { getPublishedPosts, getPost, formatDate } from '@/lib/blog.js';
import { buildMetadata, blogPostingSchema } from '@/lib/seo.js';
import styles from '../blog.module.css';

/**
 * Slug used only while the blog has no published posts.
 *
 * `output: 'export'` refuses to build a dynamic route whose
 * generateStaticParams returns an empty array, so we emit this one noindex
 * placeholder instead. The moment a real post exists it takes over and the
 * placeholder stops being generated.
 */
const EMPTY_PLACEHOLDER = 'proximamente';

/**
 * Only posts that are published at build time get a page. A post published in
 * the admin panel afterwards appears on the next `./deploy.sh`.
 */
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  if (posts.length === 0) return [{ slug: EMPTY_PLACEHOLDER }];
  return posts.map((p) => ({ slug: p.slug }));
}

function EmptyBlogNotice() {
  return (
    <div className={styles.page}>
      <Nav />
      <main className="wrap" style={{ padding: '4rem 0 6rem', maxWidth: '60ch' }}>
        <h1 className={styles.postTitle}>Todavía no hay artículos</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Estoy preparando los primeros textos sobre carrera en UX, portafolio y
          entrevistas. Mientras tanto, puedes ver las asesorías disponibles.
        </p>
        <Link href="/asesorias/" className="btn-primary">Ver las asesorías</Link>
      </main>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return buildMetadata({
      title: 'Blog',
      description: 'Aún no hay artículos publicados.',
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt || `${post.title} — artículo de Fabiola Ledesma.`,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    ...(post.coverImage ? { image: post.coverImage } : {}),
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Only reachable via the placeholder above, i.e. while the blog is empty.
  if (!post && slug === EMPTY_PLACEHOLDER) return <EmptyBlogNotice />;
  if (!post) notFound();

  return (
    <div className={styles.page}>
      <JsonLd schema={blogPostingSchema(post)} />
      <Nav />

      <main className="wrap">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/">Inicio</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/blog/">Blog</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        <article className={styles.article}>
          <header>
            <h1 className={styles.postTitle}>{post.title}</h1>
            <div className={styles.postMeta}>
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              )}
              <span>·</span>
              <span>{post.author || 'Fabiola Ledesma'}</span>
            </div>
            {post.tags?.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            )}
          </header>

          {/*
            `contentHtml` is markdown rendered server-side by the blog Lambda.
            The source is written by the authenticated admin panel — i.e. by
            Fabiola — so it's trusted content, not visitor input.
          */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
          />
        </article>

        <aside className={styles.postCta}>
          <h2>¿Quieres trabajar esto en una sesión?</h2>
          <p>
            Las asesorías individuales son el espacio para aplicar esto a tu caso
            concreto: tu CV, tu portafolio o tu siguiente paso de carrera.
          </p>
          <Link href="/asesorias/" className="btn-primary">
            Ver las asesorías
          </Link>
        </aside>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
