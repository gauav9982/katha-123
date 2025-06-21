# Katha Sales - Complete Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Local Development Setup](#local-development-setup)
- [Database Details](#database-details)
- [Server Deployment](#server-deployment)
- [GitHub Workflow](#github-workflow)
- [VS Code Server Connection](#vs-code-server-connection)
- [Application Checklist](#application-checklist)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Katha Sales એ એક સંપૂર્ણ business management system છે જેમાં:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + SQLite
- **Server:** Ubuntu + Nginx + PM2
- **Database:** SQLite (local અને server બંને)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v16+)
- Git
- VS Code (recommended)

### Step 1: Clone Repository
```bash
git clone https://github.com/gauav9982/katha-123.git
cd katha-123
```

### Step 2: Install Dependencies
```bash
# Root level dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### Step 3: Setup Database
```bash
# Root directory માં
npm run setup
```

### Step 4: Start Development Servers
```bash
# Terminal 1: Backend (Port 4000)
cd backend
npm start

# Terminal 2: Frontend (Port 5173)
cd frontend
npm run dev
```

### Step 5: Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000/api

---

## 🗄️ Database Details

### Local Database
- **Location:** `database/katha_sales.db`
- **Type:** SQLite
- **Tables:**
  - `tbl_items` - Products/Items
  - `tbl_categories` - Product Categories
  - `tbl_groups` - Category Groups
  - `tbl_parties` - Customers/Suppliers
  - `tbl_cash_sales` - Cash Sales
  - `tbl_credit_sales` - Credit Sales
  - `tbl_purchases` - Purchases
  - `tbl_payments` - Payments
  - `tbl_receipts` - Receipts
  - `tbl_expenses` - Expenses
  - `tbl_delivery_chalans` - Delivery Notes

### Server Database
- **Location:** `/var/www/katha-sales/database/katha_sales.db`
- **Permissions:** `www-data:www-data` (664)
- **Backup Location:** `/var/www/katha-sales-backup/`

### Database Commands
```bash
# Local database setup
npm run setup

# Check database tables
cd backend
node check-tables.cjs

# Verify data
node check-data.cjs
```

---

## 🚀 Server Deployment

### Server Details
- **IP:** 168.231.122.33
- **Domain:** kathasales.com
- **OS:** Ubuntu 22.04
- **Web Server:** Nginx
- **Process Manager:** PM2
- **User:** root

### Deployment Commands

#### Quick Deployment (Daily Use)
```bash
# Simple double-click deployment
./simple-deploy.bat
```

#### Full Deployment (Complete Setup)
```bash
# PowerShell script
./deploy-github.ps1
```

### Manual Server Commands
```bash
# SSH to server
ssh -i "config/deploy_key" root@168.231.122.33

# Check PM2 status
pm2 status

# View logs
pm2 logs katha-sales-backend

# Restart application
pm2 restart katha-sales-backend

# Check nginx status
sudo systemctl status nginx

# Check application
curl http://localhost:4000/api
```

---

## 📚 GitHub Workflow

### Initial Setup (First Time)
```bash
# Create new repository on GitHub
# Then locally:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/gauav9982/katha-123.git
git push -u origin main
```

### Daily Development Workflow
```bash
# 1. Pull latest changes
git pull origin main

# 2. Make your changes
# ... edit files ...

# 3. Add changes
git add .

# 4. Commit changes
git commit -m "Description of changes"

# 5. Push to GitHub
git push origin main

# 6. Deploy to server
./deploy-github.ps1
```

### Branch Management
```bash
# Create feature branch
git checkout -b feature/new-feature

# Work on feature
# ... make changes ...

# Merge back to main
git checkout main
git merge feature/new-feature
git push origin main
```

---

## 🔧 VS Code Server Connection

### Step 1: Install Remote-SSH Extension
1. VS Code માં Extensions ટેબ ખોલો
2. "Remote - SSH" શોધો અને install કરો

### Step 2: Configure SSH
1. `Ctrl+Shift+P` દબાવો
2. "Remote-SSH: Connect to Host" ટાઈપ કરો
3. "Add New SSH Host" પસંદ કરો
4. આ command ટાઈપ કરો:
   ```
   ssh -i "C:\Users\DELL\Desktop\katha 123\config\deploy_key" root@168.231.122.33
   ```

### Step 3: Connect to Server
1. `Ctrl+Shift+P` દબાવો
2. "Remote-SSH: Connect to Host" પસંદ કરો
3. `root@168.231.122.33` પસંદ કરો
4. "Linux" platform પસંદ કરો
5. Password માટે Enter દબાવો

### Step 4: Open Project
1. Server માં connected થયા પછી
2. File → Open Folder
3. `/var/www/katha-sales` પસંદ કરો

### Step 5: Terminal Access
- Server terminal: `Ctrl+`` (backtick)
- Local terminal: Terminal → New Terminal

---

## ✅ Application Checklist

### ✅ Completed Features
- [x] **Frontend Setup**
  - [x] React + TypeScript + Vite
  - [x] Tailwind CSS styling
  - [x] Responsive design
  - [x] Component structure

- [x] **Backend Setup**
  - [x] Express.js server
  - [x] SQLite database
  - [x] API routes
  - [x] CORS configuration

- [x] **Database**
  - [x] All tables created
  - [x] Relationships established
  - [x] Sample data structure

- [x] **Forms & Components**
  - [x] Item management
  - [x] Category management
  - [x] Group management
  - [x] Party management
  - [x] Sales forms (Cash/Credit)
  - [x] Purchase forms
  - [x] Payment/Receipt forms
  - [x] Expense forms
  - [x] Delivery Chalan forms

- [x] **Reports**
  - [x] Stock report
  - [x] Item transaction report

- [x] **Server Deployment**
  - [x] Ubuntu server setup
  - [x] Nginx configuration
  - [x] PM2 process management
  - [x] SSL certificate (if needed)
  - [x] Domain configuration

- [x] **Deployment Automation**
  - [x] GitHub integration
  - [x] Automated deployment scripts
  - [x] Backup system
  - [x] Health checks

### 🔄 Future Enhancements
- [ ] **Advanced Features**
  - [ ] User authentication
  - [ ] Role-based access
  - [ ] Advanced reporting
  - [ ] Data export (PDF/Excel)
  - [ ] Email notifications
  - [ ] SMS integration

- [ ] **Performance**
  - [ ] Database optimization
  - [ ] Caching system
  - [ ] Image compression
  - [ ] Lazy loading

- [ ] **Security**
  - [ ] Input validation
  - [ ] SQL injection protection
  - [ ] XSS protection
  - [ ] Rate limiting

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 4000
netstat -tlnp | grep :4000

# Kill process
sudo kill -9 <PID>

# Or restart PM2
pm2 delete all
pm2 start ecosystem.config.cjs
```

#### 2. Database Connection Issues
```bash
# Check database file permissions
ls -la database/katha_sales.db

# Fix permissions
sudo chown www-data:www-data database/katha_sales.db
sudo chmod 664 database/katha_sales.db
```

#### 3. Nginx 404 Error
```bash
# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check frontend build
ls -la /var/www/katha-sales/frontend/dist/
```

#### 4. PM2 Issues
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs katha-sales-backend

# Restart application
pm2 restart katha-sales-backend

# Delete and restart
pm2 delete all
pm2 start ecosystem.config.cjs
```

#### 5. Git Issues
```bash
# Reset to last working state
git reset --hard HEAD~1

# Force push (use carefully)
git push --force origin main

# Clean working directory
git clean -fd
```

### Debug Commands
```bash
# Check server status
ssh -i "config/deploy_key" root@168.231.122.33 "pm2 status"

# Check application logs
ssh -i "config/deploy_key" root@168.231.122.33 "pm2 logs katha-sales-backend --lines 20"

# Test API
ssh -i "config/deploy_key" root@168.231.122.33 "curl -s http://localhost:4000/api"

# Check nginx logs
ssh -i "config/deploy_key" root@168.231.122.33 "sudo tail -f /var/log/nginx/error.log"
```

---

## 📞 Support

જો કોઈ સમસ્યા આવે તો:
1. આ README ફાઈલ ચેક કરો
2. Troubleshooting section જુઓ
3. Server logs ચેક કરો
4. GitHub issues પર report કરો

---

## 📝 License

This project is proprietary software developed for Katha Sales business management.

---

**Last Updated:** June 21, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅ 