#!/bin/bash
# Verify a TIL was broadcast recently.
# Checks if ~/.blackroad/memory/til.jsonl has entries from today.
# Usage: ./check-til-broadcast.sh [repo-path]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

TIL_DIR="$HOME/.blackroad/memory/til"
TODAY=$(date +%Y-%m-%d)
TODAY_EPOCH=$(date +%s)
FAILURES=0

echo -e "${PINK}[check-til-broadcast]${RESET} Verifying TIL was broadcast..."

# TILs are stored as individual files: til-<epoch>-<rand>.json
TIL_COUNT=$(ls "$TIL_DIR"/til-*.json 2>/dev/null | wc -l | tr -d ' ')
if [ "$TIL_COUNT" -eq 0 ]; then
    echo -e "${PINK}  FAIL${RESET} No TIL files found in $TIL_DIR"
    exit 1
fi

# Check for TILs from today (within last 24h by file mod time)
TIL_HITS=$(find "$TIL_DIR" -maxdepth 1 -name 'til-*.json' -mtime -1 2>/dev/null | wc -l | tr -d ' ')

if [ "$TIL_HITS" -gt 0 ]; then
    echo -e "${GREEN}  PASS${RESET} Found $TIL_HITS TIL entries from last 24h (total: $TIL_COUNT)"
else
    echo -e "${PINK}  FAIL${RESET} No TIL entries from last 24h (total: $TIL_COUNT exist but none recent)"
    FAILURES=$((FAILURES + 1))
fi

if [ "$FAILURES" -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}  OK${RESET} TIL broadcast verified."
exit 0
