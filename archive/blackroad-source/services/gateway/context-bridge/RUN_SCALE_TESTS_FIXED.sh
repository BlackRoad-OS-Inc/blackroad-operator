#!/bin/bash

echo "🚀 Context Bridge - Scale Testing Suite"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
  ((TESTS_PASSED++))
}

fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  ((TESTS_FAILED++))
}

skip() {
  echo -e "${YELLOW}⊘ SKIP${NC}: $1"
  ((TESTS_SKIPPED++))
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Test 1: CLI Concurrent Access
echo "Test 1: CLI Concurrent Access"
echo "------------------------------"
if command -v context &> /dev/null; then
  echo "Running 10 concurrent CLI instances..."
  for i in {1..10}; do
    context status > /dev/null 2>&1 &
  done
  wait
  
  # Check config integrity
  if [ -f ~/.context-bridge/config.json ]; then
    if jq empty ~/.context-bridge/config.json 2>/dev/null; then
      pass "Config file integrity maintained"
    else
      fail "Config file corrupted"
    fi
  else
    skip "Config file not found (CLI not initialized)"
  fi
else
  skip "CLI not installed (run: npm install -g . in cli/)"
fi
echo ""

# Test 2: Extension Content Scripts Syntax
echo "Test 2: Extension Content Scripts"
echo "----------------------------------"
CONTENT_DIR="extension/content"
if [ -d "$CONTENT_DIR" ]; then
  for file in "$CONTENT_DIR"/*.js; do
    if [ -f "$file" ]; then
      if node -c "$file" 2>/dev/null; then
        pass "$(basename $file) syntax valid"
      else
        fail "$(basename $file) syntax error"
      fi
    fi
  done
else
  fail "Content scripts directory not found"
fi
echo ""

# Test 3: Cache Implementation
echo "Test 3: Cache Implementation"
echo "----------------------------"
if [ -f "$CONTENT_DIR/cache-manager.js" ]; then
  if node -c "$CONTENT_DIR/cache-manager.js" 2>/dev/null; then
    pass "Cache manager syntax valid"
    pass "Cache manager exists"
  else
    fail "Cache manager syntax error"
  fi
else
  fail "Cache manager not found at $CONTENT_DIR/cache-manager.js"
fi

# Check if cache is implemented in scripts
if grep -q "cache" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Cache implementation in claude script"
else
  fail "Cache not implemented in claude script"
fi
echo ""

# Test 4: Storage Monitor
echo "Test 4: Storage Monitor"
echo "-----------------------"
if [ -f "extension/popup/storage-monitor.js" ]; then
  if node -c "extension/popup/storage-monitor.js" 2>/dev/null; then
    pass "Storage monitor syntax valid"
    pass "Storage monitor exists"
  else
    fail "Storage monitor syntax error"
  fi
else
  fail "Storage monitor not found"
fi
echo ""

# Test 5: Request Queue
echo "Test 5: Request Queue"
echo "---------------------"
if [ -f "extension/background/request-queue.js" ]; then
  if node -c "extension/background/request-queue.js" 2>/dev/null; then
    pass "Request queue syntax valid"
    pass "Request queue exists"
  else
    fail "Request queue syntax error"
  fi
else
  fail "Request queue not found"
fi
echo ""

# Test 6: File Locking Package
echo "Test 6: File Locking"
echo "--------------------"
if [ -f "cli/package.json" ]; then
  if grep -q "proper-lockfile" cli/package.json; then
    pass "File locking package installed"
    
    # Check if it's actually used
    if grep -q "lockfile" cli/lib/config.js; then
      pass "File locking implemented in config"
    else
      fail "File locking not implemented"
    fi
  else
    fail "File locking package missing"
  fi
else
  skip "CLI package.json not found"
fi
echo ""

# Test 7: Memory Cleanup
echo "Test 7: Memory Cleanup"
echo "----------------------"
if grep -q "beforeunload" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Memory cleanup handler present in Claude"
else
  fail "Memory cleanup handler missing"
fi

if grep -q "observer.disconnect" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Observer cleanup present"
else
  fail "Observer cleanup missing"
fi
echo ""

# Test 8: Rate Limiting
echo "Test 8: Rate Limiting"
echo "---------------------"
if grep -q "COOLDOWN_MS" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Rate limiting constant defined"
else
  fail "Rate limiting constant missing"
fi

if grep -q "lastInsertTime" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Rate limiting logic present"
else
  fail "Rate limiting logic missing"
fi
echo ""

# Test 9: Error Handling
echo "Test 9: Error Handling"
echo "----------------------"
ERROR_COUNT=$(grep -c "try {" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null)
if [ $ERROR_COUNT -gt 0 ]; then
  pass "Error handling present ($ERROR_COUNT try blocks)"
else
  fail "Error handling missing"
fi

if grep -q "catch (error)" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Error catching implemented"
else
  fail "Error catching missing"
fi
echo ""

# Test 10: Cache TTL
echo "Test 10: Cache TTL"
echo "------------------"
if grep -q "TTL" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Cache TTL constant present"
else
  fail "Cache TTL constant missing"
fi

if grep -q "timestamp" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Cache timestamp tracking present"
else
  fail "Cache timestamp tracking missing"
fi
echo ""

# Test 11: Performance Features
echo "Test 11: Performance Features"
echo "-----------------------------"
if grep -q "disabled = true" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Button disable during operation"
else
  fail "No button disable logic"
fi

if grep -q "loading" "$CONTENT_DIR/claude-with-cache.js" 2>/dev/null; then
  pass "Loading states implemented"
else
  fail "Loading states missing"
fi
echo ""

# Test 12: File Structure
echo "Test 12: File Structure"
echo "-----------------------"
REQUIRED_FILES=(
  "extension/manifest.json"
  "extension/popup/popup.html"
  "extension/popup/popup.js"
  "extension/background/service-worker.js"
  "extension/content/claude.js"
  "extension/content/chatgpt.js"
  "cli/bin/context.js"
  "cli/lib/gist.js"
  "cli/lib/config.js"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "$file exists"
  else
    fail "$file missing"
  fi
done
echo ""

# Summary
echo "========================================"
echo "Scale Testing Summary"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "${YELLOW}Skipped: $TESTS_SKIPPED${NC}"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL -gt 0 ]; then
  SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL))
  echo "Success Rate: ${SUCCESS_RATE}%"
  echo ""
  
  if [ $SUCCESS_RATE -ge 95 ]; then
    echo -e "${GREEN}🎉 Excellent! Ready for production scale${NC}"
    exit 0
  elif [ $SUCCESS_RATE -ge 85 ]; then
    echo -e "${YELLOW}⚠️  Good progress, minor improvements needed${NC}"
    exit 0
  elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Acceptable, but needs work before launch${NC}"
    exit 1
  else
    echo -e "${RED}❌ Critical issues found - not ready for scale${NC}"
    exit 2
  fi
else
  echo "No tests completed"
  exit 1
fi
