#!/usr/bin/env bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# ═══════════════════════════════════════════════════════════════════════════════
#  BLACKROAD NETWORK MODULE v1.0
#  DNS, Tailscale, SSH fleet, connectivity, discovery
# ═══════════════════════════════════════════════════════════════════════════════

# ── Brand Colors ──
PINK=$'\033[38;5;205m'
AMBER=$'\033[38;5;214m'
BLUE=$'\033[38;5;69m'
VIOLET=$'\033[38;5;135m'
GREEN=$'\033[38;5;82m'
RED=$'\033[38;5;196m'
PINK=$'\033[38;5;45m'
DIM=$'\033[38;5;245m'
BOLD=$'\033[1m'
RST=$'\033[0m'

# ── Config ──
NETWORK_LOG="$HOME/.blackroad/network-log.jsonl"
NETWORK_CACHE="$HOME/.blackroad/network-cache.json"
mkdir -p "$(dirname "$NETWORK_LOG")"

# ── Device Registry ──
# Format: name|local_ip|tailscale_ip|type|role
DEVICES=(
    "cecilia|192.168.4.89|100.72.180.98|pi5|Primary AI (Hailo-8)"
    "lucidia|192.168.4.81|100.83.149.86|pi5|AI Inference"
    "alice|192.168.4.49|100.77.210.18|pi4|Worker Node"
    "aria|192.168.4.82|100.109.14.17|pi5|Harmony Protocols"
    "octavia|192.168.4.38|100.66.235.47|pi5|Multi-arm Processing"
    "shellfish|174.138.44.45|100.94.33.37|do|Edge Compute"
    "blackroad-infinity|159.65.43.12|100.108.132.8|do|Cloud Oracle"
)

# ── Helper Functions ──

timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S.000Z"
}

log_network() {
    local action="$1"
    local target="$2"
    local result="$3"
    echo "{\"timestamp\":\"$(timestamp)\",\"action\":\"$action\",\"target\":\"$target\",\"result\":\"$result\"}" >> "$NETWORK_LOG"
}

# ── Status Command ──

cmd_status() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════════════╗${RST}"
    echo -e "${PINK}║${RST}  ${AMBER}🌐 NETWORK STATUS${RST}                                                  ${PINK}║${RST}"
    echo -e "${PINK}╠══════════════════════════════════════════════════════════════════════╣${RST}"

    # Local network
    local local_ip=$(ipconfig getifaddr en0 2>/dev/null || ip route get 1 2>/dev/null | awk '{print $7}')
    echo -e "${PINK}║${RST}  Local IP:    ${PINK}$local_ip${RST}                                          ${PINK}║${RST}"

    # Gateway
    local gateway=$(netstat -rn 2>/dev/null | grep default | head -1 | awk '{print $2}')
    echo -e "${PINK}║${RST}  Gateway:     ${DIM}$gateway${RST}                                          ${PINK}║${RST}"

    # Internet connectivity
    echo -ne "${PINK}║${RST}  Internet:    "
    if ping -c 1 -W 2 8.8.8.8 &>/dev/null; then
        echo -e "${GREEN}●${RST} connected                                        ${PINK}║${RST}"
    else
        echo -e "${RED}○${RST} disconnected                                      ${PINK}║${RST}"
    fi

    # Tailscale
    echo -ne "${PINK}║${RST}  Tailscale:   "
    if command -v tailscale &>/dev/null && tailscale status &>/dev/null; then
        local ts_ip=$(tailscale ip -4 2>/dev/null)
        echo -e "${GREEN}●${RST} ${DIM}$ts_ip${RST}                                   ${PINK}║${RST}"
    else
        echo -e "${RED}○${RST} not connected                                     ${PINK}║${RST}"
    fi

    echo -e "${PINK}╠══════════════════════════════════════════════════════════════════════╣${RST}"

    # Device summary
    local online=0
    local offline=0
    for device in "${DEVICES[@]}"; do
        IFS='|' read -r name local_ip ts_ip type role <<< "$device"
        if ping -c 1 -W 1 "$local_ip" &>/dev/null || ping -c 1 -W 1 "$ts_ip" &>/dev/null 2>/dev/null; then
            ((online++))
        else
            ((offline++))
        fi
    done

    echo -e "${PINK}║${RST}  Devices:     ${GREEN}$online online${RST}, ${RED}$offline offline${RST}                              ${PINK}║${RST}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════════════╝${RST}"
}

