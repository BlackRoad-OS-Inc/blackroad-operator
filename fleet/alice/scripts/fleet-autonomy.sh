#!/bin/bash
# BlackRoad Fleet Autonomy System v2
# Deployed to every Pi — handles self-healing, cross-node monitoring,
# road-phone sync, and automatic recovery.
#
# Usage:
#   fleet-autonomy.sh heartbeat     # Quick health pulse (every 1m via cron)
#   fleet-autonomy.sh heal          # Self-heal services (every 5m via cron)
#   fleet-autonomy.sh fleet-check   # Check other nodes (every 10m via cron)
#   fleet-autonomy.sh report        # Full status report (JSON to stdout)
#   fleet-autonomy.sh dial          # Road-phone: push state to Mac
#   fleet-autonomy.sh deploy        # Install cron + systemd on this node
#   fleet-autonomy.sh deploy-all    # Push to all reachable nodes and install

set -euo pipefail

# ── identity ─────────────────────────────────────────────
RAW_HOSTNAME=$(hostname)
# Lucidia's hostname is "octavia" (misnamed) — detect by IP to resolve
NODE_NAME="$RAW_HOSTNAME"
MY_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "unknown")
case "$MY_IP" in
    192.168.4.49*)  NODE_NAME="alice" ;;
    192.168.4.96*)  NODE_NAME="cecilia" ;;
    192.168.4.101*) NODE_NAME="octavia" ;;
    192.168.4.98*)  NODE_NAME="aria" ;;
    192.168.4.38*)  NODE_NAME="lucidia" ;;
esac
HOSTNAME="$NODE_NAME"
AUTONOMY_DIR="$HOME/.blackroad-autonomy"
STATE_DIR="$AUTONOMY_DIR/state"
FLEET_DIR="$AUTONOMY_DIR/fleet"
LOG_FILE="$AUTONOMY_DIR/autonomy.log"
HEARTBEAT_FILE="$AUTONOMY_DIR/heartbeat"
SWITCHBOARD="alexa@192.168.4.28"
DROPOFF="~/local/fleet/$HOSTNAME"

mkdir -p "$AUTONOMY_DIR"/{state,fleet,health,tasks/pending,tasks/completed,logs}

# ── fleet map ────────────────────────────────────────────
declare -A FLEET_IPS
FLEET_IPS[alice]="192.168.4.49"
FLEET_IPS[cecilia]="192.168.4.96"
FLEET_IPS[octavia]="192.168.4.101"
FLEET_IPS[aria]="192.168.4.98"
FLEET_IPS[lucidia]="192.168.4.38"
FLEET_IPS[anastasia]="174.138.44.45"
FLEET_IPS[gematria]="143.198.79.78"

declare -A FLEET_USERS
FLEET_USERS[alice]="pi"
FLEET_USERS[cecilia]="blackroad"
FLEET_USERS[octavia]="pi"
FLEET_USERS[aria]="blackroad"
FLEET_USERS[lucidia]="octavia"
FLEET_USERS[anastasia]="root"
FLEET_USERS[gematria]="root"

# For nodes that need ProxyJump (e.g., gematria via anastasia)
declare -A FLEET_SSH_HOST
FLEET_SSH_HOST[anastasia]="anastasia"
FLEET_SSH_HOST[gematria]="gematria"

# Services each node MUST have running
declare -A CRITICAL_SERVICES
CRITICAL_SERVICES[alice]="stats-proxy cloudflared blackroad-agent"
CRITICAL_SERVICES[cecilia]="stats-proxy cloudflared ollama cece-api"
CRITICAL_SERVICES[octavia]="stats-proxy cloudflared ollama docker"
CRITICAL_SERVICES[aria]="stats-proxy cloudflared ollama blackroad-agent headscale"
CRITICAL_SERVICES[lucidia]="cloudflared ollama docker nginx blackroad-agent"
CRITICAL_SERVICES[anastasia]="nginx wg-quick@wg0"
CRITICAL_SERVICES[gematria]="cloudflared nginx ollama wg-quick@wg0"

# ── logging ──────────────────────────────────────────────
log() {
    local level="$1" msg="$2"
    local ts
    ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$ts] [$level] [$HOSTNAME] $msg" >> "$LOG_FILE"
    # Rotate log at 1MB
    if [ -f "$LOG_FILE" ] && [ "$(wc -c < "$LOG_FILE")" -gt 1048576 ]; then
        tail -500 "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
}

