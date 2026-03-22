#!/bin/bash
# Collect Gitea KPIs from Octavia (192.168.4.100:3100)
# 207 repos across 7 orgs

source "$(dirname "$0")/../lib/common.sh"

log "Collecting Gitea KPIs..."

OUT=$(snapshot_file gitea)
GITEA_URL="http://${GITEA_HOST}:${GITEA_PORT}/api/v1"

# Check if Gitea is reachable
if ! curl -sf --connect-timeout 5 "$GITEA_URL/repos/search?limit=1" > /dev/null 2>&1; then
  err "Gitea not reachable at $GITEA_URL"
  cat > "$OUT" << ENDJSON
{
  "source": "gitea",
  "collected_at": "$TIMESTAMP",
  "date": "$TODAY",
  "status": "unreachable",
  "repos": { "total": 0 },
  "commits": { "today": 0 }
}
ENDJSON
  exit 0
fi

total_repos=0
total_commits_today=0
total_size=0
org_breakdown='{}'
since=$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%SZ)

org_data="{"
first=true

for org in $GITEA_ORGS; do
  log "Scanning Gitea org: $org"

  # Get repos for org
  repos=$(curl -sf --connect-timeout 10 "$GITEA_URL/orgs/$org/repos?limit=50" 2>/dev/null || echo '[]')
  count=$(echo "$repos" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)
  total_repos=$((total_repos + count))

  # Count commits today per repo
  org_commits=0
  if [ "$count" -gt 0 ]; then
    repo_names=$(echo "$repos" | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    print(r['name'])
" 2>/dev/null || true)

    while IFS= read -r repo; do
      [ -z "$repo" ] && continue
      commits=$(curl -sf --connect-timeout 5 "$GITEA_URL/repos/$org/$repo/commits?since=$since&limit=50" 2>/dev/null || echo '[]')
      c=$(echo "$commits" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)
      org_commits=$((org_commits + c))
    done <<< "$repo_names"
  fi

  total_commits_today=$((total_commits_today + org_commits))

  if [ "$first" = true ]; then
    org_data="$org_data\"$org\": {\"repos\": $count, \"commits_today\": $org_commits}"
    first=false
  else
    org_data="$org_data, \"$org\": {\"repos\": $count, \"commits_today\": $org_commits}"
  fi
done

org_data="$org_data}"

cat > "$OUT" << ENDJSON
{
  "source": "gitea",
  "collected_at": "$TIMESTAMP",
  "date": "$TODAY",
  "status": "online",
  "repos": {
    "total": $total_repos,
    "orgs": $org_data
  },
  "commits": {
    "today": $total_commits_today
  }
}
ENDJSON

ok "Gitea: $total_repos repos, $total_commits_today commits today"
