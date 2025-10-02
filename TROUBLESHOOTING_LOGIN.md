# Troubleshooting "Failed to Fetch" Login Error

## Problem
When trying to login with admin/admin, you see "Failed to fetch" error.

## Root Cause
The frontend (running on port 5001) cannot connect to the backend API (running on port 3001).

## Solution

### Option 1: Use Vite Proxy (Recommended for Dev Container)

The vite.config.ts has been updated with a proxy configuration. This should work after restarting the dev server.

**Verify the proxy is working:**

1. Open a new terminal
2. Test the health endpoint through the proxy:
   ```bash
   curl http://localhost:5001/api/health
   ```
   
If this returns `{"status":"ok"}`, the proxy is working!

### Option 2: Port Forwarding (Dev Container Issue)

If you're in a VS Code dev container, you may need to forward port 3001:

1. Open VS Code terminal
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Forward a Port"
4. Enter `3001`
5. Set it to Public if needed

### Option 3: Manual API URL Configuration

If the proxy doesn't work, set an environment variable:

1. Create `.env` file in the root directory (not in server/):
   ```bash
   VITE_API_URL=http://localhost:3001/api
   ```

2. Restart the frontend:
   ```bash
   npm run dev
   ```

### Option 4: Check if Backend is Running

Verify the backend server is running:

```bash
# Check if process is running
lsof -i :3001

# Test backend directly
curl http://localhost:3001/api/health

# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

If these don't work, restart the backend:
```bash
cd server
node index.js
```

## Quick Fix Steps

1. **Restart both servers:**
   ```bash
   # Terminal 1: Backend
   cd server
   node index.js
   
   # Terminal 2: Frontend (new terminal)
   npm run dev
   ```

2. **Clear browser cache:**
   - Open browser DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Try login again with:**
   - Username: `admin`
   - Password: `admin`

## Debugging

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Common errors:
   - `Failed to fetch` - Network issue
   - `CORS error` - Backend CORS not configured
   - `404` - API endpoint not found
   - `401` - Authentication failed (after connection works)

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the `/api/auth/login` request
5. Check:
   - Status code
   - Request URL
   - Response

### Check Backend Logs

Look at the terminal where backend is running:
- Should see API requests being logged
- Look for errors

## Current Configuration

After the fix, the app should use:
- **Frontend**: http://localhost:5001 (Vite dev server)
- **Backend**: http://localhost:3001 (Express API)
- **Proxy**: Vite proxies `/api/*` to `http://localhost:3001/api/*`

## Testing the Fix

1. Open http://localhost:5001 in browser
2. You should see the login page
3. Open browser console (F12)
4. Enter username: `admin`
5. Enter password: `admin`
6. Click "Sign In"
7. Watch the Network tab for the request

### Expected Result
- Request to `/api/auth/login`
- Status: 200 OK
- Response: JSON with `token` and `user`
- Redirect to main app

### If Still Failing

Please provide:
1. Browser console error messages
2. Network tab details for the failed request
3. Output of: `curl http://localhost:5001/api/health`
4. Output of: `curl http://localhost:3001/api/health`

## Alternative: Use Production Build

If development proxy continues to fail:

```bash
# Build frontend for production
npm run build

# Serve with a simple HTTP server
npx serve -s dist -p 5001
```

Then configure Nginx or use the backend to serve static files.

---

**The issue should be resolved after restarting the frontend dev server with the proxy configuration!**
