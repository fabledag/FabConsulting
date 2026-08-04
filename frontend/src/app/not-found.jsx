import Link from 'next/link';
import Nav from '@/components/Nav/index.jsx';
import Footer from '@/components/Footer/index.jsx';

export const metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

/**
 * Exported as /404.html, which is what the CloudFront distribution already
 * serves for both 403 and 404 responses.
 */
export default function NotFound() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />
      <main
        className="wrap"
        style={{ padding: '5rem 0 6rem', maxWidth: '60ch', textAlign: 'center' }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '1rem',
          }}
        >
          Error 404
        </p>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontWeight: 400,
            color: 'var(--purple-900)',
            margin: '0 0 1rem',
          }}
        >
          Esta página no existe
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Puede que el enlace esté roto o que la página haya cambiado de dirección.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">Ir al inicio</Link>
          <Link href="/asesorias/" className="btn-ghost">Ver las asesorías</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
