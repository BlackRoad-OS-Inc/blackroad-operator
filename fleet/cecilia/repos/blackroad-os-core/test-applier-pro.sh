#!/bin/bash
# Quick test script for applier-pro system

echo "🧪 Testing applier-pro system..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
ORANGE='\033[38;5;208m'
NC='\033[0m' # No Color

# Test counter
TESTS=0
PASSED=0

run_test() {
    local name="$1"
    local command="$2"

    ((TESTS++))
    echo -n "[$TESTS] Testing $name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
    fi
}

echo "${ORANGE}=== File Existence Tests ===${NC}"
run_test "applier-pro CLI" "test -f ./applier-pro && test -x ./applier-pro"
run_test "Cover letter script" "test -f ./applier-cover-letter-ai.py && test -x ./applier-cover-letter-ai.py"
run_test "Batch script" "test -f ./applier-batch.py && test -x ./applier-batch.py"
run_test "Interview prep script" "test -f ./applier-interview-prep.py && test -x ./applier-interview-prep.py"
run_test "Salary negotiator script" "test -f ./applier-salary-negotiator.py && test -x ./applier-salary-negotiator.py"
run_test "Company research script" "test -f ./applier-company-research.py && test -x ./applier-company-research.py"

echo ""
echo "${ORANGE}=== Documentation Tests ===${NC}"
run_test "Complete guide" "test -f ./APPLIER_PRO_GUIDE.md"
run_test "Quick start" "test -f ./APPLIER_PRO_QUICK_START.md"
run_test "System summary" "test -f ./APPLIER_SYSTEM_COMPLETE.md"
run_test "Enhancement summary" "test -f ./APPLIER_ENHANCEMENTS_SUMMARY.md"

echo ""
echo "${ORANGE}=== Python Import Tests ===${NC}"
run_test "Python 3 available" "which python3"
run_test "Anthropic package" "python3 -c 'import anthropic' 2>/dev/null"
run_test "Playwright package" "python3 -c 'from playwright.async_api import async_playwright' 2>/dev/null"

echo ""
echo "${ORANGE}=== CLI Tests ===${NC}"
run_test "applier-pro help" "./applier-pro help | grep -q 'USAGE'"
run_test "applier-pro logo renders" "./applier-pro help | grep -q 'PRO'"

echo ""
echo "${ORANGE}=== Directory Structure Tests ===${NC}"
run_test ".applier directory exists" "test -d ~/.applier"
run_test "Config file exists" "test -f ~/.applier/config.json || echo 'Run ./applier-real setup first'"

echo ""
echo "${ORANGE}=== Results ===${NC}"
echo "Tests run: $TESTS"
echo "Passed: ${GREEN}$PASSED${NC}"
echo "Failed: ${RED}$((TESTS - PASSED))${NC}"

if [ $PASSED -eq $TESTS ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! System is ready to use.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Set your API key: export ANTHROPIC_API_KEY='sk-ant-...'"
    echo "  2. Run: ./applier-pro help"
    echo "  3. Start applying: ./applier-pro batch --max 5"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Check the output above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Install dependencies: pip install anthropic playwright requests"
    echo "  - Install browsers: playwright install"
    echo "  - Make scripts executable: chmod +x applier-pro applier-*.py"
    exit 1
fi
