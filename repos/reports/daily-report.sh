#!/bin/bash
# Generate formatted daily KPI report — FULL NUMBERS

source "$(dirname "$0")/../lib/common.sh"

DAILY=$(today_file)

if [ ! -f "$DAILY" ]; then
  err "No daily data for $TODAY. Run: npm run collect"
  exit 1
fi

YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d '1 day ago' +%Y-%m-%d)
YESTERDAY_FILE="$DATA_DIR/daily/${YESTERDAY}.json"

export DAILY YESTERDAY_FILE
python3 << 'PYEOF'
import json, os

with open(os.environ['DAILY']) as f:
    data = json.load(f)

yesterday = {}
yf = os.environ.get('YESTERDAY_FILE', '')
if yf and os.path.exists(yf):
    with open(yf) as f:
        yesterday = json.load(f)

s = data['summary']
ys = yesterday.get('summary', {})

def d(key):
    """Delta indicator"""
    curr = s.get(key, 0)
    prev = ys.get(key, 0)
    if not prev or not isinstance(curr, (int, float)):
        return ''
    diff = curr - prev
    if diff > 0:
        return f' \033[38;5;82m(+{diff})\033[0m'
    elif diff < 0:
        return f' \033[38;5;196m({diff})\033[0m'
    return ' \033[38;5;240m(=)\033[0m'

def pct(used, total):
    if not total:
        return '0%'
    return f"{round(used/total*100)}%"

def bar(value, max_val, width=20):
    if not max_val:
        return '░' * width
    filled = int(value / max_val * width)
    return '█' * filled + '░' * (width - filled)

P = '\033[38;5;205m'
A = '\033[38;5;214m'
B = '\033[38;5;69m'
G = '\033[38;5;82m'
V = '\033[38;5;135m'
W = '\033[1;37m'
DIM = '\033[38;5;240m'
R = '\033[0m'

# Compute some derived metrics
fleet_mem_pct = pct(s.get('fleet_mem_used_mb', 0), s.get('fleet_mem_total_mb', 1))
fleet_disk_pct = pct(s.get('fleet_disk_used_gb', 0), s.get('fleet_disk_total_gb', 1))
fleet_swap_pct = pct(s.get('fleet_swap_used_mb', 0), s.get('fleet_swap_total_mb', 1))

# Total infrastructure count
total_infra = (
    s.get('cf_d1_databases', 0) +
    s.get('cf_kv_namespaces', 0) +
    s.get('cf_r2_buckets', 0) +
    s.get('cf_pages', 0) +
    s.get('docker_containers', 0) +
    s.get('postgres_dbs', 0) +
    s.get('sqlite_dbs', 0)
)

# Total automation
total_automation = (
    s.get('mac_cron_jobs', 0) +
    s.get('fleet_cron_jobs', 0) +
    s.get('systemd_timers', 0)
)

