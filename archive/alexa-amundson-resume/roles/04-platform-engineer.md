# Alexa Amundson

**Platform Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

No platform team, no internal tools budget. Built a complete developer platform from scratch: 212 CLI tools, self-hosted Git, code search, CI/CD pipelines, and automated observability — because waiting for someone else wasn't an option.

---

## Experience

### BlackRoad OS | Founder & Platform Engineer | 2025–Present

**The Gap: No Developer Platform Exists**
- 1,603 repos across 17 GitHub orgs + 207 Gitea repos — needed unified tooling to manage code, deploy, search, and monitor across all of it
- Built 212 CLI tools (121 MB) — every common workflow is a single command: deploy, probe, audit, sync, collect, report
- Self-hosted Gitea on the fleet with 207 repos across 7 orgs — full Git sovereignty with GitHub-to-Gitea relay syncing every 30 minutes

**The Platform: Search, Deploy, Observe**
- Code search engine indexing 354 repos with FTS5 full-text search — find anything across the entire codebase in milliseconds
- 99 Cloudflare Pages projects with git-push deployment — every commit triggers build and deploy automatically
- 10-collector KPI system generates daily observability: fleet health, code velocity, cloud inventory, service status

**Why It Matters**
- A solo developer operating at the output of a small team needs tools that multiply, not slow down
- 326 commits/day sustained velocity. 4,019 PRs merged. 20 languages. This throughput requires platform, not heroics

---

## Technical Skills

Cloudflare Pages/Workers, Gitea, GitHub Actions, Docker Swarm, CLI tooling, Bash, Python, FTS5

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| CLI Tools | *live* | local.sh — ls ~/bin | wc -l |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Docker Containers | *live* | services.sh — docker ps via SSH |
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
