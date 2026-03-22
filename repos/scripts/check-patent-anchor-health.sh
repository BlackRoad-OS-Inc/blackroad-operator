#!/bin/bash
# Health check script for BlackRoad PatentNet Daily Anchor
# Usage: ./check-patent-anchor-health.sh
# Exit codes: 0 = healthy, 1 = unhealthy, 2 = error

set -e

API_URL="${API_URL:-http://127.0.0.1:4000}"
VERBOSE="${VERBOSE:-0}"

echo "=== BlackRoad PatentNet Anchor Health Check ==="
echo ""

# Check if API is responding
echo "[1/4] Checking API availability..."
if ! curl -fsS -m 10 "${API_URL}/api/patent/status" > /dev/null 2>&1; then
    echo "ERROR: API not responding at ${API_URL}"
    echo "Make sure the BlackRoad API server is running."
    exit 2
fi
echo "✓ API is responding"
echo ""

# Get status
echo "[2/4] Fetching patent anchor status..."
STATUS_JSON=$(curl -fsS -m 10 "${API_URL}/api/patent/status")

if [ "$VERBOSE" = "1" ]; then
    echo "Raw response:"
    echo "$STATUS_JSON" | jq '.' 2>/dev/null || echo "$STATUS_JSON"
    echo ""
fi

# Parse health status
HEALTHY=$(echo "$STATUS_JSON" | jq -r '.data.healthy // false' 2>/dev/null)
LAST_DAY=$(echo "$STATUS_JSON" | jq -r '.data.lastAnchor.day // null' 2>/dev/null)
LAST_STATUS=$(echo "$STATUS_JSON" | jq -r '.data.lastAnchor.status // null' 2>/dev/null)
LAST_COUNT=$(echo "$STATUS_JSON" | jq -r '.data.lastAnchor.count // 0' 2>/dev/null)
LAST_TX=$(echo "$STATUS_JSON" | jq -r '.data.lastAnchor.txHash // null' 2>/dev/null)
SUCCESS_COUNT=$(echo "$STATUS_JSON" | jq -r '.data.recent.successCount // 0' 2>/dev/null)
ERROR_COUNT=$(echo "$STATUS_JSON" | jq -r '.data.recent.errorCount // 0' 2>/dev/null)

echo "Last anchor: Day $LAST_DAY, Status: $LAST_STATUS, Claims: $LAST_COUNT"
if [ "$LAST_TX" != "null" ]; then
    echo "Transaction: $LAST_TX"
fi
echo "Recent performance: ${SUCCESS_COUNT} successes, ${ERROR_COUNT} errors"
echo ""

# Check systemd timer status
echo "[3/4] Checking systemd timer status..."
if systemctl --user is-enabled patent-anchor.timer > /dev/null 2>&1; then
    TIMER_STATUS=$(systemctl --user is-active patent-anchor.timer 2>/dev/null || echo "inactive")
    echo "✓ Timer is enabled (status: $TIMER_STATUS)"

    # Show next scheduled run
    NEXT_RUN=$(systemctl --user list-timers --all | grep patent-anchor || echo "")
    if [ -n "$NEXT_RUN" ]; then
        echo "Next scheduled run:"
        echo "$NEXT_RUN"
    fi
elif systemctl is-enabled patent-anchor.timer > /dev/null 2>&1; then
    TIMER_STATUS=$(systemctl is-active patent-anchor.timer 2>/dev/null || echo "inactive")
    echo "✓ Timer is enabled (system-wide, status: $TIMER_STATUS)"

    # Show next scheduled run
    NEXT_RUN=$(systemctl list-timers --all | grep patent-anchor || echo "")
    if [ -n "$NEXT_RUN" ]; then
        echo "Next scheduled run:"
        echo "$NEXT_RUN"
    fi
else
    echo "⚠ WARNING: Timer is not enabled"
    echo "Run: ./scripts/install-patent-anchor-timer.sh"
fi
echo ""

# Overall health determination
echo "[4/4] Overall health assessment..."
if [ "$HEALTHY" = "true" ]; then
    echo "✓ System is HEALTHY"
    echo "  - Recent anchor successful"
    echo "  - ${SUCCESS_COUNT} successful anchors in recent history"
    exit 0
else
    echo "✗ System is UNHEALTHY"
    if [ "$LAST_DAY" = "null" ]; then
        echo "  - No anchors found in history"
    else
        echo "  - Last anchor was on day $LAST_DAY"
        echo "  - Last status: $LAST_STATUS"
    fi
    echo "  - ${ERROR_COUNT} errors in recent history"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check API logs: journalctl --user -u blackroad-api -n 100"
    echo "  2. Check anchor service logs: journalctl --user -u patent-anchor.service -n 100"
    echo "  3. Manually trigger anchor: curl -X POST ${API_URL}/api/patent/anchor/daily"
    echo "  4. Check blockchain connection and credentials"
    exit 1
fi
