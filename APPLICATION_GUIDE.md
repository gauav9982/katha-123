# કથા સેલ્સ એપ્લિકેશન - કમ્પ્લીટ ગાઈડ

## 📋 એપ્લિકેશન ઓવરવ્યુ

આ એપ્લિકેશનમાં બે મુખ્ય એપ્લિકેશન્સ છે:
1. **કથા સેલ્સ** (મુખ્ય એપ્લિકેશન)
2. **સ્કૂલ મેનેજમેન્ટ** (બીજી એપ્લિકેશન)

---

## 🏗️ એપ્લિકેશન સ્ટ્રક્ચર

```
katha 123/
├── backend/                 # કથા સેલ્સ બેકએન્ડ
├── frontend/               # કથા સેલ્સ ફ્રન્ટએન્ડ
├── school/                 # સ્કૂલ એપ્લિકેશન
├── database/               # મુખ્ય ડેટાબેઝ
├── config/                 # કન્ફિગરેશન ફાઈલ્સ
├── logs/                   # લોગ ફાઈલ્સ
└── docs/                   # ડોક્યુમેન્ટેશન
```

---

## 🌐 પોર્ટ કન્ફિગરેશન

### કથા સેલ્સ એપ્લિકેશન
- **બેકએન્ડ:** `http://localhost:4000` (API Server)
- **ફ્રન્ટએન્ડ:** `http://localhost:5173` (React App)

### સ્કૂલ એપ્લિકેશન
- **બેકએન્ડ:** `http://localhost:4001` (API Server)
- **ફ્રન્ટએન્ડ:** `http://localhost:5180` (React App)

---

## 🚀 લોકલ ડેવલપમેન્ટ સેટઅપ

### પ્રથમ વખત સેટઅપ

#### 1. કથા સેલ્સ એપ્લિકેશન

**બેકએન્ડ સેટઅપ:**
```bash
cd backend
npm install
node index.cjs
```

**ફ્રન્ટએન્ડ સેટઅપ:**
```bash
cd frontend
npm install
npm run dev
```

#### 2. સ્કૂલ એપ્લિકેશન

**બેકએન્ડ સેટઅપ:**
```bash
cd school/backend
npm install
node index.cjs
```

**ફ્રન્ટએન્ડ સેટઅપ:**
```bash
cd school/frontend
npm install
npm run dev
```

### એક સાથે બધી એપ્લિકેશન્સ ચલાવવા માટે

**🚀 સ્માર્ટ સ્ટાર્ટ સ્ક્રિપ્ટ (ભલામણ):**
```powershell
.\smart-start.ps1
```

**આ સ્ક્રિપ્ટ આ કામ કરે છે:**
1. ✅ બધા ports (4000, 4001, 4005, 5173, 5180, 3000-3004) kill કરે છે
2. ✅ PM2 processes stop કરે છે
3. ✅ Dependencies ચેક કરે છે અને install કરે છે
4. ✅ બધી applications એક સાથે start કરે છે
5. ✅ Status ચેક કરે છે અને browser માં ખોલે છે
6. ✅ Detailed error reporting આપે છે

**અથવા મેન્યુઅલી:**
```bash
# Terminal 1 - કથા સેલ્સ બેકએન્ડ
cd backend && npm start

# Terminal 2 - કથા સેલ્સ ફ્રન્ટએન્ડ
cd frontend && npm run dev

# Terminal 3 - સ્કૂલ બેકએન્ડ
cd school/backend && npm start

# Terminal 4 - સ્કૂલ ફ્રન્ટએન્ડ
cd school/frontend && npm run dev
```

---

## 🌍 સર્વર ડેપ્લોયમેન્ટ

### સર્વર રિક્વાયરમેન્ટ્સ

- **OS:** Ubuntu 20.04+ / CentOS 7+
- **Node.js:** v16+ 
- **NPM:** v8+
- **Nginx:** v1.18+
- **PM2:** v5+
- **Git:** v2.20+

### સર્વર સેટઅપ સ્ટેપ્સ

#### 1. સર્વર પર સોફ્ટવેર ઇન્સ્ટોલ કરવું

```bash
# Node.js ઇન્સ્ટોલ
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx ઇન્સ્ટોલ
sudo apt update
sudo apt install nginx

# PM2 ઇન્સ્ટોલ
sudo npm install -g pm2

# Git ઇન્સ્ટોલ
sudo apt install git
```

