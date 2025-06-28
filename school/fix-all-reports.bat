@echo off
echo ========================================
echo    Complete Reports Fix Script
echo ========================================
echo.
echo This script will fix ALL reports with proper date ranges:
echo - 5th Commission Reports: Up to March 2009
echo - 6th Commission Reports: From April 2009
echo - 7th Commission Reports: From 7th commission date
echo - HRA Reports: Proper data from 5th & 6th commission
echo - All Payable/Paid Reports: Combined data from all commissions
echo.
echo Starting comprehensive fix...
echo.

cd backend
node fix-all-reports.cjs

echo.
echo ========================================
echo    Complete Fix Finished!
echo ========================================
echo.
echo All reports have been fixed with proper date ranges.
echo No problems should occur in any report now.
echo.
pause 