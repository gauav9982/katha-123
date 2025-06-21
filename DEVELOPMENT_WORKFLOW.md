# Katha Sales - Development Workflow Guide

## 🔒 Local vs Server - Complete Separation

### 🖥️ **Local Development (Your Computer)**
```
Local Computer:
├── Frontend: http://localhost:5173 (Development)
├── Backend: http://localhost:4000 (Development)
├── Database: database/katha_sales.db (Local)
└── Status: You can make ANY changes, ANY errors
```

### 🌐 **Server (Live Production)**
```
Server (168.231.122.33):
├── Frontend: http://kathasales.com (Production)
├── Backend: http://kathasales.com/api (Production)
├── Database: /var/www/katha-sales/database/katha_sales.db (Production)
└── Status: Only tested, working code
```

## 🔄 **Safe Development Process**

### Step 1: Local Development (Safe Zone)
```bash
# 1. Start local development servers
cd backend
npm start          # http://localhost:4000

# New terminal:
cd frontend
npm run dev        # http://localhost:5173

# 2. Make your changes
# Edit any files you want
# Test everything locally
# Break things if needed - it's safe!
```

### Step 2: Local Testing
```bash
# Test your changes thoroughly:
# - Frontend works correctly
# - Backend API responds
# - Database operations work
# - No errors in console
# - All features function as expected
```

### Step 3: Git Process (Version Control)
```bash
# Only when you're satisfied with local changes:
git add .
git commit -m "Description of your changes"
git push origin main
```

### Step 4: Secure Deployment (Production)
```bash
# Use secure deployment script:
./deploy-secure.ps1

# This script:
# 1. Tests everything locally first
# 2. Ensures no errors
# 3. Only then deploys to server
# 4. Server stays stable
```

## 🛡️ **Security Measures**

### 1. **Pre-Deployment Tests**
The `deploy-secure.ps1` script runs these tests:
- ✅ All dependencies installed
- ✅ Database connection works
- ✅ Backend API responds correctly
- ✅ Frontend builds successfully
- ✅ Git status is clean

### 2. **Server Protection**
- Server only gets code from GitHub
- No direct server editing
- Automatic backups before deployment
- Rollback capability if needed

### 3. **Technology Lock**
- Exact package versions locked in `package-lock.json`
- Consistent builds across environments
- No unexpected dependency updates

## 🚀 **Daily Workflow**

### Morning Setup
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm run install:all

# 3. Start development
cd backend && npm start
cd frontend && npm run dev
```

### During Development
```bash
# Make changes freely in local environment
# Test everything locally
# No impact on server whatsoever
```

### Before Deployment
```bash
# 1. Test everything locally
# 2. Commit your changes
git add .
git commit -m "Your changes"
git push origin main

# 3. Deploy securely
./deploy-secure.ps1
```

## 🔧 **Common Scenarios**

### Scenario 1: Adding New Feature
```bash
# 1. Local development
cd frontend/src/forms/
# Add new form component
# Test locally at http://localhost:5173

# 2. Test thoroughly
# - Form submits correctly
# - Data saves to database
# - No console errors

# 3. Deploy
./deploy-secure.ps1
```

### Scenario 2: Fixing Bug
```bash
# 1. Reproduce bug locally
# 2. Fix the issue
# 3. Test the fix
# 4. Deploy when satisfied
./deploy-secure.ps1
```

### Scenario 3: Database Changes
```bash
# 1. Update database schema locally
# 2. Test with local database
# 3. Update setup-database.cjs
# 4. Deploy - script will update server database
./deploy-secure.ps1
```

## 🚨 **What NOT to Do**

### ❌ Don't Edit Server Directly
```bash
# NEVER do this:
ssh root@168.231.122.33
# Edit files directly on server
# This breaks the workflow
```

### ❌ Don't Deploy Untested Code
```bash
# NEVER do this:
# Make changes
./deploy-github.ps1  # Without testing locally
```

### ❌ Don't Skip Git
```bash
# NEVER do this:
# Make changes
# Deploy without committing
# You'll lose your changes
```

## ✅ **What TO Do**

### ✅ Always Test Locally First
```bash
# 1. Make changes
# 2. Test locally
# 3. Fix any issues
# 4. Test again
# 5. Only then deploy
```

### ✅ Use Secure Deployment
```bash
# Always use:
./deploy-secure.ps1

# Instead of:
./deploy-github.ps1
```

### ✅ Commit Regularly
```bash
# Commit small, logical changes:
git add .
git commit -m "Add user validation to login form"
git push origin main
```

## 🔍 **Troubleshooting**

### Local Issues
```bash
# If local development breaks:
# 1. Check console for errors
# 2. Restart development servers
# 3. Clear browser cache
# 4. Check database connection
```

### Deployment Issues
```bash
# If deployment fails:
# 1. Check deploy-secure.ps1 output
# 2. Fix issues locally
# 3. Test again
# 4. Re-deploy
```

### Server Issues
```bash
# If server has problems:
# 1. Check server logs
ssh -i "config/deploy_key" root@168.231.122.33
pm2 logs katha-sales-backend

# 2. Restart services if needed
pm2 restart katha-sales-backend
sudo systemctl restart nginx
```

## 📋 **Quick Reference**

### Development Commands
```bash
# Start development
cd backend && npm start
cd frontend && npm run dev

# Test locally
curl http://localhost:4000/api
# Open http://localhost:5173 in browser

# Deploy safely
./deploy-secure.ps1
```

### Server Commands
```bash
# Check server status
ssh -i "config/deploy_key" root@168.231.122.33
pm2 status

# View logs
pm2 logs katha-sales-backend

# Restart application
pm2 restart katha-sales-backend
```

## 🎯 **Summary**

**Local Development = Safe Playground**
- Make any changes
- Break things
- Test thoroughly
- No impact on live site

**Server = Production Environment**
- Only tested code
- Stable and reliable
- Automatic backups
- Professional service

**Deployment = Controlled Process**
- Automated testing
- Secure transfer
- Version control
- Rollback capability

---

**Remember: Local changes NEVER affect the server until you explicitly deploy them!** 