#!/bin/bash
# Collect GitHub KPIs: commits, PRs, repos, LOC
# Sources: blackboxprogramming + all orgs

source "$(dirname "$0")/../lib/common.sh"

log "Collecting GitHub KPIs..."

OUT=$(snapshot_file github)

# Get all repos (user + orgs)
repos_json=$(mktemp)
echo '[]' > "$repos_json"

# User repos
log "Fetching user repos..."
gh api "users/$GITHUB_USER/repos?per_page=100&type=owner" --paginate --jq '
  [.[] | select(.archived == false) | {
    name: .full_name,
    stars: .stargazers_count,
    forks: .forks_count,
    size_kb: .size,
    language: .language,
    updated: .updated_at,
    default_branch: .default_branch
  }]' 2>/dev/null > "$repos_json" || true

# Org repos
for org in $GITHUB_ORGS; do
  log "Fetching $org repos..."
  gh api "orgs/$org/repos?per_page=100" --paginate --jq '
    [.[] | select(.archived == false) | {
      name: .full_name,
      stars: .stargazers_count,
      forks: .forks_count,
      size_kb: .size,
      language: .language,
      updated: .updated_at,
      default_branch: .default_branch
    }]' 2>/dev/null >> "$repos_json" || true
done

# Count repos
total_repos=$(python3 -c "
import json, glob
repos = []
for line in open('$repos_json'):
    try:
        repos.extend(json.loads(line))
    except: pass
print(len(repos))
" 2>/dev/null || echo 0)

# Get commits from last 24h across all repos
log "Counting today's commits..."
since=$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%SZ)
commits_today=0
prs_open=0
prs_merged_today=0

# Search commits by author in last 24h
commits_today=$(gh api "search/commits?q=author:$GITHUB_USER+committer-date:>=$since&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)

# Search open PRs
prs_open=$(gh api "search/issues?q=author:$GITHUB_USER+type:pr+state:open&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)

# PRs merged today
prs_merged_today=$(gh api "search/issues?q=author:$GITHUB_USER+type:pr+is:merged+merged:>=$since&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)

# Total PRs merged all time
prs_merged_total=$(gh api "search/issues?q=author:$GITHUB_USER+type:pr+is:merged&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)

# Get contribution stats
log "Fetching contribution events..."
events_today=$(gh api "users/$GITHUB_USER/events?per_page=100" --jq "[.[] | select(.created_at >= \"$since\")] | length" 2>/dev/null || echo 0)
push_events=$(gh api "users/$GITHUB_USER/events?per_page=100" --jq "[.[] | select(.type == \"PushEvent\" and .created_at >= \"$since\")] | length" 2>/dev/null || echo 0)

# Languages breakdown
log "Computing language breakdown..."
languages=$(python3 -c "
import json
repos = []
for line in open('$repos_json'):
    try:
        repos.extend(json.loads(line))
    except: pass
langs = {}
for r in repos:
    l = r.get('language')
    if l:
        langs[l] = langs.get(l, 0) + 1
top = sorted(langs.items(), key=lambda x: -x[1])[:10]
print(json.dumps(dict(top)))
" 2>/dev/null || echo '{}')

# Total size
total_size_mb=$(python3 -c "
import json
repos = []
for line in open('$repos_json'):
    try:
        repos.extend(json.loads(line))
    except: pass
print(round(sum(r.get('size_kb', 0) for r in repos) / 1024, 1))
" 2>/dev/null || echo 0)

# Write snapshot
cat > "$OUT" << ENDJSON
{
  "source": "github",
  "collected_at": "$TIMESTAMP",
  "date": "$TODAY",
  "repos": {
    "total": $total_repos,
    "total_size_mb": $total_size_mb,
    "languages": $languages
  },
  "commits": {
    "today": $commits_today,
    "push_events_today": $push_events
  },
  "pull_requests": {
    "open": $prs_open,
    "merged_today": $prs_merged_today,
    "merged_total": $prs_merged_total
  },
  "activity": {
    "events_today": $events_today
  }
}
ENDJSON

ok "GitHub: $total_repos repos, $commits_today commits today, $prs_open open PRs"
rm -f "$repos_json"
