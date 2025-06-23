@echo off
chcp 65001 >nul
title Test Deployment Prerequisites

echo.
echo ========================================
echo   Test Deployment Prerequisites
echo ========================================
echo.

echo 🔍 Testing all requirements before deployment...
echo.

REM Run the PowerShell test script
powershell -ExecutionPolicy Bypass -File "%~dp0test-deployment.ps1"

REM Check if test was successful
if %errorlevel% equ 0 (
    echo.
    echo ✅ All tests passed! Ready for deployment.
    echo.
    echo 🚀 You can now run: deploy-both-applications.bat
    echo.
) else (
    echo.
    echo ❌ Some tests failed. Please fix the issues before deployment.
    echo.
)

echo Press any key to exit...
pause >nul 