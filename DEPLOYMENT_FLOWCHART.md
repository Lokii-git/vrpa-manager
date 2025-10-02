# 🚀 vRPA Manager - Deployment Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│                    Ubuntu Server Setup                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Run setup-ubuntu.sh                                │
│  ─────────────────────────────                              │
│  • Installs Node.js 18                                      │
│  • Installs Nginx                                           │
│  • Installs PM2 (process manager)                           │
│  • Creates /opt/vrpa-manager directory                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Copy Application Files                             │
│  ───────────────────────────────                            │
│  sudo cp -r vrpa-manager/* /opt/vrpa-manager/               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Run deploy.sh                                      │
│  ──────────────────────                                     │
│  Automatically does:                                        │
│  ├─ npm install (frontend & backend)                       │
│  ├─ npm run build (frontend)                               │
│  ├─ pm2 start server/index.js --name vrpa-api              │
│  ├─ pm2 save                                                │
│  └─ pm2 startup systemd  ← ✅ CONFIGURES AUTO-START        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Configure Nginx                                    │
│  ────────────────────────                                   │
│  • Proxy /api to http://localhost:3001                     │
│  • Serve static files from /opt/vrpa-manager/dist          │
│  • Enable SSL (optional)                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               ✅ DEPLOYMENT COMPLETE!                        │
│                                                              │
│  Your application is now:                                   │
│  • Running on your server                                   │
│  • Managed by PM2                                           │
│  • Will auto-start on reboot                                │
│  • Accessible via Nginx                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Auto-Start Flow (What Happens on Reboot)

```
Server Boots Up
      ↓
┌─────────────────────┐
│  Systemd Starts     │ ← Ubuntu's init system
└─────────────────────┘
      ↓
┌─────────────────────┐
│  pm2-$USER Service  │ ← Created by "pm2 startup"
│  Starts             │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  PM2 Daemon         │ ← PM2 process manager
│  Starts             │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  PM2 Resurrects     │ ← Reads saved process list
│  Saved Processes    │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  vrpa-api           │ ← Your Node.js backend
│  Starts             │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  ✅ API Running     │
│  Port 3001          │
└─────────────────────┘
```

---

## 📋 Quick Reference

| Action | Command |
|--------|---------|
| Initial setup | `sudo ./setup-ubuntu.sh` |
| Deploy app | `sudo ./deploy.sh` |
| Check status | `pm2 status` |
| View logs | `pm2 logs vrpa-api` |
| Restart app | `pm2 restart vrpa-api` |
| Stop app | `pm2 stop vrpa-api` |
| Check auto-start | `systemctl status pm2-$USER` |
| Test auto-start | `sudo reboot` |

---

## 🎯 Key Points

1. **`setup-ubuntu.sh`** = Install software (one-time)
2. **`deploy.sh`** = Deploy app + configure auto-start (run after copying files)
3. **PM2 + systemd** = Auto-start on reboot ✅
4. **Nginx** = Serve frontend + proxy API

---

## 📚 Documentation Files

- **AUTO_START_SUMMARY.md** - Quick answer to auto-start question
- **AUTO_START_GUIDE.md** - Detailed auto-start guide
- **DEPLOYMENT.md** - Complete deployment guide
- **QUICK_START.md** - Development & deployment quick start
- **README.md** - Project overview

---

## ✅ After Deployment

Your vRPA Manager will:
- ✅ Start automatically when server boots
- ✅ Restart automatically if it crashes (PM2 watches it)
- ✅ Log everything (accessible via `pm2 logs`)
- ✅ Be manageable via PM2 commands
- ✅ Survive server reboots without intervention

**You can safely reboot your server anytime!** 🎉
