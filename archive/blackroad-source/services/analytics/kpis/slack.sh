#!/bin/bash
# Shared Slack utilities for all notification scripts
# Source this after common.sh

SLACK_ENV="$HOME/.blackroad/slack-webhook.env"

# Load webhook URLs from env file
slack_load() {
  if [ -f "$SLACK_ENV" ]; then
    source "$SLACK_ENV"
  fi
}

# Check if Slack is configured (not placeholder)
slack_ready() {
  slack_load
  [ -z "${SLACK_WEBHOOK_URL:-}" ] && return 1
  echo "$SLACK_WEBHOOK_URL" | grep -q "YOUR/WEBHOOK/URL" && return 1
  return 0
}

# Post raw JSON payload to a webhook URL
# Usage: slack_post "$payload" ["$webhook_url"]
slack_post() {
  local payload="$1"
  local webhook="${2:-${SLACK_WEBHOOK_URL:-}}"

  [ -z "$webhook" ] && return 1

  local response
  response=$(curl -sf -X POST -H 'Content-type: application/json' \
    --data "$payload" "$webhook" 2>&1)

  [ "$response" = "ok" ]
}

# Post a simple text message
# Usage: slack_text "message" ["$webhook_url"]
slack_text() {
  local msg="$1"
  local webhook="${2:-${SLACK_WEBHOOK_URL:-}}"
  local payload
  payload=$(python3 -c "
import json, sys
print(json.dumps({'text': sys.argv[1]}))
" "$msg")
  slack_post "$payload" "$webhook"
}

# Post a notification with emoji prefix
# Usage: slack_notify ":emoji:" "Title" "Body text" ["$webhook_url"]
slack_notify() {
  local emoji="$1" title="$2" body="$3"
  local webhook="${4:-${SLACK_WEBHOOK_URL:-}}"
  local payload
  payload=$(python3 -c "
import json, sys
emoji, title, body = sys.argv[1], sys.argv[2], sys.argv[3]
blocks = [
    {'type': 'section', 'text': {'type': 'mrkdwn', 'text': f'{emoji} *{title}*\n{body}'}},
    {'type': 'context', 'elements': [{'type': 'mrkdwn', 'text': '$(date -u +%Y-%m-%dT%H:%M:%SZ) | blackroad-os'}]}
]
print(json.dumps({'blocks': blocks}))
" "$emoji" "$title" "$body")
  slack_post "$payload" "$webhook"
}

# Post to alerts channel (falls back to main)
slack_alert() {
  local payload="$1"
  local webhook="${SLACK_ALERTS_WEBHOOK_URL:-${SLACK_WEBHOOK_URL:-}}"
  slack_post "$payload" "$webhook"
}

# Dedup: skip if same alert key posted within N seconds (default 3600)
# Usage: slack_dedup "key" [ttl_seconds]
# Returns 0 if should send, 1 if suppressed
slack_dedup() {
  local key="$1"
  local ttl="${2:-3600}"
  local cache_dir="$HOME/.blackroad/logs"
  mkdir -p "$cache_dir"

  local hash
  hash=$(echo "$key" | md5 2>/dev/null || echo "$key" | md5sum 2>/dev/null | cut -d' ' -f1)
  local cache_file="$cache_dir/slack-dedup-$hash"

  if [ -f "$cache_file" ]; then
    local age=$(( $(date +%s) - $(stat -f %m "$cache_file" 2>/dev/null || stat -c %Y "$cache_file" 2>/dev/null || echo 0) ))
    [ "$age" -lt "$ttl" ] && return 1
  fi

  touch "$cache_file"
  return 0
}
