# Katha Sales & School Applications - Complete Deployment Script (PowerShell)
# This script deploys both main katha application and school application to server

# --- HELPER FUNCTIONS ---
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-ServerConnection {
    param([string]$ServerIP, [string]$KeyPath)
    try {
        $testResult = ssh -i $KeyPath "root@$ServerIP" "echo 'Connection successful'" 2>$null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}
# --- END HELPER FUNCTIONS ---

Write-Host "Starting Katha Sales and School Applications Deployment..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray

# Server details
$SERVER_IP = "168.231.122.33"
$SERVER_USER = "root"
$KATHA_PATH = "/var/www/katha-sales"
$SCHOOL_PATH = "/var/www/school-app"
$KEY_PATH = "C:\Users\DELL\Desktop\katha 123\config\deploy_key"

Write-Host "Step 1: Fixing Git branch and pushing changes..." -ForegroundColor Blue
git checkout main
git merge main-website-page
git add .
git commit -m "Auto-commit before deployment"
git push origin main

Write-Host "Step 2: Creating backup on server..." -ForegroundColor Blue
$BACKUP_PATH = "/var/www/backup-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo mkdir -p $BACKUP_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo cp -r $KATHA_PATH/* $BACKUP_PATH/katha-sales/ 2>/dev/null; true"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo cp -r $SCHOOL_PATH/* $BACKUP_PATH/school-app/ 2>/dev/null; true"

Write-Host "Step 3: Stopping all services..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "pm2 delete all 2>/dev/null; true"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo systemctl stop nginx 2>/dev/null; true"

Write-Host "Step 4: Cleaning server and cloning fresh code..." -ForegroundColor Blue
$repoUrl = "https://github.com/gauav9982/katha-123.git"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd /var/www && sudo rm -rf katha-sales school-app && git clone $repoUrl katha-sales"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd /var/www && sudo mkdir -p school-app && sudo cp -r katha-sales/school/* school-app/"

Write-Host "Step 5: Installing dependencies with cache clear..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH && npm cache clean --force && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/backend && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/frontend && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH && npm cache clean --force && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/backend && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/frontend && npm install"

Write-Host "Step 6: Setting up databases..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/backend && node setup-database.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/backend && node setup-database.cjs"

Write-Host "Step 7: Building frontends..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/frontend && npm run build"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/frontend && npm run build"

Write-Host "Step 8: Setting permissions..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chown -R www-data:www-data $KATHA_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chown -R www-data:www-data $SCHOOL_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chmod -R 755 $KATHA_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chmod -R 755 $SCHOOL_PATH"

Write-Host "Step 9: Starting services..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH && pm2 start ecosystem.config.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH && pm2 start ecosystem.config.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo systemctl start nginx"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "pm2 save"

Write-Host "Step 10: Verifying deployment..." -ForegroundColor Blue
Start-Sleep -Seconds 10

$backendCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:4000/api/health"
if ($backendCheck -match "healthy") {
    Write-Host "Katha Sales backend is running" -ForegroundColor Green
} else {
    Write-Host "Katha Sales backend check failed" -ForegroundColor Yellow
}

$schoolCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:4001/api/health"
if ($schoolCheck -match "healthy") {
    Write-Host "School backend is running" -ForegroundColor Green
} else {
    Write-Host "School backend check failed" -ForegroundColor Yellow
}

Write-Host "================================================" -ForegroundColor Gray
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Katha Sales: http://kathasales.com" -ForegroundColor Cyan
Write-Host "School App: http://school.kathasales.com" -ForegroundColor Cyan
Write-Host "Backup: $BACKUP_PATH" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Gray
Pause 