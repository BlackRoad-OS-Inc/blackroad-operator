#!/bin/bash
# Collect service-level KPIs from fleet: Ollama, Docker, PostgreSQL, Nginx, systemd

source "$(dirname "$0")/../lib/common.sh"
set +e

log "Collecting service KPIs..."

OUT=$(snapshot_file services)
PROBE_SCRIPT="$(dirname "$0")/services-probe.py"

nodes_json='{'
first=true

for entry in $FLEET_NODES; do
  node=$(echo "$entry" | cut -d: -f1)
  ip=$(echo "$entry" | cut -d: -f2)
  user=$(get_ssh_user "$node")

  log "Probing services on $node..."

  result=$(ssh -o ConnectTimeout=3 -o ServerAliveInterval=3 -o ServerAliveCountMax=2 \
    -o StrictHostKeyChecking=no -o BatchMode=yes \
    "$user@$ip" "python3 -" < "$PROBE_SCRIPT" 2>/dev/null || echo '')

  if [ -n "$result" ]; then
    if [ "$first" = true ]; then
      nodes_json="$nodes_json\"$node\": $result"
      first=false
    else
      nodes_json="$nodes_json, \"$node\": $result"
    fi
    ok "$node: services probed"
  else
    if [ "$first" = true ]; then
      nodes_json="$nodes_json\"$node\": {\"status\": \"offline\"}"
      first=false
    else
      nodes_json="$nodes_json, \"$node\": {\"status\": \"offline\"}"
    fi
    err "$node: offline"
  fi
done

nodes_json="$nodes_json}"

# Aggregate
python3 -c "
import json

nodes = json.loads('''$nodes_json''')
online = {k: v for k, v in nodes.items() if v.get('status') != 'offline'}

output = {
    'source': 'services',
    'collected_at': '$TIMESTAMP',
    'date': '$TODAY',
    'totals': {
        'ollama_models': sum(v.get('ollama', {}).get('count', 0) for v in online.values()),
        'ollama_size_gb': round(sum(v.get('ollama', {}).get('size_gb', 0) for v in online.values()), 1),
        'docker_containers': sum(v.get('docker', {}).get('running', 0) for v in online.values()),
        'docker_images': sum(v.get('docker', {}).get('images', 0) for v in online.values()),
        'postgres_dbs': sum(v.get('postgres', {}).get('databases', 0) for v in online.values()),
        'nginx_sites': sum(v.get('nginx', {}).get('sites', 0) for v in online.values()),
        'systemd_services': sum(v.get('systemd', {}).get('services', 0) for v in online.values()),
        'systemd_timers': sum(v.get('systemd', {}).get('timers', 0) for v in online.values()),
        'systemd_failed': sum(v.get('systemd', {}).get('failed', 0) for v in online.values()),
        'processes': sum(v.get('processes', 0) for v in online.values()),
        'network_connections': sum(v.get('connections', 0) for v in online.values()),
        'swap_used_mb': sum(v.get('swap', {}).get('used_mb', 0) for v in online.values()),
        'swap_total_mb': sum(v.get('swap', {}).get('total_mb', 0) for v in online.values()),
        'tailscale_peers': max((v.get('tailscale_peers', 0) for v in online.values()), default=0)
    },
    'nodes': nodes
}

with open('$OUT', 'w') as f:
    json.dump(output, f, indent=2)
" 2>/dev/null

ok "Services collected"
