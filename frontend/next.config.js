/** @type {import('next').NextConfig} */

// The site is served as pre-built static files from S3 (bucket
// `fabiolaledesma-website`) behind CloudFront `E18GECI52IMNB3`, so every route
// has to be rendered at build time — there is no Node server in production.
//
// `trailingSlash: true` makes the export emit `/asesorias/mentoria/index.html`
// instead of `/asesorias/mentoria.html`. That shape is what the CloudFront
// viewer-request function (`fabiola-edge-router`) expects: it appends
// `index.html` to any URI ending in `/`. Changing this flag requires updating
// that function too, or clean URLs will start 404ing.
const nextConfig = {
  output: 'export',
  trailingSlash: true,

  // next/image's optimizer needs a running server; with a static export we
  // serve the original files straight from S3 instead.
  images: { unoptimized: true },

  reactStrictMode: true,

  // `next dev` otherwise writes frontend/AGENTS.md + frontend/CLAUDE.md on
  // every start. This repo already keeps its instructions in the root
  // CLAUDE.md; a second, auto-regenerated one inside frontend/ would compete
  // with it and show up as a permanently dirty file in git status.
  agentRules: false,
};

export default nextConfig;
