#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

sanitize_url() {
  printf '%s\n' "$1" | sed -E 's#(https?://)[^/@]+@#\1***@#'
}

check_cmd() {
  command -v "$1" >/dev/null 2>&1
}

echo "BlackRoad platform check"
echo "repo: $ROOT"
echo

origin_url="$(git remote get-url origin 2>/dev/null || true)"
gitea_url="$(git remote get-url gitea 2>/dev/null || true)"

if [ -z "$origin_url" ]; then
  echo "missing: git remote 'origin'"
  exit 1
fi

if [ -z "$gitea_url" ]; then
  echo "missing: git remote 'gitea'"
  exit 1
fi

echo "origin: $(sanitize_url "$origin_url")"
echo "gitea:  $(sanitize_url "$gitea_url")"
echo

if ! curl -fsS https://git.blackroad.io/api/v1/version >/dev/null; then
  echo "failed: Gitea is unreachable at https://git.blackroad.io"
  exit 1
fi
echo "ok: Gitea reachable"

if ! check_cmd gh || ! gh auth status >/dev/null 2>&1; then
  echo "failed: GitHub CLI is not authenticated"
  exit 1
fi
echo "ok: GitHub CLI authenticated"

if ! check_cmd vercel || ! vercel whoami >/dev/null 2>&1; then
  echo "failed: Vercel CLI is not authenticated"
  exit 1
fi
echo "ok: Vercel CLI authenticated"

if ! check_cmd wrangler || ! wrangler whoami >/dev/null 2>&1; then
  echo "failed: Wrangler is not authenticated"
  exit 1
fi
echo "ok: Cloudflare Wrangler authenticated"

for secret in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do
  if [ -n "${!secret:-}" ]; then
    echo "ok: env $secret present"
  else
    echo "warn: env $secret not set locally"
  fi
done
