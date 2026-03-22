#!/bin/bash

# BlackRoad Security Alert Notifier
# Sends notifications for critical security alerts

WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL="${SECURITY_EMAIL:-security@blackroad.io}"

send_slack_alert() {
    local severity=$1
    local repo=$2
    local alert=$3
    
    if [ -z "$WEBHOOK_URL" ]; then
        echo "No Slack webhook configured. Set SLACK_WEBHOOK_URL environment variable."
        return
    fi
    
    local color="#ff0000"
    case $severity in
        critical) color="#ff0000" ;;
        high) color="#ff9900" ;;
        medium) color="#ffcc00" ;;
        low) color="#00ff00" ;;
    esac
    
    curl -X POST "$WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"🚨 Security Alert: $severity\",
                \"text\": \"Repository: $repo\n$alert\",
                \"footer\": \"BlackRoad Security Operations\",
                \"ts\": $(date +%s)
            }]
        }" 2>/dev/null || echo "Failed to send Slack notification"
}

send_email_alert() {
    local severity=$1
    local repo=$2
    local alert=$3
    
    cat << EMAILBODY | mail -s "🚨 Security Alert [$severity]: $repo" "$EMAIL" 2>/dev/null || echo "Email not configured"
BlackRoad Security Alert

Severity: $severity
Repository: $repo

Details:
$alert

Please review and take action as needed.

---
BlackRoad Security Operations Center
security@blackroad.io
EMAILBODY
}

# Scan for alerts and send notifications
check_and_notify() {
    local org=$1
    
    echo "Checking $org for critical alerts..."
    
    alerts=$(gh api "/orgs/$org/dependabot/alerts?state=open&severity=critical" 2>/dev/null || echo "[]")
    
    if [ "$alerts" != "[]" ]; then
        count=$(echo "$alerts" | jq 'length' 2>/dev/null || echo 0)
        
        if [ "$count" -gt 0 ]; then
            echo "Found $count critical alerts in $org"
            
            # Send notification for each critical alert
            echo "$alerts" | jq -r '.[] | "\(.repository.full_name)|\(.security_advisory.summary)"' | while IFS='|' read -r repo summary; do
                send_slack_alert "critical" "$repo" "$summary"
                send_email_alert "critical" "$repo" "$summary"
            done
        fi
    fi
}

# Main execution
ORGS=(
    "blackboxprogramming"
    "BlackRoad-OS"
    "BlackRoad-AI"
    "BlackRoad-Security"
)

echo "🔔 BlackRoad Security Notification System"
echo "=========================================="
echo ""

for org in "${ORGS[@]}"; do
    check_and_notify "$org"
done

echo ""
echo "Notification scan complete."
