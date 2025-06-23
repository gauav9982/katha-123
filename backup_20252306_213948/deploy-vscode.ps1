# VS Code Direct Deployment Script
# આ script તમને VS Code થી direct server પર deploy કરવામાં મદદ કરશે

Write-Host "🚀 VS Code Direct Deployment Script" -ForegroundColor Green

# Server details
$SERVER_IP = "168.231.122.33"
$SERVER_USER = "root"
$SERVER_PATH = "/var/www/katha-sales"
$LOCAL_PATH = "C:\Users\DELL\Desktop\katha 123"

# Step 1: Create backup
Write-Host "📦 Creating backup..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p /var/www/katha-sales-backup; sudo cp -r $SERVER_PATH/* /var/www/katha-sales-backup/ 2>/dev/null; true"

# Step 2: Stop services
Write-Host "⏹️ Stopping services..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "pm2 stop katha-sales-backend 2>/dev/null; true"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl stop nginx 2>/dev/null; true"

# Step 3: Clean server directory
Write-Host "🧹 Cleaning server directory..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "sudo rm -rf $SERVER_PATH/*"
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $SERVER_PATH"

# Step 4: Upload files using scp
Write-Host "📤 Uploading files to server..." -ForegroundColor Blue
scp -r "$LOCAL_PATH\*" "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/"

# Step 5: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH; npm run install:all"

# Step 6: Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH; npm run setup"

# Step 7: Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH/frontend; npm run build"

# Step 8: Copy nginx config
Write-Host "⚙️ Updating nginx configuration..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "sudo cp $SERVER_PATH/config/nginx-katha.conf /etc/nginx/sites-available/katha-sales"
ssh $SERVER_USER@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/"

# Step 9: Set permissions
Write-Host "🔐 Setting permissions..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "sudo chown -R www-data:www-data $SERVER_PATH"
ssh $SERVER_USER@$SERVER_IP "sudo chmod -R 755 $SERVER_PATH"

# Step 10: Start services
Write-Host "▶️ Starting services..." -ForegroundColor Blue
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH; pm2 start ecosystem.config.cjs"
ssh $SERVER_USER@$SERVER_IP "sudo systemctl start nginx"

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your application is live at: http://kathasales.com" -ForegroundColor Yellow 