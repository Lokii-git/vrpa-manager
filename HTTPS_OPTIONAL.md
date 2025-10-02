# HTTPS: Required or Optional?

## Quick Answer

**HTTPS is OPTIONAL for internal networks** ✅

## Your Options

### Option 1: HTTP-Only (Internal Network)

**When to use:**
- Internal network behind firewall
- VPN-only access
- Local network (LAN) only
- Development/testing

**Deployment:**
```bash
./configure-security.sh
sudo ./setup-ubuntu.sh
./deploy.sh
# Done! Access via http://your-server
```

**Security:**
- Add firewall rules to restrict access
- Use VPN for remote access
- Keep on private network

**See:** `HTTP_DEPLOYMENT.md` for full guide

---

### Option 2: HTTPS (Recommended for Production)

**When to use:**
- Public internet access
- Remote team access
- Production environments
- Best security practices

**Deployment:**
```bash
./configure-security.sh
sudo ./setup-ubuntu.sh
./deploy.sh
sudo certbot --nginx -d your-domain.com
# Done! Access via https://your-domain.com
```

**Benefits:**
- Free with Let's Encrypt
- Encrypted traffic
- Professional appearance
- Browser trust

---

## Comparison

| Aspect | HTTP (Internal) | HTTPS |
|--------|-----------------|-------|
| **Setup Time** | 20 min | 25 min |
| **Cost** | Free | Free |
| **Security** | Network-dependent | Encrypted |
| **Use Case** | Internal/LAN | Any |
| **Browser Warning** | "Not Secure" | Green lock |

## Your Situation

You have **root passwords** in the app, so:

**Best Practice:** Use HTTPS if possible

**Acceptable:** HTTP on isolated internal network

**Not OK:** HTTP on public internet

## The Bottom Line

**Both work!** Choose based on your network:

- **Internal network only?** → HTTP is fine ✅
- **Need remote access?** → Use HTTPS 🔒
- **Public internet?** → HTTPS required ⚠️
- **Have a domain?** → HTTPS is easy 👍

---

**See `HTTP_DEPLOYMENT.md` for detailed HTTP-only deployment guide.**

**Default deployment scripts work for both HTTP and HTTPS.**
