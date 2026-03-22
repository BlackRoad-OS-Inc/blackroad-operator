# Alexa Amundson

**Site Reliability Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Running 256 services across distributed hardware with no on-call team. Built observability from scratch, resolved 10+ production incidents solo, and automated reliability into the infrastructure itself.

---

## Experience

### BlackRoad OS | Founder & Site Reliability Engineer | 2025–Present

**The Reality: Solo On-Call for Everything**
- One person responsible for 256 services, 48 domains, 7 nodes, 283 databases — every incident is yours
- Built a 10-collector KPI system tracking 60+ metrics daily: fleet health, service status, temperatures, swap, processes, connections
- Day-over-day delta tracking catches regressions before they become outages — automated Slack notifications on anomalies

**The Incidents: Real Problems, Real Fixes**
- Node at 73.8°C — identified runaway Ollama generation loop via power monitoring, killed and disabled the service, temp dropped to 57.9°C
- Swap at 100% on Cecilia — found 4 concurrent rclone instances syncing same Google Drive, consolidated to 1, freed 2 GB swap
- Obfuscated cron dropper discovered on Cecilia — exec'ing from /tmp/op.py. Removed the malware, audited all nodes, rotated credentials fleet-wide
- Leaked GitHub PAT found in systemd service file — removed from config, rotated token, migrated all secrets to chmod 600 env files

**The System: Reliability as Code**
- Self-healing autonomy: heartbeat every 60s detects down services, heal cycle every 5m auto-restarts them
- Power monitoring on every node (cron */5, persistent logs) — voltage, throttle state, temperature, governor all tracked
- Distributed tracing database with nanosecond-precision spans — can trace any request across any node

---

## Technical Skills

systemd, cron, Nginx, Docker Swarm, WireGuard, Tailscale, distributed tracing, Bash, Python

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Failed Units | *live* | services.sh — systemctl --failed via SSH |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Nodes Online | *live* | fleet.sh — SSH probe to all nodes |
| Avg Temp | *live* | fleet.sh — /sys/class/thermal via SSH |
| Docker Containers | *live* | services.sh — docker ps via SSH |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
