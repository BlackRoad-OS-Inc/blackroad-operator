# Alexa Amundson

**Security Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Found a crypto miner, a cron dropper, and a leaked PAT in my own infrastructure. Cleaned all of it, rotated credentials fleet-wide, and rebuilt security from zero-trust architecture up — because the hardest incidents are the ones inside your own network.

---

## Experience

### BlackRoad OS | Founder & Security Engineer | 2025–Present

**The Incidents: What I Found and How I Fixed It**
- Obfuscated cron dropper on Cecilia — exec'ing from /tmp/op.py every 5 minutes. Traced it, removed the cron entry, cleaned /tmp, audited all nodes
- xmrig crypto miner service configured on Lucidia — unit file referencing mining pool. Service removed, system audited for persistence mechanisms
- Leaked GitHub PAT (gho_Gfu...) embedded in a systemd service file on Lucidia — removed from config, token revoked on GitHub, all secrets migrated to chmod 600 env files
- 50+ SSH authorized keys on some nodes — audited every key, identified which ones are active, locked down access paths

**The Architecture: Trust Nothing by Default**
- Zero open ports — all external access through Cloudflare tunnels. No port forwarding, no exposed SSH, no public APIs
- WireGuard encryption for all inter-node traffic. UFW with INPUT DROP policy on edge nodes. Credential rotation enforced fleet-wide
- GitHub security scanning workflows check for AWS keys, tokens, passwords on every push — catches secrets before they ship

**The Lesson**
- Security isn't a feature you add — it's what you find when you actually look. Every fleet needs an adversarial audit, not just a firewall

---

## Technical Skills

incident response, malware analysis, credential rotation, WireGuard, Cloudflare tunnels, UFW, SSH, Linux hardening

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Failed Units | *live* | services.sh — systemctl --failed via SSH |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Tailscale Peers | *live* | services.sh — tailscale status via SSH |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
| Nodes Online | *live* | fleet.sh — SSH probe to all nodes |
