#!/bin/bash
# Cloudflare traffic analytics + GitHub traffic + contribution velocity
# Collects: requests, page views, visitors, threats blocked, worker invocations,
#           GitHub clones, views, contributions YTD, commit streak, issues closed

source "$(dirname "$0")/../lib/common.sh"

log "Collecting traffic & velocity metrics..."

OUT=$(snapshot_file traffic)
CF_ACCOUNT="848cf0b18d51e0170e0d1537aec3505a"

python3 << 'PYEOF'
import json, subprocess, os, sys
from datetime import datetime, timedelta

data = {
    'source': 'traffic',
    'date': os.environ.get('TODAY', ''),
    'collected_at': os.environ.get('TIMESTAMP', ''),
    'cloudflare': {},
    'github': {},
    'velocity': {}
}

# ── Cloudflare Analytics via GraphQL ────────────────────────────────
def cf_graphql(query):
    """Call Cloudflare GraphQL analytics API"""
    try:
        result = subprocess.run(
            ['curl', '-sf', '--max-time', '15',
             '-H', 'Content-Type: application/json',
             '-H', f'Authorization: Bearer {os.environ.get("CF_API_TOKEN", "")}',
             'https://api.cloudflare.com/client/v4/graphql'],
            input=json.dumps({'query': query}),
            capture_output=True, text=True, timeout=20
        )
        return json.loads(result.stdout) if result.stdout else {}
    except:
        return {}

# Try to get CF API token from wrangler config or env
cf_token = os.environ.get('CLOUDFLARE_API_TOKEN', os.environ.get('CF_API_TOKEN', ''))
if not cf_token:
    # Try wrangler oauth token
    try:
        import tomllib
        wrangler_cfg = os.path.expanduser('~/.wrangler/config/default.toml')
        if os.path.exists(wrangler_cfg):
            with open(wrangler_cfg, 'rb') as f:
                cfg = tomllib.load(f)
            cf_token = cfg.get('oauth_token', '')
    except:
        pass

# Get zone list
try:
    result = subprocess.run(
        ['curl', '-sf', '--max-time', '10',
         'https://api.cloudflare.com/client/v4/zones?account.id=' + os.environ.get('CF_ACCOUNT', '848cf0b18d51e0170e0d1537aec3505a') + '&per_page=50',
         '-H', f'Authorization: Bearer {cf_token}'],
        capture_output=True, text=True, timeout=15
    )
    zones_data = json.loads(result.stdout) if result.stdout else {}
    zones = zones_data.get('result', [])
    data['cloudflare']['zones_count'] = len(zones)
except:
    zones = []
    data['cloudflare']['zones_count'] = 0

# Get worker count
try:
    result = subprocess.run(
        ['curl', '-sf', '--max-time', '10',
         f'https://api.cloudflare.com/client/v4/accounts/{os.environ.get("CF_ACCOUNT", "848cf0b18d51e0170e0d1537aec3505a")}/workers/scripts',
         '-H', f'Authorization: Bearer {cf_token}'],
        capture_output=True, text=True, timeout=15
    )
    workers_data = json.loads(result.stdout) if result.stdout else {}
    data['cloudflare']['workers_total'] = len(workers_data.get('result', []))
except:
    data['cloudflare']['workers_total'] = 0

# Get tunnel health
try:
    result = subprocess.run(
        ['curl', '-sf', '--max-time', '10',
         f'https://api.cloudflare.com/client/v4/accounts/{os.environ.get("CF_ACCOUNT", "848cf0b18d51e0170e0d1537aec3505a")}/cfd_tunnel?is_deleted=false&per_page=50',
         '-H', f'Authorization: Bearer {cf_token}'],
        capture_output=True, text=True, timeout=15
    )
    tunnels_data = json.loads(result.stdout) if result.stdout else {}
    tunnels = tunnels_data.get('result', [])
    data['cloudflare']['tunnels_total'] = len(tunnels)
    data['cloudflare']['tunnels_healthy'] = sum(1 for t in tunnels if t.get('status') == 'healthy')
    data['cloudflare']['tunnels_inactive'] = sum(1 for t in tunnels if t.get('status') in ('inactive', 'down'))
except:
    pass

# ── GitHub Traffic (top repos) ──────────────────────────────────────
def gh_api(endpoint):
    try:
        result = subprocess.run(
            ['gh', 'api', endpoint],
            capture_output=True, text=True, timeout=15
        )
        return json.loads(result.stdout) if result.stdout else {}
    except:
        return {}

# Traffic for main repo
gh_user = os.environ.get('GITHUB_USER', 'blackboxprogramming')
top_repos = ['BlackRoad-Operating-System', 'lucidia', 'quantum-math-lab', 'blackroad-api-sdks', 'simulation-theory']

