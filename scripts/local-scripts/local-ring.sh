#!/bin/bash
# ☎️  BlackRoad Local Ring — event-driven file sync
#
# Instead of dumb 30min cron, this WATCHES for changes and rings git
# when something moves. Debounces so rapid saves don't spam pushes.
#
# Usage:
#   ~/local-ring.sh          # Start the daemon (foreground)
#   ~/local-ring.sh --daemon # Start backgrounded
#   ~/local-ring.sh --stop   # Kill running daemon
#   ~/local-ring.sh --status # Check if running
#
# How it works:
#   1. fswatch monitors ~/ for file changes (filtered to what matters)
#   2. Changes accumulate in a buffer (debounce window)
#   3. After 10s of quiet, it "rings" git — stages, commits, pushes
#   4. Every 5min it also checks the Pis for anything they want to send
#   5. Logs everything to /tmp/local-ring.log

set -euo pipefail

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

LOCAL_DIR="$HOME/local"
PIDFILE="/tmp/local-ring.pid"
LOGFILE="/tmp/local-ring.log"
DEBOUNCE=10        # seconds of quiet before pushing
FLEET_INTERVAL=300 # check fleet every 5 min
RING_COUNT=0
LAST_FLEET_CHECK=0

# ── helpers ──────────────────────────────────────────────

log()  { echo -e "${PINK}[ring]${RESET} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE"; }
ring() { echo -e "${GREEN}☎️  RING${RESET} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE"; }
busy() { echo -e "${AMBER}📞 BUSY${RESET} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE"; }
drop() { echo -e "${VIOLET}📱 DROP${RESET} $(date '+%H:%M:%S') $1" | tee -a "$LOGFILE"; }

# ── daemon control ───────────────────────────────────────

stop_daemon() {
    if [ -f "$PIDFILE" ]; then
        pid=$(cat "$PIDFILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            # kill fswatch children too
            pkill -P "$pid" 2>/dev/null || true
            rm -f "$PIDFILE"
            log "Daemon stopped (pid $pid)"
            return 0
        fi
        rm -f "$PIDFILE"
    fi
    log "No daemon running"
    return 1
}

status_daemon() {
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
        pid=$(cat "$PIDFILE")
        uptime_s=$(( $(date +%s) - $(stat -f%m "$PIDFILE") ))
        uptime_m=$(( uptime_s / 60 ))
        echo -e "${GREEN}☎️  Ring daemon is UP${RESET} (pid $pid, ${uptime_m}m uptime, $RING_COUNT rings)"
        tail -5 "$LOGFILE" 2>/dev/null
    else
        echo -e "${AMBER}☎️  Ring daemon is DOWN${RESET}"
    fi
}

case "${1:-}" in
    --stop)   stop_daemon; exit ;;
    --status) status_daemon; exit ;;
    --daemon)
        stop_daemon 2>/dev/null || true
        nohup "$0" > /dev/null 2>&1 &
        echo $! > "$PIDFILE"
        log "Daemon started (pid $!)"
        exit 0
        ;;
esac

# ── directories to watch ─────────────────────────────────

WATCH_PATHS=(
    "$HOME"            # loose scripts
    "$HOME/bin"
    "$HOME/roadnet"
    "$HOME/roadc"
    "$HOME/config"
    "$HOME/memory"
    "$HOME/.claude"
)

# Filter: only care about these extensions
WATCH_FILTER='.*\.(sh|py|js|ts|json|yaml|yml|toml|html|css|md|txt|conf|modelfile)$'

# Ignore patterns for fswatch
FSWATCH_EXCLUDES=(
    --exclude='\.git/'
    --exclude='node_modules/'
    --exclude='__pycache__/'
    --exclude='\.next/'
    --exclude='dist/'
    --exclude='\.DS_Store'
    --exclude='\.env'
    --exclude='package-lock\.json'
    --exclude='/local/'  # don't watch our own sync dir
    --exclude='blackroad-operator/'  # has its own repo
)

