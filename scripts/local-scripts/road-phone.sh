#!/bin/bash
# ☎️  RoadPhone — Pi-side landline to Alexandria
#
# Each Pi runs this as a service. It watches local files for changes,
# then "dials" the Mac via rsync over SSH to drop off its payload.
# Mac's ring daemon picks it up and pushes to git.
#
# Old school landline routing:
#   Pi detects change → picks up phone → dials Mac (rsync)
#   → Mac switchboard receives → routes to git
#
# Usage:
#   road-phone.sh              # Run foreground
#   road-phone.sh --install    # Install as systemd service
#   road-phone.sh --uninstall  # Remove service
#   road-phone.sh --call       # One-shot dial (no watching)

set -euo pipefail

# ── identity ─────────────────────────────────────────────

HOSTNAME=$(hostname)
SWITCHBOARD="alexa@192.168.4.28"  # Alexandria Mac
DROPOFF="~/local/fleet/$HOSTNAME"
LOGFILE="/var/log/road-phone.log"
PIDFILE="/tmp/road-phone.pid"
RING_INTERVAL=60   # check every 60s
CALL_COUNT=0

# Colors
P='\033[38;5;205m'  # pink
G='\033[38;5;82m'   # green
A='\033[38;5;214m'  # amber
V='\033[38;5;135m'  # violet
R='\033[0m'         # reset

log()  { echo -e "${P}[phone:$HOSTNAME]${R} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE" 2>/dev/null || echo "$1"; }
ring() { echo -e "${G}☎️  RING${R} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE" 2>/dev/null || echo "$1"; }
busy() { echo -e "${A}📞 BUSY${R} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE" 2>/dev/null || echo "$1"; }
tone() { echo -e "${V}📱 TONE${R} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE" 2>/dev/null || echo "$1"; }

# ── what to watch (each Pi's "phone book") ───────────────

WATCH_DIRS=(
    /opt/blackroad
    /etc/systemd/system
)

SNAPSHOT_DIR="/tmp/road-phone-snapshot"
mkdir -p "$SNAPSHOT_DIR"

# ── gather payload ───────────────────────────────────────

gather_payload() {
    local payload_dir="/tmp/road-phone-payload"
    rm -rf "$payload_dir"
    mkdir -p "$payload_dir"

    # 1. Crontab for all users
    mkdir -p "$payload_dir/crontabs"
    for user in $(cut -d: -f1 /etc/passwd 2>/dev/null | head -20); do
        crontab -u "$user" -l > "$payload_dir/crontabs/$user.txt" 2>/dev/null || true
    done
    # Remove empty ones
    find "$payload_dir/crontabs" -empty -delete 2>/dev/null || true

    # 2. Running services
    systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null \
        | awk '{print $1}' > "$payload_dir/services-running.txt" || true

    # 3. System info snapshot
    cat > "$payload_dir/system-info.txt" << SYSEOF
hostname: $(hostname)
date: $(date -Iseconds)
uptime: $(uptime)
kernel: $(uname -r)
temp: $(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf "%.1f°C", $1/1000}' || echo "N/A")
memory: $(free -h 2>/dev/null | awk '/Mem:/{print $3"/"$2}' || echo "N/A")
disk: $(df -h / 2>/dev/null | awk 'NR==2{print $3"/"$2" ("$5")"}' || echo "N/A")
load: $(cat /proc/loadavg 2>/dev/null | awk '{print $1, $2, $3}' || echo "N/A")
throttle: $(vcgencmd get_throttled 2>/dev/null || echo "N/A")
voltage: $(vcgencmd measure_volts core 2>/dev/null || echo "N/A")
SYSEOF

    # 4. /opt/blackroad scripts and configs
    if [ -d /opt/blackroad ]; then
        rsync -a --exclude='.git/' --exclude='node_modules/' --exclude='__pycache__/' \
            --exclude='*.db' --exclude='*.log' --exclude='venv/' \
            /opt/blackroad/ "$payload_dir/opt-blackroad/" 2>/dev/null || true
    fi

    # 5. BlackRoad user scripts
    for user_home in /home/blackroad /home/pi /home/octavia; do
        if [ -d "$user_home" ]; then
            local uname=$(basename "$user_home")
            mkdir -p "$payload_dir/home-$uname"

            # Grab shell scripts
            find "$user_home" -maxdepth 2 -name "*.sh" -size -100k 2>/dev/null \
                | while read -r f; do
                    cp "$f" "$payload_dir/home-$uname/" 2>/dev/null || true
                done

            # Grab .bashrc/.profile
            cp "$user_home/.bashrc" "$payload_dir/home-$uname/bashrc" 2>/dev/null || true
            cp "$user_home/.profile" "$payload_dir/home-$uname/profile" 2>/dev/null || true
            cp "$user_home/.bash_aliases" "$payload_dir/home-$uname/bash_aliases" 2>/dev/null || true
        fi
    done

    # 6. Key system configs
    mkdir -p "$payload_dir/etc"
    cp /boot/firmware/config.txt "$payload_dir/etc/config.txt" 2>/dev/null || \
        cp /boot/config.txt "$payload_dir/etc/config.txt" 2>/dev/null || true
    cp /etc/dhcpcd.conf "$payload_dir/etc/dhcpcd.conf" 2>/dev/null || true
    cp /etc/hosts "$payload_dir/etc/hosts" 2>/dev/null || true
    cp /etc/hostname "$payload_dir/etc/hostname" 2>/dev/null || true

    # 7. Docker state
    if command -v docker &>/dev/null; then
        docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}' \
            > "$payload_dir/docker-containers.txt" 2>/dev/null || true
        docker images --format '{{.Repository}}:{{.Tag}}\t{{.Size}}' \
            > "$payload_dir/docker-images.txt" 2>/dev/null || true
    fi

    # 8. Network state
    ip addr show 2>/dev/null | grep -E 'inet |state ' > "$payload_dir/network.txt" || true
    ss -tlnp 2>/dev/null > "$payload_dir/listening-ports.txt" || true

    # 9. Ollama models (if running)
    if command -v ollama &>/dev/null; then
        ollama list > "$payload_dir/ollama-models.txt" 2>/dev/null || true
    fi

    echo "$payload_dir"
}

