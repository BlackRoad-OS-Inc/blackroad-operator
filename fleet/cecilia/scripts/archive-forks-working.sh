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
# Archive upstream forks

OUTPUT="$HOME/archive-report.md"
LOG="$HOME/archive-log.txt"

echo "# Fork Archival Report" > "$OUTPUT"
echo "Started: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

ORGS=("BlackRoad-AI" "BlackRoad-Archive" "BlackRoad-Cloud" "BlackRoad-Education" "BlackRoad-Foundation" "BlackRoad-Gov" "BlackRoad-Hardware" "BlackRoad-Interactive" "BlackRoad-Labs" "BlackRoad-Media" "BlackRoad-OS" "BlackRoad-Security" "BlackRoad-Studio" "BlackRoad-Ventures" "Blackbox-Enterprises")

TOTAL_ARCHIVED=0
TOTAL_FAILED=0

for org in "${ORGS[@]}"; do
  echo "=== Processing $org ===" | tee -a "$LOG"
  echo "## $org" >> "$OUTPUT"
  
  forks=$(gh api "orgs/$org/repos" --paginate -q '.[] | select(.fork == true and .archived == false) | .name' 2>/dev/null)
  
  if [ -z "$forks" ]; then
    echo "No forks to archive" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    continue
  fi
  
  while IFS= read -r repo; do
    [ -z "$repo" ] && continue
    
    echo "Archiving $org/$repo..." | tee -a "$LOG"
    
    if gh api -X PATCH "repos/$org/$repo" -f archived=true >> "$LOG" 2>&1; then
      echo "✅ $repo" >> "$OUTPUT"
      ((TOTAL_ARCHIVED++))
    else
      echo "❌ $repo (failed)" >> "$OUTPUT"
      ((TOTAL_FAILED++))
    fi
  done <<< "$forks"
  
  echo "" >> "$OUTPUT"
done

echo "---" >> "$OUTPUT"
echo "Summary: Archived $TOTAL_ARCHIVED, Failed $TOTAL_FAILED" >> "$OUTPUT"
echo "Completed: $(date)" >> "$OUTPUT"

echo ""
echo "✅ Complete! Archived: $TOTAL_ARCHIVED, Failed: $TOTAL_FAILED"
echo "Report: $OUTPUT"
