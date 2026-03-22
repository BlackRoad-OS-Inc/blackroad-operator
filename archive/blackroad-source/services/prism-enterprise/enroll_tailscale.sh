#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${TAILSCALE_AUTH_KEY:-}" ]]; then
  echo "TAILSCALE_AUTH_KEY not set" >&2
  exit 1
fi
tailscale up --auth-key "${TAILSCALE_AUTH_KEY}" --hostname "${TAILSCALE_HOSTNAME:-blackroad-edge}" --ssh
