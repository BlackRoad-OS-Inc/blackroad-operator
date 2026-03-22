#!/usr/bin/env bash
# BlackRoad Agent Sync Script — runs on Alice (Pi 400)
# Keeps all nodes in sync with the master GitHub repo and maintains the registry

set -euo pipefail

REPO_DIR=${REPO_DIR:-/home/pi/blackroad-prism-console}
REGISTRY_FILE=${REGISTRY_FILE:-$REPO_DIR/network/registry.json}
REPORT_DIR=${REPORT_DIR:-$REPO_DIR/network/reports}
NODES_FILE=${NODES_FILE:-$REPO_DIR/network/nodes.txt}
REMOTE_NAME=${REMOTE_NAME:-origin}
REMOTE_BRANCH=${REMOTE_BRANCH:-main}
REMOTE_URL=${REMOTE_URL:-https://github.com/blackboxprogramming/blackroad-prism-console.git}
NETWORK_ID=${NETWORK_ID:-blackroad-mesh}
REGISTRY_VERSION=${REGISTRY_VERSION:-1}

log() {
  printf '[BlackRoad] %s\n' "$*"
}

ensure_remote() {
  if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
    return
  fi
  log "Remote $REMOTE_NAME not found; adding $REMOTE_URL"
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
}

update_checkout() {
  ensure_remote
  log "Refreshing repository state from ${REMOTE_NAME}/${REMOTE_BRANCH}..."
  git fetch "$REMOTE_NAME" "$REMOTE_BRANCH"

  local current_branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  if [[ "$current_branch" != "$REMOTE_BRANCH" ]]; then
    log "Switching to $REMOTE_BRANCH branch..."
    git checkout "$REMOTE_BRANCH"
  fi

  local local_hash remote_hash
  local_hash=$(git rev-parse HEAD)
  remote_hash=$(git rev-parse "${REMOTE_NAME}/${REMOTE_BRANCH}")

  if [[ "$local_hash" != "$remote_hash" ]]; then
    log "Fast-forwarding local checkout to latest commit..."
    git pull --ff-only "$REMOTE_NAME" "$REMOTE_BRANCH"
  else
    log "Local checkout already up to date."
  fi
}

merge_reports() {
  log "Merging incoming node reports into registry..."
  mkdir -p "$(dirname "$REGISTRY_FILE")" "$REPORT_DIR"

  local tmp_reg tmp_out
  tmp_reg=$(mktemp "$REPO_DIR/network/registry.XXXXXX")
  tmp_out="${tmp_reg}.tmp"
  trap 'rm -f "$tmp_reg" "$tmp_out"' EXIT

  jq -n \
    --arg network "$NETWORK_ID" \
    --arg version "$REGISTRY_VERSION" \
    '{
      network: $network,
      version: (try ($version | tonumber) catch $version),
      nodes: []
    }' > "$tmp_reg"

  shopt -s nullglob
  for report in "$REPORT_DIR"/*.json; do
    if jq empty "$report" >/dev/null 2>&1; then
      jq --slurpfile node "$report" '.nodes += $node' "$tmp_reg" > "$tmp_out"
      mv "$tmp_out" "$tmp_reg"
    else
      log "Skipping invalid report: $report"
    fi
  done
  shopt -u nullglob

  jq \
    --arg time "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    '.updated = $time | .nodes |= sort_by(.id)' \
    "$tmp_reg" > "$tmp_out"
  mv "$tmp_out" "$REGISTRY_FILE"
  rm -f "$tmp_reg" "$tmp_out"
  trap - EXIT
}

commit_registry_if_needed() {
  if git diff --quiet -- "$REGISTRY_FILE"; then
    log "Registry unchanged; nothing to commit."
    return
  fi

  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  git add "$REGISTRY_FILE"
  git commit -m "chore: merge node reports $timestamp"
  git push "$REMOTE_NAME" "$REMOTE_BRANCH"
  log "Registry changes committed and pushed."
}

broadcast_updates() {
  if [[ ! -f "$NODES_FILE" ]]; then
    log "No nodes file found at $NODES_FILE; skipping broadcast."
    return
  fi

  local nodes_started=false
  while IFS= read -r node; do
    [[ -z "$node" || "$node" == \#* ]] && continue
    if [[ "$nodes_started" = false ]]; then
      log "Broadcasting repo updates to fleet nodes..."
      nodes_started=true
    fi
    log "  → Syncing $node"
    ssh -o BatchMode=yes -o ConnectTimeout=10 "pi@$node" \
      "cd $REPO_DIR && git fetch $REMOTE_NAME $REMOTE_BRANCH && git reset --hard ${REMOTE_NAME}/${REMOTE_BRANCH} && sudo systemctl restart blackroad-agent" &
  done < "$NODES_FILE"
  wait || true
}

main() {
  cd "$REPO_DIR"

  update_checkout
  merge_reports
  commit_registry_if_needed
  broadcast_updates

  log "Sync complete."
}

main "$@"