# ── Fleet Command ──

cmd_fleet() {
    echo -e "${PINK}─── ${AMBER}DEVICE FLEET${RST} ${PINK}───${RST}"
    echo ""

    printf "  ${DIM}%-12s %-15s %-15s %-6s %s${RST}\n" "NAME" "LOCAL IP" "TAILSCALE" "TYPE" "STATUS"
    echo -e "  ${DIM}─────────────────────────────────────────────────────────────────${RST}"

    for device in "${DEVICES[@]}"; do
        IFS='|' read -r name local_ip ts_ip type role <<< "$device"

        # Check connectivity
        local status="${RED}○ offline${RST}"
        local via=""

        if ping -c 1 -W 1 "$local_ip" &>/dev/null; then
            status="${GREEN}● local${RST}"
            via="local"
        elif [[ -n "$ts_ip" ]] && ping -c 1 -W 1 "$ts_ip" &>/dev/null 2>/dev/null; then
            status="${BLUE}● tailscale${RST}"
            via="ts"
        fi

        printf "  %-12s %-15s %-15s %-6s %b\n" "$name" "$local_ip" "${ts_ip:-N/A}" "$type" "$status"
    done

    echo ""
}

# ── Ping Command ──

cmd_ping() {
    local target="${1:-all}"

    if [[ "$target" == "all" ]]; then
        echo -e "${PINK}─── ${AMBER}PING ALL DEVICES${RST} ${PINK}───${RST}"
        echo ""

        for device in "${DEVICES[@]}"; do
            IFS='|' read -r name local_ip ts_ip type role <<< "$device"
            echo -ne "  $name: "

            if ping -c 1 -W 1 "$local_ip" &>/dev/null; then
                local ms=$(ping -c 1 -W 1 "$local_ip" 2>/dev/null | grep time= | sed 's/.*time=\([0-9.]*\).*/\1/')
                echo -e "${GREEN}●${RST} ${ms}ms (local)"
                log_network "ping" "$name" "ok:${ms}ms:local"
            elif [[ -n "$ts_ip" ]] && ping -c 1 -W 2 "$ts_ip" &>/dev/null 2>/dev/null; then
                local ms=$(ping -c 1 -W 2 "$ts_ip" 2>/dev/null | grep time= | sed 's/.*time=\([0-9.]*\).*/\1/')
                echo -e "${BLUE}●${RST} ${ms}ms (tailscale)"
                log_network "ping" "$name" "ok:${ms}ms:ts"
            else
                echo -e "${RED}○${RST} unreachable"
                log_network "ping" "$name" "failed"
            fi
        done
        echo ""
    else
        # Ping specific target
        echo -e "Pinging ${AMBER}$target${RST}..."
        ping -c 5 "$target"
    fi
}

# ── SSH Command ──

