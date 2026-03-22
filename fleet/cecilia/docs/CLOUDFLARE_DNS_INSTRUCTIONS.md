# 🖤 BlackRoad Cloudflare DNS Configuration

## Current Status

Your domains **ARE working** via Cloudflare Pages! They're currently proxied through Cloudflare:
- blackroad.io → 172.67.211.99, 104.21.91.74 (Cloudflare proxy)
- blackroadai.com → 172.67.172.70, 104.21.96.40 (Cloudflare proxy)  
- blackroad.company → 104.21.34.179, 172.67.163.145 (Cloudflare proxy)

## Option 1: Keep Cloudflare Pages (RECOMMENDED)

**Your sites are LIVE right now via Cloudflare Pages!**

Test them:
```bash
curl https://blackroad-os-web.pages.dev
```

The domains are connected to Pages projects - this is actually better than direct IPs because:
- ✅ Global CDN
- ✅ Automatic SSL
- ✅ DDoS protection
- ✅ Fast worldwide

## Option 2: Point to Your Servers (Advanced)

If you want direct access to your Pi cluster/droplets:

### Via Cloudflare Dashboard:

1. Visit: https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/blackroad.io/dns

2. Add A Record:
   - Type: `A`
   - Name: `direct` (creates direct.blackroad.io)
   - IPv4: `159.65.43.12`
   - Proxy: **OFF** (gray cloud)
   - TTL: Auto

3. Repeat for subdomains:
   - `pi.blackroad.io` → 192.168.4.49 (alice)
   - `lucidia.blackroad.io` → 192.168.4.38
   - `blackroad os.blackroad.io` → 159.65.43.12

### Test Your Infrastructure:

```bash
# Test direct IP access
curl http://159.65.43.12

# Test Pi cluster (local network)
curl http://192.168.4.49
curl http://192.168.4.38
```

## Option 3: Cloudflare Tunnel (BEST for Pi)

**Recommended for secure Pi access without port forwarding:**

```bash
# On alice Pi
ssh alice
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Create tunnel
cloudflared tunnel login
cloudflared tunnel create blackroad-alice
cloudflared tunnel route dns blackroad-alice pi.blackroad.io

# Run tunnel
cloudflared tunnel run blackroad-alice
```

Then your Pi is accessible at `https://pi.blackroad.io` with SSL!

## Quick DNS Bulk Import

If you want ALL domains pointing to blackroad os-infinity:

1. Go to any domain DNS settings
2. Click "Import" → "Bind file"
3. Paste:

```
blackroad.io.        1  IN  A  159.65.43.12
blackroadai.com.     1  IN  A  159.65.43.12
blackroad.company.   1  IN  A  159.65.43.12
blackroad.network.   1  IN  A  159.65.43.12
blackroad.systems.   1  IN  A  159.65.43.12
```

4. **Disable proxy** (turn off orange cloud) for each

## Summary

✅ **Your domains ARE working via Cloudflare Pages right now**  
✅ Websites deployed to 4 nodes (alice, lucidia, blackroad os, shellfish)  
✅ 30-minute auto-sync enabled

**Next:** Just update your Pages deployments and they'll serve from your infrastructure!

---

**Quick Links:**
- Main Dashboard: https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a
- blackroad.io DNS: https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/blackroad.io/dns
- Pages Projects: https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages

