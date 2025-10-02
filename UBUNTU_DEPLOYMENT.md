# vRPA Manager - Ubuntu Deployment Guide

## ✅ Storage Migration Complete

The app has been migrated from **GitHub Spark KV** to **Browser LocalStorage**. This means:
- ✅ Data persists across browser refreshes
- ✅ Works in development AND production
- ✅ No external dependencies or cloud services required
- ✅ Perfect for Ubuntu server deployment

---

## Storage Details

### What's Stored in LocalStorage:
- `vrpa-devices` - All vRPA devices
- `ping-history` - Device ping history (last 30 days)
- `team-members` - Team members/users
- `vrpa-email-template` - Email template content

### Data Location:
- **Browser**: Stored in the browser's localStorage (client-side)
- **Per-User**: Each user has their own data
- **Persistent**: Survives browser refreshes and restarts

---

## Deployment Options for Ubuntu

### Option 1: Simple Static Deployment (Recommended for Start)

**Requirements**: Nginx or Apache web server

#### Step 1: Build the Application
```bash
npm install
npm run build
```

#### Step 2: Deploy to Web Server
```bash
# Copy dist folder to web root
sudo cp -r dist/* /var/www/html/vrpa-manager/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/vrpa-manager
sudo chmod -R 755 /var/www/html/vrpa-manager
```

#### Step 3: Configure Nginx
Create `/etc/nginx/sites-available/vrpa-manager`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or IP address
    
    root /var/www/html/vrpa-manager;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/vrpa-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 2: With SSL (Recommended for Production)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

### Option 3: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t vrpa-manager .
docker run -d -p 80:80 vrpa-manager
```

---

## Important Notes

### 🔴 Current Limitations (LocalStorage):
1. **Client-Side Only**: Each user's browser has separate data
2. **No Multi-User Sync**: Data doesn't sync between users
3. **Browser-Specific**: Data is tied to the browser/device
4. **No Central Database**: Data isn't backed up centrally

### When to Add a Backend:

Consider adding a backend API + database if you need:
- ✅ **Multi-user collaboration** (shared device pool)
- ✅ **Central data management** (admin sees all data)
- ✅ **Data backup and recovery**
- ✅ **User authentication and authorization**
- ✅ **Cross-device access** (same data on mobile/desktop)

---

## Future Backend Migration Path

If you need shared data later, you can migrate to:

### Backend Options:
1. **Node.js + Express + SQLite** (Simple)
2. **Node.js + Express + PostgreSQL** (Production-ready)
3. **Python + FastAPI + PostgreSQL**
4. **Go + Gin + PostgreSQL**

### Database Schema (for future reference):
```sql
-- Devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    ip_address VARCHAR(45),
    root_password VARCHAR(255),
    sharefile_link TEXT,
    status VARCHAR(20),
    checkout_status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

-- Checkouts table
CREATE TABLE checkouts (
    id UUID PRIMARY KEY,
    device_id UUID REFERENCES devices(id),
    team_member_id UUID REFERENCES team_members(id),
    client_name VARCHAR(255),
    checkout_date TIMESTAMP,
    expected_return_date TIMESTAMP,
    actual_return_date TIMESTAMP,
    notes TEXT,
    is_active BOOLEAN
);

-- Ping history table
CREATE TABLE ping_history (
    id UUID PRIMARY KEY,
    device_id UUID REFERENCES devices(id),
    timestamp TIMESTAMP,
    status VARCHAR(20),
    response_time INTEGER
);
```

---

## Quick Start Commands (Ubuntu)

```bash
# 1. Install dependencies (if needed)
sudo apt update
sudo apt install nginx nodejs npm

# 2. Clone/copy your project
cd /var/www/
git clone <your-repo>
cd vrpa-manager

# 3. Install and build
npm install
npm run build

# 4. Set up Nginx (see Option 1 above)

# 5. Access your app
# http://your-server-ip
```

---

## Monitoring & Maintenance

### Check Nginx Status:
```bash
sudo systemctl status nginx
```

### View Nginx Logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update the App:
```bash
cd /var/www/vrpa-manager
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/vrpa-manager/
```

---

## Support

For local-only deployment, the current localStorage solution is perfect. 

**Need a backend?** Let me know and I can help you:
1. Design the API architecture
2. Set up the database
3. Create the backend service
4. Update the frontend to use the API
5. Add authentication

The current code is structured to make this migration easy when you're ready!
