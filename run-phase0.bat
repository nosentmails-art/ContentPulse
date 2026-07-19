@echo off
REM Phase 0 Quick Start - Windows
REM This script automates Phase 0 setup and testing

echo.
echo ===============================================================
echo   CONTENTPULSE PHASE 0: GROQ VERIFICATION
echo ===============================================================
echo.

REM Step 1: Check prerequisites
echo 📋 Step 1: Checking prerequisites...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed
    echo    Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%A in ('node --version') do set NODE_VERSION=%%A
for /f "tokens=*" %%A in ('npm --version') do set NPM_VERSION=%%A

echo ✅ Node.js: %NODE_VERSION%
echo ✅ npm: %NPM_VERSION%
echo.

REM Step 2: Check GROQ_API_KEY
echo 📋 Step 2: Checking Groq API key...
echo.

if not "%GROQ_API_KEY%"=="" (
    echo ✅ GROQ_API_KEY detected in environment
) else (
    findstr /i "GROQ_API_KEY" .env.local >nul 2>nul
    if %errorlevel% equ 0 (
        echo ✅ GROQ_API_KEY found in .env.local
    ) else (
        echo ❌ ERROR: GROQ_API_KEY not found
        echo.
        echo    To setup Groq API key:
        echo    1. Visit https://console.groq.com
        echo    2. Create or sign into your account
        echo    3. Create an API key
        echo    4. Run: node setup-phase0-env.js
        echo    5. Or manually add to .env.local:
        echo       GROQ_API_KEY=your-key-here
        echo       GROQ_MODEL=llama-3.3-70b-versatile
        echo       DATABASE_URL="file:./prisma/dev.db"
        pause
        exit /b 1
    )
)
echo.

REM Step 3: Check database
echo 📋 Step 3: Checking database...
echo.

if exist "prisma\dev.db" (
    for /f %%A in ('powershell -Command "(Get-Item prisma\dev.db).Length"') do set DB_SIZE=%%A
    echo ✅ Database found: %DB_SIZE% bytes
) else (
    echo ⚠️  Database not found at prisma\dev.db
    echo    The system will create it on first run
)
echo.

REM Step 4: Start dev server
echo 📋 Step 4: Starting dev server...
echo.
echo    Command: npm run dev
echo.

start "ContentPulse Dev Server" npm run dev
set SERVER_STARTED=1

echo    Process started in new window
echo.

REM Step 5: Wait for server
echo    ⏳ Waiting for server to start...
echo    (Check the new window for "ready on http://localhost:3000")
echo.
echo    Press any key when server is ready...
pause

REM Step 6: Run Phase 0 test
echo 📋 Step 5: Running Phase 0 test...
echo.
echo    Command: node test-phase0-groq.js
echo.

call node test-phase0-groq.js
set TEST_EXIT=%errorlevel%

echo.
echo ===============================================================
if %TEST_EXIT% equ 0 (
    echo   ✅ PHASE 0 COMPLETE
) else (
    echo   ❌ PHASE 0 INCOMPLETE - Check logs above
)
echo ===============================================================
echo.

pause
exit /b %TEST_EXIT%
