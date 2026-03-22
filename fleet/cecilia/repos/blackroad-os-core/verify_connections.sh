#!/bin/bash
# BlackRoad OS Core - Connection Verification Script
# Verifies that all systems are properly connected

set -e

echo "🔍 BlackRoad OS Core - Connection Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper function
check() {
    if eval "$2" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

echo "📦 Node.js / TypeScript Environment"
echo "-----------------------------------"
check "Node.js installed" "command -v node"
check "pnpm installed" "command -v pnpm"
check "node_modules exists" "[ -d node_modules ]"
check "TypeScript config exists" "[ -f tsconfig.json ]"
check "Package.json valid" "[ -f package.json ]"
echo ""

echo "🐍 Python Environment"
echo "--------------------"
check "Python 3 installed" "command -v python3"
check "Virtual environment exists" "[ -d venv ]"
check "setup.py exists" "[ -f setup.py ]"
check "src/blackroad_core exists" "[ -d src/blackroad_core ]"
echo ""

echo "🧪 Testing Imports"
echo "-----------------"

# Activate venv for Python tests
source venv/bin/activate

# Test Python imports
if python3 -c "import blackroad_core" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Python: blackroad_core imports"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Python: blackroad_core imports"
    ((FAILED++))
fi

if python3 -c "from blackroad_core import generate_ps_sha_id, validate_ps_sha_id" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Python: PS-SHA functions import"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Python: PS-SHA functions import"
    ((FAILED++))
fi

if python3 -c "from blackroad_core import AgentManifest, PackManifest" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Python: Manifest types import"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Python: Manifest types import"
    ((FAILED++))
fi

if python3 -c "from blackroad_core import JobStatus, AgentStatus, RuntimeType" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Python: Protocol enums import"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Python: Protocol enums import"
    ((FAILED++))
fi

echo ""
echo "🎯 Functional Tests"
echo "------------------"

# Test PS-SHA ID generation
if python3 -c "
from blackroad_core import generate_ps_sha_id, validate_ps_sha_id
id = generate_ps_sha_id({'test': 'manifest'}, 'creator')
assert validate_ps_sha_id(id)
assert len(id) == 64
" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} PS-SHA ID generation works"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} PS-SHA ID generation works"
    ((FAILED++))
fi

echo ""
echo "📊 Summary"
echo "=========="
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All connections verified successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some connections failed. See above for details.${NC}"
    exit 1
fi
