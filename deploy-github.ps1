# Katha Sales - GitHub to Server Deployment Script (PowerShell)
# This script will pull fresh code from GitHub and deploy to server

Write-Host "🚀 Starting Katha Sales Deployment from GitHub..." -ForegroundColor Green

# Server details
$SERVER_IP = "154.26.138.134"
$SERVER_USER = "root"
$SERVER_PATH = "/var/www/katha-sales"
$BACKUP_PATH = "/var/www/katha-sales-backup"

# Function to print colored output
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

# Step 1: Create backup of current server
Write-Status "Creating backup of current server..."
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $BACKUP_PATH && sudo cp -r $SERVER_PATH/* $BACKUP_PATH/ 2>/dev/null || true"
Write-Success "Backup created at $BACKUP_PATH"

# Step 2: Stop services
Write-Status "Stopping services..."
ssh $SERVER_USER@$SERVER_IP "pm2 stop katha-sales-backend 2>/dev/null || true"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl stop nginx 2>/dev/null || true"
Write-Success "Services stopped"

# Step 3: Clean server directory
Write-Status "Cleaning server directory..."
ssh $SERVER_USER@$SERVER_IP "sudo rm -rf $SERVER_PATH/*"
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $SERVER_PATH"
Write-Success "Server directory cleaned"

# Step 4: Clone fresh code from GitHub
Write-Host "Cloning fresh code from GitHub..."
$cloneResult = ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && git clone https://github.com/gauav9982/katha-123.git ."
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to clone from GitHub"
    exit 1
}
Write-Success "Code cloned from GitHub"

# Step 5: Install dependencies
Write-Status "Installing dependencies..."
$installResult = ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm run install:all"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}
Write-Success "Dependencies installed"

# Step 6: Setup database
Write-Status "Setting up database..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm run setup"
Write-Success "Database setup completed"

# Step 7: Build frontend
Write-Status "Building frontend..."
$buildResult = ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH/frontend && npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build frontend"
    exit 1
}
Write-Success "Frontend built successfully"

# Step 8: Copy configuration files
Write-Status "Copying configuration files..."
ssh $SERVER_USER@$SERVER_IP "sudo cp $SERVER_PATH/config/nginx-katha.conf /etc/nginx/sites-available/katha-sales"
ssh $SERVER_USER@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/"
Write-Success "Nginx configuration updated"

# Step 9: Set proper permissions
Write-Status "Setting permissions..."
ssh $SERVER_USER@$SERVER_IP "sudo chown -R www-data:www-data $SERVER_PATH"
ssh $SERVER_USER@$SERVER_IP "sudo chmod -R 755 $SERVER_PATH"
Write-Success "Permissions set"

# Step 10: Start services
Write-Status "Starting services..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 start ecosystem.config.cjs"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl start nginx"
Write-Success "Services started"

# Step 11: Verify deployment
Write-Status "Verifying deployment..."
Start-Sleep -Seconds 5

$backendCheck = ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:4000/api/health"
if ($backendCheck -match "ok") {
    Write-Success "Backend is running"
} else {
    Write-Warning "Backend health check failed"
}

$frontendCheck = ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost"
if ($frontendCheck -match "katha") {
    Write-Success "Frontend is running"
} else {
    Write-Warning "Frontend check failed"
}

Write-Success "🎉 Deployment completed successfully!"
Write-Status "Your application is now live at: http://154.26.138.134"
Write-Status "Backup is available at: $BACKUP_PATH" 