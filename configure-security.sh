#!/bin/bash

# Pre-Deployment Security Configuration Script
# Run this BEFORE deploying to production

set -e

echo "=============================================="
echo "vRPA Manager - Pre-Deployment Security Setup"
echo "=============================================="
echo ""

# Check if running in server directory
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# 1. Generate secure JWT secret
echo "📝 Step 1: Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > server/.env << EOF
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=production
EOF

echo "✅ Created server/.env with secure JWT secret"

# 2. Set secure file permissions
echo ""
echo "🔒 Step 2: Setting secure file permissions..."
chmod 600 server/.env
chmod 700 server/data
if [ -f "server/data/users.json" ]; then
    chmod 600 server/data/users.json
fi
echo "✅ File permissions secured"

# 3. Prompt for password change
echo ""
echo "⚠️  Step 3: CHANGE DEFAULT PASSWORD"
echo "=============================================="
echo "The default admin password is INSECURE!"
echo "Current: admin / admin"
echo ""
read -p "Enter new admin password: " -s NEW_PASSWORD
echo ""
read -p "Confirm new password: " -s NEW_PASSWORD_CONFIRM
echo ""

if [ "$NEW_PASSWORD" != "$NEW_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

if [ ${#NEW_PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters!"
    exit 1
fi

# Hash the password
echo "Hashing password..."
cd server
NEW_HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$NEW_PASSWORD', 10).then(console.log);")

# Update users.json
if [ ! -f "data/users.json" ]; then
    echo "❌ data/users.json not found. Run 'node index.js' first to create initial user."
    exit 1
fi

# Create backup
cp data/users.json data/users.json.backup

# Update password in users.json
node << 'NODEJS'
const fs = require('fs');
const newHash = process.argv[1];
const users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
if (users[0]) {
    users[0].password = newHash;
    fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
    console.log('✅ Password updated successfully');
} else {
    console.log('❌ No users found in users.json');
    process.exit(1);
}
NODEJS $NEW_HASH

cd ..

# 4. Verify configuration
echo ""
echo "🔍 Step 4: Verifying configuration..."

# Check .env exists and has JWT_SECRET
if grep -q "JWT_SECRET" server/.env; then
    echo "✅ JWT_SECRET configured"
else
    echo "❌ JWT_SECRET not found in .env"
    exit 1
fi

# Check file permissions
if [ "$(stat -c %a server/.env 2>/dev/null || stat -f %A server/.env)" = "600" ]; then
    echo "✅ .env permissions correct (600)"
else
    echo "⚠️  Warning: .env permissions not 600"
fi

# 5. Summary
echo ""
echo "=============================================="
echo "✅ Pre-Deployment Configuration Complete!"
echo "=============================================="
echo ""
echo "Summary:"
echo "  ✅ Secure JWT secret generated"
echo "  ✅ File permissions secured"
echo "  ✅ Admin password changed"
echo "  ✅ Backup created (data/users.json.backup)"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "  1. Do NOT commit server/.env to git"
echo "  2. Store the new admin password securely"
echo "  3. Configure HTTPS/SSL before going live"
echo "  4. Test thoroughly before production"
echo ""
echo "Next steps:"
echo "  • Review DEPLOYMENT.md for full deployment guide"
echo "  • Run './deploy.sh' on your Ubuntu server"
echo "  • Configure Nginx with SSL/TLS certificate"
echo "  • Test login with new credentials"
echo ""
echo "📋 See DEPLOYMENT_READINESS.md for full checklist"
echo ""
