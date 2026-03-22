#!/bin/bash
# BlackRoad Fleet Collector — SSHes into nodes, collects real data, pushes to stats API
# Runs from Mac cron every 5 minutes
set -e

STATS_URL="https://stats-blackroad.amundsonalexa.workers.dev"
STATS_KEY="blackroad-stats-push-2026"
SSH_OPTS="-o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes"

# ── Probe a single node via single SSH call ──
probe_node() {
  local name=$1 host=$2 user=$3

  if ! ssh $SSH_OPTS "${user}@${host}" "true" 2>/dev/null; then
    echo "{\"name\":\"${name}\",\"host\":\"${host}\",\"status\":\"offline\",\"cpu_temp\":0,\"cpu_pct\":0,\"mem_total_mb\":0,\"mem_used_mb\":0,\"disk_pct\":0,\"ollama_models\":0,\"docker_containers\":0,\"tcp_ports\":0,\"services\":\"\"}"
    return
  fi

  # Single SSH call — collect everything as pipe-delimited
  local raw
  raw=$(ssh $SSH_OPTS "${user}@${host}" '
    # CPU temp
    t=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0)
    temp=$((t / 1000))
    # CPU usage
    cpu=$(grep "cpu " /proc/stat | awk "{u=\$2+\$4; tot=u+\$5; print int(u*100/tot)}" 2>/dev/null || echo 0)
    # Memory
    mem_t=$(free -m 2>/dev/null | awk "/Mem:/{print \$2}")
    mem_u=$(free -m 2>/dev/null | awk "/Mem:/{print \$3}")
    # Disk
    disk=$(df / 2>/dev/null | awk "NR==2{gsub(/%/,\"\"); print \$5}")
    # Uptime seconds
    up_s=$(awk "{print int(\$1)}" /proc/uptime 2>/dev/null || echo 0)
    # Ollama models
    models=$(curl -s --connect-timeout 2 http://localhost:11434/api/tags 2>/dev/null | python3 -c "import sys,json;print(len(json.load(sys.stdin).get(\"models\",[])))" 2>/dev/null || echo 0)
    # Docker containers
    dock=$(docker ps -q 2>/dev/null | wc -l | tr -d " " || echo 0)
    # TCP listening ports
    ports=$(ss -tlnp 2>/dev/null | tail -n +2 | wc -l | tr -d " " || echo 0)
    # Key services
    svcs=""
    for sp in ssh:22 dns:53 ollama:11434 nginx:80 postgres:5432 minio:9000 gitea:3100 nats:4222 portainer:9443 stats-proxy:7890 cloudflared:20241; do
      n=${sp%%:*}; p=${sp##*:}
      ss -tlnp 2>/dev/null | grep -q ":${p} " && svcs="${svcs}${n},"
    done
    printf "%s|%s|%s|%s|%s|%s|%s|%s|%s|%s" "$temp" "$cpu" "$mem_t" "$mem_u" "$disk" "$up_s" "$models" "$dock" "$ports" "$svcs"
  ' 2>/dev/null) || raw="0|0|0|0|0|0|0|0|0|"

  IFS='|' read -r cpu_temp cpu_pct mem_t mem_u disk up_s models dock ports svcs <<< "$raw"

  # Convert uptime seconds to human readable
  local days=$((up_s / 86400))
  local hours=$(( (up_s % 86400) / 3600 ))
  local uptime_str="${days}d ${hours}h"

  echo "{\"name\":\"${name}\",\"host\":\"${host}\",\"status\":\"online\",\"uptime\":\"${uptime_str}\",\"cpu_temp\":${cpu_temp:-0},\"cpu_pct\":${cpu_pct:-0},\"mem_total_mb\":${mem_t:-0},\"mem_used_mb\":${mem_u:-0},\"disk_pct\":${disk:-0},\"uptime_seconds\":${up_s:-0},\"ollama_models\":${models:-0},\"docker_containers\":${dock:-0},\"tcp_ports\":${ports:-0},\"services\":\"${svcs}\"}"
}

echo "[$(date)] Starting fleet collection..."

# ── Collect sequentially (parallel subshells can't return values easily) ──
alice=$(probe_node "Alice" "192.168.4.49" "pi")
echo "  Alice: $(echo "$alice" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["status"],f"{d.get(\"cpu_temp\",0)}°C" if d["status"]=="online" else "")' 2>/dev/null)"

cecilia=$(probe_node "Cecilia" "192.168.4.96" "blackroad")
echo "  Cecilia: $(echo "$cecilia" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["status"],f"{d.get(\"cpu_temp\",0)}°C" if d["status"]=="online" else "")' 2>/dev/null)"

octavia=$(probe_node "Octavia" "192.168.4.101" "pi")
echo "  Octavia: $(echo "$octavia" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["status"])' 2>/dev/null)"

aria=$(probe_node "Aria" "192.168.4.98" "blackroad")
echo "  Aria: $(echo "$aria" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["status"])' 2>/dev/null)"

lucidia=$(probe_node "Lucidia" "192.168.4.38" "octavia")
echo "  Lucidia: $(echo "$lucidia" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["status"],f"{d.get(\"cpu_temp\",0)}°C" if d["status"]=="online" else "")' 2>/dev/null)"

# Count online + aggregate
online=0; total_models=0; total_ports=0; total_containers=0
for nd in "$alice" "$cecilia" "$octavia" "$aria" "$lucidia"; do
  if echo "$nd" | grep -q '"online"'; then
    online=$((online + 1))
    m=$(echo "$nd" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("ollama_models",0))' 2>/dev/null) || m=0
    p=$(echo "$nd" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("tcp_ports",0))' 2>/dev/null) || p=0
    c=$(echo "$nd" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("docker_containers",0))' 2>/dev/null) || c=0
    total_models=$((total_models + m))
    total_ports=$((total_ports + p))
    total_containers=$((total_containers + c))
  fi
done

# ── Push fleet data ──
fleet_payload="{\"category\":\"fleet\",\"data\":{\"nodes\":[${alice},${cecilia},${octavia},${aria},${lucidia}],\"online\":${online},\"total\":5,\"total_ollama_models\":${total_models},\"total_tcp_ports\":${total_ports},\"total_containers\":${total_containers}}}"

curl -s -X POST "${STATS_URL}/push?key=${STATS_KEY}" \
  -H "Content-Type: application/json" \
  -d "$fleet_payload" > /dev/null

echo "[$(date)] Fleet: ${online}/5 nodes online, ${total_models} Ollama models, ${total_ports} TCP ports"

# ── Push infra counts (aggregate live + known static) ──
infra_payload="{\"category\":\"infra\",\"data\":{
  \"edge_nodes\":5,
  \"online_nodes\":${online},
  \"droplets\":2,
  \"cf_tunnels\":18,
  \"cf_pages\":95,
  \"cf_d1\":8,
  \"cf_kv\":40,
  \"cf_r2\":10,
  \"domains\":48,
  \"tunnel_hostnames\":100,
  \"sqlite_dbs\":228,
  \"tops_compute\":52,
  \"ollama_models\":${total_models},
  \"open_ports\":${total_ports},
  \"docker_containers\":${total_containers},
  \"gitea_repos\":207,
  \"shell_scripts\":92,
  \"cron_jobs\":13,
  \"wireguard_peers\":6
}}"

curl -s -X POST "${STATS_URL}/push?key=${STATS_KEY}" \
  -H "Content-Type: application/json" \
  -d "$infra_payload" > /dev/null

# ── Push analytics data (from analytics worker) ──
ANALYTICS=$(curl -s "https://analytics-blackroad.amundsonalexa.workers.dev/stats?range=24h" 2>/dev/null)
if echo "$ANALYTICS" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
  curl -s -X POST "${STATS_URL}/push?key=${STATS_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"category\":\"analytics\",\"data\":${ANALYTICS}}" > /dev/null
fi

echo "[$(date)] Collection complete."
