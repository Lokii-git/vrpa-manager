# vRPA Manager - Auto-Start Configuration

## ✅ Yes, Auto-Start is Configured!

When you run `deploy.sh`, it automatically configures your application to start on server reboot using PM2.

---

## 🔄 How Auto-Start Works

1. **PM2 Process Manager** manages your Node.js backend
2. **PM2 Startup Script** integrates with systemd (Ubuntu's init system)
3. **On Server Reboot**: systemd → PM2 → Your API automatically starts

---

## 📋 Setup Process

### Initial Setup (One-time)
```bash
# 1. Install system packages
sudo ./setup-ubuntu.sh

# 2. Copy your application to /opt/vrpa-manager

# 3. Run deployment script
cd /opt/vrpa-manager
sudo ./deploy.sh
```

The `deploy.sh` script automatically runs:
```bash
pm2 start index.js --name vrpa-api  # Start the API
pm2 save                            # Save process list
pm2 startup systemd                 # Configure auto-start ✓
```

---

## ✅ Verify Auto-Start is Enabled

```bash
# Check PM2 status
pm2 status

# Should show:
# ┌─────┬──────────┬─────────┬─────────┬─────────┐
# │ id  │ name     │ status  │ restart │ uptime  │
# ├─────┼──────────┼─────────┼─────────┼─────────┤
# │ 0   │ vrpa-api │ online  │ 0       │ 2m      │
# └─────┴──────────┴─────────┴─────────┴─────────┘

# Check startup configuration
systemctl status pm2-$USER

# Should show: "Active: active (running)"
```

---

## 🧪 Test Auto-Start

```bash
# Method 1: Reboot server
sudo reboot

# After server comes back online (wait ~30 seconds)
ssh user@your-server

# Check if API is running
pm2 status
curl http://localhost:3001/api/health

# Method 2: Stop and simulate boot
pm2 kill              # Stop PM2 daemon
pm2 resurrect         # Restore saved processes
```

---

## 🛠️ Management Commands

### Check Auto-Start Status
```bash
pm2 startup           # Shows current startup config
pm2 save              # Save current process list
systemctl status pm2-$USER  # Check systemd service
```

### Disable Auto-Start (if needed)
```bash
pm2 unstartup systemd
```

### Re-enable Auto-Start
```bash
pm2 startup systemd
# Run the command it outputs
pm2 save
```

### After Server Reboot
```bash
# Your API should automatically be running
pm2 status            # Check status
pm2 logs vrpa-api     # View logs since boot
```

---

## 📂 What Gets Auto-Started

Only the **backend API** auto-starts with PM2:
- ✅ **Backend**: `node server/index.js` (port 3001)

The **frontend** doesn't need to auto-start because:
- It's static files served by Nginx
- Nginx auto-starts via systemd (Ubuntu default)

---

## 🔍 Troubleshooting Auto-Start

### API not running after reboot

**Check PM2 daemon:**
```bash
pm2 status
```

**Check systemd service:**
```bash
systemctl status pm2-$USER
```

**Check logs:**
```bash
pm2 logs vrpa-api
journalctl -u pm2-$USER
```

**Manually start if needed:**
```bash
pm2 resurrect    # Restore saved processes
# or
pm2 start server/index.js --name vrpa-api
pm2 save
```

### PM2 not starting on boot

**Re-run startup configuration:**
```bash
pm2 startup systemd
# Copy and run the command it outputs
pm2 save
```

**Check if systemd service exists:**
```bash
systemctl list-unit-files | grep pm2
```

---

## 📊 Complete Auto-Start Flow

```
Server Boot
    ↓
Systemd starts
    ↓
Systemd runs: pm2-$USER.service
    ↓
PM2 daemon starts
    ↓
PM2 reads saved process list
    ↓
PM2 starts: vrpa-api
    ↓
Your API is running! ✅
```

---

## 💡 Summary

**After running `deploy.sh`:**
- ✅ Your backend API starts automatically on server reboot
- ✅ No manual intervention needed
- ✅ Survives crashes (PM2 auto-restarts)
- ✅ Survives server reboots (systemd integration)
- ✅ Logs are preserved and rotated

**You can safely reboot your Ubuntu server anytime!**
