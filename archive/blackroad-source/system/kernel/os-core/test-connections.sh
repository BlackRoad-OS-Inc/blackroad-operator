#!/bin/bash
# ============================================================================
# BlackRoad OS - Connection Test Suite
# ============================================================================
#
# Tests all infrastructure connections:
# - Python modules importable
# - TypeScript types exportable
# - Cloudflare API accessible
# - Device network reachable
# - LLM backends available
#
# Usage:
#   ./scripts/test-connections.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# ============================================================================
# Utility Functions
# ============================================================================

print_header() {
  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}  ${BLUE}BlackRoad OS - Connection Test Suite${NC}                      ${CYAN}║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_test() {
  echo -n -e "${BLUE}[TEST]${NC} $1 ... "
}

print_pass() {
  echo -e "${GREEN}✓ PASS${NC}"
}

print_fail() {
  echo -e "${RED}✗ FAIL${NC}"
  if [ -n "$1" ]; then
    echo -e "       ${RED}Error: $1${NC}"
  fi
}

print_skip() {
  echo -e "${YELLOW}⊘ SKIP${NC}"
  if [ -n "$1" ]; then
    echo -e "       ${YELLOW}Reason: $1${NC}"
  fi
}

print_section() {
  echo ""
  echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

# ============================================================================
# Test Results Tracking
# ============================================================================

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

test_pass() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  PASSED_TESTS=$((PASSED_TESTS + 1))
  print_pass
}

test_fail() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  FAILED_TESTS=$((FAILED_TESTS + 1))
  print_fail "$1"
}

test_skip() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
  print_skip "$1"
}

# ============================================================================
# Tests
# ============================================================================

print_header

# --- Python Core Tests ---
print_section "Python Core"

print_test "Python 3.11+ available"
if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" 2>/dev/null; then
  test_pass
else
  test_fail "Python 3.11+ required"
fi

print_test "blackroad_core module importable"
if python3 -c "import sys; sys.path.insert(0, '$PROJECT_ROOT/src'); from blackroad_core import *" 2>/dev/null; then
  test_pass
else
  test_fail "Run: python3 -m pip install -e ."
fi

print_test "Agent spawner available"
if python3 -c "import sys; sys.path.insert(0, '$PROJECT_ROOT/src'); from blackroad_core.spawner import AgentSpawner" 2>/dev/null; then
  test_pass
else
  test_fail "spawner.py not found or has errors"
fi

print_test "Pack system available"
if python3 -c "import sys; sys.path.insert(0, '$PROJECT_ROOT/src'); from blackroad_core.packs import PackRegistry" 2>/dev/null; then
  test_pass
else
  test_fail "packs module not found"
fi

print_test "LLM router available"
if python3 -c "import sys; sys.path.insert(0, '$PROJECT_ROOT/src'); from blackroad_core.llm import LLMRouter" 2>/dev/null; then
  test_pass
else
  test_fail "llm module not found"
fi

print_test "Cloudflare module available"
if python3 -c "import sys; sys.path.insert(0, '$PROJECT_ROOT/src'); from blackroad_core.cloudflare import create_cloudflare_client" 2>/dev/null; then
  test_pass
else
  test_fail "cloudflare.py not found or missing httpx dependency"
fi

# --- TypeScript Core Tests ---
print_section "TypeScript Core"

print_test "Node.js available"
if command -v node &> /dev/null; then
  test_pass
else
  test_fail "Node.js not installed"
fi

print_test "pnpm available"
if command -v pnpm &> /dev/null; then
  test_pass
else
  test_fail "Run: npm install -g pnpm"
fi

print_test "node_modules installed"
if [ -d "$PROJECT_ROOT/node_modules" ]; then
  test_pass
else
  test_fail "Run: pnpm install"
fi

print_test "TypeScript types available"
if [ -f "$PROJECT_ROOT/src/index.ts" ]; then
  test_pass
else
  test_fail "src/index.ts not found"
fi

# --- Service Files Tests ---
print_section "Service Files"

print_test "Orchestrator service exists"
if [ -f "$PROJECT_ROOT/src/orchestrator.py" ]; then
  test_pass
else
  test_fail "src/orchestrator.py not found"
fi

print_test "Bridge service exists"
if [ -f "$PROJECT_ROOT/src/api/bridge.ts" ]; then
  test_pass
