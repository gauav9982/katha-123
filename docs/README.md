# Katha Sales - Development & Deployment Guide

This guide provides all the necessary instructions for running, developing, and deploying the Katha Sales application.

---

## 🚀 Development Modes

You can run the application in two distinct modes depending on your needs.

### 1. Fully Local Development
This mode runs both the frontend and the backend on your local machine, using a local database file. It's ideal for offline work or building features without affecting live data.

**Command:**
```bash
npm run start
```
- **Frontend:** Runs on a local port (e.g., `http://localhost:3001`).
- **Backend:** Runs on a local port (e.g., `http://localhost:4000`).
- **Database:** Uses `backend/katha_sales.db`.

### 2. Live-Connected Development
This mode runs only the frontend on your local machine, but connects it directly to the live production database. This is perfect for testing new features with real data or debugging live data issues safely.

**Command:**
```bash
npm run start:live
```
- **Frontend:** Runs on a local port (e.g., `http://localhost:3001`).
- **Backend:** Connects to the live server URL (`http://168.231.122.33`).
- **Database:** Uses the production database on the live server.

---

## ☁️ Deployment to Production

Deployment is now fully automated using **GitHub Actions**. You no longer need to use `npm run deploy` or any manual `ssh`/`scp` commands.

The workflow is simple: **commit and push your changes to the `main` branch.**

### Step-by-Step Deployment Process:

**Step 1: Stage Your Changes**
Add all the files you have changed.
```bash
git add .
```

**Step 2: Commit Your Changes**
Commit the changes with a clear, descriptive message.
```bash
# Replace "Your descriptive message" with a real description
git commit -m "feat: Your descriptive message about the changes"
```
*Some common commit prefixes: `fix:` for bug fixes, `feat:` for new features, `chore:` for maintenance.*

**Step 3: Push to GitHub**
Push your commit to the `main` branch on GitHub.
```bash
git push
```

That's it! Once you push, GitHub Actions will automatically take over. It will build your application, package it correctly, and deploy it to the server. You can monitor the progress in the "Actions" tab of your GitHub repository.

---

## ⚙️ Initial Setup (One-Time Only)

If you are setting up this project on a new machine, you only need to do this once.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/gauav9982/katha-123.git
    cd katha-123
    ```
2.  **Install all dependencies:**
    This single command will install both root-level and backend dependencies.
    ```bash
    npm run setup
    ```
The project is now ready for development. You can use the `npm run start` or `npm run start:live` commands.

## Katha Sales Application

This is a sales management application for Katha.

## Overview
Katha Sales is a comprehensive sales and inventory management system designed for managing sales, purchases, inventory, and financial transactions.

## Features
- Item Management
- Sales Management (Cash & Credit)
- Purchase Management
- Party Management
- Delivery Chalan
- Receipt & Payment Management
- Stock Management
- Reports Generation

## 🚀 Quick Start - Live Server Connection

### Development માં Live Server Database જોવા માટે:

1. **Live Server સાથે Development:**
   ```bash
   npm run dev:live
   ```
   આ command તમને live server database સાથે development કરવા દેશે.

2. **Local Database સાથે Development:**
   ```bash
   npm run dev:local
   ```
   આ command તમને local database સાથે development કરવા દેશે.

3. **Frontend અને Backend બંને સાથે:**
   ```bash
   npm run start:live    # Live server સાથે
   npm run start         # Local database સાથે
   ```

### Database Connection Status જોવા માટે:

તમારી application માં database connection status જોવા માટે તમે browser console માં આ command run કરી શકો છો:
```javascript
console.log(window.DATABASE_INFO)
```

### Environment Variables Setup:

તમારા project root માં `.env` file બનાવો:

```bash
# Local Database સાથે Development
VITE_USE_LOCAL_DB=true