print(f"""
{P}╔══════════════════════════════════════════════════════════════╗{R}
{P}║{R}  {W}B L A C K R O A D   O S{R}  —  {A}Daily KPIs{R}                      {P}║{R}
{P}║{R}  {B}{data['date']}{R}  {DIM}collected {data['collected_at']}{R}            {P}║{R}
{P}╠══════════════════════════════════════════════════════════════╣{R}

{A}═══ CODE VELOCITY ══════════════════════════════════════════════{R}
   Commits today        {G}{s['commits_today']:>6}{R}{d('commits_today')}
   Push events           {s.get('push_events_today', 0):>6}{d('push_events_today')}
   GitHub events         {s.get('github_events_today', 0):>6}{d('github_events_today')}
   PRs open              {s['prs_open']:>6}{d('prs_open')}
   PRs merged today      {s['prs_merged_today']:>6}{d('prs_merged_today')}
   PRs merged total      {s['prs_merged_total']:>6}{d('prs_merged_total')}
   Open issues           {s.get('github_open_issues', 0):>6}{d('github_open_issues')}
   Total LOC          {G}{s['total_loc']:>10,}{R}{d('total_loc')}

{A}═══ REPOSITORIES ══════════════════════════════════════════════{R}
   GitHub repos          {s['repos_github']:>6}  {DIM}({s.get('github_org_count', 0)} orgs){R}{d('repos_github')}
   GitHub active          {s.get('repos_github_active', 0):>5}  {DIM}archived {s.get('repos_github_archived', 0)}{R}
   Languages              {s.get('github_language_count', 0):>5}{d('github_language_count')}
   GitHub size         {round(s.get('github_all_size_mb', s.get('github_size_mb', 0)) / 1024, 1):>7} GB{d('github_all_size_mb')}
   Gitea repos           {s['repos_gitea']:>6}{d('repos_gitea')}
   Total repos           {W}{s['repos_total']:>6}{R}{d('repos_total')}
   Stars                 {s.get('github_stars', 0):>6}    Forks  {s.get('github_forks', 0)}
   Followers             {s.get('github_followers', 0):>6}    Following  {s.get('github_following', 0)}

{A}═══ FLEET ({s['fleet_online']}/{s['fleet_total']} online) ══════════════════════════════════════{R}
   Nodes online          {G}{s['fleet_online']:>6}{R}/{s['fleet_total']}{d('fleet_online')}
   Offline               {', '.join(s.get('fleet_offline', [])) or 'none'}
   Avg temp          {s['avg_temp_c']:>7.1f}°C
   Throttled             {', '.join(s.get('throttled_nodes', [])) or 'none'}
   Memory             {s.get('fleet_mem_used_mb', 0):>5} / {s.get('fleet_mem_total_mb', 0)} MB  {DIM}({fleet_mem_pct}){R}
   Disk               {s.get('fleet_disk_used_gb', 0):>5} / {s.get('fleet_disk_total_gb', 0)} GB  {DIM}({fleet_disk_pct}){R}
   Swap               {s.get('fleet_swap_used_mb', 0):>5} / {s.get('fleet_swap_total_mb', 0)} MB  {DIM}({fleet_swap_pct}){R}
   Processes             {s.get('fleet_processes', 0):>6}
   Net connections       {s.get('fleet_connections', 0):>6}
   Tailscale peers       {s.get('tailscale_peers', 0):>6}

{A}═══ SERVICES ═══════════════════════════════════════════════════{R}
   Ollama models         {V}{s.get('ollama_models', 0):>6}{R}  {DIM}({s.get('ollama_size_gb', 0):.1f} GB){R}{d('ollama_models')}
   Docker containers     {s.get('docker_containers', 0):>6}{d('docker_containers')}
   Docker images         {s.get('docker_images', 0):>6}{d('docker_images')}
   PostgreSQL DBs        {s.get('postgres_dbs', 0):>6}{d('postgres_dbs')}
   Nginx sites           {s.get('nginx_sites', 0):>6}{d('nginx_sites')}
   Systemd services      {s.get('systemd_services', 0):>6}{d('systemd_services')}
   Systemd timers        {s.get('systemd_timers', 0):>6}{d('systemd_timers')}
   Failed units          {s.get('failed_units', 0):>6}{d('failed_units')}

{A}═══ AUTONOMY ═══════════════════════════════════════════════════{R}
   Score            {V}{s.get('autonomy_score', 0):>5}/100{R}  {bar(s.get('autonomy_score', 0), 100, 30)}{d('autonomy_score')}
   Heal events today     {s.get('heal_events_today', 0):>6}
   Service restarts      {s.get('service_restarts_today', 0):>6}
   Fleet cron jobs       {s.get('fleet_cron_jobs', 0):>6}
   Max uptime         {s.get('max_uptime_days', 0):>5} days

{A}═══ LOCAL MAC ═══════════════════════════════════════════════════{R}
   CLI tools (~/bin)     {s.get('bin_tools', 0):>6}  {DIM}({s.get('bin_size_mb', 0)} MB){R}{d('bin_tools')}
   Home scripts          {s.get('home_scripts', 0):>6}
   Templates             {s.get('templates', 0):>6}
   Local git repos       {s.get('local_git_repos', 0):>6}
   SQLite databases      {s.get('sqlite_dbs', 0):>6}  {DIM}({s.get('blackroad_dir_mb', 0)} MB){R}
   FTS5 entries       {s.get('fts5_entries', 0):>8,}
   Systems registered    {s.get('systems_registered', 0):>6}
   Cron jobs             {s.get('mac_cron_jobs', 0):>6}
   Mac disk           {s.get('mac_disk_used_gb', 0):>5} GB  {DIM}({s.get('mac_disk_pct', 0)}%){R}
   Mac processes         {s.get('mac_processes', 0):>6}
   Brew packages         {s.get('brew_packages', 0):>6}
   pip packages          {s.get('pip_packages', 0):>6}
   npm global            {s.get('npm_global_packages', 0):>6}

{A}═══ CLOUDFLARE ═════════════════════════════════════════════════{R}
   Pages projects        {s.get('cf_pages', 0):>6}{d('cf_pages')}
   D1 databases          {s.get('cf_d1_databases', 0):>6}  {DIM}({s.get('cf_d1_size_kb', 0)} KB){R}{d('cf_d1_databases')}
   KV namespaces         {s.get('cf_kv_namespaces', 0):>6}{d('cf_kv_namespaces')}
   R2 buckets            {s.get('cf_r2_buckets', 0):>6}{d('cf_r2_buckets')}

{P}═══ TOTALS ═════════════════════════════════════════════════════{R}
   {W}Total repos            {s['repos_total']:>6}{R}
   {W}Total LOC          {s['total_loc']:>10,}{R}
   {W}Total databases        {total_infra:>6}{R}  {DIM}(D1+KV+R2+Pages+SQLite+PG+Docker){R}
   {W}Total automation        {total_automation:>5}{R}  {DIM}(crons+timers){R}
   {W}Total AI models        {s.get('ollama_models', 0):>6}{R}  {DIM}({s.get('ollama_size_gb', 0):.1f} GB){R}

{P}╚══════════════════════════════════════════════════════════════╝{R}
""")
PYEOF
