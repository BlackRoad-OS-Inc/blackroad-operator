#!/bin/bash
# Verify security standards in the target repo.
# Checks: no .env files committed, no hardcoded API keys, has SECURITY.md.
# Usage: ./check-security-check.sh [repo-path]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

REPO_PATH="${1:-.}"
FAILURES=0

echo -e "${PINK}[check-security-check]${RESET} Checking security standards in: $REPO_PATH"

# 1. Check no .env files committed (via git ls-files if in a git repo)
if [ -d "$REPO_PATH/.git" ]; then
    ENV_FILES=$(cd "$REPO_PATH" && git ls-files '*.env' '.env' '.env.*' '**/.env' '**/.env.*' 2>/dev/null | grep -v '\.example\|\.template\|\.sample\|\.tests\|\.e2e' || true)
    if [ -n "$ENV_FILES" ]; then
        echo -e "${PINK}  FAIL${RESET} .env file(s) committed to git:"
        echo "$ENV_FILES" | while read -r f; do echo "         - $f"; done
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}  PASS${RESET} No .env files committed to git"
    fi
else
    # Not a git repo — check if .env files exist on disk
    ENV_FILES=$(find "$REPO_PATH" -maxdepth 3 \( -name '.env' -o -name '.env.*' -o -name '*.env' \) 2>/dev/null | head -20)
    if [ -n "$ENV_FILES" ]; then
        echo -e "${PINK}  WARN${RESET} .env file(s) found (not a git repo, cannot verify if committed):"
        echo "$ENV_FILES" | while read -r f; do echo "         - $f"; done
    else
        echo -e "${GREEN}  PASS${RESET} No .env files found"
    fi
fi

# 2. Check no hardcoded API keys (common patterns)
KEY_PATTERNS='sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|xoxb-[0-9]|sk_live_[a-zA-Z0-9]|pk_live_[a-zA-Z0-9]|AIzaSy[a-zA-Z0-9_-]{33}'

if [ -d "$REPO_PATH/.git" ]; then
    # Only scan tracked files, exclude this script itself
    # Only scan small/text files to avoid timeout on large repos
    KEY_HITS=$(cd "$REPO_PATH" && git ls-files -z 2>/dev/null \
        | xargs -0 -P4 grep -rlE "$KEY_PATTERNS" 2>/dev/null \
        | grep -v 'check-security\|node_modules\|\.min\.\|dist/\|build/\|vendor/\|test/\|tests/\|__tests__\|integration_tests\|sample_files\|\.example\|\.template\|\.md$\|\.mdx$' \
        | head -20 || true)
else
    KEY_HITS=$(grep -rlE "$KEY_PATTERNS" "$REPO_PATH" \
        --include='*.py' --include='*.js' --include='*.ts' \
        --include='*.json' --include='*.yml' --include='*.yaml' \
        --include='*.toml' --include='*.cfg' --include='*.ini' \
        2>/dev/null \
        | grep -v 'check-security' \
        | head -20 || true)
fi

if [ -n "$KEY_HITS" ]; then
    echo -e "${PINK}  FAIL${RESET} Possible hardcoded API keys found in:"
    echo "$KEY_HITS" | while read -r f; do echo "         - $f"; done
    FAILURES=$((FAILURES + 1))
else
    echo -e "${GREEN}  PASS${RESET} No hardcoded API keys detected"
fi

# 3. Check SECURITY.md exists
if [ -f "$REPO_PATH/SECURITY.md" ]; then
    echo -e "${GREEN}  PASS${RESET} SECURITY.md exists"
else
    echo -e "${PINK}  FAIL${RESET} SECURITY.md not found"
    FAILURES=$((FAILURES + 1))
fi

if [ "$FAILURES" -gt 0 ]; then
    echo -e "${PINK}  RESULT${RESET} $FAILURES security issue(s) found"
    exit 1
fi

echo -e "${GREEN}  OK${RESET} Security standards verified."
exit 0
