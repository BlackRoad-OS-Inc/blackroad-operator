#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# tests/test-swarm.sh — End-to-end test for the PR Swarm System
#
# Tests the full lifecycle:
#   1. Launch a swarm with 3 agents
#   2. Verify branches created
#   3. Simulate agent work on each branch
#   4. Verify status/monitor/review output
#   5. Close the swarm and clean up
#
# Usage: bash tests/test-swarm.sh
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

pass() { PASS=$((PASS + 1)); echo -e "  ${GREEN}PASS${NC} $1"; }
fail() { FAIL=$((FAIL + 1)); echo -e "  ${RED}FAIL${NC} $1"; }
section() { echo -e "\n${BOLD}${CYAN}$1${NC}"; }

# Save current branch to restore later
ORIGINAL_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "HEAD")

cleanup() {
  # Restore original branch
  git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true

  # Clean up test swarm branches
  if [ -n "${TEST_SWARM_ID:-}" ]; then
    git branch --list "swarm/${TEST_SWARM_ID}/*" 2>/dev/null | while IFS= read -r b; do
      b=$(echo "$b" | tr -d ' *')
      git branch -D "$b" 2>/dev/null || true
    done
    rm -rf "${ROOT_DIR}/.swarm/${TEST_SWARM_ID}" 2>/dev/null || true
  fi

  # Clean up test mesh queue files
  rm -f "${ROOT_DIR}/shared/mesh/queue/"*swarm* 2>/dev/null || true
  rm -f "${ROOT_DIR}/shared/inbox/lucidia/swarm-"* 2>/dev/null || true
  rm -f "${ROOT_DIR}/shared/inbox/octavia/swarm-"* 2>/dev/null || true
  rm -f "${ROOT_DIR}/shared/inbox/cipher/swarm-"* 2>/dev/null || true
}

trap cleanup EXIT

cd "$ROOT_DIR"

echo -e "${BOLD}PR Swarm System — End-to-End Test${NC}"
echo "=================================="

# ── Test 1: Help command ──
section "1. Help Command"
if bash swarm.sh help 2>&1 | grep -q "SWARM"; then
  pass "swarm.sh help displays correctly"
else
  fail "swarm.sh help output missing expected text"
fi

# ── Test 2: Launch a swarm ──
section "2. Launch Swarm"
LAUNCH_OUTPUT=$(bash swarm.sh launch "Test swarm e2e" lucidia,octavia,cipher parallel 2>&1)

# Extract swarm ID
TEST_SWARM_ID=$(echo "$LAUNCH_OUTPUT" | grep -oP 'swarm-\d+' | head -1)

if [ -n "$TEST_SWARM_ID" ]; then
  pass "Swarm launched: ${TEST_SWARM_ID}"
else
  fail "Could not extract swarm ID from launch output"
  echo "$LAUNCH_OUTPUT"
  exit 1
fi

# ── Test 3: Verify manifest ──
section "3. Verify Manifest"
MANIFEST=".swarm/${TEST_SWARM_ID}/manifest.json"

if [ -f "$MANIFEST" ]; then
  pass "Manifest file exists: ${MANIFEST}"
else
  fail "Manifest file missing"
fi

if jq -e '.swarm_id' "$MANIFEST" >/dev/null 2>&1; then
  pass "Manifest is valid JSON"
else
  fail "Manifest is not valid JSON"
fi

MANIFEST_TASK=$(jq -r '.task' "$MANIFEST" 2>/dev/null)
if [ "$MANIFEST_TASK" = "Test swarm e2e" ]; then
  pass "Manifest task matches"
else
  fail "Manifest task mismatch: got '${MANIFEST_TASK}'"
fi

MANIFEST_AGENTS=$(jq -r '.agents | length' "$MANIFEST" 2>/dev/null)
if [ "$MANIFEST_AGENTS" = "3" ]; then
  pass "Manifest has 3 agents"
else
  fail "Expected 3 agents, got ${MANIFEST_AGENTS}"
fi

# ── Test 4: Verify branches created ──
section "4. Verify Branches"
for agent in lucidia octavia cipher; do
  BRANCH="swarm/${TEST_SWARM_ID}/agent/${agent}"
  if git rev-parse --verify "$BRANCH" &>/dev/null; then
    pass "Branch exists: ${BRANCH}"
  else
    fail "Branch missing: ${BRANCH}"
  fi
