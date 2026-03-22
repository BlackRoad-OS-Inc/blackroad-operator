#!/bin/bash
# BlackRoad API Security Tester
# Tests BlackRoad API endpoints for common vulnerabilities
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

BASE_URL="${1:-http://localhost:8787}"
REPORT_DIR="${HOME}/.blackroad/pentest-reports/api"
mkdir -p "$REPORT_DIR"

test_endpoint() {
  local method="$1" path="$2" expected="$3" desc="$4"
  local response
  response=$(curl -sS -o /dev/null -w "%{http_code}" -X "$method" --max-time 5 "$BASE_URL$path" 2>/dev/null)
  if [ "$response" = "$expected" ]; then
    echo -e "${GREEN}✓${NC} [$method $path] → $response ($desc)"
  else
    echo -e "${YELLOW}⚠${NC} [$method $path] → $response (expected $expected) ($desc)"
  fi
}

echo -e "${CYAN}Testing: $BASE_URL${NC}\n"

# Auth tests
test_endpoint "GET" "/admin" "401" "Admin requires auth"
test_endpoint "GET" "/health" "200" "Health endpoint public"
test_endpoint "DELETE" "/" "405" "DELETE / should be rejected"

# Injection tests
test_endpoint "GET" "/memory?query=<script>alert(1)</script>" "200" "XSS in query param"
test_endpoint "GET" "/memory?query=' OR '1'='1" "200" "SQL injection attempt"

# Rate limiting
echo -e "\n${CYAN}Rate limit test (10 rapid requests)...${NC}"
for i in $(seq 1 10); do
  CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 2 "$BASE_URL/health" 2>/dev/null)
  printf "$CODE "
done
echo ""

echo -e "\n${GREEN}API tests complete!${NC}"
