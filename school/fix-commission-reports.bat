@echo off
echo ========================================
echo    Commission Reports Fix Script
echo ========================================
echo.
echo This script will fix all commission reports:
echo - 5th Commission: Up to March 2009
echo - 6th Commission: From April 2009
echo.
echo Starting fix...
echo.

cd backend
node fix-commission-reports.cjs

echo.
echo ========================================
echo    Fix Complete!
echo ========================================
echo.
pause 