# Live Server સાથે Development  
VITE_USE_LOCAL_DB=false
```

### Visual Database Status:

તમારી application માં top-right corner માં database connection status જોવા મળશે:
- 🟢 **Green dot** = Connected
- 🔴 **Red dot** = Not connected  
- 🖥️ **Computer icon** = Local database
- 🖥️ **Server icon** = Live server

### Troubleshooting:

જો connection ના થાય તો:

1. **Server check કરો:**
   ```bash
   curl http://168.231.122.33:3000/
   ```

2. **Backend service restart કરો:**
   ```bash
   ssh root@168.231.122.33 "cd /var/www/katha-sales/backend && pm2 restart index.cjs"
   ```

3. **Dependencies install કરો:**
   ```bash
   npm install
   ```

## Database Setup
The application uses SQLite database. The database file is located at:
- Local Development: `backend/katha_sales.db`
- Production Server: `/var/www/katha-sales/backend/katha_sales.db`

### Important Notes about Database:
1. **Local Development:**
   - When you run the application locally, it uses the database file from `backend/katha_sales.db`
   - Any new items or invoices saved will be stored in this local database file

2. **Production Server:**
   - The server uses its own database file at `/var/www/katha-sales/backend/katha_sales.db`
   - To update the server's database with your local data:
     1. Copy your local `katha_sales.db` to the server
     2. Restart the backend service

3. **Database Synchronization:**
   - Local and server databases are separate
   - Changes made on one system won't automatically reflect on the other
   - To keep them in sync, manually copy the database file and restart the service

## How to Update Server Database
1. Copy local database to server:
   ```bash
   scp "backend/katha_sales.db" root@168.231.122.33:/var/www/katha-sales/backend/
   ```

2. Restart backend service:
   ```bash
   ssh root@168.231.122.33 "cd /var/www/katha-sales/backend && pm2 restart index.cjs"
   ```

## Application URLs
- Frontend: http://kathasales.com or http://168.231.122.33
- Backend API: http://kathasales.com/api or http://168.231.122.33:3000

## Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Start backend server:
   ```bash
   npm run backend
   ```

4. Or start both simultaneously:
   ```bash
   npm run start
   ```

## Production Deployment
1. Build the frontend:
   ```bash
   npm run build
   ```

2. Copy the built files to server:
   ```bash
   scp -r dist/* root@168.231.122.33:/var/www/katha-sales/
   ```

3. Copy database file:
   ```bash
   scp backend/katha_sales.db root@168.231.122.33:/var/www/katha-sales/backend/
   ```

4. Restart services:
   ```bash
   ssh root@168.231.122.33 "cd /var/www/katha-sales/backend && pm2 restart index.cjs && systemctl restart nginx"
   ```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Katha-Sales
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

To run both frontend and backend servers simultaneously:

```bash
npm run start
```

This will start:
- Frontend server at http://localhost:5173
- Backend server at http://localhost:4001

## Development

To run frontend and backend separately:

```bash
# Run frontend only
npm run dev

# Run backend only
npm run backend
```

## Building for Production

```bash
npm run build
```

## Project Structure

```
Katha-Sales/
├── src/                    # Frontend source code
│   ├── components/        # Reusable components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   ├── reports/          # Report components
│   └── store/            # State management
├── backend/              # Backend server code
│   ├── index.cjs        # Main server file
│   └── database/        # Database files
└── public/              # Static assets
```

## Technologies Used

- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - Zustand (State Management)
  - React Router

- Backend:
  - Express.js
  - SQLite
  - Node.js

## License

This project is licensed under the MIT License.

## Server Requirements

- Ubuntu 25.04
- Node.js
- Nginx
- SQLite3

## Server Details

- IP: 168.231.122.33
- Hostname: srv868935.hstgr.cloud
- RAM: 8GB
- Storage: 100GB
- Location: Mumbai

## GitHub Repository

- URL: https://github.com/gauav9982/katha-sales

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/gauav9982/katha-sales.git
cd katha-sales
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create SQLite database and tables
node migrate.cjs
# Start backend server with PM2
pm2 start index.cjs --name katha-sales-backend
```

### 3. Frontend Setup
```bash
cd ../
npm install
npm run build
```

### 4. Nginx Configuration
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/katha-sales

# Add this configuration:
server {
    listen 80;
    server_name kathasales.com www.kathasales.com;

    location / {
        root /var/www/katha-sales/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the configuration
sudo ln -s /etc/nginx/sites-available/katha-sales /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Copy Frontend Build to Web Root
```bash
sudo mkdir -p /var/www/katha-sales
sudo cp -r dist /var/www/katha-sales/
```

## Database Location

The SQLite database file is located at:
- Development: `C:\Users\DELL\Desktop\katha 123\backend\katha_sales.db`
- Production: `/var/www/katha-sales/backend/katha_sales.db`

### Database Backup and Restore

To backup the database:
```bash
# From the backend directory
cp katha_sales.db katha_sales.db.backup
```

To restore from backup:
```bash
# From the backend directory
cp katha_sales.db.backup katha_sales.db
```

### Database Troubleshooting

If the database is not showing data:
1. Check if the database file exists in the correct location
2. Verify file permissions (should be readable by the application)
3. Try restoring from backup if available
4. Check backend logs for any database connection errors
5. Restart the backend server after making any changes:
   ```bash
   pm2 restart katha-sales-backend
   ```

## API Endpoints

The application uses the following base URLs:
- Development: http://localhost:4000
- Production: https://kathasales.com

Main API endpoints:
- Groups: /api/groups
- Categories: /api/categories
- Items: /api/items
- Parties: /api/parties
- Purchases: /api/purchases
- Credit Sales: /api/creditsales
- Cash Sales: /api/cashsales
- Delivery Chalans: /api/delivery-chalans
- Reports: /api/reports/*

## Troubleshooting

1. If database is not showing data:
   - Check if the database file exists in backend directory
   - Restore from backup if needed
   - Verify database permissions

2. If nginx shows 502 Bad Gateway:
   - Check if backend server is running: `pm2 status`
   - Restart backend: `pm2 restart katha-sales-backend`
   - Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

3. If frontend is not loading:
   - Verify dist folder exists in /var/www/katha-sales/
   - Check nginx configuration
   - Clear browser cache

## Support

For any issues or support, please contact:
- Email: [your-email]
- Phone: [your-phone]

# કથા સેલ્સ - ઈન્વેન્ટરી અને એકાઉન્ટિંગ એપ્લિકેશન

આ એક વેબ-આધારિત ઈન્વેન્ટરી અને એકાઉન્ટિંગ એપ્લિકેશન છે જે નાના અને મધ્યમ કદના વ્યવસાયો માટે બનાવવામાં આવી છે. તે વેચાણ, ખરીદી, સ્ટોક, ચુકવણીઓ અન્ય નાણાકીય વ્યવહારોનું સંચાલન કરવામાં મદદ કરે છે.

## ટેકનોલોજી સ્ટેક

- **ફ્રન્ટએન્ડ:** React, Vite, TypeScript, Tailwind CSS
- **બેકએન્ડ:** Node.js, Express.js
- **ડેટાબેઝ:** SQLite
- **ડિપ્લોયમેન્ટ:** GitHub Actions, SSH, SCP

## આ એપ્લિકેશન કેવી રીતે કામ કરે છે?

આ સિસ્ટમ ત્રણ મુખ્ય ભાગોમાં વહેંચાયેલી છે: સ્થાનિક વિકાસ પર્યાવરણ, GitHub પર સોર્સ કોડ મેનેજમેન્ટ, અને સર્વર પર લાઇવ એપ્લિકેશન.

1.  **સ્થાનિક વિકાસ (તમારા કમ્પ્યુટર પર):**
    -   બધા ફેરફારો અને નવી સુવિધાઓ અહીં `src` ફોલ્ડરમાં બનાવવામાં આવે છે.
    -   `npm run dev` કમાન્ડનો ઉપયોગ કરીને ફેરફારોને સ્થાનિક રીતે ચકાસી શકાય છે.

2.  **ડિપ્લોયમેન્ટ પ્રક્રિયા (GitHub Actions):**
    -   જ્યારે કોડને `git push` દ્વારા GitHub પર મોકલવામાં આવે છે, ત્યારે GitHub Actions આપમેળે શરૂ થાય છે.
    -   તે કોડને તપાસે છે, જરૂરી પેકેજો ઇન્સ્ટોલ કરે છે (`npm install`), અને ફ્રન્ટએન્ડને પ્રોડક્શન માટે તૈયાર કરે છે (`npm run build`).
    -   બિલ્ડ પ્રક્રિયા સફળતાપૂર્વક પૂર્ણ થયા પછી, તે પરિણામી `dist` ફોલ્ડરને SCP દ્વારા સુરક્ષિત રીતે સર્વર પર `~/public_html/` ડિરેક્ટરીમાં ટ્રાન્સફર કરે છે.

3.  **સર્વર (લાઇવ એપ્લિકેશન):**
    -   સર્વર પર બેકએન્ડ એપ્લિકેશન અને મુખ્ય ડેટાબેઝ ચાલી રહ્યા છે.
    -   `public_html` ફોલ્ડરમાં નવી ફાઇલો આવતાની સાથે જ વપરાશકર્તાઓ માટે વેબસાઇટ અપડેટ થઈ જાય છે.
    -   ફ્રન્ટએન્ડ સર્વર પર ચાલી રહેલા બેકએન્ડ સાથે વાતચીત કરીને ડેટાનું સંચાલન કરે છે.

## ભવિષ્યમાં ફેરફાર કેવી રીતે કરવા?

કોઈપણ નવી સુવિધા ઉમેરવા અથવા હાલની સુવિધામાં ફેરફાર કરવા માટે નીચેની પ્રક્રિયાને અનુસરો.

#### ઉદાહરણ: નવું "ખર્ચ" (Expense) ફોર્મ ઉમેરવું

1.  **કોડમાં ફેરફાર કરો:**
    -   `src/forms/` ફોલ્ડરમાં `Expense` નામનું નવું ફોલ્ડર બનાવો.
    -   તેમાં `ExpenseForm.tsx` (ફોર્મ માટે) અને `ExpenseList.tsx` (ખર્ચની સૂચિ માટે) જેવી ફાઇલો બનાવો. તમે હાલના સરળ ફોર્મ (જેમ કે `Group` અથવા `Category`) માંથી કોડની નકલ કરીને શરૂ કરી શકો છો.
    -   `src/layouts/MainLayout.tsx` માં સાઇડબાર મેનુમાં "ખર્ચ" માટે એક નવી લિંક ઉમેરો.
    -   `src/App.tsx` માં નવા બનાવેલા ફોર્મ માટે રૂટ (route) વ્યાખ્યાયિત કરો.

2.  **બેકએન્ડ અને ડેટાબેઝ (જો જરૂરી હોય તો):**
    -   જો નવી સુવિધાને ડેટાબેઝમાં ફેરફારની જરૂર હોય, તો તમારે બેકએન્ડમાં પણ ફેરફાર કરવા પડશે.
    -   ડેટાબેઝમાં નવું ટેબલ બનાવો (દા.ત., `expenses`).
    -   બેકએન્ડ કોડમાં નવા API એન્ડપોઇન્ટ બનાવો જે આ ડેટાને સાચવી અને પુનઃપ્રાપ્ત કરી શકે.

3.  **સ્થાનિક રીતે પરીક્ષણ કરો:**
    -   તમારા ફેરફારોને સ્થાનિક મશીન પર ચકાસવા માટે `npm run dev` ચલાવો અને ખાતરી કરો કે બધું બરાબર કામ કરે છે.

4.  **કોડને GitHub પર Push કરો:**
    -   એકવાર તમે ફેરફારોથી સંતુષ્ટ થઈ જાઓ, પછી નીચેના ગિટ કમાન્ડ્સનો ઉપયોગ કરો:
      ```bash
      git add .
      git commit -m "નવું ખર્ચ મોડ્યુલ ઉમેર્યું"
      git push origin main
      ```
    -   આ કમાન્ડ તમારા કોડને GitHub પર મોકલશે અને ડિપ્લોયમેન્ટ પ્રક્રિયા આપમેળે શરૂ થઈ જશે. થોડીવારમાં તમારા ફેરફારો લાઇવ વેબસાઇટ પર દેખાશે.

## Deployment
The application is automatically deployed using GitHub Actions when changes are pushed to the master branch. 

## Development Workflow

### Local Development (તમારા પોતાના Computer પર)

જ્યારે તમારે live server ના data ને અસર કર્યા વગર કામ કરવું હોય, ત્યારે આ mode વાપરો.

1.  **Backend Server ચાલુ કરો:**
    ```bash
    npm run backend
    ```

2.  **Frontend Server ચાલુ કરો (બીજા Terminal માં):**
    ```bash
    npm run dev:local
    ```
    હવે, browser માં [http://localhost:3001](http://localhost:3001) ખોલો. તમને top-right માં **"Local DB"** 🖥️ દેખાશે.

### Live Development (Live Server ના Data સાથે)

જ્યારે તમારે UI માં ફેરફાર કરીને સીધા live data પર તેની અસર જોવી હોય, ત્યારે આ mode વાપરો.

1.  **Live Mode માં Frontend ચાલુ કરો:**
    ```bash
    npm run dev:live
    ```
    > **Note:** આ માટે તમારે local backend ચાલુ કરવાની જરૂર નથી.

2.  **Browser માં Check કરો:**
    હવે, browser માં [http://localhost:3001](http://localhost:3001) ખોલો. તમને top-right માં **"Live Server"** 🖥️ અને **Green dot** 🟢 દેખાશે. આનો મતલબ છે કે તમે live data પર કામ કરી રહ્યા છો.

---

### Deployment (બધા માટે Live કરવું)

જ્યારે તમારા બધા ફેરફાર final થઈ જાય અને તેને `kathasales.com` પર live કરવા હોય, ત્યારે આ command ચલાવો:

```bash
npm run deploy
```
આ command તમારા નવા code ને build કરીને live server પર મોકલી દેશે.

---
## GitHub નું શું મહત્વ છે? (Is GitHub still important?)

**હા, GitHub હવે પહેલા કરતાં પણ વધુ મહત્વનું છે!**

તમે જે `deploy` command ચલાવો છો, તે ફક્ત તમારા computer માંથી code ને server પર મોકલે છે. જો તમારું computer ખરાબ થઈ જાય, તો તમારો બધો જ code જતો રહેશે.

**GitHub તમારા code નું online backup અને history રાખે છે.**

તમારો સાચો workflow આ પ્રમાણે હોવો જોઈએ:

1.  **Code માં ફેરફાર કરો:** `dev:live` અથવા `dev:local` નો ઉપયોગ કરીને નવા features બનાવો અથવા ફેરફાર કરો.
2.  **Test કરો:** ખાતરી કરો કે બધું બરાબર ચાલી રહ્યું છે.
3.  **Code ને GitHub પર Save કરો (Push કરો):** જ્યારે તમારું કામ પૂરું થઈ જાય, ત્યારે આ commands ચલાવો:
    ```bash
    git add .
    git commit -m "મેં આ નવું feature બનાવ્યું"
    git push origin main
    ```
    આનાથી તમારો બધો જ code **સુરક્ષિત રીતે GitHub પર save** થઈ જશે.
4.  **Deploy કરો (જો જરૂર હોય તો):** જો તમારે આ ફેરફાર `kathasales.com` પર બધાને બતાવવા હોય, તો `npm run deploy` command ચલાવો.

**ટૂંકમાં:**
*   **`deploy`** = Code ને server પર મોકલી દેશે.
*   **`git push`** = Code ને GitHub પર હંમેશા માટે સાચવવા માટે.

**હંમેશા તમારું કામ પૂરું થયા પછી `git push` કરો. એ તમારા કામનો વીમો (insurance) છે.** 