# HTTP-Only Deployment (No HTTPS)

## Can You Deploy Without HTTPS?

**YES**, you can deploy without HTTPS, especially if:

✅ **Internal Network Only** - Behind VPN, firewall, or on private network  
✅ **Development/Testing** - Non-production environment  
✅ **Localhost/LAN** - Only accessible within local network  
✅ **No Sensitive Data Transit** - Though you do have root passwords!  

## Security Implications

### ⚠️ What You Lose Without HTTPS:

1. **Data Transmitted in Plain Text**
   - Usernames and passwords visible in network traffic
   - JWT tokens can be intercepted (session hijacking)
   - Root device passwords exposed if intercepted
   - Email template content readable

2. **Man-in-the-Middle Attacks**
   - Attacker can intercept and modify data
   - Could steal JWT tokens
   - Could capture credentials

3. **Browser Warnings**
   - Some browsers show "Not Secure" warning
   - May limit some modern web APIs
   - No HTTP/2 performance benefits

### ✅ What Still Works:

1. **Password Storage** - Still hashed with bcrypt (secure)
2. **JWT Tokens** - Still signed and validated (secure)
3. **Authentication** - Still required to access
4. **API Protection** - Endpoints still protected
5. **All Features** - Everything works the same

## HTTP-Only Deployment Guide

### When HTTP-Only Is Acceptable:

**GOOD for:**
- Internal corporate network behind firewall
- VPN-only access
- Home lab / local network
- Development servers
- Testing environments

**NOT GOOD for:**
- Public internet access
- Remote team access over untrusted networks
- Compliance requirements (HIPAA, PCI, etc.)
- Production systems with sensitive data

### Deployment Without HTTPS

Just skip the SSL/TLS configuration step:

```bash
# Standard deployment
sudo ./setup-ubuntu.sh
./deploy.sh

# Skip this step:
# sudo certbot --nginx -d your-domain.com

# Access via HTTP
http://your-server-ip
# or
http://your-server-domain.com
```

That's it! Everything else works the same.

### Nginx Configuration (HTTP-Only)

The default Nginx config in `deploy.sh` already works for HTTP. It listens on port 80:

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;
    
    # Serves frontend
    location / {
        root /opt/vrpa-manager/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxies API requests
    location /api {
        proxy_pass http://localhost:3001;
        # ... proxy settings
    }
}
```

No changes needed for HTTP-only!

## Security Recommendations for HTTP-Only

If you must use HTTP, implement these compensating controls:

### 1. Network Security (CRITICAL)

```bash
# Use firewall to restrict access
sudo ufw allow from 192.168.1.0/24 to any port 80
sudo ufw deny 80

# Or only allow specific IPs
sudo ufw allow from 192.168.1.100 to any port 80
sudo ufw allow from 192.168.1.101 to any port 80
```

### 2. VPN-Only Access

```bash
# Configure OpenVPN or WireGuard
# Only allow connections from VPN subnet
sudo ufw allow from 10.8.0.0/24 to any port 80
```

### 3. Local Network Only

```nginx
# In Nginx config, restrict by IP
server {
    listen 80;
    
    # Allow only local network
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    # ... rest of config
}
```

### 4. Additional Authentication Layer

Consider adding:
- Network-level authentication (802.1X)
- VPN authentication before access
- IP whitelist
- Fail2ban for brute force protection

### 5. Monitor and Audit

```bash
# Monitor Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Monitor authentication attempts
pm2 logs vrpa-backend | grep "auth"

# Set up log rotation
sudo logrotate /etc/logrotate.d/nginx
```

## Comparison: HTTP vs HTTPS

| Feature | HTTP Only | HTTPS |
|---------|-----------|-------|
| **Data Encryption** | ❌ No | ✅ Yes |
| **Password Security** | ⚠️ Transmitted in clear | ✅ Encrypted |
| **JWT Token Security** | ⚠️ Can be intercepted | ✅ Encrypted |
| **MITM Protection** | ❌ Vulnerable | ✅ Protected |
| **Browser Trust** | ⚠️ "Not Secure" | ✅ Green lock |
| **Setup Complexity** | ✅ Simple | ⚠️ Requires cert |
| **Cost** | ✅ Free | ✅ Free (Let's Encrypt) |
| **Performance** | ⚠️ HTTP/1.1 | ✅ HTTP/2 |
| **Internal Network** | ✅ Acceptable | ✅ Better |
| **Public Internet** | ❌ Not recommended | ✅ Required |

## Your Specific Use Case

Based on your application (root passwords for vRPA devices):

### Recommendation: Use HTTPS OR Network Isolation

**Option A: HTTPS (Recommended)**
```bash
# Easy with Let's Encrypt (5 minutes)
sudo certbot --nginx -d your-domain.com
# Free, automated, and provides encryption
```

**Option B: HTTP + Network Isolation (Acceptable)**
- Deploy on internal network only
- Use VPN for remote access
- Configure firewall rules
- No public internet access

**Option C: HTTP + Local Network Only (Acceptable)**
- LAN-only access
- No remote access needed
- Physical security of network

## Quick Decision Tree

```
Do you need remote access?
│
├─ YES → Do you have a domain name?
│   │
│   ├─ YES → Use HTTPS (certbot --nginx)
│   │         ✅ Best option, free, easy
│   │
│   └─ NO → Use VPN + HTTP
│             ⚠️ VPN provides encryption
│
└─ NO (Local network only)
    └─ HTTP is fine
       ✅ Network is trusted
