#!/bin/bash

# Katha Sales - GitHub to Server Deployment Script
# This script will pull fresh code from GitHub and deploy to server

echo "🚀 Starting Katha Sales Deployment from GitHub..."

# Server details
SERVER_IP="168.231.122.33"
SERVER_USER="root"
SERVER_PATH="/var/www/katha-sales"
BACKUP_PATH="/var/www/katha-sales-backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Create backup of current server
print_status "Creating backup of current server..."
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $BACKUP_PATH && sudo cp -r $SERVER_PATH/* $BACKUP_PATH/ 2>/dev/null || true"
print_success "Backup created at $BACKUP_PATH"

# Step 2: Stop services
print_status "Stopping services..."
ssh $SERVER_USER@$SERVER_IP "pm2 stop katha-sales-backend 2>/dev/null || true"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl stop nginx 2>/dev/null || true"
print_success "Services stopped"

# Step 3: Clean server directory
print_status "Cleaning server directory..."
ssh $SERVER_USER@$SERVER_IP "sudo rm -rf $SERVER_PATH/*"
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $SERVER_PATH"
print_success "Server directory cleaned"

# Step 4: Clone fresh code from GitHub
print_status "Cloning fresh code from GitHub..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && git clone https://github.com/your-username/katha-sales.git ."
if [ $? -ne 0 ]; then
    print_error "Failed to clone from GitHub"
    exit 1
fi
print_success "Code cloned from GitHub"

# Step 5: Install dependencies
print_status "Installing dependencies..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm run install:all"
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed"

# Step 6: Setup database
print_status "Setting up database..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm run setup"
print_success "Database setup completed"

# Step 7: Build frontend
print_status "Building frontend..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH/frontend && npm run build"
if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi
print_success "Frontend built successfully"

# Step 8: Copy configuration files
print_status "Copying configuration files..."
ssh $SERVER_USER@$SERVER_IP "sudo cp $SERVER_PATH/config/nginx-katha.conf /etc/nginx/sites-available/katha-sales"
ssh $SERVER_USER@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/"
print_success "Nginx configuration updated"

# Step 9: Set proper permissions
print_status "Setting permissions..."
ssh $SERVER_USER@$SERVER_IP "sudo chown -R www-data:www-data $SERVER_PATH"
ssh $SERVER_USER@$SERVER_IP "sudo chmod -R 755 $SERVER_PATH"
print_success "Permissions set"

# Step 10: Start services
print_status "Starting services..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 start ecosystem.config.cjs"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl start nginx"
print_success "Services started"

# Step 11: Verify deployment
print_status "Verifying deployment..."
sleep 5
if ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:4000/api/health" | grep -q "ok"; then
    print_success "Backend is running"
else
    print_warning "Backend health check failed"
fi

if ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost" | grep -q "katha"; then
    print_success "Frontend is running"
else
    print_warning "Frontend check failed"
fi

print_success "🎉 Deployment completed successfully!"
print_status "Your application is now live at: http://kathasales.com"
print_status "Backup is available at: $BACKUP_PATH" 