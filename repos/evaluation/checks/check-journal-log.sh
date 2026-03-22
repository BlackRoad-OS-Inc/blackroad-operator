#!/bin/bash
# Verify work was logged to journal.
# Checks if ~/.blackroad/memory/journal.jsonl has entries from today.
# Usage: ./check-journal-log.sh [repo-path]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

JOURNAL="$HOME/.blackroad/memory/journals/master-journal.jsonl"
TODAY=$(date +%Y-%m-%d)
FAILURES=0

echo -e "${PINK}[check-journal-log]${RESET} Verifying work was logged to journal..."

# Check journal file exists
if [ ! -f "$JOURNAL" ]; then
    echo -e "${PINK}  FAIL${RESET} Journal file not found: $JOURNAL"
    exit 1
fi

# Check for entries from today
JOURNAL_HITS=$(grep -c "$TODAY" "$JOURNAL" 2>/dev/null || true)

if [ "$JOURNAL_HITS" -gt 0 ]; then
    echo -e "${GREEN}  PASS${RESET} Found $JOURNAL_HITS journal entries from today ($TODAY)"
else
    # Check yesterday as fallback
    YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")
    if [ -n "$YESTERDAY" ]; then
        JOURNAL_HITS=$(grep -c "$YESTERDAY" "$JOURNAL" 2>/dev/null || true)
    fi

    if [ "$JOURNAL_HITS" -gt 0 ]; then
        echo -e "${GREEN}  PASS${RESET} Found $JOURNAL_HITS journal entries from yesterday ($YESTERDAY)"
    else
        echo -e "${PINK}  FAIL${RESET} No journal entries found for today ($TODAY)"
        FAILURES=$((FAILURES + 1))
    fi
fi

if [ "$FAILURES" -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}  OK${RESET} Journal logging verified."
exit 0
