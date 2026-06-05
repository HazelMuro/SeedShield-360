@echo off
setlocal
title SeedShield 360 - Build Check

echo.
echo ==========================================
echo SeedShield 360 - Production Build Check
echo ==========================================
echo.

call npm run build

echo.
echo Build check finished. Review any messages above.
echo.
pause
