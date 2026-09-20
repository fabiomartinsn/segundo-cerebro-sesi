@echo off
title FabIA — Sync Gmail SESI
cd /d D:\segundo-cerebro
echo.
echo  ==========================================
echo   FabIA - Sync Gmail SESI
echo   %date% %time%
echo  ==========================================
echo.
claude -p "/sync-gmail"
echo.
echo  ==========================================
echo   Sync concluido. Pressione qualquer tecla.
echo  ==========================================
pause > nul
