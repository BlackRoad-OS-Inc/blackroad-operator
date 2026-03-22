#!/usr/bin/env bash
set -euo pipefail

missing=0

while read -r path; do
  [[ "$path" =~ ^#|^$ ]] && continue
  if [ ! -e "$path" ]; then
    echo "MISSING: $path"
    missing=1
  fi
done < mounts.manifest

if [ "$missing" -eq 1 ]; then
  echo "✗ Canonical mount validation FAILED"
  exit 1
fi

echo "✓ Canonical mount validation PASSED"
