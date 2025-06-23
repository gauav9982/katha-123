@echo off
echo ========================================
echo    Start All Applications Locally
echo ========================================
echo.

echo Starting both Main and School applications...
powershell -ExecutionPolicy Bypass -File "start-all.ps1"

echo.
echo ========================================
echo    Applications Started!
echo ========================================
echo.
echo Main Application: http://localhost:5173
echo School Application: http://localhost:5179
echo.
pause 