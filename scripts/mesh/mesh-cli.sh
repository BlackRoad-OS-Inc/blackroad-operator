#!/bin/bash
# BlackRoad Service Mesh CLI
# Usage: mesh-cli.sh <command> [args]
#   status          — health check all services
#   deploy <repo>   — trigger deploy pipeline via RoundTrip
#   broadcast <ch> <msg> — post to RoundTrip channel
#   ask <agent> <q> — ask a RoundTrip agent
#   events          — show recent mesh events

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
BLUE='\033[38;5;69m'
DIM='\033[2m'
RESET='\033[0m'

MESH_SECRET="${MESH_SECRET:-blackroad-mesh-2026}"
ROUNDTRIP_URL="${ROUNDTRIP_URL:-https://roundtrip.blackroad.io}"
CHAT_URL="${CHAT_URL:-https://chat.blackroad.io}"

# HMAC signing
sign_request() {
  local method="$1" path="$2" body="$3" timestamp="$4"
  printf "%s\n%s\n%s\n%s" "$method" "$path" "$timestamp" "$body" | \
    openssl dgst -sha256 -hmac "$MESH_SECRET" -binary | base64
}

mesh_request() {
  local url="$1" method="$2" path="$3" body="$4"
  local timestamp
  timestamp=$(python3 -c "import time; print(int(time.time() * 1000))")
  local sig
  sig=$(sign_request "$method" "$path" "$body" "$timestamp")

  if [ "$method" = "GET" ]; then
    curl -s "${url}${path}" \
      -H "X-Mesh-Signature: $sig" \
      -H "X-Mesh-Timestamp: $timestamp" \
      -H "X-Mesh-Service: cli"
  else
    curl -s "${url}${path}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -H "X-Mesh-Signature: $sig" \
      -H "X-Mesh-Timestamp: $timestamp" \
      -H "X-Mesh-Service: cli" \
      -d "$body"
  fi
}

cmd_status() {
  echo -e "${PINK}BlackRoad Service Mesh${RESET}"
  echo -e "${DIM}Checking all services...${RESET}"
  echo ""

  local services=("chat.blackroad.io" "roundtrip.blackroad.io" "git.blackroad.io" "search.blackroad.io" "auth.blackroad.io" "prism.blackroad.io" "ollama.gematria.blackroad.io")
  local names=("Chat" "RoundTrip" "RoadCode" "RoadSearch" "Auth" "Prism" "Ollama")

  for i in "${!services[@]}"; do
    local svc="${services[$i]}"
    local name="${names[$i]}"
    local health_path="/api/health"
    [ "$name" = "Ollama" ] && health_path="/api/tags"
    [ "$name" = "RoadCode" ] && health_path="/"

    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://${svc}${health_path}" 2>/dev/null || echo "000")

    if [ "$status" = "200" ]; then
      echo -e "  ${GREEN}UP${RESET}  ${name} (${svc})"
    elif [ "$status" = "000" ]; then
      echo -e "  ${RED}DOWN${RESET} ${name} (${svc})"
    else
      echo -e "  ${BLUE}${status}${RESET}  ${name} (${svc})"
    fi
  done
}

cmd_deploy() {
  local repo="$1"
  local target="${2:-all}"
  if [ -z "$repo" ]; then
    echo "Usage: mesh-cli.sh deploy <repo> [target]"
    exit 1
  fi

  echo -e "${PINK}Deploy Pipeline${RESET}"
  echo -e "  Repo: ${GREEN}${repo}${RESET}"
  echo -e "  Target: ${BLUE}${target}${RESET}"
  echo -e "  Routing through RoundTrip (5 agents)..."
  echo ""

  local body
  body=$(printf '{"repo":"%s","target":"%s","strategy":"rolling"}' "$repo" "$target")
  local result
  result=$(mesh_request "$ROUNDTRIP_URL" "POST" "/api/mesh/deploy" "$body")

  echo "$result" | python3 -m json.tool 2>/dev/null || echo "$result"
}

cmd_broadcast() {
  local channel="$1"
  local message="${*:2}"
  if [ -z "$channel" ] || [ -z "$message" ]; then
    echo "Usage: mesh-cli.sh broadcast <channel> <message>"
    exit 1
  fi

  local body
  body=$(printf '{"type":"broadcast","data":{"channel":"%s","message":"%s"}}' "$channel" "$message")
  local result
  result=$(mesh_request "$ROUNDTRIP_URL" "POST" "/api/mesh/event" "$body")
  echo "$result" | python3 -m json.tool 2>/dev/null || echo "$result"
}

cmd_ask() {
  local agent="$1"
  local question="${*:2}"
  if [ -z "$agent" ] || [ -z "$question" ]; then
    echo "Usage: mesh-cli.sh ask <agent> <question>"
    exit 1
  fi

  local body
  body=$(printf '{"type":"query","data":{"agent":"%s","question":"%s"}}' "$agent" "$question")
  local result
  result=$(mesh_request "$ROUNDTRIP_URL" "POST" "/api/mesh/event" "$body")
  echo "$result" | python3 -m json.tool 2>/dev/null || echo "$result"
}

cmd_events() {
  local result
  result=$(curl -s "${ROUNDTRIP_URL}/api/mesh/events?limit=20")
  echo -e "${PINK}Recent Mesh Events${RESET}"
  echo "$result" | python3 -m json.tool 2>/dev/null || echo "$result"
}

case "${1:-help}" in
  status)    cmd_status ;;
  deploy)    cmd_deploy "$2" "$3" ;;
  broadcast) shift; cmd_broadcast "$@" ;;
  ask)       shift; cmd_ask "$@" ;;
  events)    cmd_events ;;
  *)
    echo -e "${PINK}BlackRoad Service Mesh CLI${RESET}"
    echo ""
    echo "Commands:"
    echo "  status              Health check all services"
    echo "  deploy <repo> [tgt] Deploy via RoundTrip agent pipeline"
    echo "  broadcast <ch> <msg> Post to RoundTrip channel"
    echo "  ask <agent> <q>     Ask a RoundTrip agent"
    echo "  events              Show recent mesh events"
    ;;
esac
