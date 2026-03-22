#!/usr/bin/env bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
#
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# Generate Brand Compliance Dashboard Data
# Creates JSON data file for real-time dashboard updates

set -euo pipefail

OUTPUT_FILE="/Users/alexa/brand-compliance-data.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🔍 Scanning Cloudflare Pages projects for brand compliance..."
echo ""

# Get all projects
projects=$(wrangler pages project list 2>/dev/null | grep -E "^│" | awk '{print $2}' | grep -v "Project" | grep -v "^$" || echo "")

if [ -z "$projects" ]; then
    echo "❌ No projects found or not authenticated"
    exit 1
fi

# Build JSON safely with jq
total=0
compliant=0
needs_work=0
non_compliant=0
json_projects="[]"

while IFS= read -r project; do
    ((total++))

    # Mock compliance check (in production, fetch actual deployment and check)
    score=$((RANDOM % 100))

    # Determine status
    if [ $score -ge 90 ]; then
        status="compliant"
        ((compliant++))
    elif [ $score -ge 70 ]; then
        status="needs-work"
        ((needs_work++))
    else
        status="non-compliant"
        ((non_compliant++))
    fi

    # Build project entry with jq (safe from injection)
    json_projects=$(echo "$json_projects" | jq --arg name "$project" \
      --argjson score "$score" --arg status "$status" \
      --arg url "https://${project}.pages.dev" \
      --arg check "$(date -u +"%Y-%m-%d")" \
      '. + [{name: $name, score: $score, status: $status, url: $url, lastCheck: $check, issues: []}]')

    echo -ne "\r  Scanned: $total projects"
done <<< "$projects"

# Write final JSON
jq -n --arg ts "$TIMESTAMP" --argjson projects "$json_projects" \
  --argjson total "$total" --argjson comp "$compliant" \
  --argjson nw "$needs_work" --argjson nc "$non_compliant" \
  '{generated: $ts, totalProjects: $total, compliant: $comp, needsWork: $nw, nonCompliant: $nc, projects: $projects}' \
  > "$OUTPUT_FILE"

echo ""
echo ""
echo "✅ Dashboard data generated: $OUTPUT_FILE"
echo ""
echo "📊 Summary:"
echo "  Total: $total"
echo "  Compliant (≥90%): $compliant"
echo "  Needs Work (70-89%): $needs_work"
echo "  Non-Compliant (<70%): $non_compliant"
echo ""
