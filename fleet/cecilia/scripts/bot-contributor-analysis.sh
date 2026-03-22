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
# BlackRoad Bot & AI Contributor Analysis
# Analyzes bot/AI contributions across all repos

set -e

REPORT_DIR="$HOME/bot-analysis-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

echo "🤖 BlackRoad Bot & AI Contributor Analysis"
echo "=========================================="
echo ""
echo "Report directory: $REPORT_DIR"
echo ""

# Known bot patterns
BOT_PATTERNS=(
    "bot"
    "dependabot"
    "renovate"
    "github-actions"
    "copilot"
    "claude"
    "ai-"
    "automation"
    "[bot]"
)

# Function to check if username is likely a bot
is_bot() {
    local username="$1"
    local lower_username=$(echo "$username" | tr '[:upper:]' '[:lower:]')

    for pattern in "${BOT_PATTERNS[@]}"; do
        if [[ "$lower_username" == *"$pattern"* ]]; then
            echo "true"
            return
        fi
    done
    echo "false"
}

# Function to analyze a single repo
analyze_repo() {
    local org="$1"
    local repo="$2"

    echo "  Analyzing $org/$repo..."

    # Get contributors
    local contributors=$(gh api "/repos/$org/$repo/contributors" --paginate 2>/dev/null || echo "[]")

    if [ "$contributors" = "[]" ]; then
        return
    fi

    # Parse and categorize
    echo "$contributors" | jq -r '.[] | "\(.login)|\(.contributions)"' | while IFS='|' read -r login contributions; do
        local is_bot_result=$(is_bot "$login")
        echo "$org|$repo|$login|$contributions|$is_bot_result" >> "$REPORT_DIR/raw_contributors.csv"
    done

    # Get recent commits to analyze patterns
    local commits=$(gh api "/repos/$org/$repo/commits?per_page=100" 2>/dev/null || echo "[]")

    echo "$commits" | jq -r '.[] | "\(.commit.author.name)|\(.commit.author.email)|\(.commit.message | split("\n")[0])"' | while IFS='|' read -r name email message; do
        # Check for AI signatures
        local ai_signature="false"
        if echo "$message" | grep -q "Generated with\|Co-Authored-By: Claude\|Co-Authored-By: GitHub Copilot\|AI-generated\|🤖"; then
            ai_signature="true"
        fi
        echo "$org|$repo|$name|$email|$ai_signature|$message" >> "$REPORT_DIR/commit_analysis.csv"
    done
}

# Function to check for Dependabot PRs
check_dependabot_prs() {
    local org="$1"
    local repo="$2"

    echo "  Checking Dependabot PRs in $org/$repo..."

    local prs=$(gh pr list --repo "$org/$repo" --author "app/dependabot" --state all --limit 100 --json number,title,state,createdAt,mergedAt 2>/dev/null || echo "[]")

    if [ "$prs" != "[]" ]; then
        echo "$prs" | jq -r --arg org "$org" --arg repo "$repo" '.[] | "\($org)|\($repo)|\(.number)|\(.title)|\(.state)|\(.createdAt)|\(.mergedAt)"' >> "$REPORT_DIR/dependabot_prs.csv"
    fi
}

# Initialize CSV files
echo "org|repo|contributor|contributions|is_bot" > "$REPORT_DIR/raw_contributors.csv"
echo "org|repo|author_name|author_email|has_ai_signature|message" > "$REPORT_DIR/commit_analysis.csv"
echo "org|repo|pr_number|title|state|created_at|merged_at" > "$REPORT_DIR/dependabot_prs.csv"

# Organizations to analyze
ORGS=(
    "BlackRoad-OS"
    "BlackRoad-AI"
    "BlackRoad-Cloud"
    "BlackRoad-Security"
    "BlackRoad-Media"
    "BlackRoad-Foundation"
)

# Sample repos from each org (top 10 by activity)
echo ""
echo "📊 Analyzing major repositories..."
echo ""

for org in "${ORGS[@]}"; do
    echo "Organization: $org"

    # Get top repos by recent activity
    repos=$(gh repo list "$org" --limit 20 --json name --jq '.[].name' 2>/dev/null || echo "")

    if [ -z "$repos" ]; then
        echo "  No repos found or access denied"
        continue
    fi

    # Sample first 10
    echo "$repos" | head -10 | while read -r repo; do
        analyze_repo "$org" "$repo"
        check_dependabot_prs "$org" "$repo"
        sleep 0.5  # Rate limiting
    done
done

echo ""
echo "📈 Generating summary statistics..."
echo ""

# Generate summary report
{
    echo "# BlackRoad Bot & AI Contributor Analysis Report"
    echo "Generated: $(date)"
    echo ""
    echo "## Summary Statistics"
    echo ""

    # Bot vs Human contributors
    total_contributors=$(tail -n +2 "$REPORT_DIR/raw_contributors.csv" | wc -l | tr -d ' ')
    bot_contributors=$(tail -n +2 "$REPORT_DIR/raw_contributors.csv" | grep "true" | wc -l | tr -d ' ')
    human_contributors=$(tail -n +2 "$REPORT_DIR/raw_contributors.csv" | grep "false" | wc -l | tr -d ' ')

    echo "- Total contributor entries: $total_contributors"
    echo "- Bot contributors: $bot_contributors"
    echo "- Human contributors: $human_contributors"
    echo ""

    # AI-signed commits
    total_commits=$(tail -n +2 "$REPORT_DIR/commit_analysis.csv" | wc -l | tr -d ' ')
    ai_commits=$(tail -n +2 "$REPORT_DIR/commit_analysis.csv" | grep "true" | wc -l | tr -d ' ')

    echo "- Total commits analyzed: $total_commits"
    echo "- Commits with AI signatures: $ai_commits"
    echo ""

    # Dependabot PRs
    total_dep_prs=$(tail -n +2 "$REPORT_DIR/dependabot_prs.csv" | wc -l | tr -d ' ')
    merged_dep_prs=$(tail -n +2 "$REPORT_DIR/dependabot_prs.csv" | grep "MERGED" | wc -l | tr -d ' ')
    open_dep_prs=$(tail -n +2 "$REPORT_DIR/dependabot_prs.csv" | grep "OPEN" | wc -l | tr -d ' ')

    echo "- Total Dependabot PRs: $total_dep_prs"
    echo "- Merged Dependabot PRs: $merged_dep_prs"
    echo "- Open Dependabot PRs: $open_dep_prs"
    echo ""

    echo "## Top Bot Contributors"
    echo ""
    tail -n +2 "$REPORT_DIR/raw_contributors.csv" | grep "true" | sort -t'|' -k4 -rn | head -20 | while IFS='|' read -r org repo login contributions is_bot; do
        echo "- **$login**: $contributions contributions across $org/$repo"
    done
    echo ""

    echo "## Top Human Contributors"
    echo ""
    tail -n +2 "$REPORT_DIR/raw_contributors.csv" | grep "false" | sort -t'|' -k4 -rn | head -20 | while IFS='|' read -r org repo login contributions is_bot; do
        echo "- **$login**: $contributions contributions across $org/$repo"
    done

} > "$REPORT_DIR/SUMMARY.md"

echo "✅ Analysis complete!"
echo ""
echo "📂 Report files:"
echo "   - $REPORT_DIR/SUMMARY.md"
echo "   - $REPORT_DIR/raw_contributors.csv"
echo "   - $REPORT_DIR/commit_analysis.csv"
echo "   - $REPORT_DIR/dependabot_prs.csv"
echo ""

cat "$REPORT_DIR/SUMMARY.md"
