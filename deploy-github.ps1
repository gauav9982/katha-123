# Katha Sales - GitHub to Server Deployment Script (PowerShell)
# This script will push fresh code from GitHub and deploy to server

# --- HELPER FUNCTIONS ---
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
# --- END HELPER FUNCTIONS ---


Write-Host "🚀 Starting Katha Sales Deployment from GitHub..." -ForegroundColor Green

# --- PRE-DEPLOYMENT: PUSH LOCAL CHANGES TO GITHUB ---
Write-Host "[PRE-FLIGHT] Pushing latest local changes to GitHub..." -ForegroundColor Cyan

# Step 0.1: Add all changes
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to add files to Git. Please check your Git status."
    exit 1
}

# Step 0.2: Commit the changes
# We use a standard message. If there's nothing to commit, we allow it to continue.
git commit -m "Auto-commit before deployment"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Could not create a commit. This is likely because there are no new changes to save. Continuing..."
}

# Step 0.3: Push to GitHub
git push
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push changes to GitHub. Please check your internet connection and Git credentials."
    exit 1
}
Write-Success "[PRE-FLIGHT] Latest changes have been pushed to GitHub successfully."
# --- END PRE-DEPLOYMENT ---


# Server details
$SERVER_IP = "168.231.122.33" # CORRECT IP ADDRESS
$SERVER_USER = "root"
$SERVER_PATH = "/var/www/katha-sales"
$BACKUP_PATH = "/var/www/katha-sales-backup"
$KEY_PATH = "C:\Users\DELL\Desktop\katha 123\config\deploy_key"

# Step 1: Create backup of current server
Write-Status "Creating backup of current server..."
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo mkdir -p $BACKUP_PATH; sudo cp -r $SERVER_PATH/* $BACKUP_PATH/ 2>/dev/null; true"
Write-Success "Backup created at $BACKUP_PATH"

# Step 2: Stop services
Write-Status "Stopping services..."
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "pm2 stop katha-sales-backend 2>/dev/null; true"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo systemctl stop nginx 2>/dev/null; true"
Write-Success "Services stopped"

# Step 3 & 4: Clean server directory and clone fresh code
Write-Status "Cleaning server directory and cloning fresh code from GitHub..."
$repoUrl = "https://github.com/gauav9982/katha-123.git"
$serverParentPath = "/var/www"
$serverDirName = "katha-sales"

# This command sequence is executed on the server:
# 1. Go to the parent directory.
# 2. Remove the old project directory.
# 3. Clone the new project from GitHub.
$sshCommand = "cd $serverParentPath && sudo rm -rf $serverDirName && git clone $repoUrl $serverDirName"

# Execute the command via SSH
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" $sshCommand

# Check if the SSH command was successful
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to clean directory and clone from GitHub. This is a critical step. Please check server permissions or disk space."
    exit 1
}
Write-Success "Server cleaned and fresh code cloned from GitHub."


# Step 5: Install dependencies
Write-Status "Installing dependencies..."
$installResult = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && npm run install:all"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}
Write-Success "Dependencies installed"

# Step 5.5: Ensure database directory exists inside the project folder
Write-Status "Ensuring database directory exists on server..."
# The database file is stored inside the project, e.g., /var/www/katha-sales/database/
$dbDir = "$SERVER_PATH/database"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "mkdir -p $dbDir"
Write-Success "Database directory ($dbDir) is ready."

# Step 6: Setup database
Write-Status "Setting up database..."
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && npm run setup"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Database setup script failed. Check the logs on the server."
    exit 1
}
Write-Success "Database setup completed"

# Step 6.5: Set Correct Permissions on Database
Write-Status "Setting permissions on the database file..."
$dbFile = "$SERVER_PATH/database/katha_sales.db"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chown www-data:www-data $dbFile && sudo chmod 664 $dbFile"
Write-Success "Database permissions set correctly."


# Step 7: Build frontend
Write-Status "Building frontend..."
$buildResult = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH/frontend && npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build frontend"
    exit 1
}
Write-Success "Frontend built successfully"

# Step 8: Copy configuration files
Write-Status "Copying configuration files..."
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo cp $SERVER_PATH/config/nginx-katha.conf /etc/nginx/sites-available/katha-sales"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo ln -sf /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/"
Write-Success "Nginx configuration updated"

# Step 9: Set proper permissions
Write-Status "Setting permissions..."
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chown -R www-data:www-data $SERVER_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chmod -R 755 $SERVER_PATH"
Write-Success "Permissions set"

# Step 10: Start services
Write-Status "Starting services..."
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && pm2 start ecosystem.config.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo systemctl start nginx"
Write-Success "Services started"

# Step 11: Verify deployment
Write-Status "Verifying deployment..."
Start-Sleep -Seconds 5

$backendCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:4000/api/health"
if ($backendCheck -match "ok") {
    Write-Success "Backend is running"
} else {
    Write-Warning "Backend health check failed"
}

$frontendCheck = ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "curl -s http://localhost"
if ($frontendCheck -match "katha") {
    Write-Success "Frontend is running"
} else {
    Write-Warning "Frontend check failed"
}

Write-Success "🎉 Deployment completed successfully!"
Write-Status "Your application is now live at: http://168.231.122.33"
Write-Status "Backup is available at: $BACKUP_PATH" 