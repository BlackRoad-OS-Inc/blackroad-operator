#!/opt/homebrew/bin/bash
# BlackRoad Fleet Pull — Mac-side collector
# Pulls heartbeat/status data FROM each Pi instead of waiting for them to push.
# Runs as a launchd agent on the Mac.
#
# Usage:
#   fleet-pull.sh              # One-shot pull from all nodes
#   fleet-pull.sh --install    # Install as launchd agent (every 5 min)
#   fleet-pull.sh --uninstall  # Remove launchd agent
#   fleet-pull.sh --daemon     # Run continuously (pull every 5 min)

set -euo pipefail

FLEET_DIR="$HOME/local/fleet"
LOG_FILE="$HOME/local/fleet/pull.log"
PLIST="$HOME/Library/LaunchAgents/com.blackroad.fleet-pull.plist"

mkdir -p "$FLEET_DIR"

declare -A FLEET
FLEET[alice]="pi@192.168.4.49"
FLEET[cecilia]="blackroad@192.168.4.96"
FLEET[octavia]="pi@192.168.4.100"
FLEET[aria]="blackroad@192.168.4.98"
FLEET[lucidia]="octavia@192.168.4.38"
FLEET[anastasia]="root@174.138.44.45"
FLEET[gematria]="root@174.138.44.45"  # ProxyJump via anastasia

# SSH target override (for ProxyJump nodes)
declare -A SSH_TARGET
SSH_TARGET[gematria]="-J root@174.138.44.45 root@10.8.0.8"

# Autonomy script location per node
declare -A SCRIPT_PATH
SCRIPT_PATH[alice]="/opt/blackroad/bin/fleet-autonomy.sh"
SCRIPT_PATH[cecilia]="/opt/blackroad/bin/fleet-autonomy.sh"
SCRIPT_PATH[octavia]="/opt/blackroad/bin/fleet-autonomy.sh"
SCRIPT_PATH[aria]="/home/blackroad/.blackroad-autonomy/fleet-autonomy.sh"
SCRIPT_PATH[lucidia]="/opt/blackroad/bin/fleet-autonomy.sh"
SCRIPT_PATH[anastasia]="echo"  # no autonomy script on droplets yet
SCRIPT_PATH[gematria]="echo"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE" 2>/dev/null; }

pull_node() {
    local node="$1"
    local remote="${FLEET[$node]}"
    local script="${SCRIPT_PATH[$node]}"
    local dest="$FLEET_DIR/$node"

    mkdir -p "$dest"

    # Determine SSH command
    local ssh_args="-o ConnectTimeout=5 -o StrictHostKeyChecking=no"
    local ssh_dest="$remote"
    if [[ -n "${SSH_TARGET[$node]:-}" ]]; then
        ssh_args="$ssh_args ${SSH_TARGET[$node]}"
        ssh_dest=""
    fi

    local ping_target="${remote#*@}"
    if ! ping -c 1 -W 3 "$ping_target" > /dev/null 2>&1; then
        echo "{\"node\":\"$node\",\"status\":\"down\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$dest/status.json"
        log "$node: DOWN"
        return
    fi

    # Build SSH command for this node
    local ssh_cmd="ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no"
    local scp_cmd="scp -o ConnectTimeout=10"
    if [[ -n "${SSH_TARGET[$node]:-}" ]]; then
        ssh_cmd="$ssh_cmd ${SSH_TARGET[$node]}"
        scp_cmd="$scp_cmd ${SSH_TARGET[$node]%% *}"  # scp doesn't support ProxyJump easily
    else
        ssh_cmd="$ssh_cmd $remote"
        scp_cmd="$scp_cmd"
    fi

    # Trigger a fresh heartbeat + report on the node
    local report
    report=$($ssh_cmd "
        $script heartbeat 2>/dev/null
        $script report 2>/dev/null
    " 2>/dev/null)

    if [ -n "$report" ]; then
        echo "$report" > "$dest/heartbeat.json"
    fi

    # Push and run node-report.py for system info
    local local_report
    local_report="$(dirname "$(realpath "$0")")/node-report.py"
    if [[ -z "${SSH_TARGET[$node]:-}" ]]; then
        scp -o ConnectTimeout=5 "$local_report" "$remote:/tmp/node-report.py" 2>/dev/null || true
    else
        # For ProxyJump nodes, pipe the file through SSH
        cat "$local_report" | $ssh_cmd "cat > /tmp/node-report.py" 2>/dev/null || true
    fi
    $ssh_cmd "python3 /tmp/node-report.py" 2>/dev/null > "$dest/system-info.json" || true

    # Pull services list
    $ssh_cmd "
        systemctl list-units --type=service --state=running --no-pager --no-legend | awk '{print \$1}'
    " 2>/dev/null > "$dest/services.txt" || true

    # Pull docker state
    $ssh_cmd "
        docker ps --format '{{.Names}}\t{{.Status}}' 2>/dev/null || true
    " 2>/dev/null > "$dest/docker.txt" || true

    # Pull autonomy log
    $ssh_cmd "
        tail -50 ~/.blackroad-autonomy/autonomy.log 2>/dev/null || echo 'no autonomy log'
    " 2>/dev/null > "$dest/autonomy-log.txt" || true

    # Pull listening ports
    $ssh_cmd "
        ss -tlnp 2>/dev/null | grep LISTEN
    " 2>/dev/null > "$dest/ports.txt" || true

    log "$node: pulled OK"
}

cmd_pull() {
    log "Fleet pull starting"
    # Pull from all nodes in parallel
    for node in "${!FLEET[@]}"; do
        pull_node "$node" &
    done
    wait
    log "Fleet pull complete"
}

cmd_install() {
    local script_path
    script_path=$(realpath "$0")

    cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.blackroad.fleet-pull</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/bash</string>
        <string>$script_path</string>
    </array>
    <key>StartInterval</key>
    <integer>300</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$HOME/local/fleet/pull-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$HOME/local/fleet/pull-stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>HOME</key>
        <string>$HOME</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

    launchctl unload "$PLIST" 2>/dev/null || true
    launchctl load "$PLIST"
    echo "Fleet pull installed — runs every 5 minutes"
}

cmd_uninstall() {
    launchctl unload "$PLIST" 2>/dev/null || true
    rm -f "$PLIST"
    echo "Fleet pull uninstalled"
}

cmd_daemon() {
    while true; do
        cmd_pull
        sleep 300
    done
}

case "${1:-}" in
    --install)    cmd_install ;;
    --uninstall)  cmd_uninstall ;;
    --daemon)     cmd_daemon ;;
    *)            cmd_pull ;;
esac
