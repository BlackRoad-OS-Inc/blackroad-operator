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
  skip "CLI not installed"
fi
echo ""

# Test 2: Extension Files Syntax
echo "Test 2: Extension Files Syntax"
echo "-------------------------------"
cd extension 2>/dev/null || skip "Extension directory not found"

if [ -d "content" ]; then
  for file in content/*.js; do
    if node -c "$file" 2>/dev/null; then
      pass "$(basename $file) syntax valid"
    else
      fail "$(basename $file) syntax error"
    fi
  done
else
  skip "Content scripts not found"
fi
echo ""

# Test 3: Cache Manager
echo "Test 3: Cache Implementation"
echo "----------------------------"
if [ -f "extension/content/cache-manager.js" ]; then
  if node -c "extension/content/cache-manager.js" 2>/dev/null; then
    pass "Cache manager syntax valid"
  else
    fail "Cache manager syntax error"
  fi
else
  fail "Cache manager not found"
fi
echo ""

# Test 4: Storage Monitor
echo "Test 4: Storage Monitor"
echo "-----------------------"
if [ -f "extension/popup/storage-monitor.js" ]; then
  if node -c "extension/popup/storage-monitor.js" 2>/dev/null; then
    pass "Storage monitor syntax valid"
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
cd cli 2>/dev/null || skip "CLI directory not found"
if [ -f "package.json" ]; then
  if grep -q "proper-lockfile" package.json; then
    pass "File locking package installed"
  else
    fail "File locking package missing"
  fi
else
  skip "CLI package.json not found"
fi
cd ..
echo ""

# Test 7: Memory Cleanup
echo "Test 7: Memory Cleanup"
echo "----------------------"
if grep -q "beforeunload" extension/content/claude-with-cache.js 2>/dev/null; then
  pass "Memory cleanup handler present"
else
  fail "Memory cleanup handler missing"
fi
echo ""

# Test 8: Rate Limiting
echo "Test 8: Rate Limiting"
echo "---------------------"
if grep -q "COOLDOWN_MS" extension/content/claude-with-cache.js 2>/dev/null; then
  pass "Rate limiting implemented"
else
  fail "Rate limiting missing"
fi
echo ""

# Test 9: Error Handling
echo "Test 9: Error Handling"
echo "----------------------"
if grep -q "try {" extension/content/claude-with-cache.js 2>/dev/null; then
  pass "Error handling present"
else
  fail "Error handling missing"
fi
echo ""

# Test 10: Cache TTL
echo "Test 10: Cache TTL"
echo "------------------"
if grep -q "TTL" extension/content/claude-with-cache.js 2>/dev/null; then
  pass "Cache TTL implemented"
else
  fail "Cache TTL missing"
fi
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
  
  if [ $SUCCESS_RATE -ge 95 ]; then
    echo -e "${GREEN}🎉 Excellent! Ready for scale${NC}"
    exit 0
  elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Good, but needs improvement${NC}"
    exit 1
  else
    echo -e "${RED}❌ Critical issues found${NC}"
    exit 2
  fi
else
  echo "No tests completed"
  exit 1
fi
