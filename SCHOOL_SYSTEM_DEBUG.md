# School System Debugging Guide

## Common Issues and Solutions

### 1. School System Not Loading on Production

If the school system is not loading at `kathasales.com/school-app`, check:

1. **Frontend Build**
   - Verify the build exists: `ls -la /var/www/katha-sales/school/frontend/dist`
   - Rebuild if needed: `cd /var/www/katha-sales/school/frontend && npm run build`

2. **Nginx Configuration**
   - Check nginx config: `nginx -T | grep -A 10 'location /school-app/'`
   - Verify static files are being served from correct path
   - Check nginx error logs: `tail -f /var/log/nginx/error.log`

3. **PM2 Services**
   - Check if services are running: `pm2 list`
   - View logs: `pm2 logs school-frontend`
   - Restart if needed: `pm2 restart school-frontend`

### 2. API Connection Issues

If the school system API is not responding:

1. **Backend Service**
   - Check if running: `curl http://localhost:4001/api/health`
   - View logs: `pm2 logs school-backend`
   - Check port conflicts: `netstat -tulpn | grep 4001`

2. **Database Connection**
   - Verify database exists: `ls -la /var/www/katha-sales/database/school.db`
   - Check permissions: `ls -la /var/www/katha-sales/database`
   - Run setup if needed: `cd /var/www/katha-sales/school/backend && node setup-database.cjs`

### 3. Port Conflicts

If you see port conflicts:

1. **Check Used Ports**
   ```bash
   netstat -tulpn | grep -E '4000|4001|5180'
   ```

2. **Default Ports**
   - Main Backend: 4000
   - School Backend: 4001
   - School Frontend: 5180

3. **Fixing Port Issues**
   ```bash
   # Kill process using a port
   fuser -k 4001/tcp
   
   # Restart services
   pm2 restart all
   ```

### 4. Permission Issues

Common permission problems and fixes:

1. **Database Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/katha-sales/database
   sudo chmod -R 664 /var/www/katha-sales/database
   ```

2. **Log Permissions**
   ```bash
   sudo mkdir -p /var/www/katha-sales/school/logs
   sudo chown -R www-data:www-data /var/www/katha-sales/school/logs
   ```

### 5. Quick Fixes

Common commands for quick fixes:

1. **Restart Everything**
   ```bash
   systemctl restart nginx
   pm2 restart all
   ```

2. **Clear Cache and Rebuild**
   ```bash
   cd /var/www/katha-sales/school/frontend
   npm cache clean --force
   rm -rf node_modules
   npm install
   npm run build
   ```

3. **Reset Database**
   ```bash
   cd /var/www/katha-sales/school/backend
   node setup-database.cjs
   ```

## Deployment Checklist

Before deploying:

1. [ ] Build frontend: `npm run build`
2. [ ] Check nginx configuration
3. [ ] Verify database setup
4. [ ] Check PM2 ecosystem file
5. [ ] Test all API endpoints
6. [ ] Verify static file serving
7. [ ] Check log directories
8. [ ] Test both applications locally

## Monitoring

Tools for monitoring the application:

1. **PM2 Monitoring**
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Nginx Logs**
   ```bash
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

3. **Resource Usage**
   ```bash
   df -h  # Disk space
   free -h  # Memory usage
   top  # CPU usage
   ```

## Local Development

Setting up local development:

1. **Start Both Applications**
   ```powershell
   .\start-all.ps1
   ```

2. **Local URLs**
   - Main App: http://localhost:5174
   - School App: http://localhost:5180

3. **Development Commands**
   ```bash
   # Start frontend in dev mode
   npm run dev
   
   # Start backend in dev mode
   node index.cjs
   ```

## Backup and Recovery

1. **Create Backup**
   ```bash
   cp -r /var/www/katha-sales/database /var/www/backup/database_$(date +%Y%m%d)
   ```

2. **Restore from Backup**
   ```bash
   cp -r /var/www/backup/database_YYYYMMDD/* /var/www/katha-sales/database/
   ```

## Contact Support

For additional support:
- Email: support@kathasales.com
- Phone: +91 XXXXXXXXXX
- GitHub Issues: [Report a bug](https://github.com/gauav9982/katha-123/issues) 