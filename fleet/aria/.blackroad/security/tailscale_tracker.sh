#!/bin/bash
# Tailscale IP Tracker for BlackRoad fleet
# Monitors and logs all Tailscale connections

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
NC='\033[0m'

TS_LOG="$HOME/.blackroad/security/audit/tailscale.jsonl"
TS_CACHE="$HOME/.blackroad/security/tailscale_cache.json"

mkdir -p "$(dirname "$TS_LOG")"

log_ts_event() {
    local event="$1"
    local details="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "{\"timestamp\":\"$timestamp\",\"host\":\"$(hostname)\",\"event\":\"$event\",\"details\":$details}" >> "$TS_LOG"
}

case "$1" in
    status)
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${AMBER}Tailscale Status - $(hostname)${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        if which tailscale &>/dev/null; then
            echo -e "${BLUE}Current IP:${NC}"
            tailscale ip -4 2>/dev/null || echo "  Not connected"
            echo ""
            echo -e "${BLUE}Peers:${NC}"
            tailscale status 2>/dev/null | head -15
        else
            echo "Tailscale not installed"
        fi
        ;;

    monitor)
        echo -e "${AMBER}Starting Tailscale monitor...${NC}"

        while true; do
            current=$(tailscale status --json 2>/dev/null)
            if [[ -n "$current" ]]; then
                # Check for changes
                if [[ -f "$TS_CACHE" ]]; then
                    old=$(cat "$TS_CACHE")
                    if [[ "$current" != "$old" ]]; then
                        log_ts_event "status_change" "$current"
                        echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} Status changed"
                    fi
                fi
                echo "$current" > "$TS_CACHE"
            fi
            sleep 60
        done
        ;;

    peers)
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${AMBER}Tailscale Peer IPs${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        tailscale status --json 2>/dev/null | jq -r '.Peer | to_entries[] | "\(.value.HostName): \(.value.TailscaleIPs[0]) [\(.value.OS)]"' 2>/dev/null || echo "Cannot fetch peers"
        ;;

    verify)
        ip="$2"
        if [[ -z "$ip" ]]; then
            echo "Usage: tailscale_tracker.sh verify <ip>"
            exit 1
        fi

        # Check if IP is in Tailscale network
        if tailscale status --json 2>/dev/null | jq -e ".Peer | to_entries[] | select(.value.TailscaleIPs[] == \"$ip\")" &>/dev/null; then
            hostname=$(tailscale status --json 2>/dev/null | jq -r ".Peer | to_entries[] | select(.value.TailscaleIPs[] == \"$ip\") | .value.HostName")
            echo -e "${GREEN}VERIFIED${NC}: $ip belongs to $hostname"
            log_ts_event "ip_verified" "{\"ip\":\"$ip\",\"host\":\"$hostname\"}"
        else
            echo -e "${AMBER}UNKNOWN${NC}: $ip not in Tailscale network"
            log_ts_event "ip_unknown" "{\"ip\":\"$ip\"}"
        fi
        ;;

    audit)
        n="${2:-20}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${AMBER}Tailscale Audit Log (last $n)${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        if [[ -f "$TS_LOG" ]]; then
            tail -n "$n" "$TS_LOG" | jq -r '"\(.timestamp | split("T")[1] | split(".")[0]) [\(.event)] \(.details | tostring | .[0:50])"' 2>/dev/null
        else
            echo "No audit log yet"
        fi
        ;;

    *)
        echo "tailscale_tracker.sh <command>"
        echo ""
        echo "Commands:"
        echo "  status   - Show Tailscale status"
        echo "  monitor  - Start continuous monitoring"
        echo "  peers    - List all peer IPs"
        echo "  verify   - Verify IP belongs to mesh"
        echo "  audit    - Show audit log"
        ;;
esac
