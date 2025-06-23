@echo off
echo 🚀 Starting Katha Sales Deployment...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "quick-deploy.ps1"

echo.
echo Press any key to exit...
pause >nul 