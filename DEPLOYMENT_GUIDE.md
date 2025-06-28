# Katha Sales & School Applications - Complete Deployment Guide

## 📋 Overview

આ application માં બે મુખ્ય applications છે:

1. **Katha Sales Application** - Sales Management System
   - Port: 4000 (Backend)
   - URL: http://kathasales.com
   - Database: SQLite (katha_sales.db)

2. **School Application** - Teacher Salary Management System
   - Port: 4001 (Backend)
   - URL: http://school.kathasales.com
   - Database: SQLite (school.db)

## 🚀 Quick Deployment (Double-Click Method)

### Step 1: Simple Deployment
1. `deploy-both-applications.bat` file પર double-click કરો
2. Script automatically બધું handle કરશે
3. Wait for completion message

### Step 2: Verify Deployment
- Katha Sales: http://kathasales.com
- School App: http://school.kathasales.com

## 🔧 Manual Deployment Process

### Prerequisites
- Git installed
- SSH key configured
- Server access (168.231.122.33)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Update before deployment"
git push origin main
```

### Step 2: Server Preparation
```bash
# SSH to server
ssh -i "config/deploy_key" root@168.231.122.33

# Kill existing processes
pm2 delete all
sudo systemctl stop nginx
sudo pkill -f 'node.*4000'
sudo pkill -f 'node.*4001'
```

### Step 3: Clone Fresh Code
```bash
cd /var/www
sudo rm -rf katha-sales school-app
git clone https://github.com/gauav9982/katha-123.git katha-sales
sudo cp -r katha-sales/school school-app
```

### Step 4: Install Dependencies
```bash
# Katha Sales
cd /var/www/katha-sales
npm run install:all

# School App
cd /var/www/school-app
npm run install:all
```

### Step 5: Setup Databases
```bash
# Katha Sales
cd /var/www/katha-sales
npm run setup

# School App
cd /var/www/school-app
npm run setup
```

### Step 6: Build Frontends
```bash
# Katha Sales
cd /var/www/katha-sales/frontend
npm run build

# School App
cd /var/www/school-app/frontend
npm run build
```

### Step 7: Configure Services
```bash
# Copy Nginx configs
sudo cp /var/www/katha-sales/config/nginx-katha.conf /etc/nginx/sites-available/katha-sales
sudo cp /var/www/katha-sales/config/nginx-school.conf /etc/nginx/sites-available/school-app

# Enable sites
sudo ln -sf /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/school-app /etc/nginx/sites-enabled/
```

### Step 8: Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/katha-sales
sudo chown -R www-data:www-data /var/www/school-app
sudo chmod -R 755 /var/www/katha-sales
sudo chmod -R 755 /var/www/school-app
```

### Step 9: Start Services
```bash
# Start applications with PM2
cd /var/www/katha-sales
pm2 start ecosystem.config.cjs

cd /var/www/school-app
pm2 start ecosystem.config.cjs

# Start Nginx
sudo systemctl start nginx

# Save PM2 configuration
pm2 save
```

## 📁 File Structure

```
katha-123/
├── deploy-both-applications.bat      # Double-click deployment
├── deploy-both-applications.ps1      # PowerShell script
├── ecosystem.config.cjs              # Katha Sales PM2 config
├── config/
│   ├── nginx-katha.conf             # Katha Sales Nginx config
│   ├── nginx-school.conf            # School App Nginx config
│   └── deploy_key                   # SSH key
├── backend/                          # Katha Sales backend
├── frontend/                         # Katha Sales frontend
├── school/
│   ├── ecosystem.config.cjs         # School PM2 config
│   ├── backend/                     # School backend
│   └── frontend/                    # School frontend
└── database/                        # Database files
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :4000
sudo netstat -tulpn | grep :4001

# Kill process
sudo kill -9 <PID>
```

### PM2 Issues
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs katha-sales-backend
pm2 logs school-backend

# Restart applications
pm2 restart katha-sales-backend
pm2 restart school-backend
```

### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Database Issues
```bash
# Check database permissions
ls -la /var/www/katha-sales/database/
ls -la /var/www/school-app/database/

# Fix permissions
sudo chown www-data:www-data /var/www/katha-sales/database/katha_sales.db
sudo chown www-data:www-data /var/www/school-app/database/school.db
sudo chmod 664 /var/www/katha-sales/database/katha_sales.db
sudo chmod 664 /var/www/school-app/database/school.db
```

## 📊 Monitoring

### Check Application Status
```bash
# Backend health checks
curl http://localhost:4000/api/health
curl http://localhost:4001/api/health

# Frontend checks
curl http://kathasales.com
curl http://school.kathasales.com
```

### View Logs
```bash
# PM2 logs
pm2 logs --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Backup and Restore

### Create Backup
```bash
BACKUP_DIR="/var/www/backup-$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p $BACKUP_DIR
sudo cp -r /var/www/katha-sales $BACKUP_DIR/
sudo cp -r /var/www/school-app $BACKUP_DIR/
```

### Restore from Backup
```bash
# Stop services
pm2 delete all
sudo systemctl stop nginx

# Restore from backup
sudo cp -r /var/www/backup-YYYYMMDD_HHMMSS/katha-sales /var/www/
sudo cp -r /var/www/backup-YYYYMMDD_HHMMSS/school-app /var/www/

# Restart services
cd /var/www/katha-sales && pm2 start ecosystem.config.cjs
cd /var/www/school-app && pm2 start ecosystem.config.cjs
sudo systemctl start nginx
```

## 🎯 Best Practices

### ✅ કરવાનું:
- હંમેશા backup બનાવો deployment પહેલા
- Test કરો local માં પહેલા
- Meaningful commit messages લખો
- Regular backups રાખો

### ❌ ન કરવાનું:
- Production માં direct changes ન કરો
- Database files ને delete ન કરો
- PM2 processes ને manual kill ન કરો

## 📞 Support

જો કોઈ issue આવે તો:
1. Check logs first
2. Verify permissions
3. Restart services
4. Contact support

---

*આ guide તમને safe અને efficient deployment માટે મદદ કરશે!* 🚀 