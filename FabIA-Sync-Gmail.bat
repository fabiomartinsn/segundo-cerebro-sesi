@echo off
setlocal enabledelayedexpansion
REM FabIA-Sync-Gmail.bat v2.0
REM Sincronização automática de PDFs do Gmail SESI a cada 60 minutos

title FabIA - Sync Gmail SESI
color 0B
cd /d D:\segundo-cerebro

REM Verificar se pasta base existe
if not exist "D:\segundo-cerebro" (
    echo [ERRO] Pasta D:\segundo-cerebro não existe!
    pause
    exit /b 1
)

REM Criar estrutura de pastas necessárias
if not exist "vault\_knowledge\sesi\email" (
    mkdir "vault\_knowledge\sesi\email"
    echo [%date% %time%] ✓ Pasta criada: vault\_knowledge\sesi\email
)

if not exist "logs" (
    mkdir "logs"
)

REM Inicializar variáveis
setlocal enabledelayedexpansion
set /a ciclo=0
set "LOGFILE=logs\FabIA-Gmail-Sync.log"

REM Registrar início
echo [%date% %time%] ========== INICIANDO FabIA-Gmail-Sync ========== >> "%LOGFILE%"
echo [%date% %time%] Gmail origem: fabiomartinsn@gmail.com >> "%LOGFILE%"
echo [%date% %time%] Pasta destino: vault\_knowledge\sesi\email >> "%LOGFILE%"

:loop
set /a ciclo+=1
cls
echo.
echo ============================================================
echo   FabIA - Sync Gmail SESI v2.0
echo ============================================================
echo   Ciclo: %ciclo%
echo   Gmail: fabiomartinsn@gmail.com
echo   Destino: vault\_knowledge\sesi\email
echo   Padrão: [SESI]_[Depto]_[Tipo]_YYYYMMDD.pdf
echo ============================================================
echo.
echo   Iniciando ciclo de sincronização...
echo.
echo [%date% %time%] Ciclo %ciclo% iniciado
echo.

REM ============================================================
REM ETAPA 1: Sincronização de PDFs via Gmail
REM ============================================================
echo [%date% %time%] [1/4] Sincronizando PDFs do Gmail fabiomartinsn@gmail.com
echo [%date% %time%] [1/4] Sincronizando PDFs do Gmail fabiomartinsn@gmail.com >> "%LOGFILE%"
echo.

claude -p "/sync-gmail"

echo.
echo [%date% %time%] [1/4] CONCLUÍDO - Sincronização Gmail
echo [%date% %time%] [1/4] CONCLUÍDO - Sincronização Gmail >> "%LOGFILE%"
echo.

REM ============================================================
REM ETAPA 2: Indexação de PDFs Locais
REM ============================================================
echo [%date% %time%] [2/4] Indexando PDFs locais...
echo [%date% %time%] [2/4] Indexando PDFs locais... >> "%LOGFILE%"

setlocal enabledelayedexpansion
set "contador=0"
for %%A in (vault\_knowledge\sesi\email\*.pdf vault\_knowledge\sesi\email\*.docx) do (
    set /a contador+=1
)

echo [%date% %time%] 📋 Índice: %contador% arquivos encontrados
echo [%date% %time%] 📋 Índice: %contador% arquivos encontrados >> "%LOGFILE%"
echo [%date% %time%] [2/4] CONCLUÍDO - Indexação
echo [%date% %time%] [2/4] CONCLUÍDO - Indexação >> "%LOGFILE%"
echo.

REM ============================================================
REM ETAPA 3: Sincronização com Git
REM ============================================================
echo [%date% %time%] [3/4] Sincronizando repositório Git...
echo [%date% %time%] [3/4] Sincronizando repositório Git... >> "%LOGFILE%"
echo.

powershell -ExecutionPolicy Bypass -File "D:\segundo-cerebro\fabia-sync.ps1" >> "%LOGFILE%" 2>&1

echo.
echo [%date% %time%] [3/4] CONCLUÍDO - Git sincronizado
echo [%date% %time%] [3/4] CONCLUÍDO - Git sincronizado >> "%LOGFILE%"
echo.

REM ============================================================
REM RESUMO DO CICLO
REM ============================================================
echo ============================================================
echo   CICLO %ciclo% CONCLUÍDO
echo ============================================================
echo   Data/Hora: %date% %time%
echo   Arquivos sincronizados: %contador%
echo.
echo   Próximo ciclo em: 60 minuto(s)
echo ============================================================
echo.
echo [%date% %time%] Ciclo %ciclo% COMPLETO - Aguardando 60 minutos >> "%LOGFILE%"
echo.

REM ============================================================
REM Aguardar 60 minutos (3600 segundos)
REM ============================================================
echo Pressione Ctrl+C para interromper ou aguarde...
echo.
timeout /t 3600 /nobreak

echo.
echo [%date% %time%] Iniciando Ciclo %ciclo%+1 >> "%LOGFILE%"
echo.

goto loop

pause > nul
