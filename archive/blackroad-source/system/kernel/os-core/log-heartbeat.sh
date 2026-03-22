#!/bin/bash
logdir="$HOME/blackroad-sandbox/heartbeat/logs"
mkdir -p "$logdir"

timestamp=$(date "+%Y-%m-%d_%H-%M-%S")
outfile="$logdir/heartbeat_$timestamp.txt"

{
  echo "========== Fleet Heartbeat @ $(date) =========="
  for host in blackroad-pi raspberrypi-a1 arkham; do
    echo -e "\n→ $host"
    if ping -c 1 $(grep -A1 "$host" ~/.ssh/config | grep HostName | awk '{print $2}') >/dev/null 2>&1; then
      ssh -o ConnectTimeout=5 $host "node-status" || echo "⚠️ node-status failed on $host"
    else
      echo "❌ Host unreachable"
    fi
  done
} > "$outfile"
