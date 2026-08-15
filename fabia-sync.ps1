$BASE = "D:\segundo-cerebro"
$LOG  = "$BASE\fabia-sync.log"

function Write-Log {
    param([string]$msg, [string]$color = "White")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Add-Content -Path $LOG -Value $line -Encoding UTF8
    Write-Host $line -ForegroundColor $color
}

Clear-Host
Write-Host "  FabIA Sync v4.0 - Segundo Cerebro JFX" -ForegroundColor Cyan
Write-Host "  Pressione Ctrl+C para parar" -ForegroundColor Cyan
Write-Host ""

$ciclo = 0

while ($true) {
    $ciclo++
    Write-Host ""
    Write-Host "  === CICLO $ciclo - $(Get-Date -Format 'HH:mm:ss') ===" -ForegroundColor Yellow
    Write-Log "Iniciando ciclo $ciclo"

    Write-Host "  [1/3] Sincronizando mensagens de texto..." -ForegroundColor Cyan
    if (Test-Path "$BASE\sync-whatsapp.js") {
        try { & node "$BASE\sync-whatsapp.js"; Write-Log "Etapa 1 concluida" }
        catch { Write-Log "ERRO etapa 1: $_" }
    } else { Write-Log "AVISO: sync-whatsapp.js nao encontrado" }

    Write-Host "  [2/3] Sincronizando PDFs do WhatsApp..." -ForegroundColor Cyan
    if (Test-Path "$BASE\sync-pdfs-whatsapp.js") {
        try { & node "$BASE\sync-pdfs-whatsapp.js"; Write-Log "Etapa 2 concluida" }
        catch { Write-Log "ERRO etapa 2: $_" }
    } else { Write-Log "AVISO: sync-pdfs-whatsapp.js nao encontrado" }

    Write-Host "  [3/3] Indexando PDFs locais..." -ForegroundColor Cyan
    if (Test-Path "$BASE\index-pdfs-locais.js") {
        try { & node "$BASE\index-pdfs-locais.js"; Write-Log "Etapa 3 concluida" }
        catch { Write-Log "ERRO etapa 3: $_" }
    } else { Write-Log "AVISO: index-pdfs-locais.js nao encontrado" }

    Write-Host ""
    Write-Host "  Ciclo $ciclo concluido - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Log "Ciclo $ciclo concluido"

    for ($min = 30; $min -gt 0; $min--) {
        Write-Host "`r  Proximo ciclo em: $min minuto(s)...   " -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds 60
    }
    Write-Host ""
}
