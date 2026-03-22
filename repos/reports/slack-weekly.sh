#!/bin/bash
# Weekly Slack digest — posts Sunday night summary of the week's KPIs
# Compares this week vs last week, shows trends and highlights

source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/slack.sh"

slack_load

if ! slack_ready; then
  err "Slack not configured"
  exit 1
fi

export DATA_DIR

payload=$(python3 << 'PYEOF'
import json, os, glob
from datetime import datetime, timedelta

data_dir = os.environ.get('DATA_DIR', 'data')
daily_dir = os.path.join(data_dir, 'daily')

# Load all daily files
dailies = {}
for f in sorted(glob.glob(os.path.join(daily_dir, '*.json'))):
    try:
        with open(f) as fh:
            d = json.load(fh)
        dailies[d['date']] = d.get('summary', {})
    except:
        pass

if not dailies:
    print('{}')
    exit()

today = datetime.now()
# This week = last 7 days, Last week = 7-14 days ago
this_week = []
last_week = []

for i in range(7):
    day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
    if day in dailies:
        this_week.append(dailies[day])

for i in range(7, 14):
    day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
    if day in dailies:
        last_week.append(dailies[day])

def week_sum(data, key):
    return sum(d.get(key, 0) for d in data)

def week_avg(data, key):
    vals = [d.get(key, 0) for d in data if d.get(key, 0)]
    return round(sum(vals) / len(vals), 1) if vals else 0

def week_max(data, key):
    vals = [d.get(key, 0) for d in data]
    return max(vals) if vals else 0

def week_last(data, key):
    return data[0].get(key, 0) if data else 0

def trend(curr, prev):
    if not prev:
        return ''
    diff = curr - prev
    pct = round(diff / prev * 100) if prev else 0
    if diff > 0:
        return f' (+{diff}, +{pct}%) :chart_with_upwards_trend:'
    elif diff < 0:
        return f' ({diff}, {pct}%) :chart_with_downwards_trend:'
    return ' (=)'

# Key metrics
tw_commits = week_sum(this_week, 'commits_today')
lw_commits = week_sum(last_week, 'commits_today')
tw_prs = week_sum(this_week, 'prs_merged_today')
lw_prs = week_sum(last_week, 'prs_merged_today')
tw_events = week_sum(this_week, 'github_events_today')
lw_events = week_sum(last_week, 'github_events_today')

# Latest values
latest = this_week[0] if this_week else {}
loc = latest.get('total_loc', 0)
repos = latest.get('repos_total', 0)
fleet = latest.get('fleet_online', 0)
fleet_total = latest.get('fleet_total', 4)
autonomy = latest.get('autonomy_score', 0)
models = latest.get('ollama_models', 0)

# Sparkline for commits
commit_vals = []
for i in range(6, -1, -1):
    day = (today - timedelta(days=i)).strftime('%Y-%m-%d')
    commit_vals.append(dailies.get(day, {}).get('commits_today', 0))

bars = ['_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
max_c = max(commit_vals) or 1
sparkline = ''.join(bars[min(8, int(c / max_c * 8))] for c in commit_vals)

# Uptime percentage
fleet_days = [d.get('fleet_online', 0) for d in this_week]
fleet_totals = [d.get('fleet_total', 4) for d in this_week]
uptime_pct = round(sum(fleet_days) / sum(fleet_totals) * 100) if sum(fleet_totals) > 0 else 0

# Build blocks
week_start = (today - timedelta(days=6)).strftime('%b %d')
week_end = today.strftime('%b %d')

blocks = [
    {
        "type": "header",
        "text": {"type": "plain_text", "text": f"BlackRoad OS — Weekly Digest ({week_start} - {week_end})"}
    },

    # Velocity
    {
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text":
                f":rocket: *Code Velocity (7d)*\n"
                f"Commits: *{tw_commits}*{trend(tw_commits, lw_commits)}\n"
                f"PRs merged: *{tw_prs}*{trend(tw_prs, lw_prs)}\n"
                f"GH events: *{tw_events}*{trend(tw_events, lw_events)}\n"
                f"`{sparkline}` daily commits"},
            {"type": "mrkdwn", "text":
                f":bar_chart: *Current State*\n"
                f"LOC: *{loc:,}*\n"
                f"Repos: *{repos}*\n"
                f"Languages: {latest.get('github_language_count', 0)}\n"
                f"Autonomy: *{autonomy}/100*"},
        ]
    },

    # Fleet + infra
    {
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text":
                f":satellite: *Fleet*\n"
                f"Online: {fleet}/{fleet_total}\n"
                f"Uptime: {uptime_pct}% this week\n"
                f"Avg temp: {week_avg(this_week, 'avg_temp_c')}C\n"
                f"Max uptime: {week_max(this_week, 'max_uptime_days')}d"},
            {"type": "mrkdwn", "text":
                f":gear: *Services*\n"
                f"Ollama: {models} models\n"
                f"Docker: {latest.get('docker_containers', 0)} containers\n"
                f"Nginx: {latest.get('nginx_sites', 0)} sites\n"
                f"DBs: {latest.get('sqlite_dbs', 0)} SQLite + {latest.get('cf_d1_databases', 0)} D1"},
        ]
    },

    # Highlights
    {
        "type": "section",
        "text": {"type": "mrkdwn", "text":
            f":sparkles: *Week Highlights*\n"
            f"• {len(this_week)} days of data collected\n"
            f"• Peak commits: {max(commit_vals)} in a single day\n"
            f"• Total heal events: {week_sum(this_week, 'heal_events_today')}\n"
            f"• Service restarts: {week_sum(this_week, 'service_restarts_today')}"}
    },
    {"type": "divider"},
    {
        "type": "context",
        "elements": [
            {"type": "mrkdwn", "text": f":calendar: Week of {week_start} | blackroad-os-kpis weekly digest"}
        ]
    }
]

print(json.dumps({"blocks": blocks}))
PYEOF
)

if [ -z "$payload" ] || [ "$payload" = "{}" ]; then
  err "Not enough data for weekly digest"
  exit 1
fi

log "Posting weekly digest to Slack..."
if slack_post "$payload"; then
  ok "Weekly digest posted"
else
  err "Weekly digest failed"
fi