done

# ── Test 5: Verify agent workspace files ──
section "5. Agent Workspace Files"
for agent in lucidia octavia cipher; do
  AGENT_FILE=".swarm/${TEST_SWARM_ID}/${agent}.json"
  if [ -f "$AGENT_FILE" ]; then
    pass "Agent file exists: ${agent}.json"
  else
    fail "Agent file missing: ${agent}.json"
  fi
done

# ── Test 6: Verify coordination broadcast ──
section "6. Coordination Broadcast"
if ls shared/mesh/queue/*swarm* &>/dev/null 2>&1; then
  pass "Swarm event queued to mesh"
else
  fail "No swarm event in mesh queue"
fi

if ls shared/inbox/lucidia/swarm-* &>/dev/null 2>&1; then
  pass "LUCIDIA received swarm assignment"
else
  fail "LUCIDIA inbox empty"
fi

# ── Test 7: Simulate agent work ──
section "7. Simulate Agent Work"
for agent in lucidia octavia cipher; do
  BRANCH="swarm/${TEST_SWARM_ID}/agent/${agent}"
  git checkout "$BRANCH" 2>/dev/null

  mkdir -p "src/test-${agent}"
  echo "// Work by ${agent}" > "src/test-${agent}/work.ts"
  git add "src/test-${agent}/"
  git commit -m "test(${agent}): add test work" --no-verify 2>/dev/null

  pass "${agent} committed work to branch"
done

git checkout "$ORIGINAL_BRANCH" 2>/dev/null

# ── Test 8: Status shows work ──
section "8. Status Detection"
STATUS_OUTPUT=$(bash swarm.sh status "$TEST_SWARM_ID" 2>&1)

if echo "$STATUS_OUTPUT" | grep -q "active"; then
  pass "Status shows active swarm"
else
  fail "Status does not show active"
fi

# ── Test 9: Review shows diffs ──
section "9. Review Command"
REVIEW_OUTPUT=$(bash swarm.sh review "$TEST_SWARM_ID" 2>&1)

if echo "$REVIEW_OUTPUT" | grep -q "LUCIDIA"; then
  pass "Review shows LUCIDIA's changes"
else
  fail "Review missing LUCIDIA"
fi

if echo "$REVIEW_OUTPUT" | grep -q "CIPHER"; then
  pass "Review shows CIPHER's changes"
else
  fail "Review missing CIPHER"
fi

# ── Test 10: Monitor JSON output ──
section "10. Monitor JSON"
JSON_OUTPUT=$(bash swarm-monitor.sh --json 2>&1)

if echo "$JSON_OUTPUT" | jq -e '.swarms[0].swarm_id' >/dev/null 2>&1; then
  pass "Monitor JSON is valid"
else
  fail "Monitor JSON invalid"
fi

# ── Test 11: List command ──
section "11. List Command"
LIST_OUTPUT=$(bash swarm.sh list 2>&1)

if echo "$LIST_OUTPUT" | grep -q "$TEST_SWARM_ID"; then
  pass "List shows test swarm"
else
  fail "List missing test swarm"
fi

# ── Test 12: Close swarm ──
section "12. Close Swarm"
CLOSE_OUTPUT=$(bash swarm.sh close "$TEST_SWARM_ID" 2>&1)

if echo "$CLOSE_OUTPUT" | grep -q "closed"; then
  pass "Swarm closed successfully"
else
  fail "Close command did not report success"
fi

# Verify manifest updated
CLOSE_STATUS=$(jq -r '.status' ".swarm/${TEST_SWARM_ID}/manifest.json" 2>/dev/null)
if [ "$CLOSE_STATUS" = "closed" ]; then
  pass "Manifest status updated to closed"
else
  fail "Manifest status not updated: ${CLOSE_STATUS}"
fi

# Verify branches deleted
REMAINING=$(git branch --list "swarm/${TEST_SWARM_ID}/*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$REMAINING" = "0" ]; then
  pass "All swarm branches deleted"
else
  fail "${REMAINING} branches still remain"
fi

# ── Results ──
echo ""
echo "=================================="
echo -e "${BOLD}Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
echo "=================================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
