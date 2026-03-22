# 🖤 BlackRoad Network Configuration

## Your Mac (Current Machine)
- **Hostname:** lucidia-operator
- **Local IP:** 192.168.4.28
- **Public IPv6:** 2a09:bac1:7680:fb0::2df:46
- **Tailscale IP:** 100.91.90.68 (utun4)
- **Cloudflare WARP:** 172.16.0.2 (utun5)

## BlackRoad Infrastructure

### Raspberry Pi Cluster (Same Network!)
- **alice:** 192.168.4.49 (Gateway + Web)
- **lucidia:** 192.168.4.38 (Worker + Web)
- **aria:** 192.168.4.82 (offline)
- **octavia:** 192.168.4.74 (offline)

### DigitalOcean Droplets
- **blackroad os-infinity:** 159.65.43.12
- **shellfish:** 174.138.44.45

## Network Features Available

✅ **Tailscale:** You're connected! (100.91.90.68)
- Can reach other Tailscale nodes
- Secure mesh network

✅ **Cloudflare WARP:** Active (172.16.0.2)
- Encrypted DNS
- Fast internet routing

✅ **Local Network:** 192.168.4.x
- Can directly access alice & lucidia
- Same subnet as Pi cluster

## Quick Access Commands

```bash
# Test Pi cluster (local network)
curl http://192.168.4.49
curl http://192.168.4.38

# Via hostname
curl http://alice
curl http://lucidia

# Via Tailscale (if configured)
tailscale status
```

## Add This Mac to Infrastructure

Your Mac can serve as:
1. **Development machine** (already is!)
2. **Control node** for Pi cluster
3. **Additional web server** (via local nginx)
4. **Build/CI server**

