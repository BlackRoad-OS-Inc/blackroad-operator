#!/usr/bin/env bash
# Push BlackRoad proprietary LICENSE to ALL repos across ALL orgs
# Skip repos that already have a BlackRoad proprietary license

LICENSE_B64=$(cat /tmp/br-license-b64.txt)
ORGS="BlackRoad-OS-Inc BlackRoad-OS BlackRoad-Studio BlackRoad-Archive BlackRoad-Interactive BlackRoad-Security BlackRoad-Gov BlackRoad-Education BlackRoad-Hardware BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud BlackRoad-Labs BlackRoad-AI Blackbox-Enterprises"

total=0
updated=0
skipped=0
created=0
failed=0

for org in $ORGS; do
  echo ""
  echo "=== $org ==="
  repos=$(gh repo list "$org" --limit 200 --json name --jq '.[].name' 2>/dev/null)

  for repo in $repos; do
    total=$((total + 1))

    # Check if LICENSE exists and if it's already proprietary
    existing=$(gh api "repos/$org/$repo/contents/LICENSE" 2>/dev/null)
    sha=$(echo "$existing" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha',''))" 2>/dev/null)
    content_preview=$(echo "$existing" | python3 -c "
import sys,json,base64
try:
    c = json.load(sys.stdin).get('content','')
    print(base64.b64decode(c).decode('utf-8','ignore')[:50])
except: print('')
" 2>/dev/null)

    if echo "$content_preview" | grep -qi "BLACKROAD"; then
      skipped=$((skipped + 1))
      continue
    fi

    if [ -n "$sha" ] && [ "$sha" != "" ]; then
      # Update existing non-proprietary license
      gh api -X PUT "repos/$org/$repo/contents/LICENSE" \
        -f message="Replace with BlackRoad OS, Inc. proprietary license" \
        -f content="$LICENSE_B64" \
        -f sha="$sha" \
        --silent 2>/dev/null
      if [ $? -eq 0 ]; then
        updated=$((updated + 1))
        echo "  Updated: $repo"
      else
        failed=$((failed + 1))
        echo "  FAILED: $repo"
      fi
    else
      # Create new LICENSE
      gh api -X PUT "repos/$org/$repo/contents/LICENSE" \
        -f message="Add BlackRoad OS, Inc. proprietary license" \
        -f content="$LICENSE_B64" \
        --silent 2>/dev/null
      if [ $? -eq 0 ]; then
        created=$((created + 1))
        echo "  Created: $repo"
      else
        failed=$((failed + 1))
        echo "  FAILED: $repo"
      fi
    fi
  done
done

echo ""
echo "==============================="
echo "TOTAL REPOS SCANNED: $total"
echo "ALREADY PROPRIETARY: $skipped"
echo "UPDATED TO PROPRIETARY: $updated"
echo "CREATED NEW LICENSE: $created"
echo "FAILED: $failed"
echo "==============================="
