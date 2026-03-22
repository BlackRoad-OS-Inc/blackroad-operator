#!/usr/bin/env bash
set -euo pipefail
ENV=${1:-staging}
echo "==> Preflight: read-only app health"
curl -fsS "https://${ENV}.api.yourdomain/health" -o /dev/null

echo "==> Run migrations (Alembic example)"
alembic upgrade head

echo "==> Postflight: smoke"
curl -fsS "https://${ENV}.api.yourdomain/health" -o /dev/null
