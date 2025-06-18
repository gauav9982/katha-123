# Katha Sales Application

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

# કથા સેલ્સ એપ્લિકેશન ડિપ્લોયમેન્ટ સ્ટેપ્સ

## પૂર્ણ થયેલા સ્ટેપ્સ:

1. ✅ ફ્રન્ટએન્ડ બિલ્ડ જનરેટ કર્યું
2. ✅ nginx કન્ફિગરેશન સેટ કર્યું
   - રૂટ ડિરેક્ટરી સેટ કરી
   - ઇન્ડેક્સ ફાઇલ સેટ કરી
   - કેશિંગ હેડર્સ ઉમેર્યા
   - પ્રોક્સી હેડર્સ ઉમેર્યા
3. ✅ API URLs રિલેટિવ પાથ તરીકે અપડેટ કર્યા
4. ✅ Vite કન્ફિગરેશનમાં પ્રોક્સી સેટ કર્યું
5. ✅ PM2 કન્ફિગરેશન સેટ કર્યું
   - એક જ બેકએન્ડ સર્વર ચલાવવા માટે સેટ કર્યું
   - ઓટો રીસ્ટાર્ટ સેટ કર્યું
   - મેમરી લિમિટ સેટ કરી

## વર્તમાન સેટઅપ:

1. 🌐 ફ્રન્ટએન્ડ:
   - ડિરેક્ટરી: `/var/www/katha-sales/dist`
   - સર્વર: nginx
   - ડોમેઇન: kathasales.com

2. ⚙️ બેકએન્ડ:
   - પોર્ટ: 4000
   - પ્રોસેસ મેનેજર: PM2
   - નામ: katha-sales-backend

3. 🔄 પ્રોક્સી:
   - `/api` રિક્વેસ્ટ્સ બેકએન્ડ પર ફોરવર્ડ થાય છે
   - કેશિંગ ડિસેબલ કરેલું છે
   - CORS હેડર્સ સેટ કરેલા છે

## મેઇન્ટેનન્સ કમાન્ડ્સ:

1. બેકએન્ડ સર્વર રીસ્ટાર્ટ કરવા:
   ```bash
   pm2 restart katha-sales-backend
   ```

2. nginx રીસ્ટાર્ટ કરવા:
   ```bash
   systemctl restart nginx
   ```

3. લોગ્સ જોવા:
   ```bash
   # nginx લોગ્સ
   tail -f /var/log/nginx/error.log

   # બેકએન્ડ લોગ્સ
   pm2 logs katha-sales-backend
   ```

# Katha Sales Application Deployment

## Server Details
- IP: 168.231.122.33
- Hostname: srv868935.hstgr.cloud
- RAM: 8GB
- Storage: 100GB
- Location: Mumbai

## Deployment Steps Status

### 1. Server Setup
- [x] Install Node.js
- [x] Install PM2
- [x] Create application directory

### 2. Application Setup
- [x] Clone GitHub repository
- [x] Setup backend (npm install, migration, PM2)
- [x] Setup frontend (npm install, build)
- [x] Configure Nginx

### 3. Database Setup
- [x] SQLite database configured
- [x] Migrations completed

### 4. Final Configuration
- [x] Domain pointing (kathasales.com)
- [x] SSL configuration (pending)

## Current Status
✅ Backend setup complete, migration done, server running with PM2.
✅ Frontend build complete.
✅ Nginx configuration complete.
🚧 SSL configuration pending...

## Notes
- Application is deployed at kathasales.com
- Backend running on port 3000
- Frontend served through Nginx
- Database: SQLite 