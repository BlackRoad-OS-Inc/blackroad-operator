#!/bin/bash

echo "🔍 BlackRoad Security Alert Scanner"
echo "===================================="
echo ""

ORGS=(
    "blackboxprogramming"
    "BlackRoad-OS"
    "BlackRoad-AI"
    "BlackRoad-Security"
)

TOTAL_CRITICAL=0
TOTAL_HIGH=0
TOTAL_MEDIUM=0
TOTAL_LOW=0

for org in "${ORGS[@]}"; do
    echo "Scanning $org..."
    
    # Fetch Dependabot alerts (requires proper permissions)
    alerts=$(gh api "/orgs/$org/dependabot/alerts" 2>/dev/null || echo "[]")
    
    if [ "$alerts" != "[]" ]; then
        critical=$(echo "$alerts" | jq '[.[] | select(.security_advisory.severity == "critical")] | length' 2>/dev/null || echo 0)
        high=$(echo "$alerts" | jq '[.[] | select(.security_advisory.severity == "high")] | length' 2>/dev/null || echo 0)
        medium=$(echo "$alerts" | jq '[.[] | select(.security_advisory.severity == "medium")] | length' 2>/dev/null || echo 0)
        low=$(echo "$alerts" | jq '[.[] | select(.security_advisory.severity == "low")] | length' 2>/dev/null || echo 0)
        
        TOTAL_CRITICAL=$((TOTAL_CRITICAL + critical))
        TOTAL_HIGH=$((TOTAL_HIGH + high))
        TOTAL_MEDIUM=$((TOTAL_MEDIUM + medium))
        TOTAL_LOW=$((TOTAL_LOW + low))
        
        echo "  Critical: $critical | High: $high | Medium: $medium | Low: $low"
    fi
done

echo ""
echo "====================================="
echo "Total Alerts Across Empire:"
echo "  Critical: $TOTAL_CRITICAL"
echo "  High: $TOTAL_HIGH"
echo "  Medium: $TOTAL_MEDIUM"
echo "  Low: $TOTAL_LOW"
echo "====================================="
