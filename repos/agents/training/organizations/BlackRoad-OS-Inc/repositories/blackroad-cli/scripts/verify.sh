#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }
cd blackroad-cli 2>/dev/null || cd .
check "Repo exists" "[ -f LICENSE ]"
check "Bots directory" "[ -d bots ]"
check "Bot init" "[ -f bots/__init__.py ]"
check "At least 10 bots" "[ $(ls bots/*.py 2>/dev/null | wc -l) -ge 10 ]"
check "Trinity subsystem" "[ -d .trinity ]"
echo ""; echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
