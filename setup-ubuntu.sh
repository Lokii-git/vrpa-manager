#!/bin/bash

# vRPA Manager - Setup Script for Ubuntu Server

echo "🚀 vRPA Manager Setup Script"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  Please run as root or with sudo"
  exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js (v18 LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install PM2 (process manager)
echo "📦 Installing PM2..."
npm install -g pm2

# Create application directory
APP_DIR="/opt/vrpa-manager"
echo "📁 Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR

# Set permissions
echo "🔒 Setting permissions..."
chown -R $USER:$USER $APP_DIR

echo ""
echo "✅ System setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy your application files to $APP_DIR"
echo "   Example: sudo cp -r /path/to/vrpa-manager/* $APP_DIR/"
echo ""
echo "2. Run the deployment script:"
echo "   cd $APP_DIR"
echo "   sudo ./deploy.sh"
echo ""
echo "3. The deploy.sh script will:"
echo "   - Install all dependencies"
echo "   - Build the frontend"
echo "   - Start the backend with PM2"
echo "   - Configure auto-start on server reboot ✓"
echo ""
echo "4. Configure Nginx (see DEPLOYMENT.md)"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
