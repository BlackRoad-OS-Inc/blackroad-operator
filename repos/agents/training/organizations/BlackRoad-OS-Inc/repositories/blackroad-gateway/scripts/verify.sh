#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }

cd blackroad-gateway 2>/dev/null || cd .
check "Repo exists" "[ -f wrangler.toml ]"
check "Source entry point" "[ -f src/index.ts ]"
check "Routes file" "[ -f src/routes.ts ]"
check "Rate limiter" "[ -f src/ratelimit.ts ]"
check "Audit logger" "[ -f src/audit.ts ]"
check "Tests exist" "[ -f tests/gateway.test.ts ]"
check "No API keys in source" "! grep -r 'sk-\|ANTHROPIC_API_KEY=' src/"
check "node_modules installed" "[ -d node_modules ]"

echo ""; echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
