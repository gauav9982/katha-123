@echo off
echo === KATHA & SCHOOL APPLICATIONS RESTART SCRIPT ===
echo.

echo Step 1: Killing all existing processes...
echo.

echo Killing processes on port 4000 (Main Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Killing processes on port 4001 (School Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4001"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Killing processes on port 5173 (Main Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Killing processes on port 5180 (School Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5180"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Killing all node.exe processes...
taskkill /f /im node.exe >nul 2>&1

echo Killing all npm.exe processes...
taskkill /f /im npm.exe >nul 2>&1

echo.
echo Step 2: Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo.
echo Step 3: Starting all applications...
echo.

echo Starting Main Backend (http://localhost:4000)...
start "Main Backend" cmd /k "cd backend && node index.cjs"

echo Starting Main Frontend (http://localhost:5173)...
start "Main Frontend" cmd /k "cd frontend && npm run dev"

echo Starting School Backend (http://localhost:4001)...
start "School Backend" cmd /k "cd school\backend && node index.cjs"

echo Starting School Frontend (http://localhost:5180)...
start "School Frontend" cmd /k "cd school\frontend && npm run dev"

echo.
echo === RESTART COMPLETE ===
echo All applications are starting in new windows!
echo.
echo Applications will be accessible at:
echo Main App: http://localhost:5173
echo School App: http://localhost:5180
echo Main API: http://localhost:4000
echo School API: http://localhost:4001
echo.
echo Please wait 15-20 seconds for all servers to start.
echo.
echo IMPORTANT NOTES:
echo 1. React Router warnings in console are normal and can be ignored.
echo 2. If applications don't load, check the command windows for error messages.
echo 3. Reports should work properly in both applications.
echo.
pause 