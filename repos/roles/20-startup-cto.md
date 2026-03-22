# Alexa Amundson

**Startup CTO**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Built BlackRoad OS from nothing — no team, no funding, no existing code. One person, 7.2M lines of code, 1,810 repos, 7-node fleet, 27 AI models, 283 databases, 48+ live domains. The entire company's technical stack, soup to nuts, solo.

---

## Experience

### BlackRoad OS | Founder & Startup CTO | 2025–Present

**From Zero to Production — Alone**
- Started with an idea and a credit card. Now: 7.2M lines of code, 1,603 GitHub repos across 17 orgs, 207 Gitea repos across 7 more
- 326 commits/day sustained velocity. 4,019 PRs merged. 20 programming languages. 212 CLI tools built for every operational workflow
- No investors, no employees, no outsourcing — every line of code, every server config, every DNS record is my work

**The Infrastructure Decision: Own Everything**
- 5 Raspberry Pi edge nodes + 2 cloud VMs + Cloudflare serverless — total hardware cost under $700, cloud spend under $50/month
- 256 systemd services, 14 Docker containers, 48 Nginx sites, 27 Ollama models (48.1 GB), 52 TOPS AI compute (2x Hailo-8)
- WireGuard mesh + 4 Cloudflare tunnels + Tailscale overlay — three networking layers ensuring everything talks to everything, encrypted

**The Cloud Platform: 178 Managed Resources**
- 99 Pages, 23 D1, 47 KV, 11 R2 — Cloudflare is the global layer. Fleet is the sovereign layer. Both managed through CLI automation
- 283 databases across 5 engines. 48+ custom domains. 52 automated tasks. 60+ KPIs tracked daily across 10 collectors

**Why It Matters**
- This isn't a portfolio project — it's a production system serving real traffic. Every metric on this page is collected from live infrastructure, right now
- A CTO who built the whole stack understands every layer. I don't delegate debugging because I wrote the code that's breaking

---

## Technical Skills

Python, JavaScript, TypeScript, Bash, Go, C, React, Next.js, FastAPI, Docker, Linux, Nginx, WireGuard, Cloudflare, PostgreSQL, SQLite, systemd, Hailo-8, Ollama, GitHub Actions

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| Commits Today | *live* | github.sh — gh api events |
| PRs Merged | *live* | github.sh — gh api search/issues |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| AI Models | *live* | services.sh — ollama list via SSH |
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| Docker Containers | *live* | services.sh — docker ps via SSH |
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
