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

function Execute-SSH-Command {
    param(
        [string]$Command,
        [string]$ErrorMessage = "Command failed"
    )
    try {
        $result = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" $Command
        if ($LASTEXITCODE -ne 0) {
            Write-Error "$ErrorMessage (Exit code: $LASTEXITCODE)"
            Write-Error "Command: $Command"
            Write-Error "Output: $result"
            return $false
        }
        return $true
    }
    catch {
        Write-Error "$ErrorMessage (Exception: $_)"
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
$KEY_PATH = "C:\Users\DELL\Desktop\katha 123\config\deploy_key"

Write-Host "Step 1: Testing server connection..." -ForegroundColor Blue
if (-not (Test-ServerConnection -ServerIP $SERVER_IP -KeyPath $KEY_PATH)) {
    Write-Error "Cannot connect to server. Please check your connection and try again."
    exit 1
}

Write-Host "Step 2: Fixing Git branch and pushing changes..." -ForegroundColor Blue
git checkout main
git add .
git commit -m "Auto-commit before deployment"
git push origin main

Write-Host "Step 3: Creating backup on server..." -ForegroundColor Blue
$BACKUP_PATH = "/var/www/backup-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Execute-SSH-Command "mkdir -p $BACKUP_PATH" "Failed to create backup directory"
Execute-SSH-Command "cp -r $KATHA_PATH/* $BACKUP_PATH/ 2>/dev/null || true" "Failed to copy files to backup"

Write-Host "Step 4: Stopping all services..." -ForegroundColor Blue
Execute-SSH-Command "pm2 delete all 2>/dev/null || true" "Failed to stop PM2 services"
Execute-SSH-Command "systemctl stop nginx" "Failed to stop nginx"

Write-Host "Step 5: Cleaning server and cloning fresh code..." -ForegroundColor Blue
$repoUrl = "https://github.com/gauav9982/katha-123.git"
Execute-SSH-Command "cd /var/www && rm -rf katha-sales && git clone $repoUrl katha-sales" "Failed to clone repository"

Write-Host "Step 6: Installing dependencies with cache clear..." -ForegroundColor Blue
Execute-SSH-Command "cd $KATHA_PATH && npm cache clean --force && npm install" "Failed to install main dependencies"
Execute-SSH-Command "cd $KATHA_PATH/backend && npm install" "Failed to install backend dependencies"
Execute-SSH-Command "cd $KATHA_PATH/frontend && npm install" "Failed to install frontend dependencies"
Execute-SSH-Command "cd $KATHA_PATH/school/backend && npm install" "Failed to install school backend dependencies"
Execute-SSH-Command "cd $KATHA_PATH/school/frontend && npm install" "Failed to install school frontend dependencies"

Write-Host "Step 7: Setting up databases..." -ForegroundColor Blue
Execute-SSH-Command "cd $KATHA_PATH && mkdir -p database" "Failed to create database directory"
Execute-SSH-Command "cd $KATHA_PATH/backend && node setup-database.cjs" "Failed to setup main database"
Execute-SSH-Command "cd $KATHA_PATH/backend && node setup-cities.js" "Failed to setup cities"
Execute-SSH-Command "cd $KATHA_PATH/school/backend && node setup-database.cjs" "Failed to setup school database"

Write-Host "Step 8: Building frontends..." -ForegroundColor Blue
Execute-SSH-Command "cd $KATHA_PATH/frontend && npm run build" "Failed to build main frontend"
Execute-SSH-Command "cd $KATHA_PATH/school/frontend && npm run build" "Failed to build school frontend"

Write-Host "Step 9: Setting permissions..." -ForegroundColor Blue
Execute-SSH-Command "chown -R www-data:www-data $KATHA_PATH" "Failed to set ownership"
Execute-SSH-Command "chmod -R 755 $KATHA_PATH" "Failed to set permissions"
Execute-SSH-Command "chmod -R 664 $KATHA_PATH/database" "Failed to set database permissions"

Write-Host "Step 10: Creating log directories..." -ForegroundColor Blue
Execute-SSH-Command "mkdir -p $KATHA_PATH/logs" "Failed to create main logs directory"
Execute-SSH-Command "mkdir -p $KATHA_PATH/school/logs" "Failed to create school logs directory"
Execute-SSH-Command "chown -R www-data:www-data $KATHA_PATH/logs $KATHA_PATH/school/logs" "Failed to set log permissions"

Write-Host "Step 11: Setting up nginx..." -ForegroundColor Blue
Execute-SSH-Command "cp $KATHA_PATH/config/nginx-katha.conf /etc/nginx/sites-available/" "Failed to copy nginx config"
Execute-SSH-Command "ln -sf /etc/nginx/sites-available/nginx-katha.conf /etc/nginx/sites-enabled/" "Failed to enable nginx config"
Execute-SSH-Command "rm -f /etc/nginx/sites-enabled/default" "Failed to remove default nginx config"
Execute-SSH-Command "nginx -t" "Nginx configuration test failed"
Execute-SSH-Command "systemctl start nginx" "Failed to start nginx"

Write-Host "Step 12: Starting services..." -ForegroundColor Blue
Execute-SSH-Command "cd $KATHA_PATH && pm2 start ecosystem.config.cjs" "Failed to start PM2 services"
Execute-SSH-Command "pm2 save" "Failed to save PM2 configuration"
Execute-SSH-Command "pm2 startup" "Failed to setup PM2 startup"

Write-Host "Step 13: Verifying deployment..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check main backend
$backendCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:4000/api/health"
if ($backendCheck -match "healthy") {
    Write-Success "Katha Sales backend is running"
} else {
    Write-Warning "Katha Sales backend check failed"
    Write-Warning "Checking PM2 logs..."
    Execute-SSH-Command "pm2 logs katha-sales-backend --lines 20" "Failed to get backend logs"
}

# Check school backend
$schoolCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:4001/api/health"
if ($schoolCheck -match "healthy") {
    Write-Success "School backend is running"
} else {
    Write-Warning "School backend check failed"
    Write-Warning "Checking PM2 logs..."
    Execute-SSH-Command "pm2 logs school-backend --lines 20" "Failed to get school backend logs"
}

# Check school frontend
$schoolFrontendCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:5180/school-app/"
if ($schoolFrontendCheck -match "<!DOCTYPE html>") {
    Write-Success "School frontend is running"
} else {
    Write-Warning "School frontend check failed"
    Write-Warning "Checking PM2 logs..."
    Execute-SSH-Command "pm2 logs school-frontend --lines 20" "Failed to get school frontend logs"
}

# Verify nginx configuration
Write-Host "Step 14: Verifying nginx configuration..." -ForegroundColor Blue
Execute-SSH-Command "nginx -T | grep -A 10 'location /school-app/'" "Failed to verify nginx school app configuration"

Write-Host "Step 15: Checking server resources..." -ForegroundColor Blue
Execute-SSH-Command "df -h" "Failed to check disk space"
Execute-SSH-Command "free -h" "Failed to check memory usage"
Execute-SSH-Command "pm2 list" "Failed to list PM2 processes"

Write-Host "================================================" -ForegroundColor Gray
Write-Success "Deployment completed!"
Write-Host "Katha Sales: http://kathasales.com" -ForegroundColor Cyan
Write-Host "School App: http://kathasales.com/school-app" -ForegroundColor Cyan
Write-Host "Backup: $BACKUP_PATH" -ForegroundColor Gray

Write-Host "`nImportant URLs to check:" -ForegroundColor Yellow
Write-Host "1. Main frontend: http://kathasales.com" -ForegroundColor Cyan
Write-Host "2. School frontend: http://kathasales.com/school-app" -ForegroundColor Cyan
Write-Host "3. Main API health: http://kathasales.com/api/health" -ForegroundColor Cyan
Write-Host "4. School API health: http://kathasales.com/school-app/api/health" -ForegroundColor Cyan

Write-Host "`nIf you see any issues:" -ForegroundColor Yellow
Write-Host "1. Check nginx logs: tail -f /var/log/nginx/error.log" -ForegroundColor Gray
Write-Host "2. Check PM2 logs: pm2 logs" -ForegroundColor Gray
Write-Host "3. Check nginx config: nginx -T" -ForegroundColor Gray
Write-Host "4. Restart services: systemctl restart nginx && pm2 restart all" -ForegroundColor Gray

Write-Host "================================================" -ForegroundColor Gray
Pause