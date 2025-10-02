#!/bin/bash

# vRPA Manager - Deployment Script
# Run this AFTER you've copied the application files to /opt/vrpa-manager

set -e  # Exit on any error

APP_DIR="/opt/vrpa-manager"
API_NAME="vrpa-api"

echo "🚀 vRPA Manager Deployment Script"
echo "===================================="
echo ""

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: Application directory $APP_DIR does not exist"
  echo "Please copy your application files first!"
  exit 1
fi

cd $APP_DIR

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process (if any)..."
pm2 stop $API_NAME 2>/dev/null || true
pm2 delete $API_NAME 2>/dev/null || true

# Start backend with PM2
echo "🚀 Starting backend API..."
cd server
pm2 start index.js --name $API_NAME
cd ..

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# Configure PM2 to start on system boot
echo "⚙️  Configuring PM2 startup on boot..."
# This generates and runs the startup script
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔗 Backend API: http://localhost:3001/api/health"
echo "📁 Frontend files: $APP_DIR/dist/"
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see DEPLOYMENT.md)"
echo "2. Test the API: curl http://localhost:3001/api/health"
echo "3. Your app will now auto-start on server reboot!"
echo ""
