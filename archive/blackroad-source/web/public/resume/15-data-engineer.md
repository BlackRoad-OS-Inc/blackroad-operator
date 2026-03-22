# Alexa Amundson

**Data Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Needed to prove every metric on every resume. Built a 10-collector pipeline that pulls from GitHub API, SSH fleet probes, Cloudflare CLI, and local system — 80+ KPIs aggregated daily, pushed to KV, served live on 20 dashboards.

---

## Experience

### BlackRoad OS | Founder & Data Engineer | 2025–Present

**The Problem: Unverifiable Claims Don't Get Hired**
- Resumes say "managed 200+ services" but nobody can verify it. Needed machine-verified metrics with traceable sources
- Built 10 automated collectors: GitHub, GitHub-deep, all-orgs, Gitea, fleet, services, autonomy, LOC, local, Cloudflare
- Each collector runs independently, outputs JSON snapshots. Daily aggregation merges into a single file with 80+ keys. Every number has a source

**The Pipeline: Collect \u2192 Aggregate \u2192 Serve**
- Fleet probes: Python scripts piped over SSH stdin to remote nodes — avoids shell quoting issues, runs on any node without installing anything
- Cloudflare inventory: wrangler CLI queries Pages, D1, KV, R2 counts. GitHub API: paginated queries across 17 organizations, deduped
- Daily JSON pushed to Cloudflare KV → Worker serves 20 live resume dashboards. Every number on this page updated automatically at 6 AM

**The Scale: 283 Databases, One Pipeline**
- 283 databases across PostgreSQL, SQLite, D1, KV, Qdrant — each one discovered, counted, and tracked by the collectors
- FTS5 full-text search across 156K entries. 111 registered systems. Day-over-day deltas show trends, not just snapshots

---

## Technical Skills

Python, PostgreSQL, SQLite/FTS5, Cloudflare D1, data pipelines, SSH probes, JSON, Bash

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| PostgreSQL DBs | *live* | services.sh — psql -l via SSH |
| SQLite DBs | *live* | local.sh — find ~/.blackroad -name *.db |
| Total DB Rows | *live* | local.sh — sqlite3 row count across 230 DBs |
| D1 Databases | *live* | cloudflare.sh — wrangler d1 list --json |
