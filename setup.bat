@echo off
REM ContentPulse Development Server Launcher

setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%

echo.
echo 🚀 Starting ContentPulse Development Server
echo ========================================
echo.

npm run dev
