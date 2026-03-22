# Alexa Amundson

**Network Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Connecting 7 nodes across 3 physical locations with zero open ports. Built a multi-layer network: WireGuard mesh for encryption, Cloudflare tunnels for zero-trust access, RoadNet WiFi mesh for local coverage, and Pi-hole DNS for control.

---

## Experience

### BlackRoad OS | Founder & Network Engineer | 2025–Present

**The Layers: Defense in Depth**
- Layer 1 — WireGuard mesh VPN (10.8.0.x): encrypted tunnels between all nodes. Every packet between nodes is encrypted, period
- Layer 2 — Cloudflare tunnels (4 active): 48+ domains routed to fleet with zero open ports. External traffic never touches a public IP
- Layer 3 — Tailscale overlay (9 peers): management access from anywhere. MagicDNS for node resolution. Exit nodes for remote debugging
- Layer 4 — RoadNet WiFi mesh: 5 APs on non-overlapping channels, 5 subnets, NAT, auto-failover — local devices talk to fleet directly

**The DNS: Names, Not Numbers**
- Pi-hole for ad blocking and local DNS resolution. PowerDNS Docker for custom authoritative zones
- Custom DNS zones: .cece, .blackroad, .entity, .soul, .dream — edge services discoverable by domain name within the network
- 48 Nginx reverse proxy sites with health checking — each domain routes to the right backend on the right node

---

## Technical Skills

WireGuard, Tailscale, Nginx, Cloudflare Tunnels, Pi-hole, PowerDNS, UFW, iptables

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
| Tailscale Peers | *live* | services.sh — tailscale status via SSH |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| Net Connections | *live* | services.sh — ss -tun via SSH |
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
