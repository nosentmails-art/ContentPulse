@echo off
setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%

cd /d C:\Users\handi\CascadeProjects\ContentPulse

echo.
echo Installing dependencies...
call npm install

echo.
echo Installation complete!
echo.
pause