# ── heartbeat ────────────────────────────────────────────
cmd_heartbeat() {
    local ts load mem_free mem_total temp disk_pct throttle
    ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    load=$(awk '{print $1}' /proc/loadavg 2>/dev/null || echo "0")
    mem_free=$(free -m 2>/dev/null | awk '/Mem:/ {print $7}' || echo "0")
    mem_total=$(free -m 2>/dev/null | awk '/Mem:/ {print $2}' || echo "0")
    temp=$(awk '{printf "%.1f", $1/1000}' /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "0")
    disk_pct=$(df / 2>/dev/null | awk 'NR==2{gsub(/%/,""); print $5}' || echo "0")
    throttle=$(vcgencmd get_throttled 2>/dev/null | grep -oP '0x[0-9a-fA-F]+' || echo "N/A")

    cat > "$HEARTBEAT_FILE" << EOF
{"node":"$HOSTNAME","ts":"$ts","load":$load,"mem_free_mb":$mem_free,"mem_total_mb":$mem_total,"temp_c":$temp,"disk_pct":$disk_pct,"throttle":"$throttle"}
EOF

    # Alert conditions
    if [ "$disk_pct" -gt 90 ] 2>/dev/null; then
        log "ALERT" "Disk usage critical: ${disk_pct}%"
        auto_disk_cleanup
    fi

    local temp_int=${temp%.*}
    if [ "$temp_int" -gt 75 ] 2>/dev/null; then
        log "ALERT" "Temperature critical: ${temp}C"
        auto_thermal_protect
    fi

    log "BEAT" "load=$load mem=${mem_free}/${mem_total}MB temp=${temp}C disk=${disk_pct}%"
}

# ── slack integration ────────────────────────────────────
slack_say() {
    source ~/.blackroad/slack-webhook.env 2>/dev/null
    [ -z "$SLACK_WEBHOOK_URL" ] && return
    local msg="*${HOSTNAME}:* $1"
    curl -sf -X POST -H "Content-type: application/json" \
        --data "{"text": "$msg"}" \
        "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
}

