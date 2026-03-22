#!/bin/bash
# Today I Learned - Broadcast to all agents
TIL_DIR="$HOME/.blackroad/memory/til"
mkdir -p "$TIL_DIR"

broadcast() {
    local category="$1"
    local learning="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hostname=$(hostname)
    local id=$(date +%s)

    cat > "$TIL_DIR/til-$id.json" << EOF
{"id":"$id","timestamp":"$timestamp","agent":"$hostname","category":"$category","learning":"$learning"}
EOF
    echo -e "\033[38;5;214m[TIL]\033[0m Broadcast: $category - $learning"
}

list() {
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    echo -e "\033[1;37m  Recent Learnings\033[0m"
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    for f in $(ls -t "$TIL_DIR"/*.json 2>/dev/null | head -10); do
        cat "$f" | jq -r '"\(.agent) [\(.category)]: \(.learning | .[0:60])"' 2>/dev/null
    done
}

case "$1" in
    broadcast) broadcast "$2" "$3" ;;
    list) list ;;
    *) echo "Usage: memory-til-broadcast.sh broadcast <category> <learning>" ;;
esac
