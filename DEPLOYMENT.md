# vRPA Manager - Full Stack Deployment Guide

## 🏗️ Architecture Overview

**Frontend**: React + Vite (Static files served by Nginx)  
**Backend**: Node.js + Express (REST API)  
**Storage**: JSON files on server filesystem  
**Process Manager**: PM2  
**Web Server**: Nginx (serves frontend + proxies API requests)

---

## 📁 File Storage Structure

All data stored in `/opt/vrpa-manager/server/data/`:
```
data/
├── devices.json         # All vRPA devices
├── team-members.json    # Team members/users
├── ping-history.json    # Device ping history
└── email-template.json  # Email template content
```

**Benefits**:
- ✅ Shared across all users
- ✅ Easy to backup (just copy the data folder)
- ✅ Easy to edit manually if needed
- ✅ Version control friendly
- ✅ No database setup required

---

## 🚀 Quick Deployment (Ubuntu Server)

### Step 1: Run Setup Script
```bash
# Download and run setup script
sudo ./setup-ubuntu.sh
```

This installs:
- Node.js 18 LTS
- Nginx
- PM2 (process manager)

### Step 2: Deploy Application
```bash
# Copy application to server
cd /opt/vrpa-manager
git clone <your-repo> .
# Or upload via SCP/SFTP

# Install dependencies
npm install
cd server && npm install && cd ..
```

### Step 3: Configure Environment
```bash
# Edit production API URL
nano .env.production

# Change to:
VITE_API_URL=http://your-server-ip/api
# Or use domain: https://yourdomain.com/api
```

### Step 4: Deploy Application (Automated)
```bash
cd /opt/vrpa-manager
sudo ./deploy.sh
```

This script will:
- ✅ Install all dependencies (frontend & backend)
- ✅ Build the frontend
- ✅ Start backend with PM2
- ✅ Configure auto-start on server reboot
- ✅ Save PM2 process list

**Or manually:**
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Start backend
cd server
pm2 start index.js --name vrpa-api
pm2 save

# Configure auto-start on reboot
pm2 startup systemd
# Run the command that PM2 outputs
```

### Step 5: Build Frontend
```bash
cd /opt/vrpa-manager
npm run build
```

### Step 6: Configure Nginx

Create `/etc/nginx/sites-available/vrpa-manager`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or server IP
    
    # Frontend - serve static files
    root /opt/vrpa-manager/dist;
    index index.html;
    
    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API - proxy to Node.js
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/vrpa-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Open Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🔒 Add SSL (Recommended for Production)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## 🔧 Management Commands

### Backend API

```bash
# Start
pm2 start vrpa-api

# Stop
pm2 stop vrpa-api

# Restart
pm2 restart vrpa-api

# View logs
pm2 logs vrpa-api

# Monitor
pm2 monit

# Check status
pm2 status

# List all processes
pm2 list
```

### ♻️ Auto-Start Verification

After running `deploy.sh`, your application will automatically start on server reboot.

**Verify auto-start is configured:**
```bash
# Check PM2 startup status
pm2 startup

# Should show: "PM2 resurrection list has been configured"

# List saved processes
pm2 list

# Your vrpa-api should be listed
```

**Test auto-start (optional):**
```bash
# Reboot the server
sudo reboot

# After reboot, check if API is running
pm2 status

# Should show vrpa-api as online
```

**Manual configuration (if needed):**
```bash
# Generate startup script
pm2 startup systemd

# Run the command PM2 outputs (it will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u youruser --hp /home/youruser

# Save process list
pm2 save
```

### Frontend Updates

```bash
cd /opt/vrpa-manager
git pull  # or upload new files
npm install
npm run build
# No need to restart anything - Nginx serves static files
```

### Backend Updates

```bash
cd /opt/vrpa-manager/server
git pull  # or upload new files
npm install
pm2 restart vrpa-api
```

---

## 💾 Backup & Restore

### Backup Data
```bash
# Create backup
cd /opt/vrpa-manager/server
tar -czf vrpa-backup-$(date +%Y%m%d).tar.gz data/

# Copy to safe location
scp vrpa-backup-*.tar.gz user@backup-server:/backups/
```

### Restore Data
```bash
cd /opt/vrpa-manager/server
tar -xzf vrpa-backup-YYYYMMDD.tar.gz
pm2 restart vrpa-api
```

### Automated Backups
Create `/etc/cron.daily/vrpa-backup`:
```bash
#!/bin/bash
cd /opt/vrpa-manager/server
tar -czf /backups/vrpa-backup-$(date +%Y%m%d).tar.gz data/
# Keep only last 30 days
find /backups/ -name "vrpa-backup-*.tar.gz" -mtime +30 -delete
```

```bash
sudo chmod +x /etc/cron.daily/vrpa-backup
```

---

## 📊 Monitoring

### Check API Health
```bash
curl http://localhost:3001/api/health
```

### View Logs
```bash
# Backend logs
pm2 logs vrpa-api

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### System Resources
```bash
# Check disk space
df -h

# Check memory
free -h

# Check processes
pm2 status
```

---

## 🔍 Troubleshooting

### API not responding
```bash
# Check if API is running
pm2 status

# Check API logs
pm2 logs vrpa-api

# Restart API
pm2 restart vrpa-api
```

### Cannot connect to API from frontend
1. Check `.env.production` has correct API URL
2. Rebuild frontend: `npm run build`
3. Check Nginx proxy configuration
4. Check firewall: `sudo ufw status`

### Data not persisting
```bash
# Check data directory permissions
ls -la /opt/vrpa-manager/server/data/

# Should be writable by the user running PM2
sudo chown -R $USER:$USER /opt/vrpa-manager/server/data/
```

### Port 3001 already in use
```bash
# Find process using port
sudo lsof -i :3001

# Kill process or change port in server/index.js
```

---

## 🔐 Security Recommendations

1. **Use SSL/HTTPS** (Let's Encrypt)
2. **Add authentication** (consider adding login system)
3. **Firewall** - only allow necessary ports
4. **Regular updates**: `sudo apt update && sudo apt upgrade`
5. **Backup data** regularly
6. **Restrict file permissions**:
   ```bash
   chmod 700 /opt/vrpa-manager/server/data
   ```

---

## 📈 Performance Tuning

### Nginx Caching
Add to Nginx config:
```nginx
location /api {
    # Cache GET requests for 1 minute
    proxy_cache_valid 200 1m;
    proxy_cache_bypass $http_cache_control;
    # ... other proxy settings
}
```

### PM2 Cluster Mode
For high traffic:
```bash
pm2 start server/index.js --name vrpa-api -i max
```

---

## 🌐 Access Your Application

- **Local**: http://localhost
- **Local with API**: http://localhost:3001/api/health
- **Remote**: http://your-server-ip
- **Domain**: https://your-domain.com

---

## 📞 Support

### Test Installation

1. **Check backend**: `curl http://localhost:3001/api/health`
2. **Check devices API**: `curl http://localhost:3001/api/devices`
3. **Check frontend**: Open browser to server IP

### Common Issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Backend not running - check `pm2 status` |
| CORS errors | Check CORS settings in `server/index.js` |
| Data not saving | Check file permissions in `server/data/` |
| API 404 | Check Nginx proxy configuration |

---

## 🆕 Future Migrations

If you outgrow JSON files, easy migration to:
- **SQLite** (single file database)
- **PostgreSQL** (production database)
- **MongoDB** (NoSQL option)

The API structure is ready - just swap the storage layer!
