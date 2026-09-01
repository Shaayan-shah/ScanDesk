@echo off
title ScanDesk - Private Offline QR & Barcode Suite
echo ========================================================
echo        Starting ScanDesk - Private Scanner Suite
echo ========================================================
echo.
echo [*] Checking dependencies...
if not exist node_modules (
    echo [*] Installing dependencies for first-time setup...
    call npm install --no-audit --no-fund
)
echo [*] Launching ScanDesk local development server...
start http://localhost:5173
call npm run dev
pause
