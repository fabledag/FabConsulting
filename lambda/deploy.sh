#!/bin/bash
# ============================================================
# Deploy script — Fabiola Ledesma API (Lambda)
# Ejecutar desde el directorio raíz del proyecto o desde lambda/
# ============================================================
set -e

FUNCTION_NAME="fabiola-ledesma-api"
REGION="us-east-1"

cd "$(dirname "$0")/api"

echo "📦 Instalando dependencias de producción..."
npm install --omit=dev

echo "🗜  Empaquetando..."
rm -f ../api.zip
npm run package

echo "🚀 Subiendo código a Lambda ($FUNCTION_NAME)..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file fileb://../api.zip \
  --region "$REGION" \
  --query '{FunctionName:FunctionName,LastModified:LastModified,State:State}' \
  --output json

echo "✅ Deploy del Lambda completado."
