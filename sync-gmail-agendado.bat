@echo off
cd /d D:\segundo-cerebro
set LOGFILE=D:\segundo-cerebro\vault\Email\sync-gmail.log
echo. >> "%LOGFILE%"
echo === %date% %time% === >> "%LOGFILE%"
claude -p "/sync-gmail" >> "%LOGFILE%" 2>&1
