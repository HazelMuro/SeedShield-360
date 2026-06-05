@echo off
setlocal
title SeedShield 360 - First-time Setup

echo.
echo ==========================================
echo SeedShield 360 - First-time Setup
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please reinstall Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

echo Installing project dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo Generating Prisma client...
call npx prisma generate
if errorlevel 1 goto error

echo.
echo Creating or updating the local database...
call npx prisma migrate dev
if errorlevel 1 goto error

echo.
echo Loading operational scenario records...
call npx prisma db seed
if errorlevel 1 goto error

echo.
echo ==========================================
echo Setup complete.
echo You can now double-click start-windows.bat.
echo ==========================================
echo.
pause
exit /b 0

:error
echo.
echo ==========================================
echo Setup failed. Review the error above.
echo ==========================================
echo.
pause
exit /b 1
