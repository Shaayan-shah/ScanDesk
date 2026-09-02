@echo off
title ScanDesk Pro - Mobile & Cross-Platform Suite
echo ========================================================
echo        Starting ScanDesk Pro - Interactive Suite
echo ========================================================
echo.
echo [*] Launching local app...
start http://localhost:5173
call npm run dev
pause
