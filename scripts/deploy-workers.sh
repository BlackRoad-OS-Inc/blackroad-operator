#!/usr/bin/env bash
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
# Deploy all Cloudflare Workers
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()   { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
info()  { echo -e "${CYAN}ℹ${NC} $1"; }

WORKERS_DIR="$(cd "$(dirname "$0")/../workers" && pwd)"
TARGET="${1:-all}"

deploy_worker() {
  local name="$1"
  local dir="$WORKERS_DIR/$name"

  if [ ! -f "$dir/wrangler.toml" ]; then
    error "No wrangler.toml found in $dir"
    return 1
  fi

  info "Deploying worker: $name"
  (cd "$dir" && npx wrangler deploy 2>&1) && log "Deployed: $name" || error "Failed: $name"
}

if [ "$TARGET" = "all" ]; then
  info "Deploying all workers..."
  for dir in "$WORKERS_DIR"/*/; do
    name=$(basename "$dir")
    if [ -f "$dir/wrangler.toml" ]; then
      deploy_worker "$name"
    fi
  done
  log "All workers deployed"
else
  deploy_worker "$TARGET"
fi
