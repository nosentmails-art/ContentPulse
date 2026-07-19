@echo off
setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%

cd /d C:\Users\handi\CascadeProjects\ContentPulse

echo.
echo Attempting to push database schema...
call npm run prisma:push

echo.
echo Running Prisma generation...
call npm run prisma:generate

echo.
echo Database setup complete!
