#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }
cd blackroad-stats 2>/dev/null || cd .
check "Repo exists" "[ -f wrangler.toml ]"
check "Worker source" "[ -f src/worker.js ]"
check "Collector script" "[ -f collect.sh ]"
check "No SSH keys in repo" "! find . -name 'id_rsa*' -o -name '*.pem' | grep -q ."
echo ""; echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
