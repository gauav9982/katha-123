# Katha Sales - Workflow Tools

## 🚀 Quick Start

### **Option 1: Simple Batch File (Recommended)**
```bash
workflow.bat
```
આ file double-click કરો અથવા terminal માં run કરો.

### **Option 2: PowerShell Script**
```bash
powershell -ExecutionPolicy Bypass -File quick-workflow.ps1
```

### **Option 3: Manual Commands**
```bash
# નવી branch બનાવવા માટે
git checkout main
git pull
git checkout -b feature-name

# Changes save કરવા માટે
git add .
git commit -m "your message"

# Main માં merge કરવા માટે
git checkout main
git merge feature-name
git push
```

## 📋 Available Tools

### **1. workflow.bat**
- Simple batch file
- Easy to use menu
- Basic workflow commands

### **2. quick-workflow.ps1**
- Advanced PowerShell script
- More features
- Better error handling

### **3. test-before-deploy.ps1**
- Deployment પહેલા test કરવા માટે
- Database connection test
- Frontend build test
- Git status check

### **4. DEVELOPMENT_WORKFLOW.md**
- Complete workflow guide
- Best practices
- Troubleshooting tips

## 🎯 Common Scenarios

### **નવું Feature Add કરવું:**
1. `workflow.bat` run કરો
2. Option 1 select કરો
3. Feature name આપો
4. કામ કરો
5. Option 2 select કરી changes save કરો
6. Test કરો
7. Option 4 select કરી deploy કરો

### **Bug Fix કરવું:**
1. નવી branch બનાવો
2. Bug fix કરો
3. Test કરો
4. Commit કરો
5. Deploy કરો

### **Emergency Reset:**
1. `workflow.bat` run કરો
2. Option 5 select કરો
3. Reset type choose કરો

## 🔧 Manual Commands Reference

### **Branch Management:**
```bash
git branch                    # બધી branches જુઓ
git checkout branch-name      # Branch switch કરો
git branch -d branch-name     # Branch delete કરો
```

### **Changes Management:**
```bash
git status                    # Current status જુઓ
git add .                     # બધા changes add કરો
git commit -m "message"       # Commit કરો
git push                      # GitHub પર push કરો
```

### **Emergency Commands:**
```bash
git reset --hard HEAD~1       # છેલ્લો commit undo
git reset --hard origin/main  # Main branch પર reset
git checkout HEAD -- file     # Specific file restore
```

## 🚨 Important Notes

### **✅ કરવાનું:**
- હંમેશા નવી branch બનાવો
- Regular commits કરો
- Test before deploy
- Meaningful commit messages

### **❌ ન કરવાનું:**
- Main branch પર direct કામ ન કરો
- Untested code deploy ન કરો
- Large changes એક જ commit માં ન કરો

## 📞 Help

જો કંઈક ખોટું થાય તો:
1. `git status` run કરો
2. `git log --oneline` જુઓ
3. Emergency reset કરો
4. Help માટે પૂછો

---

*આ tools તમારું development safe અને organized રાખશે!* 🚀 