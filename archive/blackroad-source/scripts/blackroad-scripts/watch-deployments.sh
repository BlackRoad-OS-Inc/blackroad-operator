#!/bin/bash

echo "👁️  WATCHING CLOUDFLARE DEPLOYMENTS (Press Ctrl+C to stop)"
echo "══════════════════════════════════════════════════════════"
echo ""

while true; do
    clear
    date
    echo ""
    ~/check-cloudflare-deployments.sh
    echo ""
    echo "Next check in 30 seconds..."
    sleep 30
done

