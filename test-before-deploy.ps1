# Test Before Deploy Script
# આ script તમારા changes test કરશે deployment પહેલા

Write-Host "🧪 Testing Katha Sales Application..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check Git status
Write-Host "📊 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "❌ Test cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Git status is clean" -ForegroundColor Green
}

# Test Backend
Write-Host ""
Write-Host "🔧 Testing Backend..." -ForegroundColor Yellow
cd backend

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Test database connection
Write-Host "🗄️  Testing database connection..." -ForegroundColor Yellow
try {
    node -e "
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./database/katha_sales.db');
    db.get('SELECT 1 as test', (err, row) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            process.exit(1);
        } else {
            console.log('✅ Database connection successful');
            process.exit(0);
        }
    });
    "
    Write-Host "✅ Backend database test passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend database test failed" -ForegroundColor Red
    exit 1
}

# Test Frontend
Write-Host ""
Write-Host "🎨 Testing Frontend..." -ForegroundColor Yellow
cd ../frontend

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Test build
Write-Host "🏗️  Testing frontend build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

# Go back to root
cd ..

Write-Host ""
Write-Host "🎉 All tests passed! Your application is ready for deployment." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit your changes: git add . && git commit -m 'your message'"
Write-Host "2. Push to GitHub: git push"
Write-Host "3. Deploy to server: ./deploy-secure.ps1"
Write-Host "" 