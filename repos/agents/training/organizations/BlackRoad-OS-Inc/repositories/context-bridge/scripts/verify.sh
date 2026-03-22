#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }
cd context-bridge 2>/dev/null || cd .
check "Repo exists" "[ -f LICENSE ] || [ -f README.md ]"
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
