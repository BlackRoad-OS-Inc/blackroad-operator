#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8787}"
HOST="${HOST:-127.0.0.1}"
BASE_URL="${BASE_URL:-http://${HOST}:${PORT}}"
NODE="${NODE:-node}"

TMPDIR="$(mktemp -d)"
cleanup() {
  local code=$?
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  rm -rf "${TMPDIR}"
  trap - EXIT
  exit $code
}
trap cleanup EXIT

${NODE} "${ROOT}/server.js" >"${TMPDIR}/server.log" 2>&1 &
SERVER_PID=$!

for _ in {1..40}; do
  if curl -sf "${BASE_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

curl -sf "${BASE_URL}/health" >/dev/null

pass_result=$(curl -sf -X POST "${BASE_URL}/api/policy/evaluate" \
  -H 'content-type: application/json' \
  --data @"${ROOT}/demo/good_evaluation.json" | jq -r '.result')
if [[ "${pass_result}" != "pass" ]]; then
  echo "expected pass result, got ${pass_result}" >&2
  exit 1
fi

fail_result=$(curl -sf -X POST "${BASE_URL}/api/policy/evaluate" \
  -H 'content-type: application/json' \
  --data @"${ROOT}/demo/fail_evaluation.json" | jq -r '.result')
if [[ "${fail_result}" != "fail" ]]; then
  echo "expected fail result, got ${fail_result}" >&2
  exit 1
fi

remediation=$(curl -sf -X POST "${BASE_URL}/api/policy/remediate" \
  -H 'content-type: application/json' \
  --data @"${ROOT}/demo/remediation.json")
remediated_copy=$(jq -r '.remediated' <<<"${remediation}")
disclosure_flag=$(jq -r '.disclosureAdded' <<<"${remediation}")
if [[ "${disclosure_flag}" != "true" ]]; then
  echo "expected disclosure to be added" >&2
  exit 1
fi
if [[ "${remediated_copy}" == *"Guaranteed"* ]]; then
  echo "banned phrase still present" >&2
  exit 1
fi

openssl genrsa -out "${TMPDIR}/signing_key.pem" 2048 >/dev/null 2>&1
openssl rsa -in "${TMPDIR}/signing_key.pem" -pubout -out "${TMPDIR}/public.pem" >/dev/null 2>&1
printf "policy bundle" >"${TMPDIR}/bundle.txt"
hash_value=$(sha256sum "${TMPDIR}/bundle.txt" | awk '{print $1}')
signature=$(printf "%s" "${hash_value}" | openssl dgst -sha256 -sign "${TMPDIR}/signing_key.pem" | openssl base64 -A)
public_key=$(cat "${TMPDIR}/public.pem")

bundle_payload=$(jq -n \
  --arg hash "${hash_value}" \
  --arg signature "${signature}" \
  --arg publicKey "${public_key}" \
  '{version:"ci-smoke", ruleCount:3, hash:$hash, signature:$signature, publicKey:$publicKey}')

bundle_status=$(curl -sf -X POST "${BASE_URL}/api/policy/bundle" \
  -H 'content-type: application/json' \
  --data "${bundle_payload}" | jq -r '.status')
if [[ "${bundle_status}" != "ok" ]]; then
  echo "bundle verification failed" >&2
  exit 1
fi

metrics=$(curl -sf "${BASE_URL}/api/policy/metrics")
jq -e '.policy.pass == 1 and .policy.warn == 0 and .policy.fail == 1' <<<"${metrics}" >/dev/null
jq -e '.attest.ok >= 0 and .attest.fail >= 0' <<<"${metrics}" >/dev/null
jq -e '.remediation.total >= 1' <<<"${metrics}" >/dev/null
jq -e '.lastBundle.status == "ok"' <<<"${metrics}" >/dev/null

if [[ ! -s "${ROOT}/audit.ndjson" ]]; then
  echo "audit ledger missing" >&2
  exit 1
fi

python3 "${ROOT}/audit_ledger.py" --path "${ROOT}/audit.ndjson" >/dev/null

echo "SMOKE OK"
