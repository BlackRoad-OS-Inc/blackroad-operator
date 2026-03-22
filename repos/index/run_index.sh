#!/bin/bash
# Convenience wrapper to index common locations
set -euo pipefail

DB=${1:-./index.db}
shift || true
PATHS=(/home /srv /opt .)
if [ "$#" -gt 0 ]; then
  PATHS=()
  for p in "$@"; do
    PATHS+=("$p")
  done
fi

python3 indexer.py --db "$DB" --paths "${PATHS[@]}"
