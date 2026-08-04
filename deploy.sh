#!/bin/bash
# ============================================================
# Deploy script — Fabiola Ledesma Website (fabdesign.digital)
# Ejecutar desde la raíz del repo.
#
# Publica el export estático de Next.js (frontend/out) en S3 y purga la caché
# de CloudFront. Como el blog se pre-renderiza en el build, este script es
# también la forma de publicar un artículo nuevo: escribirlo en el panel admin
# no basta, hay que reconstruir y volver a subir.
# ============================================================
set -euo pipefail

OUT="./frontend/out"
BUCKET="fabiolaledesma-website"
CF_ID="E18GECI52IMNB3"
REGION="us-east-1"

# ── 1. Build ────────────────────────────────────────────────
# Next cachea las respuestas de fetch entre builds en .next/cache. Se limpia
# para que los posts del blog se vuelvan a pedir a la API y no se publique
# una versión vieja sin darnos cuenta.
echo "🧹 Limpiando caché de build..."
rm -rf frontend/.next/cache

echo "🔨 Construyendo el sitio (Next.js static export)..."
(cd frontend && npm run build)

if [ ! -f "$OUT/index.html" ]; then
  echo "❌ El build no generó $OUT/index.html — se aborta el deploy."
  exit 1
fi
echo "✅ Build completado"

# ── 2. Subir a S3 ───────────────────────────────────────────
# Primero los assets con hash en el nombre (cache eterno), para que ya estén
# disponibles cuando el HTML nuevo empiece a referenciarlos.
echo "🚀 Subiendo assets estáticos (_next)..."
aws s3 sync "$OUT/_next" "s3://$BUCKET/_next" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --region "$REGION"

# Después el HTML y los archivos de raíz (robots.txt, sitemap.xml, llms.txt,
# imágenes). Cache corto: son los que cambian en cada publicación.
# Se deja que S3 infiera el Content-Type por extensión — forzarlo a text/html
# rompería sitemap.xml y llms.txt.
echo "🚀 Subiendo HTML y archivos de raíz..."
aws s3 sync "$OUT" "s3://$BUCKET/" \
  --delete \
  --exclude "_next/*" \
  --cache-control "public, max-age=300, must-revalidate" \
  --region "$REGION"

echo "✅ S3 sync completado"

# ── 3. Invalidar CloudFront ─────────────────────────────────
echo "🔄 Invalidando caché de CloudFront..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CF_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "✅ Invalidación: $INVALIDATION_ID"

echo ""
echo "🎉 Deploy completado"
echo "🌐 https://fabdesign.digital"
echo "⏳ Espera 1-2 min a que se propague la invalidación"