cmd_ssh() {
    local subcmd="${1:-list}"
    shift 2>/dev/null || true

    case "$subcmd" in
        list|ls)
            echo -e "${PINK}─── ${AMBER}SSH HOSTS${RST} ${PINK}───${RST}"
            echo ""
            grep -E "^Host " ~/.ssh/config 2>/dev/null | while read -r line; do
                local host=$(echo "$line" | awk '{print $2}')
                echo -ne "  $host: "

                # Try to connect briefly
                if ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" "echo ok" &>/dev/null; then
                    echo -e "${GREEN}●${RST} reachable"
                else
                    echo -e "${RED}○${RST} unreachable"
                fi
            done
            echo ""
            ;;
        test)
            local host="$1"
            if [[ -z "$host" ]]; then
                echo -e "${RED}Usage:${RST} br network ssh test <host>"
                return 1
            fi
            echo -e "Testing SSH to ${AMBER}$host${RST}..."
            ssh -v -o ConnectTimeout=5 "$host" "echo 'SSH connection successful'; uname -a"
            ;;
        exec)
            local host="$1"
            shift
            local cmd="$*"
            if [[ -z "$host" || -z "$cmd" ]]; then
                echo -e "${RED}Usage:${RST} br network ssh exec <host> <command>"
                return 1
            fi
            echo -e "${DIM}Executing on $host:${RST} $cmd"
            ssh "$host" "$cmd"
            ;;
        all)
            local cmd="$*"
            if [[ -z "$cmd" ]]; then
                echo -e "${RED}Usage:${RST} br network ssh all <command>"
                return 1
            fi
            echo -e "${PINK}─── ${AMBER}EXECUTE ON ALL${RST} ${PINK}───${RST}"
            echo -e "${DIM}Command: $cmd${RST}"
            echo ""

            for device in "${DEVICES[@]}"; do
                IFS='|' read -r name local_ip ts_ip type role <<< "$device"
                [[ "$type" == "do" ]] && continue  # Skip cloud servers

                echo -ne "  ${AMBER}$name${RST}: "
                if ssh -o ConnectTimeout=3 -o BatchMode=yes "$name" "$cmd" 2>/dev/null; then
                    echo ""
                else
                    echo -e "${RED}failed${RST}"
                fi
            done
            ;;
        *)
            echo -e "${AMBER}ssh${RST} - SSH fleet commands"
            echo "  list        - List all SSH hosts and status"
            echo "  test <host> - Test SSH connection"
            echo "  exec <h> <c> - Execute command on host"
            echo "  all <cmd>   - Execute on all Pi devices"
            ;;
    esac
}

# ── DNS Command ──

cmd_dns() {
    local subcmd="${1:-lookup}"
    shift 2>/dev/null || true

    case "$subcmd" in
        lookup|l)
            local domain="${1:-blackroad.io}"
            echo -e "${PINK}─── ${AMBER}DNS LOOKUP${RST} ${PINK}───${RST} $domain"
            echo ""
            echo -e "${PINK}A Records:${RST}"
            dig +short A "$domain" 2>/dev/null || nslookup "$domain" | grep Address
            echo ""
            echo -e "${PINK}CNAME:${RST}"
            dig +short CNAME "$domain" 2>/dev/null
            echo ""
            echo -e "${PINK}MX Records:${RST}"
            dig +short MX "$domain" 2>/dev/null
            echo ""
            ;;
        check)
            echo -e "${PINK}─── ${AMBER}DNS CHECK${RST} ${PINK}───${RST}"
            echo ""
            local domains=("blackroad.io" "lucidia.earth" "blackroadai.com" "blackroadquantum.com")

            for domain in "${domains[@]}"; do
                echo -ne "  $domain: "
                local ip=$(dig +short A "$domain" 2>/dev/null | head -1)
                if [[ -n "$ip" ]]; then
                    echo -e "${GREEN}●${RST} $ip"
                else
                    echo -e "${RED}○${RST} no record"
                fi
            done
            echo ""
            ;;
        update)
            echo -e "${PINK}Running DNS update...${RST}"
            ~/blackroad-dns-update-all.sh
            ;;
        cloudflare|cf)
            echo -e "${PINK}─── ${AMBER}CLOUDFLARE DNS${RST} ${PINK}───${RST}"
            if [[ -n "$CF_API_TOKEN" ]]; then
                echo -e "  ${GREEN}●${RST} API token configured"
                # List zones
                curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
                    -H "Authorization: Bearer $CF_API_TOKEN" \
                    -H "Content-Type: application/json" 2>/dev/null | jq -r '.result[] | "  \(.name) (\(.id[0:8])...)"' 2>/dev/null || echo "  Run: export CF_API_TOKEN=<token>"
            else
                echo -e "  ${RED}○${RST} No CF_API_TOKEN set"
            fi
            ;;
        *)
            echo -e "${AMBER}dns${RST} - DNS commands"
            echo "  lookup <domain> - DNS lookup"
            echo "  check           - Check BlackRoad domains"
            echo "  update          - Run DNS update script"
            echo "  cloudflare      - Cloudflare DNS status"
            ;;
    esac
}

