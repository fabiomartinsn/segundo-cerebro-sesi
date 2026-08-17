# ============================================================
#  Migração segundo-cerebro: C: -> D: via NTFS Junction (Opção B) — v2
#  Corrige o v1: evita Get-ChildItem -Recurse (trava em paths longos
#  dentro de Tools\MiroFish\backend\.venv\Lib\site-packages\...)
#  Gerado por FabIA — REVISAR antes de executar
#
#  Diferenças da v1:
#   - Limpeza de node_modules/__pycache__ agora usa uma lista FIXA de
#     caminhos conhecidos (sem varrer a árvore inteira) — não entra em
#     .venv, não trava.
#   - Validação da cópia usa o resumo do próprio robocopy (que lida bem
#     com paths longos) em vez de Get-ChildItem -Recurse.
#   - Remoção da origem usa "cmd /c rd /s /q" (mais tolerante a paths
#     longos que Remove-Item).
#
#  Requisitos:
#   - NÃO precisa rodar como Administrador
#   - Feche antes: VS Code, terminais, Claude Code CLI ou Explorer com
#     a pasta C:\Users\fabio\Documents\segundo-cerebro aberta
#
#  Como rodar:
#   powershell -ExecutionPolicy Bypass -File .\migrar-segundo-cerebro-para-D-v2.ps1
# ============================================================

$origem       = "C:\Users\fabio\Documents\segundo-cerebro"
$destino      = "D:\segundo-cerebro"
$dataHoje     = Get-Date -Format "yyyyMMdd-HHmmss"
$backupAntigo = "D:\segundo-cerebro-backup-obsoleto-$dataHoje"
$logRobocopy  = "$env:TEMP\robocopy-migracao-segundo-cerebro.log"

Write-Host "=== 1/6 - Verificando pre-condicoes ===" -ForegroundColor Cyan

if (-not (Test-Path $origem)) {
    Write-Error "Pasta de origem nao encontrada: $origem"
    exit 1
}

$itemOrigem = Get-Item $origem
if ($itemOrigem.LinkType) {
    Write-Host "$origem ja e um link/junction ($($itemOrigem.LinkType)). Nada a fazer." -ForegroundColor Yellow
    exit 0
}

# --- Limpeza opcional e SEGURA: so pastas conhecidas, sem varredura profunda ---
Write-Host ""
Write-Host "Pastas regeneraveis conhecidas (evita entrar em .venv/site-packages - e o que travou antes)." -ForegroundColor Yellow
$candidatosLimpeza = @(
    (Join-Path $origem "node_modules"),
    (Join-Path $origem "__pycache__"),
    (Join-Path $origem "Tools\MiroFish\frontend\node_modules"),
    (Join-Path $origem "Tools\MiroFish\backend\node_modules")
)
$existentes = $candidatosLimpeza | Where-Object { Test-Path $_ }
if ($existentes) {
    Write-Host "Encontradas:"
    $existentes | ForEach-Object { Write-Host "  - $_" }
    $limpar = Read-Host "Excluir estas pastas antes de migrar? (recomendado, regeneraveis via npm/pip) [S/N]"
    if ($limpar -match '^[Ss]') {
        foreach ($pasta in $existentes) {
            Write-Host "Removendo: $pasta"
            cmd /c rd /s /q "$pasta" 2>$null
        }
    }
} else {
    Write-Host "Nenhuma encontrada nos caminhos conhecidos (ja foram removidas em tentativa anterior)."
}
Write-Host "Nota: Tools\MiroFish\backend\.venv NAO foi tocado (ambiente Python)." -ForegroundColor Yellow

Write-Host ""
Write-Host "=== 2/6 - Preservando copia obsoleta existente em D: ===" -ForegroundColor Cyan
if (Test-Path $destino) {
    Write-Host "Renomeando $destino para backup: $backupAntigo"
    Rename-Item -Path $destino -NewName (Split-Path $backupAntigo -Leaf)
} else {
    Write-Host "Nenhuma copia existente em $destino."
}

Write-Host ""
Write-Host "=== 3/6 - Copiando dados de C: para D: (robocopy) ===" -ForegroundColor Cyan
robocopy $origem $destino /E /COPY:DAT /R:2 /W:5 /MT:8 /NFL /NDL /NP /LOG:$logRobocopy /TEE
$roboExit = $LASTEXITCODE

Write-Host ""
Write-Host "=== 4/6 - Validando (resumo robocopy) ===" -ForegroundColor Cyan
if ($roboExit -ge 8) {
    Write-Host "ERRO: Robocopy retornou codigo $roboExit (falha real)." -ForegroundColor Red
    Write-Host "ABORTANDO - origem em C: NAO foi tocada. Log completo: $logRobocopy" -ForegroundColor Red
    exit 1
}

$resumo = Get-Content $logRobocopy | Select-String "^\s*Files\s*:"
Write-Host $resumo
$prosseguir = $true
if ($resumo -match "Files\s*:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)") {
    $failed = [int]$Matches[4]
    if ($failed -gt 0) {
        Write-Host "ERRO: $failed arquivo(s) com FALHA no robocopy." -ForegroundColor Red
        Write-Host "ABORTANDO - origem em C: NAO foi tocada. Verifique o log: $logRobocopy" -ForegroundColor Red
        exit 1
    }
    Write-Host "Copia validada (0 falhas reportadas pelo robocopy)." -ForegroundColor Green
} else {
    Write-Host "Nao consegui interpretar automaticamente o resumo do robocopy." -ForegroundColor Yellow
    Write-Host "Confira manualmente o log: $logRobocopy"
    $seguir = Read-Host "Deseja prosseguir mesmo assim? [S/N]"
    if ($seguir -notmatch '^[Ss]') { exit 0 }
}

Write-Host ""
Write-Host "=== 5/6 - Removendo pasta original em C: e criando junction ===" -ForegroundColor Cyan
$confirmar = Read-Host "Confirma remocao de '$origem' (ja copiado/validado em D:) e criacao do junction? [S/N]"
if ($confirmar -notmatch '^[Ss]') {
    Write-Host "Cancelado. Dados permanecem duplicados em C: e D:." -ForegroundColor Yellow
    exit 0
}

cmd /c rd /s /q "$origem"
if (Test-Path $origem) {
    Write-Host "ERRO: nao consegui remover $origem por completo (arquivo travado/em uso?)." -ForegroundColor Red
    Write-Host "Feche qualquer programa/terminal com essa pasta aberta e rode o script de novo." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Junction -Path $origem -Target $destino | Out-Null

Write-Host ""
Write-Host "=== 6/6 - Verificacao final ===" -ForegroundColor Cyan
Get-Item $origem | Select-Object FullName, LinkType, Target
Write-Host "Concluido: $origem agora e um junction apontando para $destino" -ForegroundColor Green
