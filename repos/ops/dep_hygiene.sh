#!/usr/bin/env bash
set -euo pipefail
echo "==> Node deps"
pnpm prune
pnpm dedupe || true
pnpm audit --audit-level=high || true

echo "==> Python deps"
python -m pip install --upgrade pip
pip install pip-tools || true
[ -f requirements.in ] && pip-compile --upgrade || true

echo "==> Commit"
git add -A
git commit -m "chore: dep prune/dedupe; refresh locks" || true