# ── detect changes ───────────────────────────────────────

has_changes() {
    local new_hash
    # Hash key files to detect changes
    new_hash=$(find /opt/blackroad /etc/systemd/system -name '*.sh' -o -name '*.service' -o -name '*.conf' -o -name '*.py' 2>/dev/null \
        | sort | head -200 | xargs md5sum 2>/dev/null | md5sum | awk '{print $1}')

    local old_hash=""
    [ -f "$SNAPSHOT_DIR/last_hash" ] && old_hash=$(cat "$SNAPSHOT_DIR/last_hash")

    if [ "$new_hash" != "$old_hash" ]; then
        echo "$new_hash" > "$SNAPSHOT_DIR/last_hash"
        return 0  # changed
    fi
    return 1  # no change
}

# ── dial the switchboard ─────────────────────────────────

dial() {
    local payload_dir
    payload_dir=$(gather_payload)

    tone "Dialing switchboard ($SWITCHBOARD)..."

    # Ring ring — rsync payload to Mac
    if rsync -az --timeout=30 --delete \
        "$payload_dir/" \
        "$SWITCHBOARD:$DROPOFF/" 2>/dev/null; then

        CALL_COUNT=$((CALL_COUNT + 1))
        ring "Call #$CALL_COUNT connected — payload delivered to $HOSTNAME line"
        rm -rf "$payload_dir"
        return 0
    else
        busy "Switchboard didn't pick up (Mac offline?)"
        rm -rf "$payload_dir"
        return 1
    fi
}

# ── service install ──────────────────────────────────────

install_service() {
    local script_path
    script_path=$(readlink -f "$0")

    cat > /tmp/road-phone.service << SVCEOF
[Unit]
Description=RoadPhone — BlackRoad landline to Alexandria
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=$script_path
Restart=always
RestartSec=30
Environment=PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

[Install]
WantedBy=multi-user.target
SVCEOF

    sudo mv /tmp/road-phone.service /etc/systemd/system/road-phone.service
    sudo systemctl daemon-reload
    sudo systemctl enable road-phone.service
    sudo systemctl start road-phone.service
    log "Service installed and started"
    sudo systemctl status road-phone.service --no-pager
}

uninstall_service() {
    sudo systemctl stop road-phone.service 2>/dev/null || true
    sudo systemctl disable road-phone.service 2>/dev/null || true
    sudo rm -f /etc/systemd/system/road-phone.service
    sudo systemctl daemon-reload
    log "Service uninstalled"
}

# ── handle args ──────────────────────────────────────────

case "${1:-}" in
    --install)   install_service; exit ;;
    --uninstall) uninstall_service; exit ;;
    --call)      dial; exit ;;
esac

# ── main loop ────────────────────────────────────────────

echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"; log "Phone hanging up"; exit 0' INT TERM

log "☎️  RoadPhone online — $HOSTNAME picking up the landline"
log "Switchboard: $SWITCHBOARD | Ring interval: ${RING_INTERVAL}s"

# Initial call on boot
dial

# Watch loop
SECONDS_SINCE_CALL=0
while true; do
    sleep "$RING_INTERVAL"
    SECONDS_SINCE_CALL=$((SECONDS_SINCE_CALL + RING_INTERVAL))

    if has_changes; then
        tone "Change detected on the line!"
        dial
        SECONDS_SINCE_CALL=0
    elif (( SECONDS_SINCE_CALL >= 900 )); then
        # Heartbeat call every 15 min even if nothing changed
        tone "Heartbeat ring (15m keepalive)"
        dial
        SECONDS_SINCE_CALL=0
    fi
done