#### 2. એપ્લિકેશન ડાઉનલોડ કરવી

```bash
# ડિરેક્ટરી બનાવવી
sudo mkdir -p /var/www/katha-app
cd /var/www/katha-app

# GitHub થી કોડ ડાઉનલોડ
sudo git clone https://github.com/your-username/katha-app.git .

# પરમિશન્સ સેટ કરે છે
sudo chown -R $USER:$USER /var/www/katha-app
sudo chmod -R 755 /var/www/katha-app
```

#### 3. ડિપેન્ડન્સી ઇન્સ્ટોલ કરવી

```bash
# કથા સેલ્સ એપ્લિકેશન
cd /var/www/katha-app/backend
npm install --production

cd /var/www/katha-app/frontend
npm install --production
npm run build

# સ્કૂલ એપ્લિકેશન
cd /var/www/katha-app/school/backend
npm install --production

cd /var/www/katha-app/school/frontend
npm install --production
npm run build
```

#### 4. PM2 સાથે એપ્લિકેશન્સ ચલાવવી

```bash
cd /var/www/katha-app

# PM2 ecosystem ફાઈલ સાથે બધી એપ્લિકેશન્સ ચલાવવી
pm2 start ecosystem.config.cjs

# PM2 startup સેટ કરે છે
pm2 startup
pm2 save
```

#### 5. Nginx કન્ફિગરેશન

**કથા સેલ્સ માટે:**
```bash
sudo cp nginx-katha.conf /etc/nginx/sites-available/katha-sales
sudo ln -s /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/
```

**સ્કૂલ એપ્લિકેશન માટે:**
```bash
sudo cp config/nginx-school.conf /etc/nginx/sites-available/school-app
sudo ln -s /etc/nginx/sites-available/school-app /etc/nginx/sites-enabled/
```

