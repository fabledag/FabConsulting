#!/bin/bash
# ============================================================
# Deploy script — Fabiola Ledesma Website
# Ejecutar desde el directorio FabLedesma/
# ============================================================

DIST="./frontend/dist"
BUCKET="fabiolaledesma-website"
CF_ID="E18GECI52IMNB3"
REGION="us-east-1"

# 1. Build
echo "🔨 Building React app..."
cd frontend && npm run build && cd ..
echo "✅ Build completado"

# 2. Subir HTML (cache corto)
echo "🚀 Sincronizando HTML a S3..."
aws s3 sync "$DIST" "s3://$BUCKET/" \
  --delete \
  --include "*.html" \
  --exclude "assets/*" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "max-age=300, must-revalidate" \
  --region $REGION

# 3. Subir assets (cache largo — nombres hasheados por Vite)
echo "🚀 Sincronizando assets a S3..."
aws s3 sync "$DIST/assets" "s3://$BUCKET/assets/" \
  --cache-control "max-age=31536000, immutable" \
  --region $REGION

echo "✅ S3 sync completado"

echo "🔄 Invalidando CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $CF_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "✅ Invalidación: $INVALIDATION_ID"

echo ""
echo "🎉 Deploy completado!"
echo "🌐 https://d3iwx08z7q460o.cloudfront.net"
echo "⏳ Espera 1-2 min para ver los cambios"
