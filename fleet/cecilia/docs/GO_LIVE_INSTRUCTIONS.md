# 🌐 BlackRoad Go-Live Instructions

**Status**: Ready for DNS Activation  
**Tunnel**: Active and running  
**Services**: 16 services operational  
**Infrastructure**: Multi-node HA with failover

---

## 🚀 Quick Launch (5 Minutes)

### Option A: Cloudflare Dashboard (Recommended)

1. **Open Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com
   - Select domain: `blackroad.io`
   - Navigate to: DNS > Records

2. **Add CNAME Records**
   
   Click "Add record" for each:
   
   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | www | `0447556b-9f07-4506-ab03-0440731d3656.cfargotunnel.com` | ✅ Proxied |
   | CNAME | tts | `0447556b-9f07-4506-ab03-0440731d3656.cfargotunnel.com` | ✅ Proxied |
   | CNAME | monitor | `0447556b-9f07-4506-ab03-0440731d3656.cfargotunnel.com` | ✅ Proxied |
   | CNAME | fleet | `0447556b-9f07-4506-ab03-0440731d3656.cfargotunnel.com` | ✅ Proxied |
   | CNAME | analytics | `0447556b-9f07-4506-ab03-0440731d3656.cfargotunnel.com` | ✅ Proxied |
   | CNAME | grafana | `0447556b-9f07-4506-ab03-0440731d3656.cfargotunnel.com` | ✅ Proxied |

3. **Wait for Propagation**
   - DNS typically propagates in 1-2 minutes
   - Cloudflare proxied records are instant in most cases

4. **Test Access**
   ```bash
   # Test main website
   curl -I https://www.blackroad.io
   
   # Should return HTTP/2 200
   ```

---

### Option B: Cloudflare API (Automated)

If you have API credentials:

```bash
# Set credentials
cat > ~/.cloudflare-api.env << 'CREDS'
export CF_API_TOKEN='your-cloudflare-api-token'
export CF_ZONE_ID='your-zone-id-for-blackroad-io'
CREDS

# Run activation
bash ~/activate-dns-now.sh
```

---

## 🎯 What Goes Live

Once DNS is activated, these URLs become publicly accessible:

### Public Services

| URL | Service | Description |
|-----|---------|-------------|
| **https://www.blackroad.io** | Website | Main landing page |
| **https://tts.blackroad.io** | TTS API | Text-to-speech API (via load balancer) |
| **https://monitor.blackroad.io** | System Monitor | System health monitoring |
| **https://fleet.blackroad.io** | Fleet Dashboard | Multi-node fleet status |
| **https://analytics.blackroad.io** | Analytics | Real-time performance metrics |
| **https://grafana.blackroad.io** | Grafana | Professional monitoring UI |

### Automatic Features (Cloudflare)

All URLs automatically get:
- ✅ **HTTPS/SSL** - Universal SSL certificate
- ✅ **DDoS Protection** - Automatic mitigation
- ✅ **CDN** - Global edge caching
- ✅ **WAF** - Web application firewall
- ✅ **Bot Protection** - Automatic bot filtering
- ✅ **HTTP/2 & HTTP/3** - Modern protocols

---

## 🔒 Security Features

### Already Configured

1. **Cloudflare Tunnel**
   - No open ports on origin server
   - All traffic through encrypted tunnel
   - Origin IP hidden from public

2. **Load Balancing**
   - Automatic failover (<500ms)
   - Health-check based routing
   - Multi-node redundancy

3. **SSL/TLS**
   - Full encryption (Cloudflare to origin)
   - Universal SSL certificate
   - TLS 1.3 support

### Recommended Next Steps

- [ ] Enable Cloudflare WAF rules
- [ ] Set up rate limiting
- [ ] Configure bot challenge
- [ ] Add custom error pages
- [ ] Set up Page Rules for caching

---

## 📊 Infrastructure Status

### Current Deployment

