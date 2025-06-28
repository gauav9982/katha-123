# School Salary Management System - Quick Start Guide

## 🚀 એક Command થી બધું Start કરવા માટે:

### Option 1: PowerShell Script (Recommended)
```powershell
npm run dev:all
```

### Option 2: Batch File
```cmd
npm run start:all
```

### Option 3: Manual Commands
```bash
# Backend start કરવા માટે
npm run backend

# Frontend start કરવા માટે (નવી terminal માં)
npm run frontend
```

## 📁 Project Structure
```
school/
├── backend/          # Node.js API Server
├── frontend/         # React Frontend
├── database/         # SQLite Database
├── start-all.bat     # Windows Batch Script
├── start-all.ps1     # PowerShell Script
└── package.json      # Root Package.json
```

## 🌐 URLs
- **Frontend**: http://localhost:5179
- **Backend API**: http://localhost:4007
- **School Dashboard**: http://localhost:5179/school
- **Login Debug**: http://localhost:5179/login-debug

## 🔧 Setup Commands

### પહેલી વાર setup કરવા માટે:
```bash
npm run install:all
npm run setup
```

### Database setup:
```bash
cd backend
npm run setup
```

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:all` | બધા servers એક સાથે start કરે |
| `npm run start:all` | Batch file થી start કરે |
| `npm run backend` | માત્ર backend start કરે |
| `npm run frontend` | માત્ર frontend start કરે |
| `npm run install:all` | બધા dependencies install કરે |
| `npm run setup` | Database setup કરે |

## 🐛 Troubleshooting

### જો "dev:all" script ન મળે:
1. Root directory માં જાઓ: `cd school`
2. `npm run dev:all` run કરો

### જો PowerShell execution policy error આવે:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### જો ports already in use:
```bash
# Port 4007 ચેક કરો
netstat -an | findstr :4007

# Port 5179 ચેક કરો  
netstat -an | findstr :5179
```

## 📝 Login Instructions

1. **Frontend ખોલો**: http://localhost:5179/school
2. **City name દાખલ કરો**: Nadiad, Ahmedabad, Vadodara, Surat, Rajkot
3. **Login કરો**
4. **Dashboard માં જાઓ**

## 🔍 Debug Tools

- **Login Debug**: http://localhost:5179/login-debug
- **API Health Check**: http://localhost:4007/api/health

## 📊 Features Available

- ✅ Teacher Management
- ✅ Salary Management  
- ✅ DA% Management
- ✅ HRA% Management
- ✅ LWP Management
- ✅ Payable 5th Commission Report
- 🔄 More reports coming soon...

---

**Note**: બધા servers start થવામાં 10-15 seconds લાગી શકે છે. Patience રાખો! 😊 