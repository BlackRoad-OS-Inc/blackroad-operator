# Cloudflare DNS Setup Instructions

## Automated Setup (Requires API Token)

1. Get your Cloudflare API Token:
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit DNS" permission
   - Copy the token

2. Get your Zone ID:
   - Go to https://dash.cloudflare.com
   - Select blackroad.io domain
   - Copy Zone ID from right sidebar

3. Run automated setup:
   ```bash
   export CLOUDFLARE_API_TOKEN="your_token_here"
   export CLOUDFLARE_ZONE_ID="your_zone_id_here"
   ~/update-cloudflare-dns.sh
   ```

## Manual Setup (via Dashboard)

1. Go to https://dash.cloudflare.com
2. Select your domain: blackroad.io
3. Go to DNS → Records
4. Add these CNAME records:

### Get Tunnel ID First
```bash
ssh octavia "cat ~/.cloudflared/config.yml | grep 'tunnel:'"
```

### DNS Records to Add

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | tts | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied |
| CNAME | monitor | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied |
| CNAME | www | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied |

### Activate Tunnel
```bash
ssh octavia "sudo systemctl restart cloudflared"
```

## Test After Setup

```bash
# Test TTS
curl -s https://tts.blackroad.io/health | jq

# Test Monitor
curl -s https://monitor.blackroad.io/health | jq

# Test Website
curl -s https://www.blackroad.io
```

## Load Balancer Routes

Once DNS is active, Cloudflare will route to:
- `tts.blackroad.io` → octavia:5001 (with cecilia:5001 failover)
- `monitor.blackroad.io` → octavia:5002 (with cecilia:5002 failover)
- `www.blackroad.io` → octavia:80 (nginx)

All routing includes automatic SSL/TLS via Cloudflare.
