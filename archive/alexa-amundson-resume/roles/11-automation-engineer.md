# Alexa Amundson

**Automation Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

A solo operator can't manually manage 256 services, 1,603 repos, and 7 nodes. Built 212 CLI tools and 52 scheduled automations that turn a one-person operation into a self-sustaining system.

---

## Experience

### BlackRoad OS | Founder & Automation Engineer | 2025–Present

**The Philosophy: If You Did It Twice, Automate It**
- 212 CLI tools (121 MB) in ~/bin — every deployment, probe, audit, sync, and report is a single command
- 91 shell scripts for fleet management. Custom brand compliance auditing. Mass update tooling across all 99 sites
- GitHub-to-Gitea relay syncs 207 repos every 30 minutes — cross-platform Git without manual intervention

**The Schedule: 52 Tasks Running Without You**
- 17 Mac cron jobs + 35 fleet systemd timers = 52 automated tasks running daily, hourly, and every 5 minutes
- Daily KPI collection at 6 AM: 10 collectors pull from GitHub API, fleet SSH, Cloudflare CLI, local Mac — aggregated into daily report
- Self-healing autonomy: heartbeat every 60s, heal every 5m, power monitor every 5m — fleet maintains itself overnight

**The Pipeline: Data That Updates Itself**
- 10 collectors generate snapshots → aggregated into daily JSON → pushed to Cloudflare KV → live resume dashboards update automatically
- Every number on this page came from an automated collector, not a human typing it. Updated daily. Verified by source

---

## Technical Skills

Bash, Python, cron, systemd timers, GitHub Actions, SSH automation, jq, curl

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| CLI Tools | *live* | local.sh — ls ~/bin | wc -l |
| Shell Scripts | *live* | local.sh — find ~/ -name *.sh |
| Mac Crons | *live* | local.sh — crontab -l | wc -l |
| Systemd Timers | *live* | services.sh — systemctl list-timers via SSH |
| Fleet Crons | *live* | autonomy.sh — crontab -l via SSH |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
