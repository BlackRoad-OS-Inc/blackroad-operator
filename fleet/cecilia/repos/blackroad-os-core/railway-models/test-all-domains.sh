#!/bin/bash

# BlackRoad Agents - Test All 8 Domains
# Tests health checks and inference across all agent endpoints

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
AUTHORIZED_BY="${AUTHORIZED_BY:-1031f308ae9ae6d34fe87e83867c1e5869c9fca7e35fdd5d0e8deb798e9c51be}"
TEST_PROMPT="What is your identity and primary function?"

# All 8 domains
DOMAINS=(
    "agents.blackroad.io"
    "agents.blackroad.company"
    "agents.lucidia.earth"
    "agents.blackroad.systems"
    "agents.blackroad.me"
    "agents.roadcoin.io"
    "agents.roadchain.io"
    "agents.blackroadinc.us"
)

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  BlackRoad Agents - Domain Health Check${NC}"
echo -e "${GREEN}  Testing ${#DOMAINS[@]} Domains${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Function to test health endpoint
test_health() {
    local domain="$1"
    local url="https://$domain/health"

    echo -e "${BLUE}Testing: $domain${NC}"
    echo -e "  URL: $url"

    response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✓ Health check: OK${NC}"
        echo "  Response: $body"
        return 0
    else
        echo -e "  ${RED}✗ Health check: FAILED (HTTP $http_code)${NC}"
        echo "  Response: $body"
        return 1
    fi
}

# Function to test inference
test_inference() {
    local domain="$1"
    local url="https://$domain/v1/chat/completions"

    echo -e "${BLUE}Testing inference: $domain${NC}"
    echo -e "  URL: $url"
    echo -e "  Prompt: $TEST_PROMPT"

    response=$(curl -s -w "\n%{http_code}" "$url" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"blackroad\",
            \"messages\": [{\"role\": \"user\", \"content\": \"$TEST_PROMPT\"}],
            \"authorized_by\": \"$AUTHORIZED_BY\",
            \"authority_chain\": [
                \"principal:alexa:blackroad@gmail.com\",
                \"operator:cece:blackroad-os-operator\"
            ],
            \"max_tokens\": 100
        }" 2>&1)

    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✓ Inference: OK${NC}"

        # Extract just the content field using basic parsing
        content=$(echo "$body" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$content" ]; then
            echo -e "  ${YELLOW}Response:${NC} ${content:0:100}..."
        else
            echo "  Full response: $body"
        fi
        return 0
    else
        echo -e "  ${RED}✗ Inference: FAILED (HTTP $http_code)${NC}"
        echo "  Response: $body"
        return 1
    fi
}

# Function to test version endpoint
test_version() {
    local domain="$1"
    local url="https://$domain/version"

    echo -e "${BLUE}Testing version: $domain${NC}"

    response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✓ Version check: OK${NC}"
        echo "  Response: $body"
        return 0
    else
        echo -e "  ${YELLOW}⚠ Version check: FAILED (HTTP $http_code)${NC}"
        return 1
    fi
}

# Function to test breath endpoint
test_breath() {
    local domain="$1"
    local url="https://$domain/breath"

    echo -e "${BLUE}Testing breath: $domain${NC}"

    response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✓ Breath sync: OK${NC}"
        echo "  Response: $body"
        return 0
    else
        echo -e "  ${YELLOW}⚠ Breath sync: FAILED (HTTP $http_code)${NC}"
        return 1
    fi
}

# Test all domains
PASSED=0
FAILED=0

for domain in "${DOMAINS[@]}"; do
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Domain: $domain${NC}"
    echo -e "${YELLOW}========================================${NC}"

    # Health check
    if test_health "$domain"; then
        ((PASSED++))
    else
        ((FAILED++))
        echo -e "${RED}Skipping further tests for $domain${NC}"
        continue
    fi

    echo ""

    # Version check
    test_version "$domain"
    echo ""

    # Breath check
    test_breath "$domain"
    echo ""

    # Inference test
    if test_inference "$domain"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi

    echo ""
done

# Summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Test Summary${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "  Domains tested: ${#DOMAINS[@]}"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
