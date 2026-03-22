#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }
cd blackroad-analytics 2>/dev/null || cd .
check "Repo exists" "[ -f wrangler.toml ]"
check "Worker source" "[ -f src/worker.js ]"
check "D1 migration" "[ -f migrations/0001_init.sql ]"
check "No PII storage" "! grep -i 'ip_address\|raw_ip' src/worker.js"
echo ""; echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
