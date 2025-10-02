# vRPA Manager - Quick Start Guide

## 🎯 What's Changed

Your vRPA Manager now uses a **backend server with JSON file storage** instead of browser localStorage. This means:

✅ **Shared data** - All users see the same devices  
✅ **Server storage** - Data persists on the server, not in browsers  
✅ **Easy backup** - Just copy the JSON files  
✅ **Multi-user ready** - Multiple people can use it simultaneously  

---

## 🚀 Quick Start (Development)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Start Backend Server

```bash
cd server
npm start
```

Server runs on: `http://localhost:3001`

### 3. Start Frontend (New Terminal)

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📁 Data Storage

All data stored in `/server/data/`:
```
server/data/
├── devices.json         # Your vRPA devices
├── team-members.json    # Users/team members
├── ping-history.json    # Device ping history
└── email-template.json  # Email template
```

**These files are created automatically on first run with default data.**

---

## 🔧 Configuration

### Development
Edit `.env.development`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Production
Edit `.env.production`:
```env
VITE_API_URL=http://your-server-ip:3001/api
```

---

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Files will be in ./dist/ folder
```

---

## 🌐 Ubuntu Server Deployment

See `DEPLOYMENT.md` for complete deployment guide.

**Quick version:**

1. **Setup server:**
   ```bash
   sudo ./setup-ubuntu.sh
   ```

2. **Copy application files:**
   ```bash
   sudo cp -r . /opt/vrpa-manager/
   ```

3. **Deploy (automated):**
   ```bash
   cd /opt/vrpa-manager
   sudo ./deploy.sh
   ```
   
   This script will:
   - Install all dependencies
   - Build the frontend
   - Start the backend with PM2
   - **✅ Configure auto-start on server reboot**

4. **Configure Nginx:**
   ```bash
   # See DEPLOYMENT.md for Nginx setup
   ```

**Your app will now auto-start on server reboot!** 🎉

---

## 🎮 API Endpoints

Backend API: `http://localhost:3001/api`

### Test API:
```bash
# Health check
curl http://localhost:3001/api/health

# Get devices
curl http://localhost:3001/api/devices

# Get team members
curl http://localhost:3001/api/team-members
```

---

## 💾 Backup Your Data

```bash
# Backup
cd server
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restore
tar -xzf backup-YYYYMMDD.tar.gz
```

---

## ❓ Troubleshooting

### "Cannot connect to API"
- Make sure backend server is running: `cd server && npm start`
- Check API URL in `.env.development`

### "Port 3001 already in use"
- Change port in `server/index.js` (line 7)
- Update `VITE_API_URL` in `.env` files

### Data not showing
- Check if backend started successfully
- Check browser console for errors
- Verify files exist in `server/data/`

---

## 📚 Documentation

- **DEPLOYMENT.md** - Full Ubuntu deployment guide
- **server/README.md** - Backend API documentation
- **UBUNTU_DEPLOYMENT.md** - Old localStorage guide (deprecated)

---

## 🔄 Migrating Existing Data

If you had data in browser localStorage:

1. **Export from browser console:**
   ```javascript
   console.log(JSON.stringify({
     devices: JSON.parse(localStorage.getItem('vrpa-devices')),
     members: JSON.parse(localStorage.getItem('team-members'))
   }))
   ```

2. **Import to server:**
   - Copy devices to `server/data/devices.json`
   - Copy members to `server/data/team-members.json`
   - Restart backend

---

## 🎉 You're All Set!

Your vRPA Manager now has proper server-side storage. All users will share the same device pool, and data persists properly on the server.

**Development:**
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

**Production:** See DEPLOYMENT.md
