#!/bin/bash
# Shared utilities for KPI collectors

set -e

# Paths
KPI_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$KPI_ROOT/data"
TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
export KPI_ROOT DATA_DIR TODAY TIMESTAMP

# Ensure data dirs
mkdir -p "$DATA_DIR/daily" "$DATA_DIR/snapshots" "$DATA_DIR/raw"

# Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

log() { echo -e "${BLUE}[KPI]${RESET} $*"; }
ok()  { echo -e "${GREEN}  ✓${RESET} $*"; }
err() { echo -e "${RED}  ✗${RESET} $*" >&2; }

# Config
GITHUB_USER="blackboxprogramming"
GITHUB_ORGS="Blackbox-Enterprises BlackRoad-AI BlackRoad-OS BlackRoad-Labs BlackRoad-Cloud BlackRoad-Ventures BlackRoad-Foundation BlackRoad-Media BlackRoad-Hardware BlackRoad-Education BlackRoad-Gov BlackRoad-Security BlackRoad-Interactive BlackRoad-Archive BlackRoad-Studio BlackRoad-OS-Inc"
export GITHUB_USER GITHUB_ORGS
GITEA_HOST="192.168.4.100"
GITEA_PORT="3100"
GITEA_ORGS="blackroad-os lucidia platform blackroad-ai blackroad-cloud blackroad-infra blackroad-labs"

# Fleet nodes
FLEET_NODES="alice:192.168.4.49 cecilia:192.168.4.96 octavia:192.168.4.100 lucidia:192.168.4.38"
FLEET_SSH_USERS="alice:pi cecilia:blackroad octavia:pi lucidia:octavia"

get_ssh_user() {
  local node="$1"
  echo "$FLEET_SSH_USERS" | tr ' ' '\n' | grep "^${node}:" | cut -d: -f2
}

get_node_ip() {
  local node="$1"
  echo "$FLEET_NODES" | tr ' ' '\n' | grep "^${node}:" | cut -d: -f2
}

# JSON helpers
json_set() {
  local file="$1" key="$2" value="$3"
  if [ -f "$file" ]; then
    local tmp=$(mktemp)
    python3 -c "
import json, sys
with open('$file') as f: d = json.load(f)
d['$key'] = $value
with open('$tmp', 'w') as f: json.dump(d, f, indent=2)
"
    mv "$tmp" "$file"
  fi
}

today_file() {
  echo "$DATA_DIR/daily/${TODAY}.json"
}

snapshot_file() {
  echo "$DATA_DIR/snapshots/${TODAY}-${1}.json"
}
