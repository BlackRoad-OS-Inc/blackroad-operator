# Alexa Amundson

**Cloud Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Needed global reach without global infrastructure costs. Architected a hybrid edge-cloud stack: Cloudflare serverless for global distribution, Pi fleet for sovereignty, WireGuard mesh for secure connectivity — 178 cloud resources managed solo.

---

## Experience

### BlackRoad OS | Founder & Cloud Engineer | 2025–Present

**The Strategy: Edge + Cloud, Not Either/Or**
- Pure cloud is expensive and you don't own the compute. Pure edge is limited and hard to reach. Combined both
- 99 Pages for global CDN, 23 D1 for serverless databases, 47 KV for edge config, 11 R2 for object storage — all on Cloudflare
- 5 Pi edge nodes for persistent compute, AI inference, and data sovereignty. WireGuard mesh connects everything. 4 tunnels route 48+ domains

**The Architecture: Zero Open Ports**
- No port forwarding, no exposed services. All external traffic flows through Cloudflare tunnels to fleet
- WireGuard mesh (10.8.0.x) for encrypted inter-node communication. Tailscale overlay (9 peers) for management access
- RoadNet WiFi mesh (5 APs) provides local device connectivity — devices on the mesh can reach the fleet directly

**The Numbers**
- 178 total Cloudflare resources deployed and maintained. 48+ custom domains with automated SSL/TLS
- Cloudflare Workers for edge compute and API routing — millisecond response times at the edge, heavy processing on fleet

---

## Technical Skills

Cloudflare Pages/Workers/D1/KV/R2/Tunnels, DigitalOcean, WireGuard, Tailscale, Docker, Nginx

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| D1 Databases | *live* | cloudflare.sh — wrangler d1 list --json |
| KV Namespaces | *live* | cloudflare.sh — wrangler kv list |
| R2 Buckets | *live* | cloudflare.sh — wrangler r2 bucket list |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
