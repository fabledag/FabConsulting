import { SITE_URL } from '@/lib/seo.js';

/**
 * Generated into /robots.txt at build time.
 *
 * AI crawlers are allowed on purpose — the point of the static export is that
 * they can now actually read the content instead of an empty root div. They're
 * listed explicitly rather than relying on the `*` rule so the intent is
 * unambiguous, and so account pages stay excluded for them too.
 */
// Required by `output: 'export'` — robots.txt is written once at build time.
export const dynamic = 'force-static';

export default function robots() {
  const disallow = ['/admin/', '/profile/', '/login/'];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'Claude-User', allow: '/', disallow },
      { userAgent: 'Claude-SearchBot', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'Perplexity-User', allow: '/', disallow },
      { userAgent: 'Applebot', allow: '/', disallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow },
      { userAgent: 'Bytespider', allow: '/', disallow },
      { userAgent: 'meta-externalagent', allow: '/', disallow },
      { userAgent: 'cohere-ai', allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
