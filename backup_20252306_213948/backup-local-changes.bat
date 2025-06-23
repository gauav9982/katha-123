@echo off
echo ========================================
echo    Backup Local Changes - Katha Apps
echo ========================================
echo.

REM Create timestamp for backup folder name
set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

echo.
echo Copying main application files...
xcopy "frontend" "%BACKUP_DIR%\frontend\" /E /I /Y /Q
xcopy "backend" "%BACKUP_DIR%\backend\" /E /I /Y /Q
xcopy "database" "%BACKUP_DIR%\database\" /E /I /Y /Q

echo Copying school application files...
xcopy "school" "%BACKUP_DIR%\school\" /E /I /Y /Q

echo Copying configuration files...
copy "package.json" "%BACKUP_DIR%\" >nul
copy "package-lock.json" "%BACKUP_DIR%\" >nul
copy "README.md" "%BACKUP_DIR%\" >nul
copy "ecosystem.config.cjs" "%BACKUP_DIR%\" >nul

echo Copying deployment scripts...
copy "*.bat" "%BACKUP_DIR%\" >nul
copy "*.ps1" "%BACKUP_DIR%\" >nul

echo.
echo ========================================
echo    Backup Completed Successfully!
echo ========================================
echo.
echo Backup location: %BACKUP_DIR%
echo.
echo Files backed up:
echo - Main Application (frontend, backend, database)
echo - School Application (complete folder)
echo - Configuration files (package.json, etc.)
echo - Deployment scripts
echo.
echo You can now safely deploy your applications.
echo If anything goes wrong, you can restore from this backup.
echo.
pause 