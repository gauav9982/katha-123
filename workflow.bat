@echo off
echo 🚀 Katha Sales - Quick Workflow
echo.

echo 📊 Current Status:
git status --porcelain
echo.

echo 🌿 Current Branch:
git branch --show-current
echo.

echo 🔧 Choose an action:
echo 1. Start New Feature
echo 2. Save Changes
echo 3. Go to Main
echo 4. Deploy to Server
echo 5. Emergency Reset
echo.

set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo 🌱 Creating new feature branch...
    set /p feature="Enter feature name: "
    git checkout main
    git pull
    git checkout -b %feature%
    echo ✅ New branch created!
)

if "%choice%"=="2" (
    echo 💾 Saving changes...
    git add .
    set /p msg="Enter commit message: "
    git commit -m "%msg%"
    echo ✅ Changes saved!
)

if "%choice%"=="3" (
    echo 🔄 Going to main branch...
    git checkout main
    git pull
    echo ✅ Switched to main!
)

if "%choice%"=="4" (
    echo 🚀 Deploying to server...
    echo ⚠️  Make sure you've tested locally first!
    set /p confirm="Are you sure? (y/n): "
    if "%confirm%"=="y" (
        powershell -ExecutionPolicy Bypass -File deploy-secure.ps1
    ) else (
        echo ❌ Deployment cancelled
    )
)

if "%choice%"=="5" (
    echo 🚨 Emergency Reset:
    echo a) Reset to last commit
    echo b) Reset to main
    set /p reset="Choose (a/b): "
    if "%reset%"=="a" (
        git reset --hard HEAD~1
        echo ✅ Reset to last commit!
    )
    if "%reset%"=="b" (
        git reset --hard origin/main
        echo ✅ Reset to main!
    )
)

echo.
echo ✨ Done!
pause 