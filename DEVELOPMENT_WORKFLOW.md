# Katha Sales - Development Workflow Guide

## 🚀 નવા Feature માટેનો Complete Workflow

### **Step 1: નવી Branch બનાવો**
```bash
git checkout main                    # Main branch પર જાઓ
git pull                            # Latest changes લાવો
git checkout -b feature-name        # નવી branch બનાવો
```

### **Step 2: Development કરો**
- તમારા changes કરો
- Local માં test કરો
- Code review કરો

### **Step 3: Changes Save કરો**
```bash
git add .                           # બધા changes add કરો
git commit -m "Add: feature description"  # Commit કરો
```

### **Step 4: Test કરો**
```bash
# Frontend test
cd frontend
npm run dev

# Backend test  
cd ../backend
npm start
```

### **Step 5: Main માં Merge કરો**
```bash
git checkout main                   # Main branch પર જાઓ
git merge feature-name              # Feature merge કરો
git push                           # GitHub પર push કરો
```

### **Step 6: Server પર Deploy કરો**
```bash
./deploy-secure.ps1                # Secure deployment script
```

---

## 🔄 જો કંઈક ખોટું થાય તો (Emergency Recovery)

### **Option 1: Feature Branch Delete કરો**
```bash
git checkout main                   # Main પર જાઓ
git branch -D feature-name          # Feature branch delete કરો
```

### **Option 2: છેલ્લો Commit Undo કરો**
```bash
git reset --hard HEAD~1             # છેલ્લો commit undo
```

### **Option 3: Specific File Restore કરો**
```bash
git checkout HEAD -- filename       # Specific file restore
```

---

## 📋 Feature Development Checklist

### **Before Starting:**
- [ ] Main branch પર latest changes છે
- [ ] નવી branch બનાવી છે
- [ ] Requirements clear છે

### **During Development:**
- [ ] Code clean અને readable છે
- [ ] Error handling છે
- [ ] Local test pass થાય છે

### **Before Commit:**
- [ ] બધા changes add કર્યા છે
- [ ] Meaningful commit message લખ્યું છે
- [ ] Test કર્યું છે

### **Before Merge:**
- [ ] Main branch પર latest changes છે
- [ ] Feature complete છે
- [ ] Ready for deployment છે

---

## 🎯 Common Feature Types

### **1. નવું Form બનાવવું**
- Frontend: `src/forms/NewForm/` folder બનાવો
- Backend: Database table અને API routes
- Integration: Main layout માં add કરો

### **2. નવું Report બનાવવું**
- Frontend: `src/reports/` folder માં
- Backend: Report API endpoint
- Database: Query optimization

### **3. UI Changes**
- CSS/SCSS changes
- Component modifications
- Responsive design updates

### **4. Database Changes**
- New tables
- Schema modifications
- Data migrations

---

## 🚨 Important Rules

### **✅ કરવાનું:**
- હંમેશા નવી branch બનાવો
- Regular commits કરો
- Test before commit
- Meaningful commit messages
- Pull latest changes before starting

### **❌ ન કરવાનું:**
- Main branch પર direct કામ ન કરો
- Untested code commit ન કરો
- Server files direct edit ન કરો
- Large changes એક જ commit માં ન કરો

---

## 🔧 Useful Commands

### **Branch Management:**
```bash
git branch                          # બધી branches જુઓ
git branch -a                       # Remote branches પણ જુઓ
git branch -d branch-name           # Branch delete કરો
```

### **Status Check:**
```bash
git status                          # Current status
git log --oneline                   # Commit history
git diff                            # Changes જુઓ
```

### **Stash (Temporary Save):**
```bash
git stash                           # Changes temporarily save કરો
git stash pop                       # Stashed changes restore કરો
```

---

## 📞 Emergency Contacts

### **જો કંઈક ખોટું થાય તો:**
1. **Don't Panic!** - Git everything track કરે છે
2. **Check Status:** `git status`
3. **Check History:** `git log --oneline`
4. **Ask for Help:** Always backup before major changes

### **Quick Recovery:**
```bash
# બધું reset કરવા માટે
git reset --hard origin/main

# Specific file restore
git checkout HEAD -- filename
```

---

## 🎉 Success Tips

1. **Small Changes:** એક વખતે થોડા changes કરો
2. **Regular Commits:** દરરોજ commit કરો
3. **Test Often:** દરેક change પછી test કરો
4. **Document Changes:** શું કર્યું તે note કરો
5. **Backup Important:** Critical files backup રાખો

---

*આ workflow follow કરવાથી તમારું development safe અને organized રહેશે!* 🚀 