#!/bin/bash
# Push BlackRoad proprietary LICENSE to every repo across all orgs
# Uses GitHub Contents API — no cloning needed
# Rate-limit aware: sleeps between batches

set -e

LICENSE_FILE="$HOME/LICENSE"
LICENSE_B64=$(base64 -i "$LICENSE_FILE")
ORGS=(
  BlackRoad-Agents BlackRoad-AI BlackRoad-Alphabet BlackRoad-Anthropic
  BlackRoad-App BlackRoad-Archive BlackRoad-Cloud BlackRoad-Com
  BlackRoad-Data BlackRoad-Dev BlackRoad-Education BlackRoad-Forge
  BlackRoad-Foundation BlackRoad-Google BlackRoad-Gov BlackRoad-Hardware
  BlackRoad-Interactive BlackRoad-Labs BlackRoad-Media BlackRoad-Nvidia
  BlackRoad-OpenAI BlackRoad-OS BlackRoad-OS-Inc BlackRoad-QI
  BlackRoad-Quantum BlackRoad-README BlackRoad-Sandbox BlackRoad-Security
  BlackRoad-Studio BlackRoad-Tech BlackRoad-Ventures BlackRoad-X
  BlackRoad-xAI BlackRoad-XYZ
)

LOGFILE="$HOME/license-push.log"
echo "=== License Push Started $(date -u) ===" > "$LOGFILE"

TOTAL=0
UPDATED=0
CREATED=0
SKIPPED=0
ERRORS=0

for org in "${ORGS[@]}"; do
  echo ""
  echo "=== Processing $org ==="

  # Get all repos (paginated)
  page=1
  repos=()
  while true; do
    batch=$(gh api "/orgs/$org/repos?per_page=100&page=$page&type=all" -q '.[].name' 2>/dev/null)
    if [ -z "$batch" ]; then break; fi
    while IFS= read -r repo; do
      repos+=("$repo")
    done <<< "$batch"
    page=$((page + 1))
    sleep 0.3
  done

  echo "  Found ${#repos[@]} repos"

  for repo in "${repos[@]}"; do
    TOTAL=$((TOTAL + 1))

    # Check if LICENSE already exists and get its SHA
    existing=$(gh api "/repos/$org/$repo/contents/LICENSE" -q '.sha' 2>/dev/null || echo "")

    if [ -n "$existing" ]; then
      # Check if it's already our license (by size — our license is ~60KB)
      size=$(gh api "/repos/$org/$repo/contents/LICENSE" -q '.size // 0' 2>/dev/null || echo "0")
      size=${size//[^0-9]/}
      size=${size:-0}
      if [ "$size" -gt 55000 ] 2>/dev/null && [ "$size" -lt 65000 ] 2>/dev/null; then
        SKIPPED=$((SKIPPED + 1))
        continue
      fi

      # Update existing LICENSE
      result=$(gh api "/repos/$org/$repo/contents/LICENSE" \
        --method PUT \
        -f message="Update to BlackRoad OS proprietary license" \
        -f content="$LICENSE_B64" \
        -f sha="$existing" \
        -q '.commit.sha' 2>&1) || true

      if [[ "$result" == *"error"* ]] || [[ "$result" == *"message"* ]]; then
        echo "  ERR $org/$repo: $result" | head -1
        echo "ERR $org/$repo" >> "$LOGFILE"
        ERRORS=$((ERRORS + 1))
      else
        echo "  UPD $org/$repo"
        echo "UPD $org/$repo" >> "$LOGFILE"
        UPDATED=$((UPDATED + 1))
      fi
    else
      # Create new LICENSE
      result=$(gh api "/repos/$org/$repo/contents/LICENSE" \
        --method PUT \
        -f message="Add BlackRoad OS proprietary license" \
        -f content="$LICENSE_B64" \
        -q '.commit.sha' 2>&1) || true

      if [[ "$result" == *"error"* ]] || [[ "$result" == *"message"* ]]; then
        echo "  ERR $org/$repo: $result" | head -1
        echo "ERR $org/$repo" >> "$LOGFILE"
        ERRORS=$((ERRORS + 1))
      else
        echo "  NEW $org/$repo"
        echo "NEW $org/$repo" >> "$LOGFILE"
        CREATED=$((CREATED + 1))
      fi
    fi

    # Rate limit: sleep every 20 repos
    if [ $((TOTAL % 20)) -eq 0 ]; then
      remaining=$(gh api /rate_limit -q '.rate.remaining' 2>/dev/null || echo "0")
      echo "  [Progress: $TOTAL repos | Rate limit remaining: $remaining]"
      if [ "$remaining" -lt 100 ]; then
        echo "  Rate limit low ($remaining). Sleeping 60s..."
        sleep 60
      fi
      sleep 1
    fi
  done
done

echo ""
echo "========================================="
echo "  LICENSE PUSH COMPLETE"
echo "========================================="
echo "  Total repos:  $TOTAL"
echo "  Updated:      $UPDATED"
echo "  Created:      $CREATED"
echo "  Already ours: $SKIPPED"
echo "  Errors:       $ERRORS"
echo "========================================="
echo "DONE Total=$TOTAL Updated=$UPDATED Created=$CREATED Skipped=$SKIPPED Errors=$ERRORS" >> "$LOGFILE"
