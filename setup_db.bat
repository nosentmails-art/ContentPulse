@echo off
setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%

cd /d C:\Users\handi\CascadeProjects\ContentPulse

echo.
echo Installing dependencies...
call npm install

echo.
echo Running Prisma migration...
call npm run prisma:migrate -- --name init

echo.
echo Generating Prisma client...
call npm run prisma:generate

echo.
echo Seeding database...
call npm run seed

echo.
echo Database setup complete!
pause
