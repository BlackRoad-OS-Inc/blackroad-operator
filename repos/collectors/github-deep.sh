#!/bin/bash
# Deep GitHub metrics: stars, forks, traffic, languages, profile stats

source "$(dirname "$0")/../lib/common.sh"

log "Collecting deep GitHub metrics..."

OUT=$(snapshot_file github-deep)

# Profile stats
profile=$(gh api users/$GITHUB_USER 2>/dev/null || echo '{}')
followers=$(echo "$profile" | python3 -c "import json,sys; print(json.load(sys.stdin).get('followers',0))" 2>/dev/null || echo 0)
following=$(echo "$profile" | python3 -c "import json,sys; print(json.load(sys.stdin).get('following',0))" 2>/dev/null || echo 0)
public_repos=$(echo "$profile" | python3 -c "import json,sys; print(json.load(sys.stdin).get('public_repos',0))" 2>/dev/null || echo 0)
public_gists=$(echo "$profile" | python3 -c "import json,sys; print(json.load(sys.stdin).get('public_gists',0))" 2>/dev/null || echo 0)

ok "Profile: $public_repos repos, $followers followers"

# Aggregate stars, forks, sizes across all repos
repo_stats=$(gh api "users/$GITHUB_USER/repos?per_page=100&type=owner" --paginate 2>/dev/null | python3 -c "
import json, sys

repos = []
for line in sys.stdin:
    try:
        repos.extend(json.loads(line))
    except:
        pass

total_stars = sum(r.get('stargazers_count', 0) for r in repos)
total_forks = sum(r.get('forks_count', 0) for r in repos)
total_watchers = sum(r.get('watchers_count', 0) for r in repos)
total_size_kb = sum(r.get('size', 0) for r in repos)
total_open_issues = sum(r.get('open_issues_count', 0) for r in repos)
archived = sum(1 for r in repos if r.get('archived'))
active = len(repos) - archived

# Languages
langs = {}
for r in repos:
    l = r.get('language')
    if l:
        langs[l] = langs.get(l, 0) + 1

# Most recently updated
recent = sorted(repos, key=lambda r: r.get('updated_at', ''), reverse=True)[:10]
recent_names = [r['full_name'] for r in recent]

# Largest repos
largest = sorted(repos, key=lambda r: r.get('size', 0), reverse=True)[:10]
largest_info = [{r['full_name']: round(r['size']/1024, 1)} for r in largest]

print(json.dumps({
    'total_stars': total_stars,
    'total_forks': total_forks,
    'total_watchers': total_watchers,
    'total_size_mb': round(total_size_kb / 1024, 1),
    'total_open_issues': total_open_issues,
    'archived': archived,
    'active': active,
    'languages': langs,
    'top_10_recent': recent_names,
    'top_10_largest_mb': largest_info
}))
" 2>/dev/null || echo '{}')

# Org stats — use python to avoid jq pagination issues
python3 << PYEOF
import json, subprocess, os

def gh_count(endpoint):
    result = subprocess.run(['gh', 'api', endpoint, '--paginate'],
        capture_output=True, text=True, timeout=60)
    items = []
    for line in result.stdout.strip().split('\n'):
        if line.strip():
            try:
                data = json.loads(line)
                if isinstance(data, list):
                    items.extend(data)
            except:
                pass
    return len(items)

orgs_list = os.environ.get('GITHUB_ORGS', '').split()
org_stats = {}
for org in orgs_list:
    try:
        repos = gh_count(f'orgs/{org}/repos?per_page=100')
        members = gh_count(f'orgs/{org}/members?per_page=100')
        org_stats[org] = {'repos': repos, 'members': members}
    except:
        org_stats[org] = {'repos': 0, 'members': 0}

repo_stats = json.loads('''$repo_stats''')

output = {
    'source': 'github-deep',
    'collected_at': os.environ.get('TIMESTAMP', ''),
    'date': os.environ.get('TODAY', ''),
    'profile': {
        'followers': $followers,
        'following': $following,
        'public_repos': $public_repos,
        'public_gists': $public_gists
    },
    'repos': repo_stats,
    'orgs': org_stats
}

out_file = '$OUT'
with open(out_file, 'w') as f:
    json.dump(output, f, indent=2)

print(f"  \033[38;5;82m✓\033[0m Orgs: {len(org_stats)} organizations collected")
PYEOF

ok "Deep GitHub metrics collected"
