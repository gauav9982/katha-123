@echo off
echo Starting School Application...
echo.

echo Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Starting School Backend...
cd school\backend
start "School Backend" cmd /k "node index.cjs"

echo.
echo Starting School Frontend...
cd ..\frontend
start "School Frontend" cmd /k "npm run dev"

echo.
echo School Application is starting...
echo Backend will be available at: http://localhost:4009
echo Frontend will be available at: http://localhost:5179
echo.
echo Please wait a few seconds for the servers to start...
echo Then open: http://localhost:5179
echo.
pause 