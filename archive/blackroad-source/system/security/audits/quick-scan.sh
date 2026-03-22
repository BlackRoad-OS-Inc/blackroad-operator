#!/bin/zsh
# BR Quick Security Scan — fast pre-commit security check

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

ISSUES=0

check_secrets() {
    echo "Scanning for secrets..."
    
    PATTERNS=(
        "sk-[a-zA-Z0-9]{20,}"
        "ghp_[a-zA-Z0-9]{36}"
        "AKIA[A-Z0-9]{16}"
        "-----BEGIN.*PRIVATE KEY-----"
        "password\s*=\s*['\"][^'\"]{4,}"
        "api_key\s*=\s*['\"][^'\"]{8,}"
    )
    
    for pattern in "${PATTERNS[@]}"; do
        hits=$(git diff --cached | grep -iE "$pattern" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$hits" -gt 0 ]; then
            echo -e "${RED}✗ Found potential secret (pattern: $pattern)${NC}"
            ISSUES=$((ISSUES + 1))
        fi
    done
}

check_file_permissions() {
    echo "Checking file permissions..."
    find . -name "*.key" -o -name "*.pem" -o -name "*.p12" 2>/dev/null | while read f; do
        perms=$(stat -c "%a" "$f" 2>/dev/null || stat -f "%OLp" "$f" 2>/dev/null)
        if [ "$perms" != "400" ] && [ "$perms" != "600" ]; then
            echo -e "${YELLOW}⚠ Insecure permissions ($perms) on: $f${NC}"
            ISSUES=$((ISSUES + 1))
        fi
    done
}

check_dotenv_staged() {
    echo "Checking for staged .env files..."
    if git diff --cached --name-only | grep -qE "^\.env$|^\.env\.[^e]"; then
        echo -e "${RED}✗ .env file is staged for commit!${NC}"
        ISSUES=$((ISSUES + 1))
    fi
}

check_secrets
check_file_permissions
check_dotenv_staged

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✓ No security issues found${NC}"
    exit 0
else
    echo -e "${RED}\n$ISSUES issue(s) found. Fix before committing.${NC}"
    exit 1
fi
