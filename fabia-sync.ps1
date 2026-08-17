# Detecção automática de caminho (máquina pessoal D:\ ou notebook SESI C:\)
$BASE = if (Test-Path "D:\segundo-cerebro") { "D:\segundo-cerebro" } elseif (Test-Path "C:\segundo-cerebro") { "C:\segundo-cerebro" } else { "D:\segundo-cerebro" }
$LOG  = "$BASE\fabia-sync.log"

function Write-Log {
    param([string]$msg, [string]$color = "White")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Add-Content -Path $LOG -Value $line -Encoding UTF8
    Write-Host $line -ForegroundColor $color
}

Clear-Host
Write-Host "  FabIA Sync v5.0 - Segundo Cerebro JFX + Git Sync" -ForegroundColor Cyan
Write-Host "  Base: $BASE" -ForegroundColor Gray
Write-Host "  Pressione Ctrl+C para parar" -ForegroundColor Cyan
Write-Host ""

$ciclo = 0

while ($true) {
    $ciclo++
    Write-Host ""
    Write-Host "  === CICLO $ciclo - $(Get-Date -Format 'HH:mm:ss') ===" -ForegroundColor Yellow
    Write-Log "Iniciando ciclo $ciclo"

    Write-Host "  [1/4] Sincronizando mensagens de texto..." -ForegroundColor Cyan
    if (Test-Path "$BASE\sync-whatsapp.js") {
        try { & node "$BASE\sync-whatsapp.js"; Write-Log "Etapa 1 concluida" }
        catch { Write-Log "ERRO etapa 1: $_" }
    } else { Write-Log "AVISO: sync-whatsapp.js nao encontrado" }

    Write-Host "  [2/4] Sincronizando PDFs do WhatsApp..." -ForegroundColor Cyan
    if (Test-Path "$BASE\sync-pdfs-whatsapp.js") {
        try { & node "$BASE\sync-pdfs-whatsapp.js"; Write-Log "Etapa 2 concluida" }
        catch { Write-Log "ERRO etapa 2: $_" }
    } else { Write-Log "AVISO: sync-pdfs-whatsapp.js nao encontrado" }

    Write-Host "  [3/4] Indexando PDFs locais..." -ForegroundColor Cyan
    if (Test-Path "$BASE\index-pdfs-locais.js") {
        try { & node "$BASE\index-pdfs-locais.js"; Write-Log "Etapa 3 concluida" }
        catch { Write-Log "ERRO etapa 3: $_" }
    } else { Write-Log "AVISO: index-pdfs-locais.js nao encontrado" }

    Write-Host "  [4/4] Sincronizando com Git..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        Push-Location $BASE
        
        if (!(Test-Path ".git")) {
            Write-Log "AVISO etapa 4: Nao eh repositorio Git. Pulando." -Color Yellow
        } else {
            Write-Host "    → Puxando atualizacoes remotas..." -ForegroundColor Gray
            $pullOutput = git pull origin main --ff-only 2>&1
            
            Write-Host "    → Commitando mudancas locais..." -ForegroundColor Gray
            git add --all 2>&1 | Out-Null
            $commitOutput = git commit -m "Sync automatico $timestamp" -ErrorAction SilentlyContinue 2>&1
            
            Write-Host "    → Enviando para repositorio..." -ForegroundColor Gray
            $pushOutput = git push origin main 2>&1
            
            Write-Log "Etapa 4 concluida - Git sincronizado com sucesso" -Color Green
        }
        
        Pop-Location
    } catch {
        Write-Log "ERRO etapa 4: $_" -Color Yellow
        Pop-Location
    }

    Write-Host ""
    Write-Host "  Ciclo $ciclo concluido - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Log "Ciclo $ciclo concluido"

    for ($min = 30; $min -gt 0; $min--) {
        Write-Host "`r  Proximo ciclo em: $min minuto(s)...   " -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds 60
    }
    Write-Host ""
}