```
Production Stack v8 (16 services)
├── Node: octavia (primary)
│   ├── Nginx (80) - Website
│   ├── TTS API (5001)
│   ├── Monitor API (5002)
│   ├── Load Balancer (5100)
│   ├── Fleet Monitor (5200)
│   ├── Notifications (5300)
│   ├── Metrics Collector (5400)
│   ├── Analytics (5500)
│   ├── Grafana (5600)
│   └── Ollama (11434)
└── Node: cecilia (backup)
    ├── TTS API (5001)
    ├── Monitor API (5002)
    └── Ollama (11434)

Cloudflare Tunnel: Active
Uptime: 100%
Failover: Tested ✅
SSL: Ready ✅
```

---

## 🧪 Testing After Launch

### Health Checks

```bash
# Test main website
curl -I https://www.blackroad.io
# Expected: HTTP/2 200

# Test TTS API
curl https://tts.blackroad.io/health
# Expected: {"status": "healthy", "node": "octavia"}

# Test monitoring
curl https://monitor.blackroad.io/health
# Expected: {"status": "healthy"}

# Test fleet dashboard
curl -I https://fleet.blackroad.io
# Expected: HTTP/2 200

# Test analytics
curl -I https://analytics.blackroad.io
# Expected: HTTP/2 200

# Test Grafana
curl -I https://grafana.blackroad.io
# Expected: HTTP/2 200
```

### SSL Verification

```bash
# Check SSL certificate
echo | openssl s_client -connect www.blackroad.io:443 -servername www.blackroad.io 2>/dev/null | openssl x509 -noout -subject -issuer

# Expected issuer: Cloudflare
```

### Load Balancer Test

```bash
# Test failover by hitting TTS multiple times
for i in {1..10}; do
  curl -s https://tts.blackroad.io/health | jq -r .node
  sleep 1
done

# Should show: octavia (primary) with automatic failover to cecilia if needed
```

---

## 📈 Monitoring After Launch

### Cloudflare Analytics

Available in Cloudflare Dashboard:
- Traffic analytics
- Security events
- Performance metrics
- Cache hit ratio
- Geographic distribution

### Internal Monitoring

- **Grafana**: https://grafana.blackroad.io
- **Fleet Monitor**: https://fleet.blackroad.io
- **Analytics**: https://analytics.blackroad.io

All dashboards auto-refresh with live data.

---

## 🎊 Launch Checklist

- [ ] DNS records created in Cloudflare
- [ ] Wait 1-2 minutes for propagation
- [ ] Test main website: `curl -I https://www.blackroad.io`
- [ ] Verify SSL certificate
- [ ] Check all 6 subdomains
- [ ] Test load balancer failover
- [ ] Verify monitoring dashboards
- [ ] Check Cloudflare analytics
- [ ] Announce launch! 🎉

---

## 🚨 Rollback Plan

If issues arise:

1. **Remove DNS Records**
   - Delete CNAME records in Cloudflare Dashboard
   - Traffic stops immediately

2. **Check Tunnel Status**
   ```bash
   ssh octavia "systemctl status cloudflared"
   ```

3. **Check Service Health**
   ```bash
   ssh octavia "curl http://localhost:5200/"
   ```

4. **View Logs**
   ```bash
   ssh octavia "journalctl -u cloudflared -n 50"
   ```

---

## 📞 Support Resources

### Cloudflare Tunnel Docs
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

### BlackRoad Infrastructure Docs
- `~/DEPLOYMENT_WAVE_8_COMPLETE.md` - Full infrastructure report
- `~/PUBLIC_DNS_ACTIVATION_GUIDE.md` - Detailed DNS guide

### Quick Commands

```bash
# Check all services
ssh octavia "systemctl --user status --all | grep blackroad"

# View tunnel config
ssh octavia "cat /etc/cloudflared/config.yml"

# Test internal endpoints
ssh octavia "curl http://localhost:5600/ | head -20"
```

---

## 🎉 Post-Launch

### Announce!

Share on social media:
```
🚀 BlackRoad is now LIVE!

✅ Multi-node infrastructure
✅ Automatic failover
✅ Professional monitoring
✅ Global CDN
✅ Enterprise security

Check it out: https://www.blackroad.io

Built in 65 minutes from bare metal to production! 💪
```

### Next Steps

1. **Wave 10**: Email alerting
2. **Wave 11**: Log aggregation
3. **Wave 12**: Automated backups
4. **Expansion**: Add alice and lucidia nodes

---

**Ready to launch?** Add the DNS records and go live! 🚀
