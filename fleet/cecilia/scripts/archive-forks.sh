#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
OUTPUT="$HOME/archive-report.md"
LOG="$HOME/archive-log.txt"

echo "# Fork Archival Report" > "$OUTPUT"
echo "Started: $(date)" >> "$OUTPUT"

ORGS=("BlackRoad-AI" "BlackRoad-Cloud" "BlackRoad-Education" "BlackRoad-Foundation" "BlackRoad-Gov" "BlackRoad-Hardware" "BlackRoad-Interactive" "BlackRoad-Labs" "BlackRoad-Media" "BlackRoad-OS" "BlackRoad-Security" "BlackRoad-Studio" "BlackRoad-Ventures" "Blackbox-Enterprises")

TOTAL_ARCHIVED=0
TOTAL_FAILED=0

for org in "${ORGS[@]}"; do
  echo "=== $org ===" | tee -a "$LOG"
  echo "## $org" >> "$OUTPUT"
  
  forks=$(gh api "orgs/$org/repos" --paginate -q '.[] | select(.fork == true and .archived == false) | .name' 2>/dev/null)
  
  if [ -z "$forks" ]; then
    echo "No forks" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    continue
  fi
  
  while read -r repo; do
    [ -z "$repo" ] && continue
    echo "Archiving $org/$repo..."
    
    gh api -X PATCH "repos/$org/$repo" -f archived=true > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "✅ $repo" >> "$OUTPUT"
      TOTAL_ARCHIVED=$((TOTAL_ARCHIVED + 1))
    else
      echo "❌ $repo" >> "$OUTPUT"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
  done <<< "$forks"
  echo "" >> "$OUTPUT"
done

echo "---" >> "$OUTPUT"
echo "Archived: $TOTAL_ARCHIVED, Failed: $TOTAL_FAILED" >> "$OUTPUT"
echo "Completed: $(date)" >> "$OUTPUT"
echo ""
echo "✅ Complete! Archived: $TOTAL_ARCHIVED, Failed: $TOTAL_FAILED"
