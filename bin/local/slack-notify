#!/bin/bash
# Post daily KPI report to Slack (blackroadosinc.slack.com)
# Enhanced: trend deltas, fleet health, git-agent status, alert severity
#
# Requires SLACK_WEBHOOK_URL env var or ~/.blackroad/slack-webhook.env
# Optional: SLACK_ALERTS_WEBHOOK_URL for #alerts channel

source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/slack.sh"

slack_load

if ! slack_ready; then
  err "Slack not configured. Run: bash scripts/setup-slack.sh"
  exit 1
fi

DAILY=$(today_file)

if [ ! -f "$DAILY" ]; then
  err "No daily data for $TODAY. Run: bash collectors/collect-all.sh"
  exit 1
fi

YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d '1 day ago' +%Y-%m-%d)
YESTERDAY_FILE="$DATA_DIR/daily/${YESTERDAY}.json"
GIT_AGENT_LOG="$HOME/.blackroad/logs/git-agent.log"

export DAILY YESTERDAY_FILE GIT_AGENT_LOG

# ─── Build Slack payload ─────────────────────────────────────────────
payload=$(python3 << 'PYEOF'
import json, os, glob

daily_file = os.environ.get('DAILY', '')
yesterday_file = os.environ.get('YESTERDAY_FILE', '')
git_log = os.environ.get('GIT_AGENT_LOG', '')

with open(daily_file) as f:
    data = json.load(f)

s = data['summary']

# Yesterday's data for deltas
ys = {}
if yesterday_file and os.path.exists(yesterday_file):
    with open(yesterday_file) as f:
        ys = json.load(f).get('summary', {})

def delta(key, invert=False):
    """Show delta from yesterday: +N or -N"""
    curr = s.get(key, 0)
    prev = ys.get(key, 0)
    if not prev or not isinstance(curr, (int, float)):
        return ''
    diff = curr - prev
    if diff == 0:
        return ''
    sign = '+' if diff > 0 else ''
    emoji = ''
    if invert:  # lower is better (failed_units, throttled)
        emoji = ' :small_red_triangle:' if diff > 0 else ' :small_red_triangle_down:'
    else:
        emoji = ' :chart_with_upwards_trend:' if diff > 0 else ' :chart_with_downwards_trend:'
    return f" ({sign}{diff}{emoji})"

def fmt(n):
    if isinstance(n, float):
        return f"{n:,.1f}"
    if isinstance(n, int) and n >= 1000:
        return f"{n:,}"
    return str(n)

# Fleet status emoji
fleet_online = s.get('fleet_online', 0)
fleet_total = s.get('fleet_total', 4)
fleet_emoji = ':large_green_circle:' if fleet_online == fleet_total else ':red_circle:' if fleet_online <= 1 else ':large_yellow_circle:'

# Autonomy score bar
score = s.get('autonomy_score', 0)
filled = score // 10
score_bar = ':black_large_square:' * filled + ':white_large_square:' * (10 - filled)

# Git agent last patrol
git_status = 'No patrol data'
if git_log and os.path.exists(git_log):
    with open(git_log) as f:
        lines = f.readlines()
    patrols = [l.strip() for l in lines if 'PATROL:' in l]
    if patrols:
        last = patrols[-1]
        git_status = last.split('] ', 1)[-1] if '] ' in last else last

# Alerts
alerts = []
offline = s.get('fleet_offline', [])
if offline:
    alerts.append(f":rotating_light: *Nodes offline*: {', '.join(offline)}")
if s.get('failed_units', 0) > 0:
    alerts.append(f":warning: *{s['failed_units']} failed systemd units*")
throttled = s.get('throttled_nodes', [])
if throttled:
    alerts.append(f":fire: *Throttled*: {', '.join(throttled)}")
if s.get('avg_temp_c', 0) > 70:
    alerts.append(f":thermometer: *High temp*: {s['avg_temp_c']}C avg")
if fleet_online < fleet_total:
    alerts.append(f":satellite: *Fleet degraded*: {fleet_online}/{fleet_total} online")

alert_text = '\n'.join(alerts) if alerts else ':white_check_mark: All systems nominal'

# Weekly trend (last 7 days of commits)
trend_commits = []
daily_dir = os.path.dirname(daily_file)
for f in sorted(glob.glob(os.path.join(daily_dir, '*.json')))[-7:]:
    try:
        with open(f) as fh:
            d = json.load(fh)
        trend_commits.append(d.get('summary', {}).get('commits_today', 0))
    except:
        pass

sparkline = ''
if trend_commits:
    max_c = max(trend_commits) or 1
    bars = ['_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
    sparkline = ''.join(bars[min(8, int(c / max_c * 8))] for c in trend_commits)
    sparkline = f"`{sparkline}` (7d commits)"

blocks = [
    {
        "type": "header",
        "text": {"type": "plain_text", "text": f"BlackRoad OS — Daily KPIs {data['date']}"}
    },

    # ── Alerts section ──
    {
        "type": "section",
        "text": {"type": "mrkdwn", "text": alert_text}
    },
    {"type": "divider"},

    # ── Code velocity ──
    {
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text": f":rocket: *Code Velocity*\n"
                f"Commits: *{s['commits_today']}*{delta('commits_today')}\n"
                f"PRs merged: *{s['prs_merged_today']}*{delta('prs_merged_today')}\n"
                f"PRs open: {s['prs_open']}{delta('prs_open')}\n"
                f"Events: {s.get('github_events_today', 0)}{delta('github_events_today')}"},
            {"type": "mrkdwn", "text": f":bar_chart: *Scale*\n"
                f"LOC: *{fmt(s['total_loc'])}*{delta('total_loc')}\n"
                f"Repos: *{s['repos_total']}* ({s['repos_github']} GH + {s['repos_gitea']} Gitea){delta('repos_total')}\n"
                f"Languages: {s.get('github_language_count', 0)}\n"
                f"{sparkline}"},
        ]
    },

    # ── Fleet + Services ──
    {
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text": f"{fleet_emoji} *Fleet*\n"
                f"Online: *{fleet_online}/{fleet_total}*{delta('fleet_online')}\n"
                f"Temp: {s.get('avg_temp_c', 0):.1f}C\n"
                f"Mem: {s.get('fleet_mem_used_mb', 0)}/{s.get('fleet_mem_total_mb', 0)} MB\n"
                f"Disk: {s.get('fleet_disk_used_gb', 0)}/{s.get('fleet_disk_total_gb', 0)} GB"},
            {"type": "mrkdwn", "text": f":gear: *Services*\n"
                f"Ollama: *{s.get('ollama_models', 0)}* models ({s.get('ollama_size_gb', 0):.1f} GB)\n"
                f"Docker: {s.get('docker_containers', 0)} containers\n"
                f"Systemd: {s.get('systemd_services', 0)} svc / {s.get('systemd_timers', 0)} timers\n"
                f"Nginx: {s.get('nginx_sites', 0)} sites"},
        ]
    },

    # ── Autonomy + Cloud ──
    {
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text": f":robot_face: *Autonomy*\n"
                f"Score: *{score}/100*{delta('autonomy_score')}\n"
                f"{score_bar}\n"
                f"Heals: {s.get('heal_events_today', 0)} | Restarts: {s.get('service_restarts_today', 0)}\n"
                f"Crons: {s.get('fleet_cron_jobs', 0)} | Uptime: {s.get('max_uptime_days', 0)}d"},
            {"type": "mrkdwn", "text": f":cloud: *Cloudflare*\n"
                f"Pages: {s.get('cf_pages', 0)}{delta('cf_pages')}\n"
                f"D1: {s.get('cf_d1_databases', 0)} | KV: {s.get('cf_kv_namespaces', 0)}\n"
                f"R2: {s.get('cf_r2_buckets', 0)}\n"
                f"DBs total: {s.get('sqlite_dbs', 0)} SQLite + {s.get('postgres_dbs', 0)} PG + {s.get('cf_d1_databases', 0)} D1"},
        ]
    },

    # ── Local Mac ──
    {
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text": f":computer: *Local Mac*\n"
                f"CLI tools: {s.get('bin_tools', 0)} | Scripts: {s.get('home_scripts', 0)}\n"
                f"Git repos: {s.get('local_git_repos', 0)}\n"
                f"Disk: {s.get('mac_disk_used_gb', 0)} GB ({s.get('mac_disk_pct', 0)}%)\n"
                f"Processes: {s.get('mac_processes', 0)}"},
            {"type": "mrkdwn", "text": f":file_cabinet: *Data*\n"
                f"SQLite DBs: {s.get('sqlite_dbs', 0)}\n"
                f"Total DB rows: {fmt(s.get('total_db_rows', 0))}\n"
                f"FTS5 entries: {fmt(s.get('fts5_entries', 0))}\n"
                f"Packages: {s.get('brew_packages', 0)} brew / {s.get('pip_packages', 0)} pip / {s.get('npm_global_packages', 0)} npm"},
        ]
    },
    {"type": "divider"},

    # ── Git agent status ──
    {
        "type": "context",
        "elements": [
            {"type": "mrkdwn", "text": f":satellite_antenna: Git Agent: _{git_status}_ | Collected {data['collected_at']}"}
        ]
    }
]

payload = {"blocks": blocks}
print(json.dumps(payload))
PYEOF
)

if [ -z "$payload" ]; then
  err "Failed to build Slack payload"
  exit 1
fi

# ─── Post to Slack ───────────────────────────────────────────────────
log "Posting daily report to Slack..."
if slack_post "$payload"; then
  ok "Daily report posted to Slack"
else
  err "Slack post failed"
fi
