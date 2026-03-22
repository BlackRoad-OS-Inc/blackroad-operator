#!/bin/bash
# Collect metrics across ALL 17 GitHub organizations + personal account
# This is the comprehensive cross-org collector

source "$(dirname "$0")/../lib/common.sh"

log "Collecting all-org GitHub metrics..."

OUT=$(snapshot_file github-all-orgs)

python3 << 'PYEOF'
import subprocess, json, os

def gh_api(endpoint):
    result = subprocess.run(['gh', 'api', endpoint, '--paginate'],
        capture_output=True, text=True, timeout=120)
    repos = []
    for line in result.stdout.strip().split('\n'):
        if line.strip():
            try:
                data = json.loads(line)
                if isinstance(data, list):
                    repos.extend(data)
            except:
                pass
    return repos

user = 'blackboxprogramming'
orgs = ['Blackbox-Enterprises','BlackRoad-AI','BlackRoad-OS','BlackRoad-Labs','BlackRoad-Cloud',
        'BlackRoad-Ventures','BlackRoad-Foundation','BlackRoad-Media','BlackRoad-Hardware',
        'BlackRoad-Education','BlackRoad-Gov','BlackRoad-Security','BlackRoad-Interactive',
        'BlackRoad-Archive','BlackRoad-Studio','BlackRoad-OS-Inc']

all_repos = gh_api(f'users/{user}/repos?per_page=100&type=owner')

for org in orgs:
    try:
        all_repos.extend(gh_api(f'orgs/{org}/repos?per_page=100'))
    except:
        pass

# Dedupe
seen = set()
unique = []
for r in all_repos:
    name = r.get('full_name', '')
    if name and name not in seen:
        seen.add(name)
        unique.append(r)

active = [r for r in unique if not r.get('archived')]
archived = [r for r in unique if r.get('archived')]
stars = sum(r.get('stargazers_count', 0) for r in unique)
forks = sum(r.get('forks_count', 0) for r in unique)
size_mb = round(sum(r.get('size', 0) for r in unique) / 1024, 1)
issues = sum(r.get('open_issues_count', 0) for r in unique)

langs = {}
for r in unique:
    l = r.get('language')
    if l:
        langs[l] = langs.get(l, 0) + 1

org_counts = {}
for r in unique:
    owner = r.get('owner', {}).get('login', 'unknown')
    org_counts[owner] = org_counts.get(owner, 0) + 1

output = {
    'source': 'github-all-orgs',
    'collected_at': os.environ.get('TIMESTAMP', ''),
    'date': os.environ.get('TODAY', ''),
    'totals': {
        'repos': len(unique),
        'active': len(active),
        'archived': len(archived),
        'stars': stars,
        'forks': forks,
        'size_mb': size_mb,
        'open_issues': issues,
        'language_count': len(langs),
        'org_count': len(set(r.get('owner',{}).get('login','') for r in unique))
    },
    'languages': dict(sorted(langs.items(), key=lambda x: -x[1])),
    'orgs': dict(sorted(org_counts.items(), key=lambda x: -x[1]))
}

out_file = os.path.join(os.environ.get('DATA_DIR', 'data'), 'snapshots',
    f"{os.environ.get('TODAY', 'unknown')}-github-all-orgs.json")
with open(out_file, 'w') as f:
    json.dump(output, f, indent=2)

print(f"  \033[38;5;82m✓\033[0m All-org: {len(unique)} repos ({len(active)} active), {len(langs)} languages, {len(org_counts)} owners")
PYEOF
