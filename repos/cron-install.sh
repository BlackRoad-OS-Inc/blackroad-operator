#!/bin/bash
# Install local cron for full KPI collection (fleet + GitHub + Gitea)
# This runs on the Mac which has SSH access to all nodes

set -e

KPI_ROOT="$(cd "$(dirname "$0")" && pwd)"
CRON_CMD="cd $KPI_ROOT && bash collectors/collect-all.sh >> $KPI_ROOT/data/cron.log 2>&1"
SLACK_CMD="cd $KPI_ROOT && bash reports/slack-notify.sh >> $KPI_ROOT/data/cron.log 2>&1"

# Check if already installed
if crontab -l 2>/dev/null | grep -q "blackroad-os-kpis"; then
  echo "KPI cron already installed. Updating..."
  crontab -l 2>/dev/null | grep -v "blackroad-os-kpis" | crontab -
fi

# Add cron entries
(crontab -l 2>/dev/null || true; cat << EOF
# blackroad-os-kpis: daily collection at 6 AM CST (midnight UTC)
0 6 * * * $CRON_CMD
# blackroad-os-kpis: slack notification after collection
5 6 * * * $SLACK_CMD
EOF
) | crontab -

echo "KPI cron installed:"
crontab -l | grep "blackroad-os-kpis"
echo
echo "Next steps:"
echo "  1. Set up Slack webhook: ~/.blackroad/slack-webhook.env"
echo "  2. Test: cd $KPI_ROOT && npm run collect"
echo "  3. Push to GitHub: cd $KPI_ROOT && git push"
