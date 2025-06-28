Write-Host "Fixing Server Issues..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray

# Server details
$SERVER_IP = "168.231.122.33"
$SERVER_USER = "root"
$KATHA_PATH = "/var/www/katha-sales"
$SCHOOL_PATH = "/var/www/school-app"
$KEY_PATH = "C:\Users\DELL\Desktop\katha 123\config\deploy_key"

Write-Host "Step 1: Creating school-app directory..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd /var/www && sudo mkdir -p school-app"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd /var/www && sudo cp -r katha-sales/school/* school-app/"

Write-Host "Step 2: Installing dependencies properly..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH && npm cache clean --force"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/backend && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/frontend && npm install"

ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH && npm cache clean --force"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/backend && npm install"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/frontend && npm install"

Write-Host "Step 3: Setting up databases..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/backend && node setup-database.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/backend && node setup-database.cjs"

Write-Host "Step 4: Building frontends..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH/frontend && npm run build"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH/frontend && npm run build"

Write-Host "Step 5: Setting permissions..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chown -R www-data:www-data $KATHA_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chown -R www-data:www-data $SCHOOL_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chmod -R 755 $KATHA_PATH"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo chmod -R 755 $SCHOOL_PATH"

Write-Host "Step 6: Starting services..." -ForegroundColor Blue
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "pm2 delete all 2>/dev/null; true"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $KATHA_PATH && pm2 start ecosystem.config.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "cd $SCHOOL_PATH && pm2 start ecosystem.config.cjs"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo systemctl start nginx"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "pm2 save"

Write-Host "Step 7: Checking services..." -ForegroundColor Blue
Start-Sleep -Seconds 5
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "pm2 status"
ssh -i $KEY_PATH "$SERVER_USER@$SERVER_IP" "sudo systemctl status nginx"

Write-Host "================================================" -ForegroundColor Gray
Write-Host "Server issues fixed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray
Pause 