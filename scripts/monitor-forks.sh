#!/bin/bash
# monitor-forks.sh — Track who forks BlackRoad repos
# Runs via cron. Logs new forks to memory system + SQLite.
# Usage: ./monitor-forks.sh [--quiet]
#
# BlackRoad OS, Inc. — Proprietary

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

DB="$HOME/.blackroad/fork-monitor.db"
QUIET="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Initialize database
mkdir -p "$(dirname "$DB")"
sqlite3 "$DB" "CREATE TABLE IF NOT EXISTS forks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo TEXT NOT NULL,
  forker TEXT NOT NULL,
  forker_url TEXT,
  fork_url TEXT,
  fork_created_at TEXT,
  detected_at TEXT NOT NULL,
  notified INTEGER DEFAULT 0,
  UNIQUE(repo, forker)
);"

sqlite3 "$DB" "CREATE TABLE IF NOT EXISTS stars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo TEXT NOT NULL,
  starrer TEXT NOT NULL,
  starred_at TEXT,
  detected_at TEXT NOT NULL,
  UNIQUE(repo, starrer)
);"

sqlite3 "$DB" "CREATE TABLE IF NOT EXISTS snapshots (
  repo TEXT NOT NULL,
  forks INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  clones_14d INTEGER DEFAULT 0,
  views_14d INTEGER DEFAULT 0,
  checked_at TEXT NOT NULL,
  PRIMARY KEY(repo, checked_at)
);"

# Repos to monitor (high-value)
REPOS=(
  "BlackRoad-OS-Inc/operator"
  "blackboxprogramming/road-math"
  "BlackRoad-Quantum/amundson-millennium"
  "BlackRoad-Hardware/hardware-specs"
  "BlackRoad-Media/black-board"
  "BlackRoad-Education/roadie-tutor"
  "BlackRoad-OS-Inc/blackroad"
  "BlackRoad-OS-Inc/information"
  "BlackRoad-Forge/RoadHome"
)

# Also monitor all orgs for any fork activity
ORGS=(
  "BlackRoad-OS-Inc" "BlackRoad-OS" "BlackRoad-AI" "BlackRoad-Hardware"
  "BlackRoad-Education" "BlackRoad-Quantum" "BlackRoad-Media"
  "BlackRoad-Interactive" "BlackRoad-Labs" "BlackRoad-Security"
  "BlackRoad-Forge" "BlackRoad-Network" "BlackRoad-Agents"
)

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NEW_FORKS=0
NEW_STARS=0

[ -z "$QUIET" ] && echo -e "${PINK}BlackRoad Fork Monitor${RESET}"
[ -z "$QUIET" ] && echo "========================="

# Check each high-value repo for forks
for repo in "${REPOS[@]}"; do
  [ -z "$QUIET" ] && echo -e "\n${AMBER}Checking $repo...${RESET}"

  # Get fork list
  forks_json=$(gh api "repos/$repo/forks?per_page=100&sort=newest" 2>/dev/null || echo "[]")
  fork_count=$(echo "$forks_json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d,list) else 0)" 2>/dev/null || echo "0")

  if [ "$fork_count" -gt 0 ]; then
    echo "$forks_json" | python3 -c "
import sys, json, subprocess, sqlite3

forks = json.load(sys.stdin)
if not isinstance(forks, list):
    sys.exit(0)

db = sqlite3.connect('$DB')
new = 0
for f in forks:
    owner = f.get('owner', {}).get('login', '?')
    fork_url = f.get('html_url', '')
    created = f.get('created_at', '')
    try:
        db.execute('INSERT OR IGNORE INTO forks (repo, forker, forker_url, fork_url, fork_created_at, detected_at) VALUES (?, ?, ?, ?, ?, ?)',
                   ('$repo', owner, f.get('owner',{}).get('html_url',''), fork_url, created, '$NOW'))
        if db.total_changes > 0:
            new += 1
            print(f'  NEW FORK: {owner} -> {fork_url}')
    except:
        pass
db.commit()
db.close()
print(f'  {len(forks)} total forks, {new} new')
" 2>/dev/null
  fi

  # Get stargazers
  stars_json=$(gh api "repos/$repo/stargazers" -H "Accept: application/vnd.github.star+json" 2>/dev/null || echo "[]")
  echo "$stars_json" | python3 -c "
