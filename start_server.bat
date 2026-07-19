@echo off
setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%

cd /d C:\Users\handi\CascadeProjects\ContentPulse

echo.
echo Starting ContentPulse development server...
call npm run dev
