#!/usr/bin/env bash
# Deploy BlackRoad Prism Console assets and services on a host.
#
# The script expects to run on the target server after the repository has
# been synchronised (for example via rsync from CI). It installs production
# dependencies, builds the marketing site, applies database migrations, and
# restarts critical services with health verification.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '==> %s\n' "$*"; }
warn() { printf ':: warning :: %s\n' "$*"; }
err() { printf ':: error :: %s\n' "$*" >&2; }

CURRENT_STEP="initialisation"
trap 'err "Deployment failed during: ${CURRENT_STEP}"' ERR

step() {
  CURRENT_STEP="$1"
  log "$CURRENT_STEP"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    err "Required command not found: $cmd"
    return 1
  fi
}

# Configuration with sane defaults; override via environment variables.
DEPLOY_ENV="${DEPLOY_ENV:-production}"
WEB_ROOT="${WEB_ROOT:-/var/www/blackroad}"
API_SERVICE="${API_SERVICE:-blackroad-api}"
BRIDGE_SERVICE="${BRIDGE_SERVICE:-ollama-bridge}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
SITE_HEALTH_URL="${SITE_HEALTH_URL:-http://127.0.0.1/healthz}"
API_HEALTH_URL="${API_HEALTH_URL:-http://127.0.0.1:4000/api/health}"
LLM_CHECK="${LLM_CHECK:-true}"
API_BASE_FOR_LLM="${API_BASE_FOR_LLM:-http://127.0.0.1:4000}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_DELAY="${HEALTH_DELAY:-3}"

# Determine whether sudo is required for privileged operations.
SUDO_CMD=""
if [[ "${USE_SUDO:-auto}" == "always" ]]; then
  SUDO_CMD="sudo"
elif [[ "${USE_SUDO:-auto}" != "never" ]]; then
  if [[ "$(id -u)" -ne 0 ]] && command -v sudo >/dev/null 2>&1; then
    SUDO_CMD="sudo"
  fi
fi

step "Pre-flight checks"
require_cmd npm
require_cmd node
require_cmd curl
require_cmd rsync || warn "rsync not available; will fall back to cp"
if [[ -d "${ROOT_DIR}/srv/blackroad-api/migrations" ]]; then
  require_cmd sqlite3 || warn "sqlite3 missing; migrations may fail"
fi

step "Install API dependencies"
cd "$ROOT_DIR"
if [[ -f package-lock.json ]]; then
  npm ci --omit=dev
else
  warn "package-lock.json not found; skipping npm ci"
fi

step "Install and build marketing site"
if [[ -d "${ROOT_DIR}/sites/blackroad" ]]; then
  npm --prefix sites/blackroad ci
  npm --prefix sites/blackroad run build
else
  warn "sites/blackroad missing; skipping site build"
fi

sync_static_assets() {
  local src="${ROOT_DIR}/sites/blackroad/dist/"
  local dest="$WEB_ROOT"
  if [[ ! -d "$src" ]]; then
    warn "Site build output not found; skipping static asset sync"
    return
  fi
  if [[ -n "$SUDO_CMD" ]]; then
    $SUDO_CMD mkdir -p "$dest"
  else
    mkdir -p "$dest"
  fi
  if command -v rsync >/dev/null 2>&1; then
    if ! rsync -a --delete "$src" "$dest/" 2>/dev/null; then
      if [[ -n "$SUDO_CMD" ]]; then
        $SUDO_CMD rsync -a --delete "$src" "$dest/"
      else
        err "Failed to sync static assets to $dest"
        return 1
      fi
    fi
  else
    # Fallback to cp when rsync is unavailable.
    if [[ -n "$SUDO_CMD" ]]; then
      $SUDO_CMD rm -rf "$dest"/*
      $SUDO_CMD cp -a "$src". "$dest/"
    else
      rm -rf "$dest"/*
      cp -a "$src". "$dest/"
    fi
  fi
}

step "Sync marketing site assets"
sync_static_assets

run_migrations() {
  if [[ ! -d "${ROOT_DIR}/srv/blackroad-api/migrations" ]]; then
    warn "No migrations directory found; skipping database migrations"
    return
  fi
  if ! command -v sqlite3 >/dev/null 2>&1; then
    warn "sqlite3 not installed; skipping database migrations"
    return
  fi
  node srv/blackroad-api/scripts/migrate.js
}

step "Apply database migrations"
run_migrations

restart_service() {
  local service="$1"
  local action="${2:-restart}"
  if [[ -z "$service" ]]; then
    return
  fi
  if command -v systemctl >/dev/null 2>&1; then
    if systemctl list-units --type=service --all | grep -Fq "${service}.service" || \
       systemctl status "$service" >/dev/null 2>&1; then
      if [[ -n "$SUDO_CMD" ]]; then
        $SUDO_CMD systemctl "$action" "$service"
      else
        systemctl "$action" "$service"
      fi
      return
    fi
  fi
  if command -v service >/dev/null 2>&1; then
    if [[ -n "$SUDO_CMD" ]]; then
      $SUDO_CMD service "$service" "$action"
    else
      service "$service" "$action"
    fi
    return
  fi
  if command -v pm2 >/dev/null 2>&1; then
    if [[ "$action" == "restart" ]]; then
      pm2 restart "$service" >/dev/null 2>&1 || warn "pm2 restart failed for $service"
    fi
    return
  fi
  warn "No service manager available to control $service"
}

step "Restart services"
restart_service "$API_SERVICE"
restart_service "$BRIDGE_SERVICE"
if [[ "${RELOAD_NGINX:-true}" == "true" ]]; then
  restart_service "$NGINX_SERVICE" reload
fi

check_endpoint() {
  local name="$1"
  local url="$2"
  local retries="$3"
  local delay="$4"
  local attempt=1
  while (( attempt <= retries )); do
    if curl -fsS --max-time 5 "$url" >/dev/null; then
      log "$name healthy at $url"
      return 0
    fi
    sleep "$delay"
    ((attempt++))
  done
  err "$name failed health checks at $url"
  return 1
}

step "Verify health"
check_endpoint "Site" "$SITE_HEALTH_URL" "$HEALTH_RETRIES" "$HEALTH_DELAY"
check_endpoint "API" "$API_HEALTH_URL" "$HEALTH_RETRIES" "$HEALTH_DELAY"

if [[ "$LLM_CHECK" == "true" && -f "${ROOT_DIR}/deploy/verify_llm.sh" ]]; then
  step "Verify LLM bridge"
  (cd "$ROOT_DIR" && API_BASE="$API_BASE_FOR_LLM" bash deploy/verify_llm.sh)
fi

step "Deployment complete"
log "Environment: $DEPLOY_ENV"
log "Static assets → $WEB_ROOT"
log "API service → $API_SERVICE"
log "Bridge service → $BRIDGE_SERVICE"
log "Deployment finished successfully"