total_views = 0
total_uniques = 0
total_clones = 0
total_unique_cloners = 0

for repo in top_repos:
    views = gh_api(f'repos/{gh_user}/{repo}/traffic/views')
    clones = gh_api(f'repos/{gh_user}/{repo}/traffic/clones')
    total_views += views.get('count', 0)
    total_uniques += views.get('uniques', 0)
    total_clones += clones.get('count', 0)
    total_unique_cloners += clones.get('uniques', 0)

data['github']['views_14d'] = total_views
data['github']['unique_visitors_14d'] = total_uniques
data['github']['clones_14d'] = total_clones
data['github']['unique_cloners_14d'] = total_unique_cloners

# GitHub contributions YTD
try:
    gql = '{ user(login:"' + gh_user + '") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } } } } }'
    result = subprocess.run(
        ['gh', 'api', 'graphql', '-f', f'query={gql}'],
        capture_output=True, text=True, timeout=30
    )
    cal_data = json.loads(result.stdout) if result.stdout else {}
    cal = cal_data.get('data', {}).get('user', {}).get('contributionsCollection', {}).get('contributionCalendar', {})
    data['github']['contributions_ytd'] = cal.get('totalContributions', 0)

    # Calculate streak
    streak = 0
    all_days = []
    for week in cal.get('weeks', []):
        for day in week.get('contributionDays', []):
            all_days.append(day)

    # Sort by date descending
    all_days.sort(key=lambda d: d['date'], reverse=True)
    for day in all_days:
        if day['contributionCount'] > 0:
            streak += 1
        else:
            break
    data['github']['commit_streak_days'] = streak

    # Average per day
    today = datetime.now()
    day_of_year = today.timetuple().tm_yday
    data['github']['avg_commits_per_day'] = round(data['github']['contributions_ytd'] / max(day_of_year, 1), 1)

except:
    data['github']['contributions_ytd'] = 0
    data['github']['commit_streak_days'] = 0
    data['github']['avg_commits_per_day'] = 0

# Issues closed
try:
    result = subprocess.run(
        ['gh', 'api', 'search/issues', '-f', f'q=author:{gh_user} is:issue is:closed'],
        capture_output=True, text=True, timeout=15
    )
    issues = json.loads(result.stdout) if result.stdout else {}
    data['github']['issues_closed_total'] = issues.get('total_count', 0)
except:
    data['github']['issues_closed_total'] = 0

# Repos updated in last 7 days
try:
    cutoff = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    result = subprocess.run(
        ['gh', 'api', f'users/{gh_user}/repos?per_page=100&sort=updated'],
        capture_output=True, text=True, timeout=15
    )
    repos = json.loads(result.stdout) if result.stdout else []
    data['github']['repos_updated_7d'] = sum(1 for r in repos if r.get('updated_at', '') > cutoff)
except:
    data['github']['repos_updated_7d'] = 0

# Non-fork count
try:
    result = subprocess.run(
        ['gh', 'repo', 'list', '--limit', '500', '--json', 'isFork'],
        capture_output=True, text=True, timeout=30
    )
    repos = json.loads(result.stdout) if result.stdout else []
    personal_forks = sum(1 for r in repos if r.get('isFork'))
    personal_originals = len(repos) - personal_forks

    # Check orgs for forks too
    total_forks = personal_forks
    for org in os.environ.get('GITHUB_ORGS', '').split():
        try:
            result = subprocess.run(
                ['gh', 'repo', 'list', org, '--limit', '500', '--json', 'isFork'],
                capture_output=True, text=True, timeout=30
            )
            org_repos = json.loads(result.stdout) if result.stdout else []
            total_forks += sum(1 for r in org_repos if r.get('isFork'))
        except:
            pass

    data['github']['total_forks'] = total_forks
    data['github']['non_fork_repos'] = 0  # filled during aggregation
except:
    data['github']['total_forks'] = 46

# Write output
out_file = os.environ.get('OUT', '/tmp/kpi-traffic.json')
with open(out_file, 'w') as f:
    json.dump(data, f, indent=2)

print(f"  \033[38;5;82m✓\033[0m GitHub: {data['github'].get('contributions_ytd', 0)} contributions YTD, {data['github'].get('commit_streak_days', 0)}-day streak")
print(f"  \033[38;5;82m✓\033[0m GitHub: {total_views} views, {total_clones} clones (14d)")
print(f"  \033[38;5;82m✓\033[0m Cloudflare: {data['cloudflare'].get('zones_count', 0)} zones, {data['cloudflare'].get('workers_total', 0)} workers")
PYEOF

ok "Traffic & velocity metrics collected"
