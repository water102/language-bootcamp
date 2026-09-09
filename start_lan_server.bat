@echo off
chcp 65001 > nul
title English C1 Bootcamp — LAN Web Server
echo ==================================================================
echo   ENGLISH C1 BOOTCAMP — 120 DAYS
echo   Khoi dong Web Server ho tro truy cap tu Mang Noi Bo (LAN)
echo ==================================================================
echo.

cd /d "%~dp0"
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Can cai Node.js 22.12+ de chay ung dung Vite.
    pause
    exit /b 1
)

if not exist node_modules (
    call npm ci
    if errorlevel 1 exit /b 1
)
call npm run build
if errorlevel 1 exit /b 1
call npm run preview
pause
