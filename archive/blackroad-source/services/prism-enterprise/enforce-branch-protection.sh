#!/usr/bin/env bash
# Enforce merge-queue friendly branch protection for the current repository.
# Requires: gh CLI (authenticated) and jq.

set -euo pipefail
trap 'rc=$?; echo "[enforce-branch-protection] failed with exit code $rc at line $LINENO: $BASH_COMMAND" >&2' ERR

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI is required." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required." >&2
  exit 1
fi

DEFAULT_CHECKS=(build test lint security sbom policy eval)
IFS=',' read -r -a CHECKS <<< "${REQ_CHECKS:-${DEFAULT_CHECKS[*]}}"

for idx in "${!CHECKS[@]}"; do
  CHECKS[$idx]="$(echo "${CHECKS[$idx]}" | xargs)"
  if [[ -z "${CHECKS[$idx]}" ]]; then
    unset 'CHECKS[idx]'
  fi
done

if [[ ${#CHECKS[@]} -eq 0 ]]; then
  echo "ERROR: At least one required status check must be specified via REQ_CHECKS." >&2
  exit 1
fi

CONTEXTS_JSON=$(printf '"%s",' "${CHECKS[@]}")
CONTEXTS_JSON="[${CONTEXTS_JSON%,}]"

cat <<JSON | gh api -X PUT repos/:owner/:repo/branches/main/protection --input - >/dev/null
{
  "required_status_checks": {
    "strict": true,
    "contexts": ${CONTEXTS_JSON}
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_deletions": false,
  "allow_force_pushes": false
}
JSON

cat <<'JSON' | gh api -X PATCH repos/:owner/:repo --input - >/dev/null
{
  "allow_merge_commit": false,
  "allow_squash_merge": true,
  "allow_rebase_merge": true
}
JSON

if ! gh api repos/:owner/:repo/labels/queue:ready >/dev/null 2>&1; then
  cat <<'JSON' | gh api -X POST repos/:owner/:repo/labels --input - >/dev/null
  {
    "name": "queue:ready",
    "color": "0e8a16",
    "description": "Eligible for merge queue processing"
  }
  JSON
fi

echo "Branch protection updated. Current settings:"
gh api repos/:owner/:repo/branches/main/protection   | jq '{
      linear_history: .required_linear_history.enabled,
      force_push: .allow_force_pushes.enabled,
      deletions: .allow_deletions.enabled,
      admins: .enforce_admins.enabled,
      reviews: .required_pull_request_reviews,
      status_checks: .required_status_checks.contexts
    }'

echo
if gh api repos/:owner/:repo/labels/queue:ready >/dev/null 2>&1; then
  echo "Label 'queue:ready' ensured."
fi
