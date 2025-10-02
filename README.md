# vRPA Manager

A full-stack web application for managing vRPA (virtual RPA) devices with device monitoring, team management, and deployment tracking.

## ✨ Features

- � **Secure Authentication** - JWT-based login system with bcrypt password hashing
- �🖥️ **Device Management** - Add, edit, and track vRPA devices
- 📊 **Real-time Monitoring** - Automated device health checks
- 👥 **Team Management** - Manage users and access
- 📅 **Checkout System** - Track device assignments and schedules
- 📧 **Email Templates** - Customizable deployment email templates
- 💾 **File-based Storage** - Simple JSON file storage on server
- 🔒 **Multi-user Ready** - Shared data across all users

## 🏗️ Architecture

**Frontend**: React + TypeScript + Vite + TailwindCSS  
**Backend**: Node.js + Express  
**Storage**: JSON files  
**Server**: Nginx + PM2  

## 🚀 Quick Start

See **[QUICK_START_AUTH.md](QUICK_START_AUTH.md)** for complete setup with authentication.

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin`

⚠️ **Change the default password after first login!**

### Development

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Start backend
cd server && npm start

# 3. Start frontend (new terminal)
npm run dev
```

## 📦 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete Ubuntu deployment guide.

### Quick Deploy on Ubuntu:

```bash
# 1. Run setup script (installs Node.js, Nginx, PM2)
sudo ./setup-ubuntu.sh

# 2. Copy application files to /opt/vrpa-manager

# 3. Deploy (auto-configures startup on reboot)
cd /opt/vrpa-manager
sudo ./deploy.sh

# 4. Configure Nginx (see DEPLOYMENT.md)
```

**✅ Your app will automatically start on server reboot!**

## 📚 Documentation

- **[QUICK_START_AUTH.md](QUICK_START_AUTH.md)** - Quick start with authentication
- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Complete authentication system docs
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Ubuntu server deployment
- **[AUTO_START_GUIDE.md](AUTO_START_GUIDE.md)** - PM2 auto-start configuration
- **[ADMIN_PANEL_FEATURE.md](ADMIN_PANEL_FEATURE.md)** - Admin panel guide
- **[server/README.md](server/README.md)** - Backend API docs

## 🔧 Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- Express.js
- Phosphor Icons

## 📝 License

MIT License
