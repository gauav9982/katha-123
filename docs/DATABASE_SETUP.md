# Database Connection Setup Guide

## તમારી Application ને Live Server સાથે Connect કરવા માટે:

### 1. **Environment Variables Setup:**

તમારા project root માં `.env` file બનાવો અને આ configuration add કરો:

```bash
# Local Database સાથે Development
VITE_USE_LOCAL_DB=true

# Live Server સાથે Development  
VITE_USE_LOCAL_DB=false
```

### 2. **Commands to Run:**

#### Local Database સાથે Development:
```bash
npm run dev:local
# અથવા
VITE_USE_LOCAL_DB=true npm run dev
```

#### Live Server Database સાથે Development:
```bash
npm run dev:live
# અથવા
VITE_USE_LOCAL_DB=false npm run dev
```

#### Frontend અને Backend બંને સાથે:
```bash
# Local Database સાથે
npm run start

# Live Server સાથે
npm run start:live
```

### 3. **Database Connection Status:**

તમારી application માં top-right corner માં database connection status જોવા મળશે:
- 🟢 **Green dot** = Connected
- 🔴 **Red dot** = Not connected
- 🖥️ **Computer icon** = Local database
- 🖥️ **Server icon** = Live server

### 4. **Server Details:**

- **Server IP:** 168.231.122.33
- **Backend Port:** 3000
- **Database Path:** `/var/www/katha-sales/backend/katha_sales.db`

### 5. **Troubleshooting:**

જો connection ના થાય તો:

1. **Server check કરો:**
   ```bash
   curl http://168.231.122.33:3000/
   ```

2. **Backend service restart કરો:**
   ```bash
   ssh root@168.231.122.33 "cd /var/www/katha-sales/backend && pm2 restart index.cjs"
   ```

3. **Firewall check કરો:**
   ```bash
   ssh root@168.231.122.33 "ufw status"
   ```

### 6. **Live Database જોવા માટે:**

તમે browser console માં આ command run કરી શકો છો:
```javascript
console.log('Database Info:', window.DATABASE_INFO)
```

### 7. **Production Deployment:**

```bash
# Build અને deploy
npm run deploy

# માત્ર server પર files copy કરવા માટે
npm run deploy:server
```

## Important Notes:

1. **Development માં Live Server જોવા માટે:** `VITE_USE_LOCAL_DB=false` set કરો
2. **Local Development માટે:** `VITE_USE_LOCAL_DB=true` set કરો  
3. **Production માં:** આ configuration automatically handle થાય છે
4. **Database changes:** Live server પર changes કરવા માટે database file copy કરવી પડશે

## Quick Commands:

```bash
# Live server સાથે development
npm run dev:live

# Local database સાથે development  
npm run dev:local

# Both frontend અને backend
npm run start:live

# Production build
npm run build

# Deploy to server
npm run deploy
``` 