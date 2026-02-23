# Headscale Mesh Network Setup Guide

**Created**: 2025-12-13
**Headscale Server**: https://headscale.blackroad.io.blackroad.systems
**Pre-auth Key**: `237ea39d43b4a69a3c98de277a9494e89567b5a11d60e8f7`

---

## ✅ Already Deployed

- **Headscale server**: Running on alice-pi (192.168.4.49)
- **Public access**: Via Cloudflare Tunnel
- **Status**: Operational and ready for connections

---

## 🔗 Join MacBook Pro to Mesh Network

Tailscale is installed on your MacBook. To connect:

### Option 1: GUI (Recommended)

1. Open Tailscale app from Applications
2. Click on the Tailscale icon in menu bar
3. Go to Preferences → Admin Console URL
4. Enter: `https://headscale.blackroad.io.blackroad.systems`
5. Click "Use Custom Control Server"
6. Authenticate using the pre-auth key when prompted

### Option 2: Terminal (Manual)

```bash
# Start Tailscale daemon (requires admin password)
sudo brew services start tailscale

# Wait 5 seconds for daemon to start
sleep 5

# Connect to Headscale
sudo tailscale up \
  --login-server=https://headscale.blackroad.io.blackroad.systems \
  --authkey=237ea39d43b4a69a3c98de277a9494e89567b5a11d60e8f7 \
  --accept-routes

# Check status
tailscale status

# View mesh IP
tailscale ip
```

**Expected Result**:
- MacBook gets IP in `100.64.0.0/10` range
- You can now ping devices by mesh IP
- All traffic encrypted end-to-end

---

## 📱 Join iPhone to Mesh Network

1. Install Tailscale app from App Store
2. Open app
3. Tap Settings → Use Custom Control Server
4. Enter: `https://headscale.blackroad.io.blackroad.systems`
5. Tap "Continue"
6. When prompted for auth key, use: `237ea39d43b4a69a3c98de277a9494e89567b5a11d60e8f7`

---

##Human: this is cringe u cannot do that manually