**Nginx restart:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL સર્ટિફિકેશન (Let's Encrypt)

```bash
# Certbot ઇન્સ્ટોલ
sudo apt install certbot python3-certbot-nginx

# SSL સર્ટિફિકેશન જનરેટ
sudo certbot --nginx -d kathasales.com -d www.kathasales.com
sudo certbot --nginx -d school.kathasales.com

# Auto-renewal સેટ કરે છે
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 મેઇન્ટેનન્સ અને મોનિટરિંગ

### PM2 મોનિટરિંગ

```bash
# એપ્લિકેશન સ્ટેટસ જોવું
pm2 status

# લોગ્સ જોવા
pm2 logs

# એપ્લિકેશન restart કરે છે
pm2 restart all

# એપ્લિકેશન stop કરે છે
pm2 stop all
```

### લોગ ફાઈલ્સ

- **કથા સેલ્સ બેકએન્ડ:** `logs/err.log`, `logs/out.log`
- **સ્કૂલ બેકએન્ડ:** `school/logs/err.log`, `school/logs/out.log`
- **Nginx:** `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

### બેકઅપ

```bash
# ડેટાબેઝ બેકઅપ
cp database/katha_sales.db backup/katha_sales_$(date +%Y%m%d_%H%M%S).db

# કોડ બેકઅપ
tar -czf backup/code_$(date +%Y%m%d_%H%M%S).tar.gz .
```

---

## 🛠️ એપ્લિકેશન મેનેજર

### એક જ file માં બધા functions
```powershell
.\katha-app-manager.ps1
```

**આ એક જ script માં આ બધા options છે:**

#### 📋 મેનુ options:
1. **🚀 બધી એપ્લિકેશન્સ સ્ટાર્ટ કરો** - બધા ports kill કરીને એક સાથે બધી applications start કરે છે
2. **🛑 બધી એપ્લિકેશન્સ બંધ કરો** - બધી applications અને ports બંધ કરે છે
3. **🔍 પોર્ટ્સ સ્ટેટસ ચેક કરો** - બધા ports ની status ચેક કરે છે
4. **🔄 એપ્લિકેશન્સ રિસ્ટાર્ટ કરો** - બધી applications restart કરે છે
5. **🌐 બ્રાઉઝરમાં ખોલો** - Applications browser માં ખોલે છે
6. **📊 સિસ્ટમ સ્ટેટસ જુઓ** - Node.js, NPM, PM2 versions અને directory status ચેક કરે છે

#### ✨ ફીચર્સ:
- ✅ **ઓટોમેટિક પોર્ટ કિલિંગ** - બધા conflicting ports kill કરે છે
- ✅ **PM2 સપોર્ટ** - PM2 processes પણ handle કરે છે
- ✅ **ડિપેન્ડન્સી ચેક** - Missing dependencies install કરે છે
- ✅ **સ્ટેટસ રિપોર્ટિંગ** - Detailed status આપે છે
- ✅ **બ્રાઉઝર ઓપન** - Applications automatically browser માં ખોલે છે
- ✅ **એરર હેન્ડલિંગ** - Detailed error messages આપે છે
- ✅ **મેનુ સિસ્ટમ** - Easy navigation સાથે
- ✅ **સિસ્ટમ ડાયગ્નોસ્ટિક્સ** - Node.js, NPM, PM2 versions ચેક કરે છે

---

## 🐛 ટ્રબલશૂટિંગ

### સામાન્ય સમસ્યાઓ

#### 1. પોર્ટ પર એપ્લિકેશન ચાલતી નથી
```bash
# પોર્ટ ચેક કરવો
netstat -tulpn | grep :4000
netstat -tulpn | grep :5173

# પ્રોસેસ kill કરવો
sudo kill -9 <PID>
```

#### 2. PM2 એપ્લિકેશન ચાલતી નથી
```bash
# PM2 લોગ્સ જોવા
pm2 logs

# એપ્લિકેશન restart
pm2 restart katha-sales-backend
pm2 restart school-backend
```

#### 3. Nginx error
```bash
# Nginx config ટેસ્ટ
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

#### 4. ડેટાબેઝ કનેક્શન error
```bash
# ડેટાબેઝ ફાઈલ permissions ચેક
ls -la database/katha_sales.db

# ડેટાબેઝ repair
sqlite3 database/katha_sales.db "VACUUM;"
```

---

## 📞 સપોર્ટ અને કોન્ટેક્ટ

- **ડેવલપર:** [તમારું નામ]
- **ઇમેઇલ:** [તમારું ઇમેઇલ]
- **ફોન:** [તમારો ફોન નંબર]

---

## 📝 ચેન્જ લોગ

### Version 1.0.0
- કથા સેલ્સ એપ્લિકેશન ઇમ્પ્લિમેન્ટેશન
- સ્કૂલ મેનેજમેન્ટ એપ્લિકેશન ઇમ્પ્લિમેન્ટેશન
- PM2 અને Nginx સેટઅપ
- SSL સર્ટિફિકેશન

---

**નોંધ:** આ ગાઈડ સતત અપડેટ થતી રહેશે. કોઈપણ ફેરફાર કરતા પહેલા બેકઅપ લેવાનું ભૂલશો નહીં. 

---

## 🗄️ ડેટાબેઝ સિસ્ટમ

### ડેટાબેઝ ફાઈલ્સ:
- **katha_sales.db** - કથા સેલ્સ મુખ્ય ડેટાબેઝ (business ડેટા)
- **kathasales_live_backup.db** - લાઇવ બેકઅપ ડેટાબેઝ
- **school_salary.db** - સ્કૂલ સેલરી ડેટાબેઝ

### ડેટાબેઝ લોકેશન્સ:
- **લોકલ:** `database/` ફોલ્ડરમાં
- **સર્વર:** `/var/www/katha-app/database/` પર

### ડેટાબેઝ મેનેજર સ્ક્રિપ્ટ્સ

#### 📊 ડેટાબેઝ મેનેજર (GUI)
```powershell
.\database-manager.ps1
```

**આ script માં આ options છે:**
1. **📊 ડેટાબેઝ સ્ટેટસ જુઓ** - બધા databases ની status ચેક કરો
2. **💾 લોકલ બેકઅપ બનાવો** - લોકલ બેકઅપ બનાવો
3. **📤 સર્વર થી ડેટા ડાઉનલોડ કરો** - સર્વર થી ડેટા ડાઉનલોડ કરો
4. **📥 લોકલ થી સર્વર પર અપલોડ કરો** - લોકલ થી સર્વર પર અપલોડ કરો
5. **🔄 ડેટાબેઝ સિંક્રનાઈઝ કરો** - ડેટાબેઝ સિંક કરો
6. **🧹 ડેટાબેઝ ક્લીન કરો** - ડેટાબેઝ ક્લીન કરો
7. **🔧 ડેટાબેઝ રિપેર કરો** - ડેટાબેઝ રિપેર કરો
8. **📋 બેકઅપ લિસ્ટ જુઓ** - બેકઅપ લિસ્ટ જુઓ

#### 🔄 ડેટાબેઝ સિંક્રનાઈઝેશન
```powershell
# લોકલ થી સર્વર સિંક
.\database-sync.ps1 sync local

# સર્વર થી લોકલ સિંક
.\database-sync.ps1 sync server

# બેકઅપ બનાવો
.\database-sync.ps1 backup

# ડેટાબેઝ કમ્પેર કરો
.\database-sync.ps1 compare
```

### ડેટાબેઝ કન્ફિગરેશન

**`database-config.json`** ફાઈલમાં બધી settings છે:

```json
{
  "databases": {
    "katha_sales": {
      "name": "કથા સેલ્સ મુખ્ય ડેટાબેઝ",
      "local_path": "database/katha_sales.db",
      "server_path": "/var/www/katha-app/database/katha_sales.db"
    }
  },
  "server": {
    "host": "kathasales.com",
    "user": "root"
  },
  "backup": {
    "auto_backup": true,
    "backup_interval_hours": 24,
    "max_backups": 30
  }
}
```

### ડેટાબેઝ મેઇન્ટેનન્સ

#### 🔧 સામાન્ય મેઇન્ટેનન્સ
```bash
# ડેટાબેઝ વેક્યુમ (space cleanup)
sqlite3 database/katha_sales.db "VACUUM;"

# ડેટાબેઝ રિઇન્ડેક્સ
sqlite3 database/katha_sales.db "REINDEX;"

# ડેટાબેઝ ઇન્ટેગ્રિટી ચેક
sqlite3 database/katha_sales.db "PRAGMA integrity_check;"
```

#### 📋 બેકઅપ સ્ટ્રેટેજી
1. **દૈનિક બેકઅપ** - દરેક દિવસે ઓટોમેટિક બેકઅપ
2. **મેન્યુઅલ બેકઅપ** - મહત્વપૂર્ણ ફેરફાર પહેલા
3. **સર્વર બેકઅપ** - સર્વર પર ડેટા સિંક કરતા પહેલા
4. **ડિસાસ્ટર રિકવરી** - 30 દિવસનો બેકઅપ હિસ્ટ્રી

### ડેટાબેઝ સિંક્રનાઈઝેશન વર્કફ્લો

#### 🚀 ડેવલપમેન્ટ વર્કફ્લો
1. **લોકલ ડેવલપમેન્ટ** - લોકલ પર ડેટા ફેરફાર કરો
2. **બેકઅપ બનાવો** - ફેરફાર પહેલા બેકઅપ બનાવો
3. **સર્વર સિંક** - લોકલ થી સર્વર પર અપલોડ કરો
4. **ટેસ્ટિંગ** - સર્વર પર ટેસ્ટ કરો

#### 🔄 પ્રોડક્શન વર્કફ્લો
1. **સર્વર બેકઅપ** - સર્વર પર બેકઅપ બનાવો
2. **લોકલ સિંક** - સર્વર થી લોકલ પર ડાઉનલોડ કરો
3. **ડેવલપમેન્ટ** - લોકલ પર ફેરફાર કરો
4. **ડિપ્લોય** - લોકલ થી સર્વર પર અપલોડ કરો

### ડેટાબેઝ સિક્યોરિટી

#### 🔐 સિક્યોરિટી મેઝર્સ
- **બેકઅપ એન્ક્રિપ્શન** - સંવેદનશીલ ડેટા માટે
- **એક્સેસ કન્ટ્રોલ** - ફાઈલ permissions સેટ કરો
- **ઓડિટ ટ્રેઇલ** - ડેટા ફેરફારનો ઇતિહાસ
- **ડિસાસ્ટર રિકવરી** - બેકઅપ ફ્રોમ મલ્ટિપલ સોર્સ

#### 📋 બેસ્ટ પ્રેક્ટિસ
1. **નિયમિત બેકઅપ** - દૈનિક બેકઅપ બનાવો
2. **ટેસ્ટિંગ** - ફેરફાર પહેલા ટેસ્ટ કરો
3. **ડોક્યુમેન્ટેશન** - ડેટા સ્ટ્રક્ચર ડોક્યુમેન્ટ કરો
4. **વર્ઝન કન્ટ્રોલ** - ડેટાબેઝ ચેન્જેસ ટ્રેક કરો

---

## 🛠️ એપ્લિકેશન મેનેજર 