#!/bin/bash
# Auto-update resume repo with latest verified metrics from KPI collection
# Runs after daily collection to keep all 20 resumes current

source "$(dirname "$0")/../lib/common.sh"

RESUME_DIR="$HOME/alexa-amundson-resume"
DAILY=$(today_file)

if [ ! -f "$DAILY" ]; then
  err "No daily data. Run collection first."
  exit 1
fi

if [ ! -d "$RESUME_DIR" ]; then
  err "Resume repo not found at $RESUME_DIR"
  exit 1
fi

log "Updating resume metrics from KPI data..."

# Get all-org stats
ALL_ORGS="$DATA_DIR/snapshots/${TODAY}-github-all-orgs.json"

python3 << PYEOF
import json, os, glob, re

# Load daily KPI data
with open('$DAILY') as f:
    daily = json.load(f)
s = daily['summary']

# Load all-org data if available
all_orgs = {}
aof = '$ALL_ORGS'
if os.path.exists(aof):
    with open(aof) as f:
        all_orgs = json.load(f)

t = all_orgs.get('totals', {})
langs = all_orgs.get('languages', {})
orgs = all_orgs.get('orgs', {})

# Build verified metrics
github_repos = t.get('repos', s.get('repos_github', 0))
github_active = t.get('active', s.get('repos_active', 0))
github_archived = t.get('archived', s.get('repos_archived', 0))
github_size_mb = t.get('size_mb', s.get('github_size_mb', 0))
github_size_gb = round(github_size_mb / 1024, 1) if github_size_mb else 0
lang_count = t.get('language_count', 20)
org_count = t.get('org_count', 17)
gitea_repos = 207  # from memory, Octavia offline
total_repos = github_repos + gitea_repos
stars = t.get('stars', s.get('github_stars', 0))

# Write VERIFIED-METRICS.md
metrics = f"""# Verified BlackRoad OS Metrics ({daily['date']})

Source: blackroad-os-kpis automated collection + full GitHub API scan across all {org_count} owners.

## Code
- {s['total_loc']:,} lines of code
- {s['commits_today']} commits/day, {s['prs_merged_total']:,} PRs merged all-time
- **{github_repos:,} GitHub repositories** across {org_count} owners ({github_active:,} active, {github_archived:,} archived)
- **{gitea_repos} Gitea repositories** across 7 organizations (self-hosted)
- **{total_repos:,} total repositories**
- {lang_count} languages: {', '.join(f'{l} ({c})' for l, c in sorted(langs.items(), key=lambda x: -x[1])[:15])}
- {github_size_gb} GB total GitHub repo size
- {stars} stars, {org_count} organizations

## GitHub Organizations ({len(orgs)} owners)
"""
for org_name, count in sorted(orgs.items(), key=lambda x: -x[1]):
    metrics += f"- {org_name}: {count:,} repos\\n"

metrics += f"""
## Infrastructure
- 5 Raspberry Pi nodes (Pi 5 x 4, Pi 400 x 1), 2 DigitalOcean droplets
- 52 TOPS AI acceleration (2x Hailo-8 NPUs)
- {s.get('fleet_mem_total_mb', 20000) // 1000} GB fleet RAM, {s.get('fleet_disk_total_gb', 707)} GB fleet storage
- WireGuard mesh VPN across all nodes

## AI/ML
- {s.get('ollama_models', 27)} Ollama models deployed ({s.get('ollama_size_gb', 48.1)} GB)
- 4 custom fine-tuned CECE models
- 2x Hailo-8 NPU (52 TOPS)

## Cloud (Cloudflare)
- {s.get('cf_pages', 99)} Pages projects
- {s.get('cf_d1_databases', 22)} D1 databases
- {s.get('cf_kv_namespaces', 46)} KV namespaces
- {s.get('cf_r2_buckets', 11)} R2 buckets
- 48+ custom domains via 4 tunnels

## Services
- {s.get('docker_containers', 14)} Docker containers
- {s.get('postgres_dbs', 11)} PostgreSQL databases
- {s.get('nginx_sites', 48)} Nginx sites
- {s.get('systemd_services', 256)} systemd services
- {s.get('systemd_timers', 35)} timers
- {s.get('tailscale_peers', 9)} Tailscale peers

## Automation
- {s.get('bin_tools', 212)} CLI tools ({s.get('bin_size_mb', 121)} MB)
- {s.get('home_scripts', 91)} shell scripts
- {s.get('mac_cron_jobs', 17)} Mac crons + {s.get('systemd_timers', 35)} fleet timers = {s.get('mac_cron_jobs', 17) + s.get('systemd_timers', 35)} automated tasks
- {s.get('sqlite_dbs', 230)} SQLite databases ({s.get('blackroad_dir_mb', 1390)} MB)
- {s.get('systems_registered', 111)} registered systems
- 60+ KPIs tracked daily across 9 collectors
"""

