#!/bin/bash
# BlackRoad OS - Pi Fleet Health Check

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PI_USER="${PI_USER:-pi}"

declare -A PI_FLEET=(
    ["lucidia"]="192.168.4.38"
    ["blackroad-pi"]="192.168.4.64"
    ["lucidia-alt"]="192.168.4.99"
)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    BlackRoad Pi Fleet Health Check    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

check_pi() {
    local pi_name=$1
    local pi_ip=$2

    echo -e "${BLUE}┌─ ${pi_name} (${pi_ip}) ─────────────${NC}"

    # Network check
    if ping -c 1 -W 2 "${pi_ip}" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Network: Online"
    else
        echo -e "  ${RED}✗${NC} Network: Offline"
        echo -e "${BLUE}└──────────────────────────────────────${NC}"
        return 1
    fi

    # SSH check
    if ! ssh -o ConnectTimeout=5 "${PI_USER}@${pi_ip}" "echo ''" > /dev/null 2>&1; then
        echo -e "  ${RED}✗${NC} SSH: Not accessible"
        echo -e "${BLUE}└──────────────────────────────────────${NC}"
        return 1
    fi
    echo -e "  ${GREEN}✓${NC} SSH: Accessible"

    # Get system info
    RESULT=$(ssh "${PI_USER}@${pi_ip}" "bash -s" << 'REMOTE'
set -e

# System uptime
UPTIME=$(uptime -p)

# Python version
if command -v python3 &> /dev/null; then
    PYTHON_VER=$(python3 --version 2>&1 | awk '{print $2}')
else
    PYTHON_VER="Not installed"
fi

# Check if blackroad installed
if [ -d "/home/pi/blackroad/venv" ]; then
    source /home/pi/blackroad/venv/bin/activate
    if python3 -c "import blackroad_core" 2>/dev/null; then
        BR_VER=$(python3 -c "import blackroad_core; print(blackroad_core.__version__)" 2>/dev/null || echo "unknown")
        BR_STATUS="Installed (v${BR_VER})"
    else
        BR_STATUS="Import failed"
    fi
else
    BR_STATUS="Not installed"
fi

# Memory usage
MEM_TOTAL=$(free -m | awk 'NR==2{print $2}')
MEM_USED=$(free -m | awk 'NR==2{print $3}')
MEM_PERCENT=$(awk "BEGIN {printf \"%.1f\", ($MEM_USED/$MEM_TOTAL)*100}")

# Disk usage
DISK_PERCENT=$(df -h / | awk 'NR==2{print $5}')

# CPU temp (if available)
if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
    TEMP_C=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
    TEMP_INFO="${TEMP_C}°C"
else
    TEMP_INFO="N/A"
fi

# Service status
if systemctl is-active --quiet blackroad-lucidia 2>/dev/null; then
    SVC_LUCIDIA="running"
elif systemctl is-active --quiet blackroad-agent 2>/dev/null; then
    SVC_AGENT="running"
else
    SVC_STATUS="not running"
fi

echo "UPTIME:${UPTIME}"
echo "PYTHON:${PYTHON_VER}"
echo "BLACKROAD:${BR_STATUS}"
echo "MEM:${MEM_USED}MB / ${MEM_TOTAL}MB (${MEM_PERCENT}%)"
echo "DISK:${DISK_PERCENT}"
echo "TEMP:${TEMP_INFO}"
echo "SERVICE:${SVC_LUCIDIA:-${SVC_AGENT:-${SVC_STATUS}}}"
REMOTE
)

    # Parse and display results
    while IFS= read -r line; do
        key=$(echo "$line" | cut -d: -f1)
        value=$(echo "$line" | cut -d: -f2-)

        case "$key" in
            UPTIME)
                echo -e "  ${GREEN}↑${NC} Uptime: ${value}"
                ;;
            PYTHON)
                echo -e "  ${GREEN}⚙${NC} Python: ${value}"
                ;;
            BLACKROAD)
                if [[ "$value" == *"Installed"* ]]; then
                    echo -e "  ${GREEN}✓${NC} BlackRoad: ${value}"
                else
                    echo -e "  ${YELLOW}⚠${NC} BlackRoad: ${value}"
                fi
                ;;
            MEM)
                percent=$(echo "$value" | grep -oP '\(.*%\)' | tr -d '()')
                mem_num=$(echo "$percent" | tr -d '%')
                if (( $(echo "$mem_num > 80" | bc -l) )); then
                    echo -e "  ${RED}⚠${NC} Memory: ${value}"
                else
                    echo -e "  ${GREEN}✓${NC} Memory: ${value}"
                fi
                ;;
            DISK)
                disk_num=$(echo "$value" | tr -d '%')
                if (( disk_num > 80 )); then
                    echo -e "  ${RED}⚠${NC} Disk: ${value} used"
                else
                    echo -e "  ${GREEN}✓${NC} Disk: ${value} used"
                fi
                ;;
            TEMP)
                if [[ "$value" != "N/A" ]]; then
                    temp_num=$(echo "$value" | grep -oP '\d+')
                    if (( temp_num > 70 )); then
                        echo -e "  ${RED}🔥${NC} CPU Temp: ${value}"
                    else
                        echo -e "  ${GREEN}🌡${NC} CPU Temp: ${value}"
                    fi
                fi
                ;;
            SERVICE)
                if [[ "$value" == "running" ]]; then
                    echo -e "  ${GREEN}✓${NC} Service: ${value}"
                else
                    echo -e "  ${YELLOW}○${NC} Service: ${value}"
                fi
                ;;
        esac
    done <<< "$RESULT"

    echo -e "${BLUE}└──────────────────────────────────────${NC}"
    echo ""
}

# Check all Pis
ONLINE=0
OFFLINE=0

for pi_name in "${!PI_FLEET[@]}"; do
    pi_ip="${PI_FLEET[$pi_name]}"
    if check_pi "$pi_name" "$pi_ip"; then
        ((ONLINE++))
    else
        ((OFFLINE++))
    fi
done

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║             Fleet Summary              ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║ ${GREEN}Online: ${ONLINE}${BLUE}                              ║${NC}"
echo -e "${BLUE}║ ${RED}Offline: ${OFFLINE}${BLUE}                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

if [ $OFFLINE -gt 0 ]; then
    exit 1
fi