# ── self-healing ─────────────────────────────────────────
cmd_heal() {
    local services="${CRITICAL_SERVICES[$HOSTNAME]:-}"
    local healed=0

    for svc in $services; do
        if ! systemctl is-active --quiet "$svc" 2>/dev/null; then
            log "HEAL" "Service $svc is DOWN — restarting"
            if sudo systemctl restart "$svc" 2>/dev/null; then
                log "HEAL" "Service $svc restarted successfully"
                slack_say "🔧 just restarted $svc — it was down but I fixed it"
                healed=$((healed + 1))
            else
                log "HEAL" "FAILED to restart $svc"
                slack_say "🚨 $svc is DOWN and I couldn't fix it — need help"
            fi
        fi
    done

    # Check OOM kills since last heal
    local oom_count
    oom_count=$(dmesg 2>/dev/null | grep -c "Out of memory" 2>/dev/null || echo "0")
    oom_count=${oom_count//[^0-9]/}
    oom_count=${oom_count:-0}
    if [ "$oom_count" -gt 0 ] 2>/dev/null; then
        slack_say "🧠 OOM kills detected ($oom_count) — clearing caches"
        log "HEAL" "OOM kills detected ($oom_count) — clearing caches"
        sync
        echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
    fi

    # Check zombie processes
    local zombies
    zombies=$(ps aux 2>/dev/null | awk '$8 ~ /Z/ {print $2}' | wc -l)
    if [ "$zombies" -gt 5 ]; then
        log "HEAL" "Zombie processes: $zombies"
    fi

    # Check swap pressure
    local swap_used
    swap_used=$(free -m 2>/dev/null | awk '/Swap:/ {print $3}' || echo "0")
    if [ "$swap_used" -gt 500 ]; then
        log "HEAL" "High swap: ${swap_used}MB — clearing inactive"
        sync
        echo 1 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
    fi

    [ $healed -gt 0 ] && log "HEAL" "Healed $healed services"
}

# ── fleet check (cross-node monitoring) ──────────────────
cmd_fleet_check() {
    log "FLEET" "Starting cross-node health check"

    for node in "${!FLEET_IPS[@]}"; do
        [ "$node" = "$HOSTNAME" ] && continue
        local ip="${FLEET_IPS[$node]}"
        local user="${FLEET_USERS[$node]}"
        local ssh_target="${FLEET_SSH_HOST[$node]:-$user@$ip}"

        if ping -c 1 -W 2 "$ip" > /dev/null 2>&1; then
            # Node is pingable — try SSH health check
            local remote_status
            remote_status=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$ssh_target" \
                'echo "up"; cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk "{printf \"%.0f\", \$1/1000}"; echo; free -m | awk "/Mem:/{print \$7}"; df / | awk "NR==2{print \$5}"' 2>/dev/null || echo "ssh_fail")

            if echo "$remote_status" | head -1 | grep -q "up"; then
                local r_temp r_mem r_disk
                r_temp=$(echo "$remote_status" | sed -n '2p')
                r_mem=$(echo "$remote_status" | sed -n '3p')
                r_disk=$(echo "$remote_status" | sed -n '4p')
                echo "{\"node\":\"$node\",\"status\":\"up\",\"temp\":$r_temp,\"mem_free_mb\":$r_mem,\"disk\":\"$r_disk\"}" > "$FLEET_DIR/$node.json"
                log "FLEET" "$node: UP temp=${r_temp}C mem=${r_mem}MB disk=$r_disk"
            else
                echo "{\"node\":\"$node\",\"status\":\"ssh_fail\"}" > "$FLEET_DIR/$node.json"
                log "FLEET" "$node: PING OK but SSH failed"
            fi
        else
            echo "{\"node\":\"$node\",\"status\":\"down\"}" > "$FLEET_DIR/$node.json"
            log "FLEET" "$node: DOWN (no ping response)"
        fi
    done
}

# ── auto disk cleanup ────────────────────────────────────
auto_disk_cleanup() {
    log "AUTO" "Running emergency disk cleanup"

    # Clear package cache
    sudo apt-get clean 2>/dev/null || true

    # Clear old journal logs
    sudo journalctl --vacuum-time=3d 2>/dev/null || true

    # Clear tmp files older than 7 days
    find /tmp -type f -mtime +7 -delete 2>/dev/null || true

    # Clear old log files
    find /var/log -name '*.gz' -mtime +7 -delete 2>/dev/null || true
    find /var/log -name '*.1' -mtime +7 -delete 2>/dev/null || true

    local after
    after=$(df / | awk 'NR==2{print $5}')
    log "AUTO" "Disk cleanup complete — now at $after"
}

# ── thermal protection ───────────────────────────────────
auto_thermal_protect() {
    log "AUTO" "Thermal protection triggered"

    # Set CPU to powersave temporarily
    for cpu_dir in /sys/devices/system/cpu/cpu*/cpufreq; do
        echo "powersave" | sudo tee "$cpu_dir/scaling_governor" > /dev/null 2>&1 || true
    done

    # If above 80C, kill non-essential processes
    local temp_raw
    temp_raw=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "0")
    if [ "$temp_raw" -gt 80000 ]; then
        log "AUTO" "CRITICAL HEAT — throttling heavy processes"
        # Kill any rogue ollama generation (not the service itself)
        pkill -f "ollama runner" 2>/dev/null || true
    fi

    # Schedule governor restore in 5 minutes
    (sleep 300 && for cpu_dir in /sys/devices/system/cpu/cpu*/cpufreq; do
        echo "conservative" | sudo tee "$cpu_dir/scaling_governor" > /dev/null 2>&1 || true
    done) &
}

# ── road-phone dial ──────────────────────────────────────
cmd_dial() {
    local payload_dir="/tmp/fleet-autonomy-payload"
    rm -rf "$payload_dir"
    mkdir -p "$payload_dir"

    # Heartbeat
    cp "$HEARTBEAT_FILE" "$payload_dir/heartbeat.json" 2>/dev/null || true

    # Fleet status
    cp "$FLEET_DIR"/*.json "$payload_dir/" 2>/dev/null || true

    # Running services
    systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null \
        | awk '{print $1}' > "$payload_dir/services.txt" || true

    # Crontabs
    mkdir -p "$payload_dir/crontabs"
    for user in $(cut -d: -f1 /etc/passwd 2>/dev/null | head -20); do
        crontab -u "$user" -l > "$payload_dir/crontabs/$user.txt" 2>/dev/null || true
    done
    find "$payload_dir/crontabs" -empty -delete 2>/dev/null || true

    # System info
    cat > "$payload_dir/system-info.json" << SEOF
{
  "hostname": "$HOSTNAME",
  "ts": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "uptime_seconds": $(awk '{print int($1)}' /proc/uptime),
  "kernel": "$(uname -r)",
  "temp_c": $(awk '{printf "%.1f", $1/1000}' /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "0"),
  "memory_mb": {"total": $(free -m | awk '/Mem:/{print $2}'), "used": $(free -m | awk '/Mem:/{print $3}'), "free": $(free -m | awk '/Mem:/{print $7}')},
  "disk": "$(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')",
  "load": [$(awk '{print $1","$2","$3}' /proc/loadavg)],
  "ollama_models": $(curl -s http://localhost:11434/api/tags 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps([m['name'] for m in d.get('models',[])]))" 2>/dev/null || echo '[]')
}
SEOF

    # Docker state
    if command -v docker &>/dev/null; then
        sudo docker ps --format '{{.Names}}\t{{.Status}}' > "$payload_dir/docker.txt" 2>/dev/null || true
    fi

    # Network
    ip addr show 2>/dev/null | grep -E 'inet |state ' > "$payload_dir/network.txt" || true
    ss -tlnp 2>/dev/null | grep LISTEN > "$payload_dir/ports.txt" || true

    # Autonomy log (last 50 lines)
    tail -50 "$LOG_FILE" > "$payload_dir/autonomy-log.txt" 2>/dev/null || true

    # Dial Mac
    if rsync -az --timeout=30 --delete \
        "$payload_dir/" "$SWITCHBOARD:$DROPOFF/" 2>/dev/null; then
        log "DIAL" "Payload delivered to switchboard"
    else
        log "DIAL" "Switchboard unreachable"
    fi

    rm -rf "$payload_dir"
}

# ── full status report ───────────────────────────────────
cmd_report() {
    cmd_heartbeat
    cat "$HEARTBEAT_FILE"
}

# ── deploy to this node ──────────────────────────────────
cmd_deploy() {
    local script_path
    script_path=$(readlink -f "$0")

    # Install cron entries
    local existing_cron
    existing_cron=$(crontab -l 2>/dev/null || true)

    # Remove old autonomy cron entries
    local new_cron
    new_cron=$(echo "$existing_cron" | grep -v "fleet-autonomy" | grep -v "blackroad-pi-autonomy" || true)

    # Add new entries
    new_cron="$new_cron
# BlackRoad Fleet Autonomy v2
* * * * * $script_path heartbeat >> $LOG_FILE 2>&1
*/5 * * * * $script_path heal >> $LOG_FILE 2>&1
*/10 * * * * $script_path fleet-check >> $LOG_FILE 2>&1
*/15 * * * * $script_path dial >> $LOG_FILE 2>&1"

    echo "$new_cron" | crontab -
    log "DEPLOY" "Cron entries installed"

    # Install road-phone service (systemd timer for reliability)
    sudo tee /etc/systemd/system/fleet-autonomy-dial.service > /dev/null << SVCEOF
[Unit]
Description=BlackRoad Fleet Autonomy — Dial Mac
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=$(whoami)
ExecStart=$script_path dial
Environment=PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
Environment=HOME=$HOME
SVCEOF

    sudo tee /etc/systemd/system/fleet-autonomy-dial.timer > /dev/null << TMREOF
[Unit]
Description=BlackRoad Fleet Autonomy — Periodic Dial

[Timer]
OnBootSec=60
OnUnitActiveSec=900
Persistent=true

[Install]
WantedBy=timers.target
TMREOF

    sudo systemctl daemon-reload
    sudo systemctl enable fleet-autonomy-dial.timer
    sudo systemctl start fleet-autonomy-dial.timer

    log "DEPLOY" "Fleet autonomy v2 deployed on $HOSTNAME"
    echo "Fleet autonomy v2 deployed on $HOSTNAME"
}

# ── deploy to all nodes ──────────────────────────────────
cmd_deploy_all() {
    local script_path
    script_path=$(readlink -f "$0")

    for node in "${!FLEET_IPS[@]}"; do
        [ "$node" = "$HOSTNAME" ] && continue
        local ip="${FLEET_IPS[$node]}"
        local user="${FLEET_USERS[$node]}"

        echo "Deploying to $node ($user@$ip)..."

        if ping -c 1 -W 2 "$ip" > /dev/null 2>&1; then
            # Copy script
            if scp -o ConnectTimeout=5 "$script_path" "$user@$ip:/tmp/fleet-autonomy.sh" 2>/dev/null; then
                ssh -o ConnectTimeout=5 "$user@$ip" "
                    sudo mkdir -p /opt/blackroad/bin
                    sudo cp /tmp/fleet-autonomy.sh /opt/blackroad/bin/fleet-autonomy.sh
                    sudo chmod +x /opt/blackroad/bin/fleet-autonomy.sh
                    /opt/blackroad/bin/fleet-autonomy.sh deploy
                " 2>/dev/null && echo "  $node: deployed" || echo "  $node: deploy failed"
            else
                echo "  $node: scp failed"
            fi
        else
            echo "  $node: offline (skipped)"
        fi
    done

    # Deploy locally too
    cmd_deploy
}

# ── main dispatch ────────────────────────────────────────
case "${1:-help}" in
    heartbeat)    cmd_heartbeat ;;
    heal)         cmd_heal ;;
    fleet-check)  cmd_fleet_check ;;
    dial)         cmd_dial ;;
    report)       cmd_report ;;
    deploy)       cmd_deploy ;;
    deploy-all)   cmd_deploy_all ;;
    *)
        echo "BlackRoad Fleet Autonomy v2"
        echo "Usage: $0 {heartbeat|heal|fleet-check|dial|report|deploy|deploy-all}"
        exit 1
        ;;
esac
