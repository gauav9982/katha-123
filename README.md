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

---

## 🖥️ New Computer Setup (Development)

### Prerequisites Installation

#### 1. Install Node.js
```bash
# Windows માટે:
# https://nodejs.org/en/ પરથી LTS version download કરો
# અથવા Chocolatey થી:
choco install nodejs

# macOS માટે:
brew install node

# Linux માટે:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Install Git
```bash
# Windows માટે:
# https://git-scm.com/ પરથી download કરો
# અથવા Chocolatey થી:
choco install git

# macOS માટે:
brew install git

# Linux માટે:
sudo apt-get install git
```

#### 3. Install VS Code
```bash
# Windows માટે:
# https://code.visualstudio.com/ પરથી download કરો
# અથવા Chocolatey થી:
choco install vscode

# macOS માટે:
brew install --cask visual-studio-code

# Linux માટે:
sudo snap install code --classic
```

#### 4. Install Required VS Code Extensions
VS Code ખોલ્યા પછી આ extensions install કરો:
- **Remote - SSH** (server connection માટે)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Thunder Client** (API testing માટે)

### Complete Setup Process

#### Step 1: Clone Repository
```bash
# Desktop પર જાઓ
cd Desktop

# Repository clone કરો
git clone https://github.com/gauav9982/katha-123.git

# Project folder માં જાઓ
cd katha-123
```

#### Step 2: Install Dependencies
```bash
# Root level dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install

# Root directory પાછા જાઓ
cd ..
```

#### Step 3: Setup Database
```bash
# Database setup
npm run setup

# Database ચેક કરો
cd backend
node check-tables.cjs
cd ..
```

#### Step 4: Configure Environment
```bash
# Frontend config ચેક કરો
# frontend/src/config.ts ફાઈલ ખોલો
# API URL સાચી છે કે નહીં ચેક કરો

# Backend config ચેક કરો
# backend/config/database.cjs ફાઈલ ખોલો
# Database path સાચી છે કે નહીં ચેક કરો
```

#### Step 5: Start Development Servers
```bash
# Terminal 1: Backend Server
cd backend
npm start
# Server http://localhost:4000 પર ચાલશે

# Terminal 2: Frontend Server (નવો terminal ખોલો)
cd frontend
npm run dev
# Frontend http://localhost:5173 પર ચાલશે
```

#### Step 6: Test Application
1. **Frontend Test:** Browser માં http://localhost:5173 ખોલો
2. **Backend Test:** Browser માં http://localhost:4000/api ખોલો
3. **Database Test:** કોઈ item add કરવાનો પ્રયાસ કરો

### Development Workflow

#### Daily Development Process
```bash
# 1. Latest changes pull કરો
git pull origin main

# 2. Development servers start કરો
# Terminal 1:
cd backend && npm start

# Terminal 2:
cd frontend && npm run dev

# 3. Changes કરો અને test કરો

# 4. Changes commit કરો
git add .
git commit -m "Description of changes"

# 5. GitHub પર push કરો
git push origin main

# 6. Server પર deploy કરો
./deploy-github.ps1
```

#### Testing Changes
```bash
# Backend API test
curl http://localhost:4000/api

# Frontend build test
cd frontend
npm run build

# Database test
cd ../backend
node check-data.cjs
```

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Check ports
netstat -ano | findstr :4000
netstat -ano | findstr :5173

# Kill process
taskkill /PID <process_id> /F
```

#### 2. Node Modules Issues
```bash
# Clear node_modules
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules

# Reinstall
npm install
cd frontend && npm install
cd ../backend && npm install
```

#### 3. Database Issues
```bash
# Database file permissions
# Windows માં: Right-click → Properties → Security
# Linux/macOS માં:
chmod 664 database/katha_sales.db

# Database reset
rm database/katha_sales.db
npm run setup
```

#### 4. Git Issues
```bash
# Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# SSH key setup (if needed)
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"
# GitHub પર SSH key add કરો
```

### Development Tips

#### 1. Code Organization
- **Frontend:** `frontend/src/` માં components, forms, reports
- **Backend:** `backend/routes/` માં API endpoints
- **Database:** `backend/setup-database.cjs` માં schema

#### 2. File Structure
```
katha-123/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── forms/         # Form components
│   │   ├── reports/       # Report components
│   │   └── config.ts      # Configuration
│   └── dist/          # Build output
├── backend/           # Node.js server
│   ├── routes/        # API routes
│   ├── config/        # Configuration files
│   └── setup-database.cjs
├── database/          # SQLite database
├── config/            # Server configuration
└── docs/              # Documentation
```

#### 3. Development Commands
```bash
# Frontend development
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build

# Backend development
cd backend
npm start            # Development server
node check-tables.cjs # Check database
node check-data.cjs   # Check data

# Root level
npm run setup        # Setup database
npm run install:all  # Install all dependencies
```

#### 4. Debugging
```bash
# Backend logs
cd backend
npm start
# Console માં logs જોવા

# Frontend logs
cd frontend
npm run dev
# Browser console માં logs જોવા

# Database debugging
cd backend
node check-tables.cjs
node check-data.cjs
```

### Production Deployment

#### First Time Deployment
```bash
# 1. GitHub repository setup
git remote add origin https://github.com/gauav9982/katha-123.git
git push -u origin main

# 2. Server deployment
./deploy-github.ps1
```

#### Regular Deployment
```bash
# Changes કર્યા પછી
git add .
git commit -m "Changes description"
git push origin main
./deploy-github.ps1
```

### Backup & Recovery

#### Local Backup
```bash
# Database backup
cp database/katha_sales.db database/katha_sales_backup.db

# Code backup
git archive --format=zip --output=katha-sales-backup.zip main
```

#### Server Backup
```bash
# Server પર backup
ssh -i "config/deploy_key" root@168.231.122.33
# Backup location: /var/www/katha-sales-backup/
```

---

**Last Updated:** June 21, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅ 

---

## 📖 કમ્પ્લીટ ગાઈડ

**આ એપ્લિકેશનની કમ્પ્લીટ ગાઈડ માટે જુઓ:** [APPLICATION_GUIDE.md](./APPLICATION_GUIDE.md)

## 🚀 એક ક્લિક સ્ટાર્ટ

### એપ્લિકેશન મેનેજર (ભલામણ)
```powershell
.\katha-app-manager.ps1
```

**આ script માં આ બધા options છે:**
- 🚀 બધી એપ્લિકેશન્સ સ્ટાર્ટ કરો
- 🛑 બધી એપ્લિકેશન્સ બંધ કરો  
- 🔍 પોર્ટ્સ સ્ટેટસ ચેક કરો
- 🔄 એપ્લિકેશન્સ રિસ્ટાર્ટ કરો
- 🌐 બ્રાઉઝરમાં ખોલો
- 📊 સિસ્ટમ સ્ટેટસ જુઓ

### મેન્યુઅલ સ્ટાર્ટ
```bash
# Backend
cd backend && npm install && node index.cjs

# Frontend (નવી terminal માં)
cd frontend && npm install && npm run dev
```

## 📱 એપ્લિકેશન URLs
- **કથા સેલ્સ:** http://localhost:5173
- **સ્કૂલ એપ્લિકેશન:** http://localhost:5180

## 🔧 મુખ્ય ફાઈલ
- `katha-app-manager.ps1` - એક જ file માં બધા functions

---

**📚 વધુ માહિતી માટે [APPLICATION_GUIDE.md](./APPLICATION_GUIDE.md) જુઓ**