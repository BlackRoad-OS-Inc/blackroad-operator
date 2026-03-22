# Alexa Amundson

**Senior DevOps Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Needed production infrastructure without a team or budget. Built a self-healing 7-node fleet from Raspberry Pis, automated 52 operational tasks, and deployed 99 cloud services — solo, from scratch.

---

## Experience

### BlackRoad OS | Founder & Senior DevOps Engineer | 2025–Present

**The Problem: Zero Infrastructure, Zero Team**
- No existing infrastructure, no ops team, no vendor contracts — needed production-grade systems running 48+ domains on day one
- Solved by designing a hybrid fleet: 5 Pi nodes + 2 cloud VMs + Cloudflare edge, all connected via WireGuard mesh VPN — total cost under $700 hardware
- Result: 256 systemd services running across fleet, 48 Nginx reverse proxy sites, 14 Docker containers — all managed by one person

**The Bet: Self-Healing Over Manual Ops**
- Fleet nodes crash, services fail, temperatures spike — manual monitoring doesn't scale for a solo operator running 256 services
- Built autonomy scripts: heartbeat every 60 seconds, heal cycle every 5 minutes, automatic service restarts on failure
- Detected a node cooking at 73.8°C from a runaway Ollama loop — auto-isolated the process, dropped temp to 57.9°C without downtime

**The Multiplier: 212 CLI Tools**
- Every repeated task became a tool. 212 CLI tools (121 MB) in ~/bin — deploy, probe, audit, sync, report
- GitHub-to-Gitea relay syncs 207 repos every 30 minutes. Daily KPI collection tracks 60+ metrics across 10 data sources
- 99 Cloudflare Pages, 23 D1 databases, 47 KV namespaces, 11 R2 buckets — all deployed and maintained through CLI automation

---

## Technical Skills

Linux/Debian, Docker Swarm, systemd, Nginx, WireGuard, Cloudflare, GitHub Actions, Bash, Python

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Docker Containers | *live* | services.sh — docker ps via SSH |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| CLI Tools | *live* | local.sh — ls ~/bin | wc -l |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