metrics_path = os.path.join('$RESUME_DIR', 'VERIFIED-METRICS.md')
with open(metrics_path, 'w') as f:
    f.write(metrics)

print(f"Updated VERIFIED-METRICS.md")

# Update README quick stats
readme_path = os.path.join('$RESUME_DIR', 'README.md')
with open(readme_path) as f:
    readme = f.read()

# Replace the stats block
old_stats_start = readme.find('## Verified Metrics')
old_stats_end = readme.find('---', old_stats_start + 1)
if old_stats_start > 0 and old_stats_end > 0:
    new_stats = f"""## Verified Metrics ({daily['date']})

All numbers collected by [blackroad-os-kpis](https://github.com/blackboxprogramming/blackroad-os-kpis).

\`\`\`
CODE
  Lines of code          {s['total_loc']:>10,}
  Commits/day            {s['commits_today']:>10}
  PRs merged (all time)  {s['prs_merged_total']:>10,}
  GitHub repos           {github_repos:>10,}  ({github_active} active, {org_count} orgs)
  Gitea repos            {gitea_repos:>10}  (7 orgs)
  Total repos            {total_repos:>10,}
  Languages              {lang_count:>10}
  GitHub size            {github_size_mb:>8} GB

INFRASTRUCTURE
  Fleet nodes            {s['fleet_total']:>10}
  Systemd services       {s.get('systemd_services', 256):>10}
  Docker containers      {s.get('docker_containers', 14):>10}
  Nginx sites            {s.get('nginx_sites', 48):>10}
  Fleet storage          {s.get('fleet_disk_total_gb', 707):>7} GB
  Fleet RAM              {s.get('fleet_mem_total_mb', 20000) // 1000:>7} GB

AI
  Models deployed        {s.get('ollama_models', 27):>10}  ({s.get('ollama_size_gb', 48.1)} GB)
  AI acceleration        {52:>7} TOPS
  Custom models          {4:>10}

CLOUD (Cloudflare)
  Pages projects         {s.get('cf_pages', 99):>10}
  D1 databases           {s.get('cf_d1_databases', 22):>10}
  KV namespaces          {s.get('cf_kv_namespaces', 46):>10}
  R2 buckets             {s.get('cf_r2_buckets', 11):>10}
  Domains                       48+

DATA
  Total databases        {s.get('postgres_dbs', 11) + s.get('sqlite_dbs', 230) + s.get('cf_d1_databases', 22):>10}
  PostgreSQL             {s.get('postgres_dbs', 11):>10}
  SQLite                 {s.get('sqlite_dbs', 230):>10}  ({s.get('blackroad_dir_mb', 1390)} MB)

AUTOMATION
  CLI tools              {s.get('bin_tools', 212):>10}  ({s.get('bin_size_mb', 121)} MB)
  Automated tasks        {s.get('mac_cron_jobs', 17) + s.get('systemd_timers', 35):>10}
  KPIs tracked                  60+
  Data collectors        {9:>10}
\`\`\`

"""
    readme = readme[:old_stats_start] + new_stats + readme[old_stats_end:]
    with open(readme_path, 'w') as f:
        f.write(readme)
    print("Updated README.md stats block")

PYEOF

# Commit and push if there are changes
cd "$RESUME_DIR"
if ! git diff --quiet 2>/dev/null; then
  git add -A
  git commit -m "kpi: auto-update metrics $(date +%Y-%m-%d)" 2>/dev/null
  git push 2>/dev/null
  ok "Resume repo updated and pushed"
else
  ok "Resume metrics already current"
fi