import sys, json, sqlite3
stars = json.load(sys.stdin)
if not isinstance(stars, list):
    sys.exit(0)
db = sqlite3.connect('$DB')
new = 0
for s in stars:
    user = s.get('user', {}).get('login', '?')
    starred = s.get('starred_at', '')
    try:
        db.execute('INSERT OR IGNORE INTO stars (repo, starrer, starred_at, detected_at) VALUES (?, ?, ?, ?)',
                   ('$repo', user, starred, '$NOW'))
        if db.total_changes > 0:
            new += 1
            print(f'  NEW STAR: {user} starred $repo')
    except:
        pass
db.commit()
db.close()
" 2>/dev/null

  # Get traffic (requires push access)
  views=$(gh api "repos/$repo/traffic/views" --jq '.uniques // 0' 2>/dev/null || echo "0")
  clones=$(gh api "repos/$repo/traffic/clones" --jq '.uniques // 0' 2>/dev/null || echo "0")
  repo_data=$(gh api "repos/$repo" --jq '"\(.forks_count) \(.stargazers_count) \(.subscribers_count)"' 2>/dev/null || echo "0 0 0")
  read -r fc sc wc <<< "$repo_data"

  sqlite3 "$DB" "INSERT INTO snapshots (repo, forks, stars, watchers, clones_14d, views_14d, checked_at) VALUES ('$repo', ${fc:-0}, ${sc:-0}, ${wc:-0}, ${clones:-0}, ${views:-0}, '$NOW');"

  [ -z "$QUIET" ] && echo "  forks=$fc stars=$sc watchers=$wc views=$views clones=$clones"

  sleep 0.5  # rate limit
done

# Check org-level fork events
for org in "${ORGS[@]}"; do
  events=$(gh api "orgs/$org/events?per_page=30" --jq '[.[] | select(.type=="ForkEvent")] | .[] | "\(.actor.login) forked \(.repo.name) at \(.created_at)"' 2>/dev/null || true)
  if [ -n "$events" ]; then
    [ -z "$QUIET" ] && echo -e "\n${GREEN}Fork events in $org:${RESET}"
    echo "$events" | while read -r line; do
      [ -z "$QUIET" ] && echo "  $line"
    done
  fi
  sleep 0.3
done

# Summary
TOTAL_FORKS=$(sqlite3 "$DB" "SELECT COUNT(*) FROM forks;" 2>/dev/null || echo "0")
TOTAL_STARS=$(sqlite3 "$DB" "SELECT COUNT(*) FROM stars;" 2>/dev/null || echo "0")
LATEST_FORKS=$(sqlite3 "$DB" "SELECT repo || ' by ' || forker FROM forks ORDER BY detected_at DESC LIMIT 5;" 2>/dev/null || echo "none")

[ -z "$QUIET" ] && echo -e "\n${PINK}=== Summary ===${RESET}"
[ -z "$QUIET" ] && echo "Total tracked forks: $TOTAL_FORKS"
[ -z "$QUIET" ] && echo "Total tracked stars: $TOTAL_STARS"
[ -z "$QUIET" ] && echo "Latest forks:"
[ -z "$QUIET" ] && echo "$LATEST_FORKS" | head -5

# Log to memory system if new forks found
if [ "$TOTAL_FORKS" -gt 0 ]; then
  NEW_UNREPORTED=$(sqlite3 "$DB" "SELECT COUNT(*) FROM forks WHERE notified = 0;" 2>/dev/null || echo "0")
  if [ "$NEW_UNREPORTED" -gt 0 ]; then
    FORK_DETAILS=$(sqlite3 "$DB" "SELECT forker || ' forked ' || repo FROM forks WHERE notified = 0;" 2>/dev/null)
    bash "$SCRIPT_DIR/memory/memory-system.sh" log monitor fork-alert "NEW FORKS DETECTED: $FORK_DETAILS" 2>/dev/null || true
    bash "$SCRIPT_DIR/memory/memory-collaboration.sh" announce "FORK ALERT: $NEW_UNREPORTED new fork(s) detected — $FORK_DETAILS" 2>/dev/null || true
    sqlite3 "$DB" "UPDATE forks SET notified = 1 WHERE notified = 0;"
    echo -e "${GREEN}Notified memory system about $NEW_UNREPORTED new fork(s)${RESET}"
  fi
fi

echo ""
echo "Database: $DB"
echo "Next run: cron or manual"