```

## Modified Deployment for HTTP-Only

### Step 1: Configure Security (Same)
```bash
./configure-security.sh
```

### Step 2: Deploy (Same)
```bash
sudo ./setup-ubuntu.sh
./deploy.sh
```

### Step 3: Configure Network Security (Instead of HTTPS)
```bash
# Option A: Restrict by IP
sudo ufw allow from 192.168.1.0/24 to any port 80

# Option B: VPN only
sudo ufw allow from 10.8.0.0/24 to any port 80

# Option C: Deny public access
sudo ufw deny from any to any port 80
sudo ufw allow from 192.168.1.0/24 to any port 80
```

### Step 4: Access
```bash
# Internal network
http://192.168.1.100

# Or via hostname
http://vrpa-manager.local
```

## Environment Variables for HTTP

No changes needed! The application works the same:

```env
# server/.env (same for HTTP or HTTPS)
JWT_SECRET=your-secure-secret
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=production
```

## Browser Considerations

Modern browsers may show warnings for HTTP:

1. **Chrome/Edge**
   - Shows "Not Secure" in address bar
   - May limit some APIs (like geolocation)
   - Still fully functional for your use case

2. **Firefox**
   - Similar "Not Secure" warning
   - Can click through and use normally

3. **Safari**
   - Shows security warning
   - Fully functional

**These warnings are cosmetic and don't affect functionality.**

## Cost Comparison

| Approach | Setup Time | Ongoing Cost | Maintenance |
|----------|------------|--------------|-------------|
| **HTTP only** | 20 min | Free | Minimal |
| **HTTPS (Let's Encrypt)** | 25 min | Free | Auto-renew |
| **HTTPS (Commercial)** | 30 min | $10-50/yr | Manual renew |
| **VPN + HTTP** | 60 min | Free-$10/mo | Moderate |

## Final Recommendation

For your vRPA Manager with root passwords:

### Best Practice (Recommended):
```bash
# Use HTTPS - it's free and easy!
sudo certbot --nginx -d your-domain.com
```
- Only 5 extra minutes
- Free with Let's Encrypt
- Auto-renewal
- Full encryption
- Professional appearance

### Acceptable Alternative:
```bash
# HTTP + Network isolation
# Deploy on internal network
# Use VPN for remote access
# Configure firewall rules
```
- No public internet exposure
- VPN provides encryption layer
- Requires network administration

### Not Recommended:
```bash
# HTTP on public internet
# ❌ Credentials transmitted in clear
# ❌ JWT tokens can be intercepted
# ❌ Root passwords at risk
```

## Bottom Line

**You CAN deploy without HTTPS**, especially for internal use. The application works exactly the same. 

**However:**
- HTTPS is free (Let's Encrypt)
- Takes only 5 extra minutes
- Provides important security
- Recommended for any production use

**For internal network only:**
- HTTP is acceptable
- Use firewall rules to restrict access
- Consider VPN for remote access
- Document security decisions

**Your choice depends on:**
- Network architecture (internal vs public)
- Access requirements (local vs remote)
- Security policies
- Compliance requirements

---

**TL;DR:** 
- ✅ HTTP works fine on trusted internal networks
- ✅ HTTPS is better and easy to set up (recommended)
- ⚠️ Never use HTTP over public internet with sensitive data
- 🔒 If HTTP-only, use firewall/VPN for protection

Need help deciding? Consider:
- Will anyone access from home/remote? → Use HTTPS
- Only in office on LAN? → HTTP is fine
- Have a domain name? → Use HTTPS (it's free!)
- No domain? → Use VPN or HTTP with IP restrictions
