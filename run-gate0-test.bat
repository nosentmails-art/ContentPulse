@echo off
REM Gate 0 Test Runner for Windows
REM Starts dev server with correct DATABASE_URL, then tests endpoints

echo.
echo 🚀 Starting Gate 0 Test Sequence
echo.

echo 📦 Starting Next.js dev server...
echo    Using DATABASE_URL=file:./prisma/prisma/dev.db
echo.

REM Start dev server in a new window
start "ContentPulse Dev Server" cmd /k "set DATABASE_URL=file:./prisma/prisma/dev.db && npm run dev"

echo    Dev server started in new window
echo    Waiting 5 seconds for server to be ready...
echo.

timeout /t 5 /nobreak

echo 🧪 Running endpoint tests...
echo.

REM Run test script
node test-gate0.js
set TEST_RESULT=%ERRORLEVEL%

echo.
echo ✅ Test complete. Check the dev server window for more details.
echo.

exit /b %TEST_RESULT%
