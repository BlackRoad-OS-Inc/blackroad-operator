#!/bin/bash

# Audit custom domains across Cloudflare Pages projects.
# Read-only: does not modify anything.

set -euo pipefail

ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable not set"
  echo "Set it, then re-run:"
  echo "  export CLOUDFLARE_API_TOKEN='{{CLOUDFLARE_API_TOKEN}}'"
  exit 1
fi

API_TOKEN="$CLOUDFLARE_API_TOKEN"

api() {
  local method="$1"; shift
  local url="$1"; shift

  curl -sS -X "$method" "$url" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    "$@"
}

PROJECTS_JSON=$(api GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects?per_page=100")

if ! echo "$PROJECTS_JSON" | jq -e '.success == true' >/dev/null; then
  echo "❌ Failed to list Pages projects"
  echo "$PROJECTS_JSON" | jq -r '.errors[]?.message // empty'
  exit 1
fi

# Desired end-state mapping (domain -> project)
# Adjust this list if you want different routing.
DESIRED=(
  "blackroad.io:blackroad-os-web"
  "docs.blackroad.io:blackroad-os-docs"
  "brand.blackroad.io:blackroad-os-brand"
  "prism.blackroad.io:blackroad-os-prism"
  "tools.blackroad.io:blackroad-tools"
  "lucidia.earth:lucidia-platform"
  "math.lucidia.earth:lucidia-math"
  "core.lucidia.earth:lucidia-core"
)

# Build an index of current domain ownership by scanning all projects' domains.
# Output: DOMAIN\tPROJECT\tSTATUS
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

echo "$PROJECTS_JSON" | jq -r '.result[] | .name' | while read -r project; do
  DOMAINS_JSON=$(api GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$project/domains")

  if ! echo "$DOMAINS_JSON" | jq -e '.success == true' >/dev/null; then
    # Some projects may not allow domain listing; note and continue.
    echo -e "<error>\t$project\t$(echo "$DOMAINS_JSON" | jq -r '.errors[0].message // "unknown"')" >> "$TMP"
    continue
  fi

  echo "$DOMAINS_JSON" | jq -r --arg p "$project" '.result[]? | [(.name // ""), $p, (.status // "") ] | @tsv' >> "$TMP"
done


echo "════════════════════════════════════════"
echo "Cloudflare Pages Domain Audit"
echo "Account: $ACCOUNT_ID"
echo "════════════════════════════════════════"
echo

echo "Desired routing:"
for item in "${DESIRED[@]}"; do
  IFS=':' read -r domain desired_project <<< "$item"
  echo "  - $domain -> $desired_project"
done

echo

echo "Current attachments (for desired domains only):"
for item in "${DESIRED[@]}"; do
  IFS=':' read -r domain desired_project <<< "$item"

  matches=$(awk -F '\t' -v d="$domain" '$1==d {print $0}' "$TMP" || true)

  if [ -z "$matches" ]; then
    echo "  - $domain: (not attached to any Pages project)  [WILL ADD -> $desired_project]"
    continue
  fi

  while IFS=$'\t' read -r found_domain found_project found_status; do
    if [ "$found_project" = "$desired_project" ]; then
      echo "  - $domain: OK (already on $found_project) [status=$found_status]"
    else
      echo "  - $domain: CONFLICT (currently on $found_project, desired $desired_project) [status=$found_status]"
    fi
  done <<< "$matches"
done

echo

echo "Notes:"
echo "- This script is read-only. It does not add/remove domains."
echo "- If you want, I can generate and run a safe 'fix' script next that:"
echo "  1) removes a conflicting domain from the wrong project"
echo "  2) adds it to the desired project"
echo "  ...but only with your explicit confirmation."
