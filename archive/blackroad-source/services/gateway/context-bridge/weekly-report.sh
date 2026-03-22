#!/bin/bash

# Context Bridge - Weekly Report Generator
# Run this every Monday morning

WEEK=$(date +%Y-%m-%d)

echo "📊 Context Bridge Weekly Report - Week of $WEEK"
echo "=================================================="
echo ""

echo "📈 GROWTH METRICS"
echo "-----------------"
echo "Chrome Installs:       [MANUAL: Check Chrome Dashboard]"
echo "Firefox Downloads:     [MANUAL: Check Firefox Stats]"
echo "GitHub Stars:          $(gh api repos/blackroad-os/context-bridge --jq '.stargazers_count')"
echo "GitHub Forks:          $(gh api repos/blackroad-os/context-bridge --jq '.forks_count')"
echo "GitHub Watchers:       $(gh api repos/blackroad-os/context-bridge --jq '.subscribers_count')"
echo ""

echo "🐛 ISSUES & BUGS"
echo "----------------"
echo "Open Issues:           $(gh issue list --state open --repo blackroad-os/context-bridge --json number --jq 'length')"
echo "Open Bugs:             $(gh issue list --label bug --state open --repo blackroad-os/context-bridge --json number --jq 'length')"
echo "Closed This Week:      $(gh issue list --state closed --repo blackroad-os/context-bridge --search "closed:>=$(date -v-7d +%Y-%m-%d)" --json number --jq 'length')"
echo "Opened This Week:      $(gh issue list --repo blackroad-os/context-bridge --search "created:>=$(date -v-7d +%Y-%m-%d)" --json number --jq 'length')"
echo ""

echo "💬 USER FEEDBACK"
echo "----------------"
echo "Chrome Reviews:        [MANUAL: Count reviews this week]"
echo "Firefox Reviews:       [MANUAL: Count reviews this week]"
echo "Support Emails:        [MANUAL: Count emails this week]"
echo "GitHub Discussions:    $(gh api repos/blackroad-os/context-bridge --jq '.has_discussions')"
echo ""

echo "🔀 PULL REQUESTS"
echo "----------------"
echo "Open PRs:              $(gh pr list --state open --repo blackroad-os/context-bridge --json number --jq 'length')"
echo "Merged This Week:      $(gh pr list --state merged --repo blackroad-os/context-bridge --search "merged:>=$(date -v-7d +%Y-%m-%d)" --json number --jq 'length')"
echo ""

echo "🚀 ACTIONS TAKEN THIS WEEK"
echo "---------------------------"
gh issue list --state closed --repo blackroad-os/context-bridge --search "closed:>=$(date -v-7d +%Y-%m-%d)" --json title,number --jq '.[] | "- Fixed: \(.title) (#\(.number))"'
echo ""

echo "📋 NEXT WEEK PRIORITIES"
echo "------------------------"
gh issue list --label "priority: high" --state open --repo blackroad-os/context-bridge --json title,number --jq '.[] | "- [ ] \(.title) (#\(.number))"'
echo ""

echo "🎯 KEY METRICS SUMMARY"
echo "----------------------"
echo "Overall Health:        [Green/Yellow/Red]"
echo "User Satisfaction:     [Rating/5.0]"
echo "Growth Rate:           [+X% week-over-week]"
echo "Bug Resolution Time:   [X days average]"
echo ""

echo "💡 INSIGHTS & RECOMMENDATIONS"
echo "------------------------------"
echo "- [Key insight from user feedback]"
echo "- [Trend observed this week]"
echo "- [Recommended action for next week]"
echo ""

echo "✅ Report complete!"
echo ""
echo "Save this report:"
echo "bash scripts/weekly-report.sh > reports/week-$WEEK.md"
