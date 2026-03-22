#!/bin/bash
echo "========== Fleet Status: $(date) =========="
for host in blackroad-pi raspberrypi-a1 arkham; do
  echo -e "\n→ $host"
  if ping -c 1 $(grep -A1 "$host" ~/.ssh/config | grep HostName | awk '{print $2}') >/dev/null 2>&1; then
    ssh -o ConnectTimeout=5 $host "node-status" || echo "⚠️ node-status failed on $host"
  else
    echo "❌ Host unreachable"
  fi
done
