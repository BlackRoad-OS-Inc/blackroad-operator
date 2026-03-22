#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }
cd blackroad-prism 2>/dev/null || cd .
check "Repo exists" "[ -f wrangler.toml ]"
check "Entry point" "[ -f src/index.ts ]"
check "Dashboard" "[ -f src/dashboard.ts ]"
check "TypeScript config" "[ -f tsconfig.json ]"
check "node_modules" "[ -d node_modules ]"
echo ""; echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
