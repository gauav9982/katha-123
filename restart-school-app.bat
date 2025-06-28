@echo off
echo ========================================
echo Restarting School Application Only
echo ========================================

echo.
echo 1. Killing processes on school ports...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. Starting School Backend (Port 4001)...
cd school\backend
start "School Backend" cmd /k "node index.cjs"
timeout /t 3 /nobreak >nul

echo.
echo 3. Starting School Frontend (Port 5180)...
cd ..\frontend
start "School Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo 4. Opening School Application...
timeout /t 5 /nobreak >nul
start http://localhost:5180

echo.
echo ========================================
echo School Application Restarted!
echo ========================================
echo Backend: http://localhost:4001
echo Frontend: http://localhost:5180
echo.
echo Press any key to exit...
pause >nul 