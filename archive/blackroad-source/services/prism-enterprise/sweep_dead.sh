#!/usr/bin/env bash
set -euo pipefail
echo "==> Find dead files (no references)"
pnpm dlx knip --reporter compact || true  # JS/TS unused exports/files

echo "==> Remove orphaned workflows (disabled/empty jobs)"
grep -Rl '"on":\s*null\|"workflow_call":\s*{}' .github/workflows || true

echo "==> Delete merged branches (remote + local)"
bash scripts/cleanup-merged-branches.sh || true
