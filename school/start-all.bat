@echo off
echo Starting School Salary Management System...
echo.

echo Starting Backend Server...
start "School Backend" cmd /k "cd backend && npm start"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "School Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All servers are starting...
echo Backend: http://localhost:4007
echo Frontend: http://localhost:5179
echo.
echo Press any key to close this window...
pause > nul 