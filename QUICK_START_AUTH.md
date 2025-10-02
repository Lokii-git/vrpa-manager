# vRPA Manager - Quick Start with Authentication

## First Time Setup

### 1. Start the Backend Server
```bash
cd server
npm install
node index.js
```
Expected output:
```
✅ vRPA Manager Server running on port 3001
📁 Data directory: /workspaces/spark-template/server/data
🔗 API: http://localhost:3001/api
```

### 2. Start the Frontend
```bash
# In a new terminal
npm run dev
```
Expected output:
```
➜  Local:   http://localhost:5001/
```

### 3. Login
1. Open http://localhost:5001 in your browser
2. You'll see the login page
3. Enter default credentials:
   - **Username**: `admin`
   - **Password**: `admin`
4. Click "Sign In"

⚠️ **IMPORTANT**: Change the default password after first login!

## Main Features

Once logged in, you have access to:

### Devices Tab
- View all devices with status (online/offline/error)
- Add new devices (IP, name, password, etc.)
- Check out devices to team members
- Schedule future checkouts
- Return devices
- Copy passwords and sharefile links
- View device history

### Scheduled Tab
- See all devices with upcoming scheduled checkouts
- Scheduled person and time displayed

### History Tab
- View ping history for all devices
- Filter by device
- See online/offline events over time

### Admin Panel Tab
- **Users Subtab**: Manage team members (add, edit, delete)
- **Email Template Subtab**: Customize the checkout email template

## Logging Out

Click the "Logout" button in the top right corner to sign out.

## Security Notes

1. **Default Password**: The default admin password is intentionally weak for initial setup
2. **Change Immediately**: Update the password after first login
3. **Session Storage**: Your login session expires when you close the browser
4. **HTTPS**: Use HTTPS in production environments
5. **Internal Network**: This system is designed for internal network use

## Common Tasks

### Adding a Device
1. Click "Add Device" button
2. Fill in device details:
   - Name (required)
   - IP Address (required)
   - Username (required)
   - Password (required)
   - Sharefile Link (optional)
3. Click "Add Device"

### Checking Out a Device
1. Find the device in the "Devices" tab
2. Click "Check Out"
3. Select a team member
4. Click "Check Out"

### Scheduling a Device
1. Find the device in the "Devices" tab  
2. Click "Schedule"
3. Select team member and date/time
4. Click "Schedule"

### Returning a Device
1. Find a checked-out device
2. Click "Return"
3. Device becomes available again

### Copying Information
- Click the copy icon next to any password or sharefile link
- Information is copied to your clipboard
- Use the "Copy Template" button to copy pre-filled email text

## Troubleshooting

### Can't login
- Verify the server is running on port 3001
- Check username is exactly `admin` (lowercase)
- Check password is exactly `admin` (lowercase)
- Look for error messages in the login form

### "401 Unauthorized" errors
- Your session has expired (24 hours)
- Logout and login again

### Server won't start
- Ensure port 3001 is not in use
- Check `.env` file exists in `server/` directory
- Verify Node.js is installed

### Frontend won't start
- Run `npm install` in the root directory
- Check if port 5001 (or 5000) is available

## File Structure

```
/workspaces/spark-template/
├── server/                    # Backend API
│   ├── data/                  # Data storage (JSON files)
│   │   ├── devices.json       # Device list
│   │   ├── team-members.json  # Team members
│   │   ├── users.json         # Login credentials
│   │   └── ...
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   ├── .env                  # Environment variables
│   └── index.js              # Main server file
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx     # Login interface
│   │   ├── AdminPanel.tsx    # Admin interface
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth state management
│   └── lib/
│       └── api.ts            # API client
└── AUTHENTICATION.md          # Detailed auth docs
```

## Documentation

- **AUTHENTICATION.md** - Complete authentication system documentation
- **DEPLOYMENT.md** - Ubuntu production deployment guide
- **AUTO_START_GUIDE.md** - Auto-start configuration with PM2
- **API.md** - Backend API reference
- **README.md** - Project overview

## Next Steps

1. ✅ Login with default credentials
2. ✅ Explore the interface
3. ✅ Add your first device
4. ⚠️ Change the default password (manual process - see AUTHENTICATION.md)
5. 📝 Configure your team members
6. 📝 Customize the email template
7. 🚀 Start managing your devices!

## Getting Help

- Check the documentation files for detailed information
- Review error messages in the browser console (F12)
- Check server logs in the terminal
- Verify all services are running

## Production Deployment

When ready to deploy to Ubuntu:
1. Read **DEPLOYMENT.md** for complete instructions
2. Change the JWT secret in `.env`
3. Change the default password
4. Configure HTTPS with Nginx
5. Set up firewall rules
6. Enable PM2 auto-start

---

**Happy Device Managing! 🎉**
