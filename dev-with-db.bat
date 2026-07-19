@echo off
setlocal enabledelayedexpansion
set DATABASE_URL=file:./prisma/prisma/dev.db
set NODE_PATH=C:\Program Files\nodejs
set PATH=%NODE_PATH%;%PATH%

echo Starting dev server with DATABASE_URL=file:./prisma/prisma/dev.db
echo PATH: %PATH%

%NODE_PATH%\node.exe %NODE_PATH%\node_modules\npm\bin\npm-cli.js run dev
