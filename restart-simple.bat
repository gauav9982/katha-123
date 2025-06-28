@echo off
echo === RESTART ALL APPLICATIONS ===
echo.

echo Killing all processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo Waiting...
timeout /t 3 /nobreak >nul

echo Starting applications...
start "Main Backend" cmd /k "cd backend && node index.cjs"
start "Main Frontend" cmd /k "cd frontend && npm run dev"
start "School Backend" cmd /k "cd school\backend && node index.cjs"
start "School Frontend" cmd /k "cd school\frontend && npm run dev"

echo.
echo === DONE ===
echo Main App: http://localhost:5173
echo School App: http://localhost:5180
echo.
pause 