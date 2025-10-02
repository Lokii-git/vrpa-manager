# Updating Existing Installation with Authentication

This guide is for updating an existing vRPA Manager installation to add the new authentication system.

## Prerequisites

- Existing vRPA Manager installation (backend + frontend)
- SSH access to the server
- Sudo privileges (if using PM2/system services)

## Update Process

### Step 1: Backup Existing Data

```bash
# Backup your data directory
cd /opt/vrpa-manager/server  # or wherever your installation is
cp -r data data.backup.$(date +%Y%m%d-%H%M%S)

# List backups to verify
ls -la data.backup.*
```

### Step 2: Pull Latest Code

```bash
# If using git
cd /opt/vrpa-manager
git pull origin main

# Or manually copy updated files
# Upload new files via scp/sftp
```

### Step 3: Update Backend Dependencies

```bash
cd /opt/vrpa-manager/server

# Install new authentication dependencies
npm install bcrypt jsonwebtoken dotenv

# Verify installation
npm list bcrypt jsonwebtoken dotenv
```

### Step 4: Configure Environment

```bash
cd /opt/vrpa-manager/server

# Copy example env file
cp .env.example .env

# Generate secure JWT secret
SECRET=$(openssl rand -base64 32)

# Create .env file with secure secret
cat > .env << EOF
JWT_SECRET=$SECRET
JWT_EXPIRES_IN=24h
PORT=3001
EOF

# Verify .env file
cat .env
```

### Step 5: Create Initial Admin User

The server will automatically create the admin user on first startup, but you can do it manually:

```bash
cd /opt/vrpa-manager/server

# Create users.json with admin user
node << 'SCRIPT'
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

bcrypt.hash('admin', 10).then(hash => {
  const user = {
    id: uuidv4(),
    username: 'admin',
    password: hash,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(dataDir, 'users.json'),
    JSON.stringify([user], null, 2)
  );
  
  console.log('✅ Admin user created successfully');
  console.log('Username: admin');
  console.log('Password: admin');
  console.log('⚠️  Change this password after first login!');
});
SCRIPT
```

### Step 6: Update Frontend

```bash
cd /opt/vrpa-manager

# Rebuild frontend with new authentication components
npm install
npm run build

# Verify build
ls -la dist/
```

### Step 7: Restart Services

#### If using PM2:

```bash
# Restart backend
pm2 restart vrpa-backend

# Check status
pm2 status vrpa-backend
pm2 logs vrpa-backend --lines 20
```

#### If using systemd:

```bash
sudo systemctl restart vrpa-manager
sudo systemctl status vrpa-manager
```

#### If running manually:

```bash
# Stop old server (Ctrl+C or kill process)
# Start new server
cd /opt/vrpa-manager/server
node index.js
```

### Step 8: Update Nginx (if needed)

The Nginx configuration should not need changes, but verify it's working:

```bash
# Test Nginx configuration
sudo nginx -t

# Reload if needed
sudo systemctl reload nginx
```

### Step 9: Verify Installation

1. **Test Backend**:
   ```bash
   # Health check (should work without auth)
   curl http://localhost:3001/api/health
   
   # Test protected endpoint (should return 401)
   curl http://localhost:3001/api/devices
   
   # Test login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

2. **Test Frontend**:
   - Open browser to your server's address
   - Should see login page
   - Login with admin/admin
   - Verify all features work

### Step 10: Change Default Password

⚠️ **IMPORTANT**: Change the default password immediately!

Currently requires manual process:

```bash
cd /opt/vrpa-manager/server

# Generate new password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_NEW_PASSWORD', 10).then(console.log);"

# Copy the hash output, then edit users.json
nano data/users.json

# Replace the password field with your new hash
# Save and exit (Ctrl+X, Y, Enter)

# Restart server
pm2 restart vrpa-backend
```

## Rollback Procedure

If you encounter issues, you can rollback:

### Option 1: Restore Previous Version

```bash
# Stop services
pm2 stop vrpa-backend  # or sudo systemctl stop vrpa-manager

# Restore old code
cd /opt/vrpa-manager
git checkout <previous-commit>

# Or restore from backup
# (restore your backed-up files)

# Restart services
pm2 start vrpa-backend
```

### Option 2: Disable Authentication Temporarily

Edit `server/index.js` and comment out authMiddleware on protected routes:

```javascript
// Temporarily disable auth
// app.get('/api/devices', authMiddleware, async (req, res) => {
app.get('/api/devices', async (req, res) => {
```

This is NOT recommended for production, only for emergency troubleshooting.

## Troubleshooting

### Issue: "Cannot find module 'bcrypt'"

```bash
cd /opt/vrpa-manager/server
npm install
```

### Issue: "JWT_SECRET not defined"

```bash
cd /opt/vrpa-manager/server
# Verify .env file exists
ls -la .env

# If missing, create it
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "JWT_EXPIRES_IN=24h" >> .env
echo "PORT=3001" >> .env
```

### Issue: "users.json not found"

```bash
# Create manually (see Step 5 above)
# Or restart server to auto-create
pm2 restart vrpa-backend
pm2 logs vrpa-backend
```

### Issue: Login page shows but can't login

1. Check server logs:
   ```bash
   pm2 logs vrpa-backend
   ```

2. Verify users.json exists:
   ```bash
   cat /opt/vrpa-manager/server/data/users.json
   ```

3. Test login endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

### Issue: "401 Unauthorized" on API calls

- Clear browser cache and sessionStorage
- Logout and login again
- Check browser console for errors
- Verify token is being sent in requests (F12 → Network tab)

### Issue: Frontend build fails

```bash
cd /opt/vrpa-manager
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Post-Update Checklist

- [ ] Backend starts without errors
- [ ] Frontend displays login page
- [ ] Can login with admin/admin
- [ ] All device features work
- [ ] Admin panel accessible
- [ ] Team members can be managed
- [ ] Devices can be added/edited/deleted
- [ ] Checkout/return functionality works
- [ ] Default password changed
- [ ] JWT_SECRET is secure (not default)
- [ ] HTTPS configured (production)
- [ ] PM2 auto-restart working
- [ ] Backup of data directory exists

## Additional Security Steps

After successful update:

1. **Change Default Password** (see Step 10)

2. **Verify JWT Secret**:
   ```bash
   # Ensure it's not the default
   grep JWT_SECRET /opt/vrpa-manager/server/.env
   ```

3. **Check File Permissions**:
   ```bash
   # .env should not be world-readable
   chmod 600 /opt/vrpa-manager/server/.env
   
   # data directory should be secure
   chmod 700 /opt/vrpa-manager/server/data
   ```

4. **Enable HTTPS** (if not already):
   - See DEPLOYMENT.md for SSL/TLS setup with Let's Encrypt

5. **Review Access Logs**:
   ```bash
   # Check Nginx access logs
   sudo tail -f /var/log/nginx/access.log
   
   # Monitor for failed login attempts
   pm2 logs vrpa-backend | grep "Invalid credentials"
   ```

## Getting Help

If you encounter issues:

1. Check **AUTHENTICATION.md** for detailed documentation
2. Review **TROUBLESHOOTING.md** (if available)
3. Check server logs: `pm2 logs vrpa-backend`
4. Check browser console (F12)
5. Verify all steps completed correctly

## Maintenance

After update:

- Monitor logs for authentication issues
- Review failed login attempts
- Keep JWT_SECRET secure
- Regularly update dependencies:
  ```bash
  cd /opt/vrpa-manager/server
  npm update
  npm audit
  ```

---

**Update complete! Your vRPA Manager now has secure authentication.** 🔐
