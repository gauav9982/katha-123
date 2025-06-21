# Quick Deploy Script - Daily Use માટે
# આ script તમને ઝડપથી server પર deploy કરવામાં મદદ કરશે

Write-Host "🚀 Quick Deploy - Katha Sales" -ForegroundColor Green

# Server details
$SERVER_IP = "154.26.138.134"
$SERVER_USER = "root"
$SERVER_PATH = "/var/www/katha-sales"

# Function to check if command was successful
function Test-Command {
    param($Command)
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Success: $Command" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed: $Command" -ForegroundColor Red
        return $false
    }
}

# Step 1: Git Pull
Write-Host "🔄 Pulling latest code from GitHub..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH; git pull origin main"
if (-not (Test-Command "Git Pull")) { 
    Write-Host "❌ Git pull failed. Please check if your local code is pushed to GitHub." -ForegroundColor Red
    exit 1 
}

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies (if any)..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH; npm run install:all"
if (-not (Test-Command "Dependencies Install")) { 
    Write-Host "❌ Dependencies install failed." -ForegroundColor Red
    exit 1 
}

# Step 3: Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH/frontend; npm run build"
if (-not (Test-Command "Frontend Build")) { 
    Write-Host "❌ Frontend build failed." -ForegroundColor Red
    exit 1 
}

# Step 4: Restart services
Write-Host "🔄 Restarting services..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH; pm2 restart katha-sales-backend --update-env"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl reload nginx"

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Check your application at: http://$SERVER_IP" -ForegroundColor Yellow
Write-Host "📱 You can now use the application with full data functionality!" -ForegroundColor Cyan 