#!/usr/bin/env bash
# Play a PR's diff as LEDs; see CI status for celebration.
set -euo pipefail
: "${OWNER:?Set OWNER}"; : "${REPO:?Set REPO}"; : "${PR:?Set PR}"
TOKEN="${GH_PAT:-${GH_TOKEN:-${GITHUB_TOKEN:-}}}"
[ -n "$TOKEN" ] || { echo "Need GH_TOKEN/GH_PAT"; exit 2; }
BASE="${LED_BASE:-http://127.0.0.1:4000}"
KEY="${LED_KEY:-}"
DEVICE_ID="${LED_DEVICE_ID:-pi-01}"

# Helper function to call the GitHub API with authentication using $TOKEN
api(){ curl -fsSL -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" "$@"; }
jhdr=(-H 'content-type: application/json'); [ -n "$KEY" ] && jhdr+=(-H "X-BlackRoad-Key: $KEY")

# Sum additions/deletions (paginate)
page=1 A=0 D=0
while :; do
  resp="$(api "https://api.github.com/repos/$OWNER/$REPO/pulls/$PR/files?per_page=100&page=$page")"
  cnt="$(echo "$resp" | jq 'length')"; [ "$cnt" -eq 0 ] && break
  A=$(( A + $(echo "$resp" | jq '[.[]|.additions]|add // 0') ))
  D=$(( D + $(echo "$resp" | jq '[.[]|.deletions]|add // 0') ))
  page=$(( page + 1 ))
done

# Head SHA & combined status
sha="$(api "https://api.github.com/repos/$OWNER/$REPO/pulls/$PR" | jq -r '.head.sha')"
STATE="$(api "https://api.github.com/repos/$OWNER/$REPO/commits/$sha/status" | jq -r '.state')"

# Helpers

# progress <percent>
#   Sends a progress update to the LED device via the API.
#   Arguments:
#     $1 - Progress percentage (integer, 0-100).
#   Side effects:
#     Sends a POST request to $BASE/api/devices/$DEVICE_ID/command with type "led.progress".
#     Sets the progress bar on the LED device for 8 seconds.
progress(){ curl -sS "${jhdr[@]}" -d "{\"type\":\"led.progress\",\"pct\":$1,\"ttl_s\":8}" \
  "$BASE/api/devices/$DEVICE_ID/command" >/dev/null || true; }

# emo <emotion> <ttl_s>
#   Sets the LED device to display a given emotion/state via the API.
#   Arguments:
#     $1 - Emotion/state name (string, e.g. "busy", "error", "thinking").
#     $2 - Time to live in seconds (integer).
#   Side effects:
#     Sends a POST request to $BASE/api/devices/$DEVICE_ID/command with type "led.emotion".
#     Sets the LED device to the specified emotion for the given duration.
emo(){ curl -sS "${jhdr[@]}" -d "{\"type\":\"led.emotion\",\"emotion\":\"$1\",\"ttl_s\":$2}" \
  "$BASE/api/devices/$DEVICE_ID/command" >/dev/null || true; }

emo busy 6
for i in $(seq 0 8); do progress $(( i*12 )); sleep 0.22; done
if [ "$A" -gt 0 ]; then
  if [ "$A" -gt 4000 ]; then
    limit=4000
  else
    limit=$A
  fi
  steps=$(( limit / 8 + 1 ))
else
  steps=4
fi
for _ in $(seq 2 $((steps>6?6:steps))); do progress 15; sleep 0.15; progress 60; sleep 0.15; progress 90; sleep 0.15; done
[ "$D" -gt 0 ] && emo error 4
[ "$STATE" = "success" ] && curl -sS "${jhdr[@]}" -d '{"type":"led.celebrate","ttl_s":12}' \
  "$BASE/api/devices/$DEVICE_ID/command" >/dev/null || emo thinking 6
