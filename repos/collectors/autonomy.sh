#!/bin/bash
# Collect autonomy KPIs: self-healing events, cron health, watchdog activity
# Sources: fleet cron logs, systemd journals, autonomy logs

source "$(dirname "$0")/../lib/common.sh"
set +e  # Don't exit on SSH failures

log "Collecting autonomy KPIs..."

OUT=$(snapshot_file autonomy)

autonomy_data='{"nodes": {}}'

for entry in $FLEET_NODES; do
  node=$(echo "$entry" | cut -d: -f1)
  ip=$(echo "$entry" | cut -d: -f2)
  user=$(get_ssh_user "$node")

  log "Checking autonomy on $node..."

  result=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$user@$ip" '
    today=$(date +%Y-%m-%d)

    # Safe grep -c wrapper: grep -c returns exit 1 on zero matches,
    # which breaks || echo 0 (double output). Use subshell + true instead.
    safe_count() { grep -c "$@" 2>/dev/null || true; }

    # Count self-healing events from autonomy logs
    heal_events=0
    if [ -f ~/.blackroad-autonomy/cron.log ]; then
      heal_events=$(safe_count "$today" ~/.blackroad-autonomy/cron.log)
    fi

    # Count service restarts today
    restarts=$(journalctl --since today -u "*.service" --no-pager 2>/dev/null | safe_count "Started\|Restarted\|Reloaded")

    # Count failed systemd units
    failed=$(systemctl --failed --no-legend 2>/dev/null | wc -l | tr -d " ")

    # Cron job count
    cron_jobs=$(crontab -l 2>/dev/null | safe_count -v "^#\|^$")
    user_crons=0
    for u in $(ls /home/ 2>/dev/null); do
      c=$(sudo crontab -u "$u" -l 2>/dev/null | safe_count -v "^#\|^$")
      [ -n "$c" ] && [ "$c" -gt 0 ] 2>/dev/null && user_crons=$((user_crons + c))
    done

    # Watchdog/timer units
    timers=$(systemctl list-timers --no-legend 2>/dev/null | wc -l | tr -d " ")

    # Power monitor entries today
    power_entries=0
    if [ -f /var/log/blackroad-power.log ]; then
      power_entries=$(safe_count "$today" /var/log/blackroad-power.log)
    fi

    # Docker auto-restarts
    docker_restarts=$(docker ps -a --format "{{.Status}}" 2>/dev/null | safe_count "Restarting")

    # Uptime in days
    uptime_days=$(awk "{print int(\$1/86400)}" /proc/uptime)

    echo "{"
    echo "  \"heal_events_today\": $heal_events,"
    echo "  \"service_restarts_today\": $restarts,"
    echo "  \"failed_units\": $failed,"
    echo "  \"cron_jobs\": $cron_jobs,"
    echo "  \"user_cron_jobs\": $user_crons,"
    echo "  \"active_timers\": $timers,"
    echo "  \"power_monitor_entries\": $power_entries,"
    echo "  \"docker_auto_restarts\": $docker_restarts,"
    echo "  \"uptime_days\": $uptime_days"
    echo "}"
  ' 2>/dev/null || echo '{"status": "unreachable"}')

  autonomy_data=$(python3 -c "
import json
d = json.loads('''$autonomy_data''')
d['nodes']['$node'] = json.loads('''$result''')
print(json.dumps(d))
" 2>/dev/null || echo "$autonomy_data")

done

# Compute fleet autonomy score
python3 -c "
import json

data = json.loads('''$autonomy_data''')
nodes = data.get('nodes', {})
online = {k: v for k, v in nodes.items() if 'status' not in v}

total_heals = sum(n.get('heal_events_today', 0) for n in online.values())
total_restarts = sum(n.get('service_restarts_today', 0) for n in online.values())
total_failed = sum(n.get('failed_units', 0) for n in online.values())
total_timers = sum(n.get('active_timers', 0) for n in online.values())
total_crons = sum(n.get('cron_jobs', 0) + n.get('user_cron_jobs', 0) for n in online.values())
max_uptime = max((n.get('uptime_days', 0) for n in online.values()), default=0)

# Autonomy score: higher = more self-sufficient
# +points for timers, crons, heal events; -points for failures
score = min(100, max(0,
    50  # base
    + min(20, total_timers * 2)
    + min(15, total_crons)
    + min(10, total_heals * 5)
    - total_failed * 3
))

output = {
    'source': 'autonomy',
    'collected_at': '$TIMESTAMP',
    'date': '$TODAY',
    'autonomy_score': score,
    'totals': {
        'heal_events_today': total_heals,
        'service_restarts_today': total_restarts,
        'failed_units': total_failed,
        'active_timers': total_timers,
        'total_cron_jobs': total_crons,
        'max_uptime_days': max_uptime
    },
    'nodes': data['nodes']
}

with open('$OUT', 'w') as f:
    json.dump(output, f, indent=2)
" 2>/dev/null

ok "Autonomy data collected"
