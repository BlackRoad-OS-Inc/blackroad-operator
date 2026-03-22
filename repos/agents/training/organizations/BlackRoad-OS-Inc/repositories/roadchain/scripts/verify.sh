#!/bin/bash
set -e
PASS=0; FAIL=0
check() { if eval "$2" &>/dev/null; then echo "PASS: $1"; ((PASS++)); else echo "FAIL: $1"; ((FAIL++)); fi; }
cd roadchain 2>/dev/null || cd .; check 'Repo exists' '[ -f LICENSE ] || [ -f README.md ]'; echo "Results: $PASS passed, $FAIL failed"
