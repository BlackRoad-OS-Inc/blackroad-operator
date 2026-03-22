#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8787}"
HOST="${HOST:-127.0.0.1}"
BASE_URL="${BASE_URL:-http://${HOST}:${PORT}}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "# Hitting ${BASE_URL}"

echo "# Health"
curl -sf "${BASE_URL}/health" | jq

echo "\n# Evaluate (pass)"
curl -sf -X POST "${BASE_URL}/api/policy/evaluate" \
  -H 'content-type: application/json' \
  --data @"${ROOT}/demo/good_evaluation.json" | jq

echo "\n# Evaluate (fail)"
curl -sf -X POST "${BASE_URL}/api/policy/evaluate" \
  -H 'content-type: application/json' \
  --data @"${ROOT}/demo/fail_evaluation.json" | jq

echo "\n# Remediate"
curl -sf -X POST "${BASE_URL}/api/policy/remediate" \
  -H 'content-type: application/json' \
  --data @"${ROOT}/demo/remediation.json" | jq

echo "\n# Metrics"
curl -sf "${BASE_URL}/api/policy/metrics" | jq
