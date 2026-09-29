import './globals.css';
import { AuthProvider } from '@/context/AuthContext.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import {
  SITE_URL,
  SITE_NAME,
  AUTHOR,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  personSchema,
  professionalServiceSchema,
  websiteSchema,
} from '@/lib/seo.js';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    // Pages set a bare title; this appends the brand automatically.
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  icons: {
    // Fab Design mark (Assets/Fotos/favicon.png). favicon.ico also sits at
    // the root for crawlers and browsers that request it by default.
    icon: [
      { url: '/favicon.ico', sizes: '32x32 48x48' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/`,
    locale: 'es_MX',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — Asesorías en UX, IA y Product Design` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport = {
  themeColor: '#543BAA',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          crossOrigin="anonymous"
        />

        {/* Site-wide graph: who Fabiola is, what she offers, and the site
            itself. Individual pages add their own Service/BlogPosting nodes
            that reference these by @id instead of repeating them. */}
        <JsonLd
          schema={{
            '@context': 'https://schema.org',
            '@graph': [personSchema, professionalServiceSchema, websiteSchema],
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
