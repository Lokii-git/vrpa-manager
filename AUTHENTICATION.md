# Authentication System

The vRPA Manager includes a secure JWT-based authentication system to protect sensitive device information and root passwords.

## Overview

- **Authentication Method**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Token Storage**: Session storage (tokens expire when browser closes)
- **Token Expiration**: 24 hours (configurable)
- **Protected Resources**: All API endpoints except `/api/auth/login` and `/api/health`

## Default Credentials

```
Username: admin
Password: admin
```

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Features

### Login Page
- Clean, user-friendly login interface
- Error handling for failed authentication
- Loading states during authentication
- Automatic redirect on successful login

### Session Management
- Automatic token verification on page load
- Session persistence across page refreshes
- Automatic logout on token expiration
- Logout button in the main application

### API Security
- All API requests include JWT token in Authorization header
- Middleware validates tokens on protected endpoints
- Invalid tokens receive 401 Unauthorized response
- Expired tokens require re-authentication

## Architecture

### Frontend Components

#### `LoginPage.tsx`
- Handles username/password input
- Calls `/api/auth/login` endpoint
- Stores JWT token in sessionStorage
- Triggers authentication state update

#### `AuthContext.tsx`
- Manages authentication state globally
- Provides `isAuthenticated`, `login`, `logout` functions
- Verifies token on application load
- Handles token expiration

#### Protected API Calls (`api.ts`)
- Automatically includes Authorization header
- Reads token from sessionStorage
- No manual token management required

### Backend Components

#### Authentication Endpoints

**POST `/api/auth/login`**
```json
Request:
{
  "username": "admin",
  "password": "admin"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin"
  }
}
```

**GET `/api/auth/verify`**
- Requires: `Authorization: Bearer <token>` header
- Returns: User information if token is valid
- Returns: 401 if token is invalid/expired

**POST `/api/auth/change-password`**
```json
Request:
{
  "currentPassword": "admin",
  "newPassword": "newSecurePassword123"
}

Response:
{
  "message": "Password changed successfully"
}
```

#### Auth Middleware (`middleware/auth.js`)
```javascript
// Validates JWT token on protected routes
// Attaches user information to req.user
// Returns 401 if token is invalid
```

## Security Best Practices

### In Production

1. **Change JWT Secret**
   ```bash
   # Generate a strong random secret
   openssl rand -base64 32
   
   # Update server/.env
   JWT_SECRET=<your-generated-secret>
   ```

2. **Change Default Password**
   - Login with admin/admin
   - (Future feature: Password change UI)
   - Currently requires manual update in `users.json`

3. **Use HTTPS**
   - Configure Nginx with SSL/TLS certificates
   - Force HTTPS redirects
   - See DEPLOYMENT.md for details

4. **Secure Token Storage**
   - Tokens stored in sessionStorage (not localStorage)
   - Tokens expire when browser closes
   - No token persistence across sessions

5. **Network Security**
   - Deploy behind VPN or firewall
   - Limit access to trusted networks
   - Monitor failed login attempts

### Password Requirements (Future Enhancement)

Current implementation uses basic password hashing. Consider adding:
- Minimum password length requirements
- Password complexity rules
- Password change enforcement
- Account lockout after failed attempts
- Password history

## User Management

### Initial Admin User

On first startup, the server automatically creates an admin user:
- **Username**: admin
- **Password**: admin (bcrypt hashed)
- Stored in: `server/data/users.json`

### Adding Users (Manual Process)

1. Hash a password using bcrypt:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password', 10).then(console.log);"
   ```

2. Add user to `server/data/users.json`:
   ```json
   {
     "id": "generate-uuid-here",
     "username": "newuser",
     "password": "<bcrypt-hash>",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```

### Future Enhancement: User Management UI
- Add users through Admin Panel
- Reset passwords
- Manage user roles
- View login history

## Troubleshooting

### "Invalid credentials" on login
- Verify username and password are correct
- Check `server/data/users.json` exists
- Ensure server is running

### "401 Unauthorized" on API calls
- Token may have expired (24 hours)
- Token may be invalid
- Re-login to get new token

### Token not persisting
- Using sessionStorage (by design)
- Tokens expire when browser closes
- Use localStorage if persistence needed (less secure)

### Server won't start
- Check `.env` file exists with JWT_SECRET
- Verify port 3001 is available
- Check server logs for errors

## API Reference

All authenticated endpoints require the Authorization header:
```
Authorization: Bearer <token>
```

### Protected Endpoints
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Add device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/team-members` - Get team members
- `POST /api/team-members` - Add team member
- `PUT /api/team-members/:id` - Update team member
- `DELETE /api/team-members/:id` - Delete team member
- `GET /api/ping-history` - Get ping history
- `POST /api/ping-history` - Add ping record
- `GET /api/email-template` - Get email template
- `PUT /api/email-template` - Update email template

### Public Endpoints
- `POST /api/auth/login` - Login
- `GET /api/health` - Health check

## Configuration

### Environment Variables (`server/.env`)

```env
# JWT Secret - CHANGE IN PRODUCTION!
JWT_SECRET=your-secure-random-secret-here

# Token expiration time (default: 24h)
JWT_EXPIRES_IN=24h

# Server port
PORT=3001
```

### Token Expiration Options
- `15m` - 15 minutes
- `1h` - 1 hour
- `24h` - 24 hours (default)
- `7d` - 7 days
- `30d` - 30 days

## Development vs Production

### Development
- Default credentials (admin/admin)
- SessionStorage for tokens
- CORS enabled for localhost:5001
- Clear error messages

### Production
- Changed default password
- Strong JWT secret
- HTTPS only
- Restricted CORS origins
- Generic error messages
- Rate limiting (future enhancement)

## Migration Notes

### Upgrading from Unauthenticated Version

1. Update frontend dependencies (none required)
2. Update backend dependencies:
   ```bash
   cd server
   npm install bcrypt jsonwebtoken dotenv
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with strong JWT_SECRET
   ```

4. Restart server - `users.json` created automatically
5. Test login at http://localhost:5001

### Backward Compatibility
- All existing data (devices, team members, etc.) preserved
- Only adds authentication layer
- No database migrations required

## Future Enhancements

- [ ] User management UI in Admin Panel
- [ ] Password reset functionality
- [ ] Role-based access control (admin, user, viewer)
- [ ] Login history and audit logs
- [ ] Multi-factor authentication (MFA)
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements
- [ ] Remember me functionality
- [ ] Refresh tokens for extended sessions
