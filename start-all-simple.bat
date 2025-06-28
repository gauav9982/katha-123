@echo off
echo === KATHA & SCHOOL APPLICATIONS STARTUP SCRIPT (SIMPLE) ===
echo Starting All Apps...

echo Step 1: Killing existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo Step 2: Waiting for processes to close...
timeout /t 5 /nobreak >nul

echo Step 3: Starting Main Backend (http://localhost:4000)...
start "Main Backend" cmd /k "cd backend && node index.cjs"

echo Step 4: Starting Main Frontend (http://localhost:5173)...
start "Main Frontend" cmd /k "cd frontend && npm run dev"

echo Step 5: Starting School Backend (http://localhost:4001)...
start "School Backend" cmd /k "cd school\backend && node index.cjs"

echo Step 6: Starting School Frontend (http://localhost:5180)...
start "School Frontend" cmd /k "cd school\frontend && npm run dev"

echo.
echo === STARTUP COMPLETE ===
echo All servers are starting in new windows!
echo.
echo Applications will be accessible at:
echo Main App: http://localhost:5173
echo School App: http://localhost:5180
echo.
echo Please wait 15-20 seconds for all servers to start.
echo.
echo IMPORTANT NOTES:
echo 1. React Router warnings in console are normal and can be ignored.
echo 2. If applications don't load, check the command windows for error messages.
echo 3. Reports should work properly in both applications.
echo.
pause 