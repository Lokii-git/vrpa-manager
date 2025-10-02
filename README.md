# vRPA Manager

A full-stack web application for managing vRPA (virtual RPA) devices with real-time monitoring, team management, deployment tracking, and secure authentication.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login system with bcrypt password hashing
- 🖥️ **Device Management** - Add, edit, delete, and track vRPA devices with IP addresses
- 📊 **Real-time Monitoring** - Automated device health checks with ping monitoring
- 📈 **Device History** - Track device status over time with visual charts
- 👥 **Team Management** - Manage team members and email distribution
- 📅 **Checkout System** - Track device assignments with check-in/check-out dates
- 🗓️ **Deployment Scheduling** - Schedule future deployments with ShareFile links
- 📧 **Email Templates** - Customizable deployment email templates
- 💾 **File-based Storage** - Simple JSON file storage on backend
- 🔒 **Protected API** - All endpoints secured with JWT authentication
- 🌐 **Proxy Support** - Works in development and production environments

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

### Frontend
- **React 18** - Modern UI with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast dev server with proxy
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Phosphor Icons** - Comprehensive icon set

### Backend
- **Node.js + Express** - RESTful API server
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing
- **JSON Storage** - File-based data persistence
- **CORS Enabled** - Cross-origin support

### Deployment
- **PM2** - Process manager with auto-restart
- **Nginx** - Reverse proxy and static file serving
- **Ubuntu 22.04+** - Production server OS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Lokii-git/vrpa-manager.git
cd vrpa-manager

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..

# 4. Start backend server (Terminal 1)
cd server
npm run dev  # Uses nodemon for auto-reload

# 5. Start frontend dev server (Terminal 2)
npm run dev  # Vite dev server with proxy
```

**Access the app**: Open http://localhost:5173

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin`

⚠️ **IMPORTANT**: Change the default password immediately after first login using the change password feature!

### First Time Setup

1. **Login** with default credentials (admin/admin)
2. **Change Password** - Click your username in the header
3. **Add Team Members** - Navigate to Team Management
4. **Add Devices** - Add your vRPA devices with IP addresses
5. **Start Monitoring** - Enable device health monitoring

## 📦 Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete Ubuntu deployment guide.

### Quick Deploy on Ubuntu 22.04+

```bash
# 1. Run setup script (installs Node.js 18, Nginx, PM2)
sudo ./setup-ubuntu.sh

# 2. Copy application files to /opt/vrpa-manager
sudo cp -r /path/to/vrpa-manager /opt/

# 3. Configure security (IMPORTANT - generates JWT secret and changes password)
cd /opt/vrpa-manager
./configure-security.sh

# 4. Deploy application (builds frontend, starts backend with PM2)
./deploy.sh

# 5. Configure Nginx reverse proxy
# See DEPLOYMENT.md for Nginx configuration

# Optional: Setup HTTPS with Let's Encrypt (recommended)
sudo certbot --nginx -d your-domain.com
```

**✅ Benefits:**
- App automatically starts on server reboot (PM2)
- Production-optimized build
- Secure JWT secrets
- Custom admin password

### Deployment Options

- **[HTTP_DEPLOYMENT.md](HTTP_DEPLOYMENT.md)** - Internal network deployment without HTTPS
- **[HTTPS_OPTIONAL.md](HTTPS_OPTIONAL.md)** - HTTP vs HTTPS comparison
- **[DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md)** - Pre-deployment checklist
- **[READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)** - Quick deployment summary

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Development quick start
- **[QUICK_START_AUTH.md](QUICK_START_AUTH.md)** - Authentication setup guide
- **[NEW_FEATURES_SUMMARY.md](NEW_FEATURES_SUMMARY.md)** - Recent features

### Authentication & Security
- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Authentication system overview
- **[AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)** - Technical implementation details
- **[TROUBLESHOOTING_LOGIN.md](TROUBLESHOOTING_LOGIN.md)** - Login issue solutions

### Deployment & Operations
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete Ubuntu deployment guide
- **[UBUNTU_DEPLOYMENT.md](UBUNTU_DEPLOYMENT.md)** - Ubuntu-specific instructions
- **[AUTO_START_GUIDE.md](AUTO_START_GUIDE.md)** - PM2 auto-start configuration
- **[UPDATE_GUIDE.md](UPDATE_GUIDE.md)** - Updating existing installations

### Backend API
- **[server/README.md](server/README.md)** - Backend API documentation
- All API endpoints require JWT authentication
- Environment variables configured in `server/.env`

## 🔧 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript 5** - Static typing and enhanced IDE support
- **Vite 5** - Next-generation frontend tooling
- **TailwindCSS 3** - Utility-first CSS framework
- **shadcn/ui** - Radix UI + Tailwind component library
- **Phosphor Icons** - Flexible icon family
- **Recharts** - Composable charting library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4** - Web application framework
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment configuration
- **uuid** - Unique ID generation

### DevOps
- **PM2** - Production process manager
- **Nginx** - Reverse proxy and web server
- **Nodemon** - Development auto-reload

## 🐛 Troubleshooting

### "Failed to fetch" Error
- Fixed in latest version with Vite proxy configuration
- See [TROUBLESHOOTING_LOGIN.md](TROUBLESHOOTING_LOGIN.md)

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### Cannot Login
1. Check backend is running: `curl http://localhost:3001/api/health`
2. Verify credentials: default is `admin/admin`
3. Check browser console for errors
4. Clear session storage and try again

## 🤝 Contributing

This is a private repository. For access or questions, contact the repository owner.

## 📝 License

MIT License

---

**Built with ❤️ for efficient vRPA device management**
