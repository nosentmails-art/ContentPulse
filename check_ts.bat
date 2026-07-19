@echo off
setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%

cd /d C:\Users\handi\CascadeProjects\ContentPulse

echo.
echo Running TypeScript check...
call npx tsc --noEmit

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ TypeScript check PASSED - 0 errors
  exit /b 0
) else (
  echo.
  echo ❌ TypeScript check FAILED
  exit /b 1
)
