#!/bin/bash
# fleet-run.sh — run a command on all fleet nodes in parallel
# Usage: fleet-run.sh "command to run"

CMD="$1"
[ -z "$CMD" ] && echo "Usage: fleet-run.sh 'command'" && exit 1

NODES=(
  "pi@192.168.4.49"        # Alice
  "blackroad@192.168.4.98" # Aria
  "pi@192.168.4.101"       # Octavia
  "blackroad@192.168.4.38" # Lucidia
  "blackroad@192.168.4.96" # Cecilia
)

echo "=== Fleet Run: $CMD ==="
for node in "${NODES[@]}"; do
  name=$(echo "$node" | cut -d@ -f2 | sed 's/192.168.4.49/Alice/;s/192.168.4.98/Aria/;s/192.168.4.101/Octavia/;s/192.168.4.38/Lucidia/;s/192.168.4.96/Cecilia/')
  (
    result=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$node" "$CMD" 2>/dev/null)
    echo "[$name] $result"
  ) &
done
wait
echo "=== Done ==="
