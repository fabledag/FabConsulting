# ============================================================
# Deploy script — Fabiola Ledesma Website
# Ejecutar desde PowerShell en la carpeta FabLedesma/
# Requiere: AWS CLI configurado con credenciales
# ============================================================

$SRC     = ".\src"
$BUCKET  = "fabiolaledesma-website"
$CF_ID   = "E18GECI52IMNB3"
$REGION  = "us-east-1"
$CF_FUNC = "arn:aws:cloudfront::975050366655:function/fabiola-path-rewrite"

Write-Host "🚀 Iniciando deploy a S3..." -ForegroundColor Cyan

# 1. Subir archivos HTML con cache corto
aws s3 sync "$SRC" "s3://$BUCKET/" `
  --delete `
  --exclude "node_modules/*" `
  --include "*.html" `
  --content-type "text/html; charset=utf-8" `
  --cache-control "max-age=300, must-revalidate" `
  --region $REGION

# 2. Subir CSS/JS con cache largo
aws s3 sync "$SRC" "s3://$BUCKET/" `
  --delete `
  --exclude "node_modules/*" `
  --exclude "*.html" `
  --cache-control "max-age=86400" `
  --region $REGION

Write-Host "✅ S3 sync completado" -ForegroundColor Green

# 3. Invalidar cache de CloudFront
Write-Host "🔄 Invalidando CloudFront cache..." -ForegroundColor Cyan
$INVALIDATION = aws cloudfront create-invalidation `
  --distribution-id $CF_ID `
  --paths "/*" `
  --output json | ConvertFrom-Json

Write-Host "✅ Invalidación creada: $($INVALIDATION.Invalidation.Id)" -ForegroundColor Green

# 4. Verificar/Asociar CloudFront Function (path rewrite para /blog/ y /admin/)
Write-Host "🔗 Verificando CloudFront Function..." -ForegroundColor Cyan
$CONFIG = aws cloudfront get-distribution-config --id $CF_ID --output json | ConvertFrom-Json
$ETAG   = (aws cloudfront get-distribution-config --id $CF_ID --output text --query 'ETag')

$funcAssocs = $CONFIG.DistributionConfig.DefaultCacheBehavior.FunctionAssociations
if ($funcAssocs -eq $null -or $funcAssocs.Quantity -eq 0) {
    Write-Host "⚙️  Asociando CloudFront Function..." -ForegroundColor Yellow
    $CONFIG.DistributionConfig.DefaultCacheBehavior.FunctionAssociations = @{
        Quantity = 1
        Items = @(@{
            FunctionARN = $CF_FUNC
            EventType   = "viewer-request"
        })
    }
    $tmpConfig = $CONFIG.DistributionConfig | ConvertTo-Json -Depth 20
    $tmpConfig | Out-File -FilePath ".\infra\cf-deploy-config.json" -Encoding utf8

    aws cloudfront update-distribution `
      --id $CF_ID `
      --distribution-config "file://infra/cf-deploy-config.json" `
      --if-match $ETAG

    Write-Host "✅ CloudFront Function asociada" -ForegroundColor Green
} else {
    Write-Host "✅ CloudFront Function ya está asociada" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deploy completado!" -ForegroundColor Green
Write-Host "🌐 URL: https://d3iwx08z7q460o.cloudfront.net" -ForegroundColor Cyan
Write-Host "⏳ CloudFront puede tardar 1-2 min en propagar el nuevo diseño" -ForegroundColor Yellow
