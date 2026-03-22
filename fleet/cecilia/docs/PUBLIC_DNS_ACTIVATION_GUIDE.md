# Public DNS Activation Guide

## Quick Start (Automated)

### Prerequisites
1. Cloudflare API Token with DNS Edit permission
2. Zone ID for blackroad.io domain

### Get Credentials

**API Token**:
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit zone DNS" template
4. Select "blackroad.io" zone
5. Copy the token

**Zone ID**:
1. Go to https://dash.cloudflare.com
2. Select blackroad.io domain
3. Scroll down to "API" section in right sidebar
4. Copy "Zone ID"

### Run Automated Script

```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id_here"
~/activate-cloudflare-dns.sh
```

This will create all DNS records automatically.

---

## Manual Setup (Dashboard)

### Step 1: Get Tunnel ID

```bash
ssh octavia "grep 'tunnel:' ~/.cloudflared/config.yml | awk '{print \$2}'"
```

### Step 2: Add DNS Records

Go to https://dash.cloudflare.com → blackroad.io → DNS → Records

Add these CNAME records:

| Name | Target | Proxy | Description |
|------|--------|-------|-------------|
| tts | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | TTS API (load balanced) |
| monitor | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | Monitoring API (load balanced) |
| fleet | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | Fleet dashboard |
| www | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | Main website |

Replace `<tunnel-id>` with the ID from Step 1.

### Step 3: Restart Tunnel (if needed)

```bash
ssh octavia "sudo systemctl restart cloudflared"
```

Or for user service:
```bash
ssh octavia "systemctl --user restart cloudflared"
```

---

## Testing

Wait 2-5 minutes for DNS propagation, then test:

```bash
# Test TTS API
curl -s https://tts.blackroad.io/health | jq

# Test Monitoring API
curl -s https://monitor.blackroad.io/health | jq

# Test Fleet Dashboard
curl -s https://fleet.blackroad.io/health | jq

# Test Website
curl -s https://www.blackroad.io
```

---

## Architecture

```
Internet
    ↓
Cloudflare Edge (SSL/TLS)
    ↓
Cloudflare Tunnel
    ↓
Octavia Load Balancer (5100)
    ↓
    ├─→ Octavia Services (primary)
    └─→ Cecilia Services (backup failover)
```

All traffic benefits from:
- ✅ Automatic SSL/TLS via Cloudflare
- ✅ DDoS protection
- ✅ Load balancing with failover
- ✅ CDN caching
- ✅ WAF protection

---

## Troubleshooting

### DNS not resolving
- Wait 5 minutes for propagation
- Check DNS: `dig tts.blackroad.io`
- Verify Cloudflare proxy is enabled (orange cloud)

### Tunnel not connecting
```bash
ssh octavia "systemctl status cloudflared"
ssh octavia "journalctl -u cloudflared -n 50"
```

### 502 Bad Gateway
- Check local services: `ssh octavia "curl http://localhost:5100/health"`
- Verify load balancer running
- Check backend services

### SSL errors
- Cloudflare automatically provides SSL
- Ensure "Proxied" is enabled (orange cloud)
- Check SSL/TLS mode in Cloudflare dashboard (should be "Full" or "Flexible")
