#!/bin/bash
# Push BlackRoad proprietary LICENSE to remaining orgs
# Rate-limit aware: waits for full reset when limit is hit

LICENSE_FILE="$HOME/LICENSE"
LICENSE_B64=$(base64 -i "$LICENSE_FILE")

# Only orgs that still need processing
ORGS=(
  BlackRoad-OS
  BlackRoad-OS-Inc
  BlackRoad-QI BlackRoad-Quantum BlackRoad-README BlackRoad-Sandbox
  BlackRoad-Security BlackRoad-Studio BlackRoad-Tech BlackRoad-Ventures
  BlackRoad-X BlackRoad-xAI BlackRoad-XYZ
)

LOGFILE="$HOME/license-push.log"
echo "=== License Push Remaining Started $(date -u) ===" >> "$LOGFILE"

TOTAL=0
UPDATED=0
CREATED=0
SKIPPED=0
ERRORS=0

wait_for_rate_limit() {
  while true; do
    remaining=$(gh api /rate_limit -q '.rate.remaining' 2>/dev/null || echo "0")
    remaining=${remaining//[^0-9]/}
    remaining=${remaining:-0}
    if [ "$remaining" -gt 200 ]; then
      echo "  Rate limit OK: $remaining remaining"
      return
    fi
    reset_at=$(gh api /rate_limit -q '.rate.reset' 2>/dev/null || echo "0")
    reset_at=${reset_at//[^0-9]/}
    now=$(date +%s)
    wait_secs=$(( reset_at - now + 5 ))
    if [ "$wait_secs" -lt 5 ]; then wait_secs=65; fi
    if [ "$wait_secs" -gt 3700 ]; then wait_secs=3700; fi
    echo "  Rate limit exhausted ($remaining). Waiting ${wait_secs}s for reset..."
    sleep "$wait_secs"
  done
}

for org in "${ORGS[@]}"; do
  echo ""
  echo "=== Processing $org ==="
  wait_for_rate_limit

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

    # Check rate limit every 15 repos
    if [ $((TOTAL % 15)) -eq 0 ]; then
      wait_for_rate_limit
    fi

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

      if [[ "$result" == *"rate limit"* ]]; then
        echo "  RATE LIMITED on $org/$repo — waiting..."
        wait_for_rate_limit
        # Retry
        result=$(gh api "/repos/$org/$repo/contents/LICENSE" \
          --method PUT \
          -f message="Update to BlackRoad OS proprietary license" \
          -f content="$LICENSE_B64" \
          -f sha="$existing" \
          -q '.commit.sha' 2>&1) || true
      fi

      if [[ "$result" == *"error"* ]] || [[ "$result" == *"message"* ]] || [[ "$result" == *"API rate"* ]]; then
        echo "  ERR $org/$repo" | head -1
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

      if [[ "$result" == *"rate limit"* ]]; then
        echo "  RATE LIMITED on $org/$repo — waiting..."
        wait_for_rate_limit
        result=$(gh api "/repos/$org/$repo/contents/LICENSE" \
          --method PUT \
          -f message="Add BlackRoad OS proprietary license" \
          -f content="$LICENSE_B64" \
          -q '.commit.sha' 2>&1) || true
      fi

      if [[ "$result" == *"error"* ]] || [[ "$result" == *"message"* ]] || [[ "$result" == *"API rate"* ]]; then
        echo "  ERR $org/$repo" | head -1
        echo "ERR $org/$repo" >> "$LOGFILE"
        ERRORS=$((ERRORS + 1))
      else
        echo "  NEW $org/$repo"
        echo "NEW $org/$repo" >> "$LOGFILE"
        CREATED=$((CREATED + 1))
      fi
    fi

    sleep 0.5
  done
done

echo ""
echo "========================================="
echo "  LICENSE PUSH COMPLETE"
echo "========================================="
echo "  Total repos:  $TOTAL"
echo "  Updated:      $UPDATED"
echo "  Created:      $CREATED"
echo "  Skipped:      $SKIPPED"
echo "  Errors:       $ERRORS"
echo "========================================="
echo "DONE: total=$TOTAL updated=$UPDATED created=$CREATED skipped=$SKIPPED errors=$ERRORS" >> "$LOGFILE"

# Announce completion
bash ~/blackroad-operator/scripts/memory/memory-collaboration.sh announce "LICENSE PUSH COMPLETE: $TOTAL repos processed, $UPDATED updated, $CREATED created, $SKIPPED skipped (already had license), $ERRORS errors. Remaining orgs: BlackRoad-OS through BlackRoad-XYZ." 2>/dev/null
bash ~/blackroad-operator/scripts/memory/memory-system.sh log deploy license-push "Pushed proprietary license to remaining 13 orgs: $TOTAL repos, $UPDATED updated, $CREATED new, $SKIPPED skipped, $ERRORS errors" 2>/dev/null