# ── Tailscale Command ──

cmd_tailscale() {
    local subcmd="${1:-status}"
    shift 2>/dev/null || true

    case "$subcmd" in
        status|s)
            echo -e "${PINK}─── ${AMBER}TAILSCALE STATUS${RST} ${PINK}───${RST}"
            echo ""
            if command -v tailscale &>/dev/null; then
                tailscale status 2>/dev/null || echo -e "  ${RED}Not connected${RST}"
            else
                echo -e "  ${RED}Tailscale not installed${RST}"
            fi
            echo ""
            ;;
        ip)
            tailscale ip -4 2>/dev/null
            ;;
        peers)
            echo -e "${PINK}─── ${AMBER}TAILSCALE PEERS${RST} ${PINK}───${RST}"
            tailscale status 2>/dev/null | while read -r line; do
                if [[ "$line" == *"online"* || "$line" == *"active"* ]]; then
                    echo -e "  ${GREEN}●${RST} $line"
                elif [[ "$line" == *"offline"* ]]; then
                    echo -e "  ${RED}○${RST} $line"
                else
                    echo "  $line"
                fi
            done
            ;;
        ping)
            local peer="$1"
            if [[ -z "$peer" ]]; then
                echo -e "${RED}Usage:${RST} br network tailscale ping <peer>"
                return 1
            fi
            tailscale ping "$peer"
            ;;
        *)
            echo -e "${AMBER}tailscale${RST} - Tailscale mesh commands"
            echo "  status      - Show Tailscale status"
            echo "  ip          - Show Tailscale IP"
            echo "  peers       - List all peers"
            echo "  ping <peer> - Ping a peer"
            ;;
    esac
}

# ── Scan Command ──

cmd_scan() {
    local subcmd="${1:-quick}"
    shift 2>/dev/null || true

    case "$subcmd" in
        quick|q)
            echo -e "${PINK}─── ${AMBER}QUICK NETWORK SCAN${RST} ${PINK}───${RST}"
            echo ""

            # Get local subnet
            local subnet=$(ipconfig getifaddr en0 2>/dev/null | sed 's/\.[0-9]*$/.0\/24/')
            [[ -z "$subnet" ]] && subnet="192.168.4.0/24"

            echo -e "  Scanning ${PINK}$subnet${RST}..."
            echo ""

            # Quick ping sweep
            local base=$(echo "$subnet" | sed 's/\.0\/24//')
            local found=0

            for i in {1..254}; do
                ip="$base.$i"
                if ping -c 1 -W 1 "$ip" &>/dev/null; then
                    # Try to get hostname
                    local hostname=$(arp -a 2>/dev/null | grep "$ip" | awk -F'[()]' '{print $1}' | xargs)
                    [[ -z "$hostname" ]] && hostname="unknown"
                    echo -e "  ${GREEN}●${RST} $ip ${DIM}($hostname)${RST}"
                    ((found++))
                fi
            done &

            # Show progress
            local pid=$!
            local count=0
            while kill -0 $pid 2>/dev/null; do
                ((count++))
                printf "\r  ${DIM}Scanning... %d/254${RST}" $count
                sleep 0.1
            done
            wait $pid 2>/dev/null

            echo ""
            echo -e "  ${GREEN}$found devices found${RST}"
            ;;
        ports)
            local target="$1"
            if [[ -z "$target" ]]; then
                echo -e "${RED}Usage:${RST} br network scan ports <host>"
                return 1
            fi

            echo -e "${PINK}─── ${AMBER}PORT SCAN${RST} ${PINK}───${RST} $target"
            echo ""

            local ports=(22 80 443 3000 8080 8443 11434 5000 3306 5432 6379 27017)
            for port in "${ports[@]}"; do
                echo -ne "  Port $port: "
                if nc -z -w 2 "$target" "$port" 2>/dev/null; then
                    echo -e "${GREEN}open${RST}"
                else
                    echo -e "${DIM}closed${RST}"
                fi
            done
            echo ""
            ;;
        discover)
            echo -e "${PINK}─── ${AMBER}DEVICE DISCOVERY${RST} ${PINK}───${RST}"
            ~/blackroad-network-discovery.sh 2>/dev/null || {
                echo "Running ARP scan..."
                arp -a 2>/dev/null | head -20
            }
            ;;
        *)
            echo -e "${AMBER}scan${RST} - Network scanning"
            echo "  quick        - Quick ping sweep of local network"
            echo "  ports <host> - Port scan a host"
            echo "  discover     - Full device discovery"
            ;;
    esac
}

