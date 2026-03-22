#!/bin/bash
# Verify blackroad-agents training environment
set -e

PASS=0
FAIL=0

check() {
  if eval "$2" &>/dev/null; then
    echo "PASS: $1"
    ((PASS++))
  else
    echo "FAIL: $1"
    ((FAIL++))
  fi
}

cd blackroad-agents 2>/dev/null || cd .

check "Repo exists" "[ -f LICENSE ]"
check "Modelfiles directory exists" "[ -d modelfiles ]"
check "CECE profile exists" "[ -f cece-profile.json ]"
check "Coordination directory exists" "[ -d coordination ]"
check "Skill matcher exists" "[ -f coordination/skill-matcher.sh ]"
check "At least 5 Modelfiles" "[ $(ls modelfiles/*.Modelfile 2>/dev/null | wc -l) -ge 5 ]"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "All checks passed." || exit 1
