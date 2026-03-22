#!/usr/bin/env bash
# Set up deployment webhooks
set -euo pipefail

PROJECT_DIR="${1:-.}"
WEBHOOK_URL="${2}"

cd "$PROJECT_DIR"

if [[ -z "$WEBHOOK_URL" ]]; then
  echo "Usage: memory-webhooks.sh <project-dir> <webhook-url>"
  echo ""
  echo "Example webhook URLs:"
  echo "  - Discord: https://discord.com/api/webhooks/..."
  echo "  - Slack: https://hooks.slack.com/services/..."
  echo "  - Custom: https://your-server.com/webhook"
  exit 1
fi

# Create post-commit hook with webhook
mkdir -p .git/hooks
cat > .git/hooks/post-commit <<HOOK
#!/bin/bash
# Auto-push and webhook notification

# Push to GitHub
git push 2>/dev/null || true

# Send webhook notification
COMMIT_MSG=\$(git log -1 --format="%s")
COMMIT_SHA=\$(git log -1 --format="%h")
PROJECT=\$(basename \$(pwd))

curl -X POST "$WEBHOOK_URL" \\
  -H "Content-Type: application/json" \\
  -d "{
    \"content\": \"✅ Deployed: **\$PROJECT**\",
    \"embeds\": [{
      \"title\": \"\$COMMIT_MSG\",
      \"description\": \"Commit: \$COMMIT_SHA\",
      \"color\": 5763719
    }]
  }" 2>/dev/null || true
HOOK

chmod +x .git/hooks/post-commit
echo "✅ Webhook configured for $(basename $PROJECT_DIR)"
