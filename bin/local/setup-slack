#!/bin/bash
# Set up Slack webhooks for BlackRoad OS notifications
# Creates ~/.blackroad/slack-webhook.env with webhook URLs

source "$(dirname "$0")/../lib/common.sh"

ENV_FILE="$HOME/.blackroad/slack-webhook.env"
mkdir -p "$(dirname "$ENV_FILE")"

echo -e "${PINK}BlackRoad OS — Slack Setup${RESET}"
echo
echo "This script configures Slack webhooks for:"
echo "  • #kpis — daily KPI reports + weekly digests"
echo "  • #alerts — fleet alerts + deploy status (optional)"
echo
echo -e "${AMBER}Setup Instructions:${RESET}"
echo "  1. Go to https://api.slack.com/apps → Create New App → From scratch"
echo "     App name: BlackRoad OS, Workspace: BlackRoad OS Inc"
echo
echo "  2. In your app → Incoming Webhooks → Activate"
echo
echo "  3. Add New Webhook to Workspace → select #kpis channel"
echo "     Copy the webhook URL"
echo
echo "  4. (Optional) Add another webhook → select #alerts channel"
echo

# Check existing config
if [ -f "$ENV_FILE" ]; then
  echo -e "${BLUE}Current config:${RESET}"
  grep -v "^#" "$ENV_FILE" | grep -v "^$" | sed 's/=.*/=***/'
  echo
fi

echo -e "${GREEN}Enter your webhook URLs (or press Enter to skip):${RESET}"
echo

read -rp "  #kpis webhook URL: " kpi_url
read -rp "  #alerts webhook URL (optional): " alert_url

if [ -z "$kpi_url" ] && [ -z "$alert_url" ]; then
  echo
  err "No URLs provided. Run this script again when you have them."
  exit 1
fi

# Write env file
cat > "$ENV_FILE" << EOF
# BlackRoad OS Slack Webhooks
# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Daily KPI reports, weekly digests, deploy notifications
SLACK_WEBHOOK_URL=${kpi_url:-https://hooks.slack.com/services/YOUR/WEBHOOK/URL}

# Critical fleet alerts (falls back to SLACK_WEBHOOK_URL if not set)
SLACK_ALERTS_WEBHOOK_URL=${alert_url:-}
EOF

chmod 600 "$ENV_FILE"

echo
ok "Config saved to $ENV_FILE (chmod 600)"

# Test the webhook
if [ -n "$kpi_url" ] && ! echo "$kpi_url" | grep -q "YOUR"; then
  echo
  read -rp "  Send test message? [y/N] " test
  if [[ "$test" =~ ^[yY] ]]; then
    source "$ENV_FILE"
    source "$(dirname "$0")/../lib/slack.sh"
    slack_load

    if slack_notify ":white_check_mark:" "BlackRoad OS Connected" \
        "Slack integration is live. Daily KPIs at 6:05am, alerts every 30min."; then
      ok "Test message sent!"
    else
      err "Test message failed — check your webhook URL"
    fi
  fi
fi

echo
echo -e "${BLUE}Notification schedule:${RESET}"
echo "  • Daily report:  6:05 AM (slack-notify.sh)"
echo "  • Fleet alerts:  every 30 min (slack-alert.sh)"
echo "  • Git patrol:    every 2 hours (git-agent patrol)"
echo "  • Deploy status: after each deploy (git-agent deploy)"
echo "  • Weekly digest: Sunday 8 PM (slack-weekly.sh)"
echo
echo -e "Run ${GREEN}slack-alert.sh \"test message\"${RESET} to send a custom alert"
