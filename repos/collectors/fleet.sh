#!/bin/bash
# Collect fleet health KPIs from all Pi nodes
# Uptime, CPU, memory, disk, temps, services, Docker

source "$(dirname "$0")/../lib/common.sh"
set +e  # Don't exit on SSH failures

log "Collecting fleet KPIs..."

OUT=$(snapshot_file fleet)
PROBE_SCRIPT="$(dirname "$0")/fleet-probe.py"

nodes_json="["
first=true

for entry in $FLEET_NODES; do
  node=$(echo "$entry" | cut -d: -f1)
  ip=$(echo "$entry" | cut -d: -f2)
  user=$(get_ssh_user "$node")

  log "Probing $node ($user@$ip)..."

  # Pipe the probe script via stdin to avoid quoting issues
  result=$(ssh -o ConnectTimeout=3 -o ServerAliveInterval=3 -o ServerAliveCountMax=2 \
    -o StrictHostKeyChecking=no -o BatchMode=yes \
    "$user@$ip" "python3 -" < "$PROBE_SCRIPT" 2>/dev/null || true)

  if [ -n "$result" ]; then
    # Enrich with node info
    result=$(echo "$result" | python3 -c "
import json, sys
d = json.load(sys.stdin)
d['cpu_temp_c'] = round(d.get('cpu_temp', 0) / 1000, 1)
d['mem_pct'] = round(d['mem_used_mb'] / d['mem_total_mb'] * 100, 1) if d['mem_total_mb'] > 0 else 0
d['status'] = 'online'
d['node'] = '$node'
d['ip'] = '$ip'
print(json.dumps(d))
" 2>/dev/null)

    if [ "$first" = true ]; then
      nodes_json="$nodes_json$result"
      first=false
    else
      nodes_json="$nodes_json,$result"
    fi
    ok "$node: online"
  else
    offline="{\"node\": \"$node\", \"ip\": \"$ip\", \"status\": \"offline\"}"
    if [ "$first" = true ]; then
      nodes_json="$nodes_json$offline"
      first=false
    else
      nodes_json="$nodes_json,$offline"
    fi
    err "$node: offline"
  fi
done

nodes_json="$nodes_json]"

# Compute fleet summary
python3 -c "
import json

nodes = json.loads('''$nodes_json''')
online = [n for n in nodes if n.get('status') == 'online']
offline = [n for n in nodes if n.get('status') == 'offline']

summary = {
    'source': 'fleet',
    'collected_at': '$TIMESTAMP',
    'date': '$TODAY',
    'fleet': {
        'total_nodes': len(nodes),
        'online': len(online),
        'offline': len(offline),
        'offline_nodes': [n['node'] for n in offline]
    },
    'totals': {
        'cpu_avg_temp_c': round(sum(n.get('cpu_temp_c', 0) for n in online) / max(len(online), 1), 1),
        'mem_used_mb': sum(n.get('mem_used_mb', 0) for n in online),
        'mem_total_mb': sum(n.get('mem_total_mb', 0) for n in online),
        'disk_used_gb': sum(n.get('disk_used_gb', 0) for n in online),
        'disk_total_gb': sum(n.get('disk_total_gb', 0) for n in online),
        'docker_containers': sum(n.get('docker_containers', 0) for n in online),
        'ollama_models': sum(n.get('ollama_models', 0) for n in online),
        'systemd_failed': sum(n.get('systemd_failed', 0) for n in online),
        'throttled_nodes': [n['node'] for n in online if n.get('throttle_hex', '0x0') not in ('0x0', 'unknown')]
    },
    'nodes': nodes
}

with open('$OUT', 'w') as f:
    json.dump(summary, f, indent=2)
" 2>/dev/null

ok "Fleet: $(echo "$nodes_json" | python3 -c "import json,sys; n=json.load(sys.stdin); print(f\"{sum(1 for x in n if x.get('status')=='online')}/{len(n)} online\")")"
