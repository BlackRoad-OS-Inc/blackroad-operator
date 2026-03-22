#!/bin/bash
# BlackRoad Quick Port Scanner
# Usage: ./port_scan.sh <target> [port-range]
# Example: ./port_scan.sh 192.168.4.38 1-1000
# AUTHORIZED USE ONLY

TARGET=${1:?Usage: $0 <target> [port-range]}
PORT_RANGE=${2:-1-1024}
START_PORT=$(echo $PORT_RANGE | cut -d- -f1)
END_PORT=$(echo $PORT_RANGE | cut -d- -f2)

echo "╔══════════════════════════════════════════╗"
echo "║  BlackRoad Port Scanner (AUTHORIZED ONLY) ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Target: $TARGET"
echo "Range:  $PORT_RANGE"
echo "Time:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

OPEN_PORTS=()
for port in $(seq $START_PORT $END_PORT); do
    timeout 0.5 bash -c "echo >/dev/tcp/$TARGET/$port" 2>/dev/null && {
        SERVICE=$(grep -w "$port/tcp" /etc/services 2>/dev/null | awk '{print $1}' | head -1)
        echo "  OPEN  $port/tcp${SERVICE:+  ($SERVICE)}"
        OPEN_PORTS+=($port)
    }
done

echo ""
echo "Found ${#OPEN_PORTS[@]} open ports: ${OPEN_PORTS[*]}"

