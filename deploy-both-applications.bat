@echo off
chcp 65001 >nul
title Katha Sales and School Applications - Complete Deployment

echo.
echo ========================================
echo   Katha Sales and School Applications
echo   Complete Deployment Script
echo ========================================
echo.

echo Starting deployment process...
echo.

REM Run the PowerShell deployment script
powershell -ExecutionPolicy Bypass -File "%~dp0deploy-both-applications.ps1"

REM Check if deployment was successful
if %errorlevel% equ 0 (
    echo.
    echo Deployment completed successfully!
    echo.
    echo Applications are now live at:
    echo    Katha Sales: http://kathasales.com
    echo    School App: http://school.kathasales.com
    echo.
) else (
    echo.
    echo Deployment failed with error code: %errorlevel%
    echo Please check the error messages above and try again.
    echo.
)

echo Press any key to exit...
pause >nul 