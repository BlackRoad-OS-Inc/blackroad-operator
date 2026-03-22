#!/usr/bin/env bash
set -euo pipefail
blocked_ext='png|jpg|jpeg|gif|webp|pdf|zip|tar|gz|npz|npy|pkl|parquet|feather|mp4|mov|wav|ogg'
files=$(git diff --cached --name-only)
fail=0
for f in $files; do
  if echo "$f" | grep -E "\.(${blocked_ext})$" -i >/dev/null; then
    echo "❌ Binary-like extension blocked: $f"
    fail=1
    continue
  fi
  if git show :$f 2>/dev/null | head -c 8000 | LC_ALL=C tr -d '\n' | grep -qaP '\x00'; then
    echo "❌ Binary content detected (null byte): $f"
    fail=1
  fi
done
if [ $fail -ne 0 ]; then
  echo "🚫 Commit aborted: remove binaries or convert to text (SVG/PGM/JSON)."
  exit 1
fi
