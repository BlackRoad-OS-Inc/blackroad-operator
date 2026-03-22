#!/bin/bash
# Verify the memory system's codex was searched in recent journal entries.
# Checks if ~/.blackroad/memory/journal.jsonl contains a recent "codex" or "search" action.
# Usage: ./check-codex-search.sh [repo-path]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

JOURNAL="$HOME/.blackroad/memory/journals/master-journal.jsonl"
TODAY=$(date +%Y-%m-%d)
FAILURES=0

echo -e "${PINK}[check-codex-search]${RESET} Verifying codex was searched..."

# Check journal file exists
if [ ! -f "$JOURNAL" ]; then
    echo -e "${PINK}  FAIL${RESET} Journal file not found: $JOURNAL"
    exit 1
fi

# Check for recent codex/search entries (today or within last 24h)
CODEX_HITS=$(grep -i '"codex"\|"search"\|codex\|search' "$JOURNAL" 2>/dev/null | grep -c "$TODAY" 2>/dev/null || true)

if [ "$CODEX_HITS" -gt 0 ]; then
    echo -e "${GREEN}  PASS${RESET} Found $CODEX_HITS codex/search entries from today ($TODAY)"
else
    # Also check yesterday in case of timezone edge
    YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")
    if [ -n "$YESTERDAY" ]; then
        CODEX_HITS=$(grep -i '"codex"\|"search"\|codex\|search' "$JOURNAL" 2>/dev/null | grep -c "$YESTERDAY" 2>/dev/null || true)
    fi

    if [ "$CODEX_HITS" -gt 0 ]; then
        echo -e "${GREEN}  PASS${RESET} Found $CODEX_HITS codex/search entries from yesterday ($YESTERDAY)"
    else
        echo -e "${PINK}  FAIL${RESET} No codex/search entries found in journal for today ($TODAY)"
        FAILURES=$((FAILURES + 1))
    fi
fi

if [ "$FAILURES" -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}  OK${RESET} Codex search verified."
exit 0
