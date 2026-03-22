#!/bin/bash
# sync-fleet.sh - Sync Lucidia OS to all fleet devices
# Usage: ./sync-fleet.sh

echo ""
echo "██████████  LUCIDIA SYNC  ██████████"
echo ""

FLEET_HOSTS="cecilia lucidia aria octavia alice gematria anastasia"

# First, commit and push to GitHub
echo "=== Pushing to GitHub ==="
cd ~/lucidia-os
git add -A
git commit -m "sync: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
git push origin main 2>/dev/null || echo "Already up to date"

echo ""
echo "=== Syncing to Fleet ==="
for host in $FLEET_HOSTS; do
    echo -n "  $host: "
    rsync -az --delete ~/lucidia-os/ ${host}:~/.lucidia/ 2>/dev/null && \
    ssh ${host} "chmod +x ~/.lucidia/bin/* ~/.lucidia/agent/* 2>/dev/null" && \
    echo "✓" || echo "✗"
done

echo ""
echo "=== Fleet Synced! ==="
echo ""
