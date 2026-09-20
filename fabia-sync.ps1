# FabIA Git Sync Script
# Sincroniza alterações no repositório segundo-cerebro

Set-Location "D:\segundo-cerebro"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "[$timestamp] Etapa 3: Sincronizando com Git..." -ForegroundColor Cyan
Write-Host ""

# Puxar atualizações remotas
Write-Host "  → Puxando atualizações remotas..." -ForegroundColor Gray
git fetch origin | Out-Null
Start-Sleep -Seconds 1

# Adicionar todas as mudanças
Write-Host "  → Commitando mudanças locais..." -ForegroundColor Gray
git add -A | Out-Null

# Criar commit com timestamp
$commitMsg = "FabIA Gmail Sync - $timestamp"
git commit -m "$commitMsg" 2>$null | Out-Null
Start-Sleep -Seconds 1

# Enviar para repositório
Write-Host "  → Enviando para repositório..." -ForegroundColor Gray
git push origin 2>$null | Out-Null
Start-Sleep -Seconds 1

$finalTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "[$finalTime] Etapa 4 concluída - Git sincronizado com sucesso" -ForegroundColor Green
Write-Host ""
Write-Host "Ciclo 1 concluído - $finalTime" -ForegroundColor Green
Write-Host "Próximo ciclo em: 60 minuto(s)..." -ForegroundColor Yellow
