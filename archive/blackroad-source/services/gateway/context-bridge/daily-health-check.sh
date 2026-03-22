#!/bin/bash

# Context Bridge - Daily Health Check Script
# Run this every morning to catch issues early

echo "🔍 Context Bridge Daily Health Check"
echo "======================================"
echo ""

# Check GitHub Issues
echo "📋 GitHub Issues:"
gh issue list --state "open" --repo blackroad-os/context-bridge | head -10

echo ""

# Check for new bug reports
echo "🐛 New Bugs:"
gh issue list --label "bug" --state "open" --repo blackroad-os/context-bridge

echo ""

# Check GitHub Stars
echo "⭐ GitHub Stars:"
gh api repos/blackroad-os/context-bridge --jq '.stargazers_count'

echo ""

# Check for security alerts (Dependabot)
echo "🔒 Security Alerts:"
gh api repos/blackroad-os/context-bridge/vulnerability-alerts --silent 2>/dev/null && echo "⚠️ ALERTS FOUND!" || echo "✅ No alerts"

echo ""

# Check recent commits
echo "📝 Recent Commits:"
gh api repos/blackroad-os/context-bridge/commits --jq '.[0:3] | .[] | "- \(.commit.message | split("\n")[0]) by \(.commit.author.name)"'

echo ""

# Check pull requests
echo "🔀 Open Pull Requests:"
gh pr list --state "open" --repo blackroad-os/context-bridge | head -5

echo ""

echo "✅ Health check complete!"
echo ""
echo "Next steps:"
echo "1. Check Chrome Web Store dashboard manually"
echo "2. Check Firefox Add-ons dashboard manually"
echo "3. Check support email for new messages"
echo "4. Respond to any negative reviews"
