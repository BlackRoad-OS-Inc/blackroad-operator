#!/usr/bin/env bash
set -euo pipefail

REGISTRY=${1:-ghcr.io/yourorg}
IMAGE_TAG=${2:-latest}

if [[ -z "${ROLLBACK_TARGET:-}" ]]; then
  echo "Set ROLLBACK_TARGET to the previous image digest (e.g. sha256:abc)." >&2
  exit 1
fi

echo "Rolling back to ${REGISTRY}/${ROLLBACK_SERVICE:-svc-template-fastapi}@${ROLLBACK_TARGET}" >&2

if command -v kubectl >/dev/null 2>&1; then
  kubectl set image deployment/${ROLLBACK_SERVICE:-svc-template-fastapi} \
    ${ROLLBACK_SERVICE:-svc-template-fastapi}=${REGISTRY}/${ROLLBACK_SERVICE:-svc-template-fastapi}@${ROLLBACK_TARGET}
fi

if command -v flyctl >/dev/null 2>&1; then
  flyctl releases revert "${ROLLBACK_APP:-svc-template}" --yes
fi

echo "Rollback command submitted. Monitor your deployment to confirm recovery."
