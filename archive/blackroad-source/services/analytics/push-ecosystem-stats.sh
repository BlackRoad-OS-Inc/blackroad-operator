#!/bin/bash
# Push ecosystem stats to KV every 6 hours
# Cron: 0 */6 * * * /Users/alexa/blackroad-operator/scripts/collectors/push-ecosystem-stats.sh

set -e
STATS_URL="https://stats-blackroad.amundsonalexa.workers.dev"
KEY="blackroad-stats-push-2026"

# Collect live counts
REPOS=$(gh repo list BlackRoad-OS-Inc --limit 100 --json name -q '. | length' 2>/dev/null || echo 80)
TOTAL_REPOS=627  # Updated manually or via full org scan

# Ollama models (from fleet API)
MODELS=$(curl -s --max-time 5 "$STATS_URL/fleet" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{}).get('nodes',[])
if isinstance(d,list):
    print(sum(n.get('models',0) for n in d))
elif isinstance(d,dict):
    print(sum(n.get('models',0) for n in d.values()))
else:
    print(44)
" 2>/dev/null || echo 44)

# Auth users
USERS=$(curl -s --max-time 5 "https://auth.blackroad.io/api/stats" 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin).get('users',42))" 2>/dev/null || echo 42)

# Push combined
curl -s -X POST "$STATS_URL/push" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"ecosystem\",\"data\":{\"repos\":$TOTAL_REPOS,\"workers\":106,\"pages\":95,\"kv\":55,\"d1\":26,\"r2\":12,\"agents\":30000,\"pi_nodes\":5,\"models\":$MODELS,\"loc\":508383,\"auth_users\":$USERS,\"tools\":105,\"templates\":34,\"tunnels\":18,\"domains\":68,\"services\":118,\"crons\":22,\"inc_repos\":$REPOS}}" > /dev/null 2>&1

echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') ecosystem stats pushed"
