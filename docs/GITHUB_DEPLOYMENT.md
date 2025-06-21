# GitHub થી Server પર Direct Deployment Guide

આ guide તમને GitHub થી server પર fresh code લાવવાની અને server ને completely clean કરવાની process સમજાવે છે.

## 🚀 Quick Deployment (Automated)

### Option 1: Linux/Mac માટે
```bash
chmod +x deploy-github.sh
./deploy-github.sh
```

### Option 2: Windows PowerShell માટે
```powershell
.\deploy-github.ps1
```

## 📋 Manual Deployment Steps

જો automated script work ન કરે તો આ steps follow કરો:

### Step 1: Server પર Login કરો
```bash
ssh root@168.231.122.33
```

### Step 2: Current Application ને Backup કરો
```bash
# Backup directory બનાવો
sudo mkdir -p /var/www/katha-sales-backup

# Current files ને backup કરો
sudo cp -r /var/www/katha-sales/* /var/www/katha-sales-backup/
```

### Step 3: Services ને Stop કરો
```bash
# PM2 process stop કરો
pm2 stop katha-sales-backend

# Nginx stop કરો
sudo systemctl stop nginx
```

### Step 4: Server Directory ને Clean કરો
```bash
# Current directory ને completely delete કરો
sudo rm -rf /var/www/katha-sales/*

# Fresh directory બનાવો
sudo mkdir -p /var/www/katha-sales
cd /var/www/katha-sales
```

### Step 5: GitHub થી Fresh Code Clone કરો
```bash
# GitHub repository થી code clone કરો
git clone https://github.com/your-username/katha-sales.git .

# જો private repository હોય તો:
# git clone https://username:token@github.com/your-username/katha-sales.git .
```

### Step 6: Dependencies Install કરો
```bash
# બધા dependencies install કરો
npm run install:all

# અથવા manually:
# npm install
# cd backend && npm install
# cd ../frontend && npm install
```

### Step 7: Database Setup કરો
```bash
# Database tables create કરો
npm run setup
```

### Step 8: Frontend Build કરો
```bash
# Frontend ને production માટે build કરો
cd frontend
npm run build
cd ..
```

### Step 9: Configuration Files Copy કરો
```bash
# Nginx configuration copy કરો
sudo cp config/nginx-katha.conf /etc/nginx/sites-available/katha-sales

# Nginx site enable કરો
sudo ln -sf /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/

# Default site disable કરો (જો જરૂર હોય)
sudo rm -f /etc/nginx/sites-enabled/default
```

### Step 10: Permissions Set કરો
```bash
# Proper permissions set કરો
sudo chown -R www-data:www-data /var/www/katha-sales
sudo chmod -R 755 /var/www/katha-sales
```

### Step 11: Services Start કરો
```bash
# Backend start કરો
pm2 start ecosystem.config.cjs

# Nginx start કરો
sudo systemctl start nginx

# Nginx status check કરો
sudo systemctl status nginx
```

### Step 12: Deployment Verify કરો
```bash
# Backend check કરો
curl http://localhost:4000/api/health

# Frontend check કરો
curl http://localhost

# PM2 status check કરો
pm2 status
```

## 🔧 Configuration Files

### GitHub Repository URL Update કરો
Scripts માં આ line update કરો:
```bash
git clone https://github.com/YOUR-ACTUAL-USERNAME/katha-sales.git .
```

### Server IP Update કરો (જો જરૂર હોય)
Scripts માં આ line update કરો:
```bash
SERVER_IP="YOUR-SERVER-IP"
```

## 🛠️ Troubleshooting

### Error: Permission Denied
```bash
# SSH key permissions fix કરો
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Error: Git Clone Failed
```bash
# GitHub credentials check કરો
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Error: Nginx Configuration
```bash
# Nginx configuration test કરો
sudo nginx -t

# Nginx reload કરો
sudo systemctl reload nginx
```

### Error: PM2 Process
```bash
# PM2 processes list કરો
pm2 list

# PM2 logs check કરો
pm2 logs katha-sales-backend
```

## 📊 Deployment Verification

Deployment સફળ થયું છે કે નહીં તે check કરવા માટે:

1. **Website**: http://kathasales.com
2. **API**: http://kathasales.com/api/health
3. **Server Status**: `pm2 status` અને `sudo systemctl status nginx`

## 🔄 Rollback Process

જો કંઈક ખોટું થાય તો backup થી rollback કરવા માટે:

```bash
# Services stop કરો
pm2 stop katha-sales-backend
sudo systemctl stop nginx

# Backup થી restore કરો
sudo rm -rf /var/www/katha-sales/*
sudo cp -r /var/www/katha-sales-backup/* /var/www/katha-sales/

# Services restart કરો
pm2 start katha-sales-backend
sudo systemctl start nginx
```

## 📝 Notes

- **Backup**: દરેક deployment પહેલા automatic backup બને છે
- **Clean Installation**: દરેક વખતે fresh code થી installation થાય છે
- **Zero Downtime**: Backup process દરમિયાન website down રહેશે
- **Database**: Database files backup માં સાચવાય છે

## 🆘 Support

કોઈ પણ issue માટે:
1. Server logs check કરો: `pm2 logs` અને `sudo journalctl -u nginx`
2. Configuration files verify કરો
3. Permissions check કરો
4. Network connectivity test કરો 