# ── Speed Test ──

cmd_speed() {
    echo -e "${PINK}─── ${AMBER}SPEED TEST${RST} ${PINK}───${RST}"
    echo ""

    if command -v speedtest-cli &>/dev/null; then
        speedtest-cli --simple
    elif command -v fast &>/dev/null; then
        fast
    else
        echo -e "  ${DIM}Testing download speed...${RST}"
        local start=$(date +%s%N)
        curl -s -o /dev/null "https://speed.cloudflare.com/__down?bytes=10000000"
        local end=$(date +%s%N)
        local duration=$(( (end - start) / 1000000 ))
        local mbps=$(( 10 * 8 * 1000 / duration ))
        echo -e "  Download: ${GREEN}~${mbps} Mbps${RST} ${DIM}(10MB test)${RST}"
    fi
    echo ""
}

# ── Topology ──

cmd_topology() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════════════╗${RST}"
    echo -e "${PINK}║${RST}  ${AMBER}🗺️  BLACKROAD NETWORK TOPOLOGY${RST}                                     ${PINK}║${RST}"
    echo -e "${PINK}╠══════════════════════════════════════════════════════════════════════╣${RST}"
    echo -e "${PINK}║${RST}                                                                      ${PINK}║${RST}"
    echo -e "${PINK}║${RST}                    ${PINK}☁️  INTERNET${RST}                                      ${PINK}║${RST}"
    echo -e "${PINK}║${RST}                         │                                           ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              ┌──────────┴──────────┐                                ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              │                     │                                ${PINK}║${RST}"
    echo -e "${PINK}║${RST}         ${BLUE}[Cloudflare]${RST}          ${VIOLET}[Tailscale]${RST}                          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              │                     │                                ${PINK}║${RST}"
    echo -e "${PINK}║${RST}    ┌─────────┼─────────┐     ┌─────┴─────┐                          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}    │         │         │     │           │                          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}  ${GREEN}[DO]${RST}      ${GREEN}[DO]${RST}     ${AMBER}[Router]${RST}  │           │                          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}  shellfish  infinity    │     │           │                          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}                         │     │           │                          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              ┌──────────┴─────┴───────────┴──────────┐              ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              │              LOCAL NETWORK             │              ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              │           192.168.4.0/24               │              ${PINK}║${RST}"
    echo -e "${PINK}║${RST}              └─────────────────┬───────────────────────┘              ${PINK}║${RST}"
    echo -e "${PINK}║${RST}        ┌─────────┬─────────┬───┴───┬─────────┬─────────┐            ${PINK}║${RST}"
    echo -e "${PINK}║${RST}        │         │         │       │         │         │            ${PINK}║${RST}"
    echo -e "${PINK}║${RST}     ${GREEN}cecilia${RST}  ${GREEN}lucidia${RST}  ${GREEN}aria${RST}  ${GREEN}octavia${RST}  ${GREEN}alice${RST}   ${PINK}mac${RST}          ${PINK}║${RST}"
    echo -e "${PINK}║${RST}      .89       .81      .82     .38      .49     .28           ${PINK}║${RST}"
    echo -e "${PINK}║${RST}    Hailo-8   Pironman   Pi5     Pi5      Pi4    Host           ${PINK}║${RST}"
    echo -e "${PINK}║${RST}                                                                      ${PINK}║${RST}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════════════╝${RST}"
}

