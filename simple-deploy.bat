@echo off
echo ========================================
echo    Katha Sales - Quick Deploy
echo ========================================
echo.

echo Running the updated deployment script...
powershell -ExecutionPolicy Bypass -File "quick-deploy.ps1"

echo.
echo ========================================
echo    Deployment Process Finished
echo ========================================
echo.
echo Please check the output above for any errors.
echo If successful, your application is live at:
echo http://154.26.138.134
echo.
pause 