else
  test_fail "src/api/bridge.ts not found"
fi

print_test "Startup script exists"
if [ -f "$PROJECT_ROOT/scripts/start-all.sh" ] && [ -x "$PROJECT_ROOT/scripts/start-all.sh" ]; then
  test_pass
else
  test_fail "scripts/start-all.sh not found or not executable"
fi

# --- Environment Configuration ---
print_section "Environment Configuration"

print_test ".env file exists"
if [ -f "$PROJECT_ROOT/.env" ]; then
  test_pass
else
  test_skip "Optional, using defaults"
fi

print_test "Cloudflare account ID configured"
if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
  test_pass
else
  test_skip "Set CLOUDFLARE_ACCOUNT_ID for edge features"
fi

print_test "Cloudflare API token configured"
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
  test_pass
else
  test_skip "Set CLOUDFLARE_API_TOKEN for edge features"
fi

print_test "Anthropic API key configured"
if [ -n "$ANTHROPIC_API_KEY" ]; then
  test_pass
else
  test_skip "Set ANTHROPIC_API_KEY for Claude integration"
fi

# --- External Services ---
print_section "External Services"

print_test "Cloudflare API reachable"
if [ -n "$CLOUDFLARE_ACCOUNT_ID" ] && [ -n "$CLOUDFLARE_API_TOKEN" ]; then
  if curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID" | grep -q "200"; then
    test_pass
  else
    test_fail "Cloudflare API returned non-200 status"
  fi
else
  test_skip "Credentials not configured"
fi

print_test "Ollama available (local LLM)"
if command -v ollama &> /dev/null; then
  if curl -s http://localhost:11434/api/tags &> /dev/null; then
    test_pass
  else
    test_skip "Ollama not running (ollama serve)"
  fi
else
  test_skip "Ollama not installed (optional)"
fi

# --- Device Network ---
print_section "Device Network"

print_test "Device inventory exists"
if [ -f "$PROJECT_ROOT/data/inventory.json" ]; then
  DEVICE_COUNT=$(jq -r '.device_count' "$PROJECT_ROOT/data/inventory.json" 2>/dev/null || echo "0")
  echo -e "${GREEN}✓ PASS${NC} (${DEVICE_COUNT} devices)"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  test_skip "Run: ./scripts/generate_inventory_json.sh --scan"
fi

print_test "Lucidia Pi reachable (192.168.4.38)"
if ping -c 1 -W 2 192.168.4.38 &> /dev/null; then
  test_pass
else
  test_skip "Device not on network"
fi

print_test "iPhone Koder reachable (192.168.4.68)"
if ping -c 1 -W 2 192.168.4.68 &> /dev/null; then
  test_pass
else
  test_skip "Device not on network"
fi

# --- Documentation ---
print_section "Documentation"

print_test "Connection guide exists"
if [ -f "$PROJECT_ROOT/docs/CONNECTION_GUIDE.md" ]; then
  test_pass
else
  test_fail "docs/CONNECTION_GUIDE.md not found"
fi

print_test "Agent infrastructure guide exists"
if [ -f "$PROJECT_ROOT/docs/AGENT_INFRASTRUCTURE.md" ]; then
  test_pass
else
  test_fail "docs/AGENT_INFRASTRUCTURE.md not found"
fi

print_test "CLAUDE.md exists"
if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
  test_pass
else
  test_fail "CLAUDE.md not found"
fi

# ============================================================================
# Results Summary
# ============================================================================

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BLUE}Test Results Summary${NC}                                       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS_PCT=0
if [ $TOTAL_TESTS -gt 0 ]; then
  PASS_PCT=$((PASSED_TESTS * 100 / TOTAL_TESTS))
fi

echo -e "  Total:   ${TOTAL_TESTS} tests"
echo -e "  ${GREEN}Passed:  ${PASSED_TESTS}${NC} (${PASS_PCT}%)"
echo -e "  ${RED}Failed:  ${FAILED_TESTS}${NC}"
echo -e "  ${YELLOW}Skipped: ${SKIPPED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✓ All required tests passed!${NC}"
  echo ""
  echo -e "Ready to start: ${CYAN}./scripts/start-all.sh${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please fix issues before starting.${NC}"
  echo ""
  exit 1
fi
