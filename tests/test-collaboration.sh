#!/bin/bash
# Integration test for BlackRoad Collaboration System
# Tests: init, register, announce, handoff, inbox, status, Slack endpoint
set +e  # Don't exit on error — we're testing

COLLAB="/Users/alexa/blackroad-operator/scripts/memory/memory-collaboration.sh"
SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

pass=0
fail=0

test_it() {
    local name="$1"
    local cmd="$2"
    local expected="$3"

    local output
    output=$(eval "$cmd" 2>&1) || true

    if echo "$output" | grep -qi "$expected"; then
        echo -e "  ${GREEN}PASS${NC} $name"
        ((pass++))
    else
        echo -e "  ${RED}FAIL${NC} $name"
        echo -e "    Expected: $expected"
        echo -e "    Got: ${output:0:200}"
        ((fail++))
    fi
}

echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PINK}║${NC}  ${BOLD}Collaboration System Integration Tests${NC}                 ${PINK}║${NC}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: DB init
test_it "DB init" "$COLLAB init" "initialized\|already"

# Test 2: Register
test_it "Register session" "$COLLAB register test-run" "registered"

# Test 3: Announce
test_it "Announce message" "$COLLAB announce 'test announcement from integration test'" "Announced"

# Test 4: Handoff
test_it "Create handoff" "$COLLAB handoff 'test handoff for next session'" "Handoff saved"

# Test 5: Inbox
test_it "Read inbox" "$COLLAB inbox" "Pending Handoffs\|Recent Messages\|Inbox empty"

# Test 6: Status
test_it "Check status" "$COLLAB status" "Collaboration Status"

# Test 7: Slack /health
test_it "Slack Worker health" "curl -s --max-time 5 $SLACK_API/health" "alive"

# Test 8: Slack /collab endpoint
test_it "Slack /collab endpoint" "curl -s --max-time 5 -X POST $SLACK_API/collab -H 'Content-Type: application/json' -d '{\"type\":\"announce\",\"session_id\":\"test\",\"message\":\"integration test\"}'" "ok"

# Test 9: Session file exists
test_it "Session file created" "cat ~/.blackroad/memory/current-collab-session" "collab-"

# Test 10: SQLite DB has data
test_it "DB has sessions" "sqlite3 ~/.blackroad/collaboration.db 'SELECT count(*) FROM sessions;'" "[0-9]"

# Test 11: Complete
test_it "Complete session" "$COLLAB complete" "complete"

# Test 12: Help
test_it "Help output" "$COLLAB help" "Collaboration System"

echo ""
echo -e "${BOLD}Results:${NC} ${GREEN}${pass} passed${NC}, ${RED}${fail} failed${NC}"
echo ""

if [[ "$fail" -gt 0 ]]; then
    exit 1
fi
