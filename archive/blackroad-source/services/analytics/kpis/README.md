# BlackRoad OS KPIs

Daily collection of fleet health, GitHub activity, Cloudflare stats, and autonomy scores across the BlackRoad infrastructure.

## What it Does

Runs 14 collectors that SSH into 5 Raspberry Pi nodes, query GitHub/Gitea APIs, and probe Cloudflare resources. Results are stored as daily snapshots, posted to Slack, and pushed to Cloudflare KV for dashboard display.

## Collectors

| Collector | What it Measures |
|-----------|-----------------|
| `github.sh` | Repos, commits, stars, PRs (fork-excluded counts) |
| `github-deep.sh` | Per-repo stats across all orgs |
| `github-all-orgs.sh` | Multi-org aggregation |
| `gitea.sh` | Gitea repos, orgs, mirrors (Octavia :3100) |
| `fleet.sh` | SSH probe: CPU temp, RAM, disk, uptime per node |
| `fleet-probe.py` | Deep fleet health with service-level checks |
| `services.sh` | Port scanning and service status across fleet |
| `services-probe.py` | HTTP health checks on all endpoints |
| `autonomy.sh` | Self-healing event counts, restart frequency |
| `loc.sh` | Lines of code across all repos |
| `cloudflare.sh` | Pages, Workers, D1, KV, R2, tunnel counts |
| `traffic.sh` | Analytics data from sovereign analytics Worker |
| `local.sh` | Mac-side metrics (cron jobs, scripts, databases) |
| `collect-all.sh` | Runs all collectors in sequence |

## Reports

| Report | Destination |
|--------|-------------|
| `slack-notify.sh` | Daily Slack post with key metrics |
| `slack-alert.sh` | Threshold alerts (node down, disk full, etc.) |
| `slack-weekly.sh` | Weekly summary with trends |
| `daily-report.sh` | Markdown report to `data/` |
| `markdown-report.sh` | Formatted report for backlog |
| `push-kv.sh` | Push latest metrics to Cloudflare KV |
| `update-resumes.sh` | Update portfolio stats from live data |

## Schedule

```
# Mac crontab
0 6 * * * cd ~/blackroad-os-kpis && bash collectors/collect-all.sh
5 6 * * * cd ~/blackroad-os-kpis && bash reports/slack-notify.sh
```

Daily at 6 AM CST. GitHub Actions also runs collectors on push.

## First Collection (2026-03-12)

| Metric | Value |
|--------|-------|
| GitHub repos (non-fork) | 115 |
| Gitea repos | 207 |
| Total commits | 349 |
| Lines of code | 7.2M |
| Fleet nodes online | 4/5 |
| Ollama models | 27 |
| Cloudflare Pages | 95 |
| D1 databases | 8 |

## Setup

```bash
# Install collectors
git clone https://github.com/blackboxprogramming/blackroad-os-kpis.git
cd blackroad-os-kpis

# Install cron jobs
bash cron-install.sh

# Configure Slack (optional)
bash scripts/setup-slack.sh

# Run all collectors manually
bash collectors/collect-all.sh
```

## Data

Daily snapshots are stored in `data/` as timestamped JSON files. The `LATEST.md` file contains the most recent collection summary.

## License

Copyright 2026 BlackRoad OS, Inc. — Alexa Amundson. All rights reserved.
