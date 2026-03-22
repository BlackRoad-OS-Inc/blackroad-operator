#!/bin/bash
# Collect lines of code KPIs
# Sources: local repos, fleet repos, GitHub cloc estimates

source "$(dirname "$0")/../lib/common.sh"

log "Collecting LOC KPIs..."

OUT=$(snapshot_file loc)

# Local stats from blackroad-progress
local_stats='{}'
if [ -f "$HOME/.blackroad-progress/stats.json" ]; then
  local_stats=$(cat "$HOME/.blackroad-progress/stats.json")
fi

# Count LOC in home dir scripts
script_lines=0
script_count=0
for f in "$HOME"/*.sh "$HOME"/bin/*; do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f" 2>/dev/null || echo 0)
    script_lines=$((script_lines + lines))
    script_count=$((script_count + 1))
  fi
done

# Count active project LOC (key repos)
project_loc='{}'
for dir in "$HOME"/blackroad-os-kpis "$HOME"/roadc "$HOME"/images-blackroad "$HOME"/roadnet; do
  if [ -d "$dir" ]; then
    name=$(basename "$dir")
    lines=$(find "$dir" -type f \( -name "*.sh" -o -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.html" -o -name "*.css" -o -name "*.json" -o -name "*.md" -o -name "*.c" -o -name "*.rs" \) ! -path "*/node_modules/*" ! -path "*/.git/*" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo 0)
    project_loc=$(python3 -c "
import json
d = json.loads('$project_loc') if '$project_loc' != '{}' else {}
d['$name'] = int('$lines') if '$lines'.strip() else 0
print(json.dumps(d))
" 2>/dev/null || echo '{}')
  fi
done

# Fleet LOC via SSH (fast: just count key dirs)
fleet_loc='{}'
for entry in $FLEET_NODES; do
  node=$(echo "$entry" | cut -d: -f1)
  ip=$(echo "$entry" | cut -d: -f2)
  user=$(get_ssh_user "$node")

  lines=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$user@$ip" '
    find /opt/blackroad /home/*/bin /home/*/*.sh -type f 2>/dev/null | head -500 | xargs wc -l 2>/dev/null | tail -1 | awk "{print \$1}"
  ' 2>/dev/null || echo 0)

  fleet_loc=$(python3 -c "
import json
d = json.loads('$fleet_loc') if '$fleet_loc' != '{}' else {}
d['$node'] = int('$lines') if '$lines'.strip() and '$lines'.strip().isdigit() else 0
print(json.dumps(d))
" 2>/dev/null || echo "$fleet_loc")
done

# Total estimate
total_local=$(python3 -c "
import json
s = json.loads('''$local_stats''')
print(s.get('total_code_lines', 0))
" 2>/dev/null || echo 0)

python3 -c "
import json

local_stats = json.loads('''$local_stats''')
fleet_loc = json.loads('''$fleet_loc''')
project_loc = json.loads('''$project_loc''')

output = {
    'source': 'loc',
    'collected_at': '$TIMESTAMP',
    'date': '$TODAY',
    'local': {
        'total_code_lines': local_stats.get('total_code_lines', 0),
        'repos': local_stats.get('repos', 0),
        'files': local_stats.get('files', 0),
        'scripts': $script_count,
        'script_lines': $script_lines
    },
    'projects': project_loc,
    'fleet': fleet_loc,
    'total_estimated_loc': local_stats.get('total_code_lines', 0) + sum(fleet_loc.values())
}

with open('$OUT', 'w') as f:
    json.dump(output, f, indent=2)
" 2>/dev/null

ok "LOC data collected"