# ── Watch Mode ──

cmd_watch() {
    local interval="${1:-5}"

    echo -e "${PINK}Network Watch Mode${RST} (${interval}s interval)"
    echo -e "${DIM}Press Ctrl+C to stop${RST}"
    echo ""

    while true; do
        clear
        echo -e "${PINK}─── ${AMBER}NETWORK MONITOR${RST} ${PINK}───${RST} $(date '+%H:%M:%S')"
        echo ""

        # Quick status
        local online=0
        local offline=0

        for device in "${DEVICES[@]}"; do
            IFS='|' read -r name local_ip ts_ip type role <<< "$device"

            echo -ne "  "
            if ping -c 1 -W 1 "$local_ip" &>/dev/null; then
                local ms=$(ping -c 1 -W 1 "$local_ip" 2>/dev/null | grep time= | sed 's/.*time=\([0-9.]*\).*/\1/')
                printf "${GREEN}●${RST} %-10s %6sms  ${DIM}%s${RST}\n" "$name" "$ms" "$role"
                ((online++))
            elif [[ -n "$ts_ip" ]] && ping -c 1 -W 1 "$ts_ip" &>/dev/null 2>/dev/null; then
                printf "${BLUE}●${RST} %-10s ${DIM}via ts${RST}   ${DIM}%s${RST}\n" "$name" "$role"
                ((online++))
            else
                printf "${RED}○${RST} %-10s ${DIM}offline${RST}\n" "$name"
                ((offline++))
            fi
        done

        echo ""
        echo -e "  ${GREEN}$online${RST} online │ ${RED}$offline${RST} offline"

        sleep "$interval"
    done
}

# ── Help ──

cmd_help() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════════════╗${RST}"
    echo -e "${PINK}║${RST}  ${AMBER}🌐 BLACKROAD NETWORK${RST}                                                ${PINK}║${RST}"
    echo -e "${PINK}║${RST}  ${DIM}DNS, Tailscale, SSH fleet, connectivity, discovery${RST}                 ${PINK}║${RST}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════════════╝${RST}"
    echo ""
    echo -e "  ${BOLD}${GREEN}STATUS${RST}"
    echo -e "    ${GREEN}status${RST}         Network overview"
    echo -e "    ${GREEN}fleet${RST}          Device fleet status"
    echo -e "    ${GREEN}topology${RST}       Network topology diagram"
    echo -e "    ${GREEN}watch${RST} [sec]    Live monitoring"
    echo ""
    echo -e "  ${BOLD}${BLUE}CONNECTIVITY${RST}"
    echo -e "    ${GREEN}ping${RST} [target]  Ping all devices or specific target"
    echo -e "    ${GREEN}speed${RST}          Speed test"
    echo -e "    ${GREEN}scan${RST} [cmd]     Network scanning (quick/ports/discover)"
    echo ""
    echo -e "  ${BOLD}${VIOLET}SERVICES${RST}"
    echo -e "    ${GREEN}ssh${RST} [cmd]      SSH fleet (list/test/exec/all)"
    echo -e "    ${GREEN}dns${RST} [cmd]      DNS operations (lookup/check/update)"
    echo -e "    ${GREEN}tailscale${RST}      Tailscale mesh (status/peers/ping)"
    echo ""
}

# ── Main ──

case "${1:-help}" in
    # Status
    status|s)        cmd_status ;;
    fleet|f)         cmd_fleet ;;
    topology|topo|t) cmd_topology ;;
    watch|w)         shift; cmd_watch "$@" ;;

    # Connectivity
    ping|p)          shift; cmd_ping "$@" ;;
    speed)           cmd_speed ;;
    scan)            shift; cmd_scan "$@" ;;

    # Services
    ssh)             shift; cmd_ssh "$@" ;;
    dns|d)           shift; cmd_dns "$@" ;;
    tailscale|ts)    shift; cmd_tailscale "$@" ;;

    help|--help|h)   cmd_help ;;

    *)
        # Default: treat as ping target
        cmd_ping "$1"
        ;;
esac
