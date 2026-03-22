#!/bin/bash
# BlackRoad Adaptive Defense — every attack makes us stronger
# Runs on cron: */5 * * * *
# 1. Collects failed SSH/HTTP attempts from all nodes
# 2. Bans attackers on ALL nodes simultaneously
# 3. Grows a permanent blocklist forever
# 4. Auto-bans entire subnets when patterns emerge
# 5. Logs to memory system
set -e

BLOCKLIST="$HOME/.blackroad/blocklist.txt"
BAN_LOG="$HOME/.blackroad/ban-log.txt"
THRESHOLD=3

mkdir -p "$(dirname "$BLOCKLIST")"
touch "$BLOCKLIST" "$BAN_LOG"

NODES=("root@gematria" "pi@192.168.4.49" "pi@192.168.4.101")

# Collect attackers from all nodes (last 5 min, >= THRESHOLD failures)
attackers=""
for node in "${NODES[@]}"; do
  ips=$(ssh -o ConnectTimeout=3 -o BatchMode=yes "$node" "
    journalctl -u ssh --since '5 min ago' --no-pager 2>/dev/null | \
    grep -oP 'from \K\d+\.\d+\.\d+\.\d+' | \
    sort | uniq -c | sort -rn | \
    awk -v t=$THRESHOLD '\$1 >= t {print \$2}'
  " 2>/dev/null)
  attackers="$attackers $ips"
done

# Deduplicate, skip our IPs
new_ips=$(echo "$attackers" | tr ' ' '\n' | sort -u | grep -v '^$' | grep -vE '^(192\.168\.4\.|10\.8\.0\.|127\.0\.0\.1)')
new_count=$(echo "$new_ips" | grep -c . 2>/dev/null || echo 0)

# Ban new IPs fleet-wide
if [ "$new_count" -gt 0 ]; then
  while IFS= read -r ip; do
    [ -z "$ip" ] && continue
    grep -q "^$ip$" "$BLOCKLIST" 2>/dev/null && continue

    echo "$ip" >> "$BLOCKLIST"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)|$ip|ssh-brute-force" >> "$BAN_LOG"

    for node in "${NODES[@]}"; do
      ssh -o ConnectTimeout=3 -o BatchMode=yes "$node" \
        "sudo ufw deny from $ip comment 'adaptive-defense' 2>/dev/null" &
    done
    wait
  done <<< "$new_ips"
fi

# Detect subnet patterns — 5+ IPs from same /24 = ban entire subnet
cat "$BAN_LOG" | cut -d'|' -f2 | grep -oP '\d+\.\d+\.\d+' | \
  awk '{print $1".0/24"}' | sort | uniq -c | sort -rn | \
  while read count subnet; do
    [ "$count" -lt 5 ] && continue
    grep -q "$subnet" "$BLOCKLIST" 2>/dev/null && continue
    echo "$subnet" >> "$BLOCKLIST"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)|$subnet|subnet-pattern($count)" >> "$BAN_LOG"
    for node in "${NODES[@]}"; do
      ssh -o ConnectTimeout=3 -o BatchMode=yes "$node" \
        "sudo ufw deny from $subnet comment 'adaptive-subnet-ban' 2>/dev/null" &
    done
    wait
  done

total=$(wc -l < "$BLOCKLIST" | tr -d ' ')
today=$(grep "$(date -u +%Y-%m-%d)" "$BAN_LOG" 2>/dev/null | wc -l | tr -d ' ')

# Log if new bans
if [ "$new_count" -gt 0 ]; then
  ~/blackroad-operator/scripts/memory/memory-system.sh log security adaptive-defense \
    "Auto-banned $new_count IPs fleet-wide. Total blocklist: $total. Today: $today bans." 2>/dev/null
fi

# 7. Update RoadCoin value from security proofs
~/blackroad-operator/scripts/security/threat-to-value.sh 2>/dev/null
