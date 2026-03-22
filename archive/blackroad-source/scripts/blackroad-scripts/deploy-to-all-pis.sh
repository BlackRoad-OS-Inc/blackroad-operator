#!/bin/bash
echo "🚀 Deploying BlackRoad enhancements to all Pis..."

# Create monitoring cron job
for pi in alice lucidia shellfish aria; do
    echo "Setting up auto-monitoring on $pi..."
    ssh $pi "crontab -l 2>/dev/null | grep -v blackroad-health || true; (crontab -l 2>/dev/null; echo '*/5 * * * * ~/blackroad/scripts/agent-health.sh >> ~/blackroad/logs/health.log 2>&1') | crontab -" &
done
wait

echo "✅ All Pis enhanced with monitoring"
