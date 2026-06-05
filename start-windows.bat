@echo off
setlocal
title SeedShield 360 - Offline Local Start

echo.
echo ==========================================
echo SeedShield 360 - Offline Local Start
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

echo Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
  echo.
  echo Prisma generate failed. Review the error above.
  echo.
  pause
  exit /b 1
)

echo.
echo Opening SeedShield 360 at http://localhost:3005 ...
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 6; Start-Process 'http://localhost:3005'"

echo.
echo Starting local server on port 3005.
echo Keep this black command window open while using the system.
echo Close this window to stop the app.
echo.
call npm run dev

echo.
echo SeedShield 360 has stopped.
pause
