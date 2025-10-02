# GitHub Codespaces / Dev Container Configuration

## Issue
When running in GitHub Codespaces or a dev container, the frontend needs special configuration to connect to the backend API.

## Solution Applied

### 1. Vite Proxy Configuration
Updated `vite.config.ts` to:
```typescript
server: {
  host: true, // Listen on all addresses (needed for Codespaces)
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      ws: true,
    }
  }
}
```

### 2. API Client Configuration
All API calls now use relative paths (`/api/*`) instead of absolute URLs:
- `src/lib/api.ts`
- `src/components/LoginPage.tsx`
- `src/contexts/AuthContext.tsx`

### 3. How It Works

```
Browser (Codespaces URL)
    ↓
https://automatic-disco-xxx.app.github.dev/
    ↓
Vite Dev Server (Port 5001)
    ↓ (proxy /api → http://localhost:3001)
Backend API (Port 3001)
```

When you access the app via the Codespaces URL:
1. Browser loads the React app from Vite
2. React makes API calls to `/api/auth/login` (relative URL)
3. Vite proxy intercepts and forwards to `http://localhost:3001/api/auth/login`
4. Backend processes the request
5. Response flows back through the proxy to the browser

## Port Forwarding in Codespaces

GitHub Codespaces automatically forwards ports. You can manage them:

1. **View Ports**: 
   - Open "Ports" panel in VS Code (Ctrl+Shift+P → "Ports: Focus on Ports View")
   
2. **Verify Forwarding**:
   - Port 3001 (Backend API) - Should be forwarded
   - Port 5001 (Frontend) - Should be forwarded and public

3. **Make Port Public** (if needed):
   - Right-click the port in Ports panel
   - Select "Port Visibility" → "Public"

## Testing the Setup

### 1. Check Vite is Running
```bash
ps aux | grep vite
```

### 2. Check Backend is Running
```bash
lsof -i :3001
```

### 3. Check Ports Panel
- Both 3001 and 5001 should be forwarded
- 5001 should have a globe icon (public)

### 4. Test in Browser
1. Open the Codespaces URL (Port 5001)
2. You should see the login page
3. Open browser DevTools (F12)
4. Try logging in with admin/admin
5. Check Network tab - request should go to `/api/auth/login` (relative)
6. Should succeed with 200 OK

## Troubleshooting

### Still seeing "Failed to fetch"?

**Check Browser Console:**
The error shows `localhost:3001/api/auth/login` which means the browser is still trying direct connection.

**Solution - Hard Refresh:**
1. Open the app
2. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. Or open DevTools (F12) → Network tab → Check "Disable cache"
4. Refresh the page

**Solution - Clear Storage:**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Click "Clear site data"
5. Refresh the page

### Proxy Not Working?

**Check Vite Config:**
```bash
cat vite.config.ts | grep -A 10 "server:"
```

Should show:
```typescript
server: {
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
```

**Restart Vite:**
```bash
pkill -f vite
npm run dev
```

### Backend Not Responding?

**Check if running:**
```bash
curl http://localhost:3001/api/health
```

**If not running:**
```bash
cd server
node index.js
```

## Production Deployment

For production deployment (not Codespaces):
1. Use environment variable: `VITE_API_URL=https://your-domain.com/api`
2. Or configure Nginx to proxy `/api` to backend
3. See DEPLOYMENT.md for details

## Development Workflow

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Accessing the Application

- Use the Codespaces forwarded URL for port 5001
- Or click "Open in Browser" on port 5001 in Ports panel
- Login with: admin / admin

## Environment Variables

### Frontend (.env in root - optional)
```env
# Only needed if not using Vite proxy
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (server/.env - required)
```env
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=24h
PORT=3001
```

## Summary

✅ Vite proxy configured for Codespaces  
✅ All API calls use relative paths  
✅ Host setting enabled for external access  
✅ WebSocket support enabled  
✅ Change origin enabled for CORS  

The application should now work correctly in GitHub Codespaces!
