@echo off
echo === APPLICATION TEST SCRIPT ===
echo.

echo 1. Testing Port Status...
echo.

echo Checking port 4000 (Main Backend)...
netstat -ano | findstr ":4000" >nul
if %errorlevel% equ 0 (
    echo ✓ Port 4000 is running
) else (
    echo ✗ Port 4000 is NOT running
)

echo Checking port 4001 (School Backend)...
netstat -ano | findstr ":4001" >nul
if %errorlevel% equ 0 (
    echo ✓ Port 4001 is running
) else (
    echo ✗ Port 4001 is NOT running
)

echo Checking port 5173 (Main Frontend)...
netstat -ano | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo ✓ Port 5173 is running
) else (
    echo ✗ Port 5173 is NOT running
)

echo Checking port 5180 (School Frontend)...
netstat -ano | findstr ":5180" >nul
if %errorlevel% equ 0 (
    echo ✓ Port 5180 is running
) else (
    echo ✗ Port 5180 is NOT running
)

echo.
echo === APPLICATION LINKS ===
echo Main Application: http://localhost:5173
echo School Application: http://localhost:5180
echo Main API: http://localhost:4000
echo School API: http://localhost:4001

echo.
echo === TESTING INSTRUCTIONS ===
echo 1. Main App: Test Reports menu and other features
echo 2. School App: Login with any city, test reports section
echo 3. Test Report: http://localhost:5180/test-report
echo 4. Simple Test Report: http://localhost:5180/simple-test-report
echo 5. If any issues, check browser console for errors

echo.
echo Test completed. Press any key to exit...
pause 