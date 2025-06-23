@echo off
echo ========================================
echo    Katha Sales + School - Deploy Both
echo ========================================
echo.

echo Running deployment script for both applications...
echo This will deploy both Main and School applications to server.
echo.

powershell -ExecutionPolicy Bypass -File "deploy-both-simple.ps1"

echo.
echo ========================================
echo    Deployment Process Finished
echo ========================================
echo.
echo Please check the output above for any errors.
echo If successful, your applications are live at:
echo Main App: http://168.231.122.33
echo School App: http://168.231.122.33/school
echo.
pause 