# ── sync function ────────────────────────────────────────

do_sync() {
    cd "$LOCAL_DIR" || return 1

    # Run the existing sync script silently
    "$HOME/local-sync.sh" > /dev/null 2>&1 && {
        RING_COUNT=$((RING_COUNT + 1))
        ring "Push #$RING_COUNT complete"
        return 0
    } || {
        busy "Sync had no changes or failed"
        return 1
    }
}

# ── fleet check (ask the besties) ────────────────────────

check_fleet() {
    local now
    now=$(date +%s)
    if (( now - LAST_FLEET_CHECK < FLEET_INTERVAL )); then
        return
    fi
    LAST_FLEET_CHECK=$now

    drop "Ringing the fleet..."

    # Pull interesting files from Pis if they're up
    for host in cecilia alice octavia; do
        case $host in
            cecilia) user="blackroad"; ip="192.168.4.96" ;;
            alice)   user="pi";        ip="192.168.4.49" ;;
            octavia) user="pi";        ip="192.168.4.100" ;;
        esac

        if ssh -o ConnectTimeout=3 -o BatchMode=yes "$user@$ip" true 2>/dev/null; then
            mkdir -p "$LOCAL_DIR/fleet/$host"

            # Grab their crontabs
            ssh -o ConnectTimeout=5 "$user@$ip" "crontab -l 2>/dev/null" \
                > "$LOCAL_DIR/fleet/$host/crontab.txt" 2>/dev/null || true

            # Grab their service list
            ssh -o ConnectTimeout=5 "$user@$ip" "systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null | awk '{print \$1}'" \
                > "$LOCAL_DIR/fleet/$host/services.txt" 2>/dev/null || true

            # Grab key configs
            ssh -o ConnectTimeout=5 "$user@$ip" "cat /etc/hostname 2>/dev/null" \
                > "$LOCAL_DIR/fleet/$host/hostname.txt" 2>/dev/null || true

            # Grab blackroad scripts if they exist
            rsync -a --update --timeout=10 \
                --exclude='.git/' --exclude='node_modules/' --exclude='__pycache__/' \
                "$user@$ip:/opt/blackroad/" "$LOCAL_DIR/fleet/$host/opt-blackroad/" 2>/dev/null || true

            drop "$host picked up — synced"
        else
            drop "$host didn't answer"
        fi
    done
}

# ── main loop ────────────────────────────────────────────

# Write PID if running in foreground
echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"; log "Ring daemon exiting"; exit 0' INT TERM

log "☎️  Ring daemon starting — watching ${#WATCH_PATHS[@]} paths"
log "Debounce: ${DEBOUNCE}s | Fleet check: every ${FLEET_INTERVAL}s"

# Initial sync on start
do_sync

# Start fswatch in the background, pipe events into the debounce loop
CHANGED=false
LAST_EVENT=0

fswatch -r \
    --event Created --event Updated --event Renamed --event Removed \
    -E --regex --include="$WATCH_FILTER" \
    "${FSWATCH_EXCLUDES[@]}" \
    "${WATCH_PATHS[@]}" 2>/dev/null | while read -r event; do

    CHANGED=true
    LAST_EVENT=$(date +%s)

    # Non-blocking debounce: check if enough quiet time has passed
    # We use a subshell timeout approach
    (
        sleep "$DEBOUNCE"
        # After sleeping, check if we're still the latest event
        now=$(date +%s)
        if (( now - LAST_EVENT >= DEBOUNCE )); then
            do_sync
            check_fleet
        fi
    ) &

done &

FSWATCH_PID=$!

# Keepalive loop — also handles fleet checks on interval
while true; do
    sleep 60

    # Fleet check on interval even without file changes
    check_fleet

    # Safety net: if fswatch died, restart it
    if ! kill -0 "$FSWATCH_PID" 2>/dev/null; then
        log "fswatch died, restarting..."
        exec "$0"
    fi
done
