#!/bin/bash
# Verify brand compliance rules in the target repo.
# Checks: LICENSE exists, LICENSE is proprietary (not MIT/Apache/GPL),
#          README.md exists, no "open source" in README.
# Usage: ./check-brand-compliance.sh [repo-path]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

REPO_PATH="${1:-.}"
FAILURES=0

echo -e "${PINK}[check-brand-compliance]${RESET} Checking brand compliance in: $REPO_PATH"

# 1. Check LICENSE file exists
LICENSE_FILE=""
for name in LICENSE LICENSE.md LICENSE.txt; do
    if [ -f "$REPO_PATH/$name" ]; then
        LICENSE_FILE="$REPO_PATH/$name"
        break
    fi
done

if [ -n "$LICENSE_FILE" ]; then
    echo -e "${GREEN}  PASS${RESET} LICENSE file exists ($LICENSE_FILE)"
else
    echo -e "${PINK}  FAIL${RESET} No LICENSE file found"
    FAILURES=$((FAILURES + 1))
fi

# 2. Check LICENSE is NOT MIT/Apache/GPL (must be proprietary)
if [ -n "$LICENSE_FILE" ]; then
    if grep -qiE 'MIT License|Apache License|GNU General Public License|GNU GPL|Mozilla Public License|BSD [0-9]-Clause' "$LICENSE_FILE" 2>/dev/null; then
        echo -e "${PINK}  FAIL${RESET} LICENSE is open-source (must be proprietary)"
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}  PASS${RESET} LICENSE is proprietary (not MIT/Apache/GPL)"
    fi
fi

# 3. Check README.md exists
if [ -f "$REPO_PATH/README.md" ]; then
    echo -e "${GREEN}  PASS${RESET} README.md exists"
else
    echo -e "${PINK}  FAIL${RESET} README.md not found"
    FAILURES=$((FAILURES + 1))
fi

# 4. Check no "open source" or "open-source" in README
if [ -f "$REPO_PATH/README.md" ]; then
    if grep -qiE 'open.source' "$REPO_PATH/README.md" 2>/dev/null; then
        echo -e "${PINK}  FAIL${RESET} README.md contains 'open source' (brand rule violation)"
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}  PASS${RESET} README.md clean of 'open source' references"
    fi
fi

if [ "$FAILURES" -gt 0 ]; then
    echo -e "${PINK}  RESULT${RESET} $FAILURES brand compliance issue(s) found"
    exit 1
fi

echo -e "${GREEN}  OK${RESET} Brand compliance verified."
exit 0
