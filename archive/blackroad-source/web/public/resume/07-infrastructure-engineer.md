# Alexa Amundson

**Infrastructure Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Built a production fleet from single-board computers. 5 Raspberry Pis, 2 cloud VMs, 52 TOPS of AI acceleration, 707 GB distributed storage — proving that serious infrastructure doesn't require serious budgets.

---

## Experience

### BlackRoad OS | Founder & Infrastructure Engineer | 2025–Present

**The Thesis: Commodity Hardware, Production Workloads**
- A Raspberry Pi 5 costs $80. A Hailo-8 NPU costs $100. Together they deliver 26 TOPS of AI inference with 8 GB RAM
- Built a 7-node fleet for under $700 total hardware cost — runs 256 systemd services, 14 Docker containers, 27 AI models, 48 Nginx sites
- Same fleet handles production traffic across 48+ domains serving real users through Cloudflare tunnels

**The Hard Part: Power, Heat, and Storage**
- Pi 5 + Hailo-8 + NVMe draws more than a standard 5V/3A PSU can deliver — diagnosed undervoltage (0.75V), tuned config.txt, recovered +95mV
- Reduced GPU memory 256MB to 16MB on headless nodes. Applied conservative CPU governors. Disabled 16 skeleton microservices — freed 800 MB RAM
- Fleet averages 42°C now. Power monitoring runs every 5 minutes on all nodes, logging voltage, throttle state, and governor

**The Network: Every Node Reachable, Every Path Encrypted**
- WireGuard mesh VPN (10.8.0.x) connects all nodes. RoadNet WiFi mesh (5 APs, 5 subnets) provides local coverage
- 4 Cloudflare tunnels route 48+ domains to fleet services. Tailscale overlay (9 peers) for remote management

---

## Technical Skills

Raspberry Pi, Linux, WireGuard, Nginx, systemd, Docker Swarm, Hailo-8, NVMe

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Nodes Online | *live* | fleet.sh — SSH probe to all nodes |
| Fleet Storage (GB) | *live* | fleet.sh — df via SSH |
| Fleet RAM (MB) | *live* | fleet.sh — /proc/meminfo via SSH |
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
