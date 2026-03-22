#!/bin/bash
# KV → Redis Migration — Sovereignty Migration
# Exports all Cloudflare KV namespace data and imports to Alice's Redis
# Usage: ./migrate-kv-to-redis.sh [--dry-run] [--namespace <name>]
set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

ALICE="pi@192.168.4.49"
EXPORT_DIR="$HOME/.blackroad/kv-exports"
DRY_RUN=false
SINGLE_NS=""
TOTAL_KEYS=0
TOTAL_MIGRATED=0
TOTAL_FAILED=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --namespace) SINGLE_NS="$2"; shift 2;;
    -h|--help)
      echo -e "${PINK}KV → Redis Migration${RESET}"
      echo ""
      echo "Usage: ./migrate-kv-to-redis.sh [--dry-run] [--namespace <name>]"
      echo ""
      echo "Options:"
      echo "  --dry-run              Show what would be migrated without writing"
      echo "  --namespace <name>     Migrate only the named namespace"
      echo "  -h, --help             Show this help"
      exit 0
      ;;
    *) echo -e "${RED}Unknown option: $1${RESET}"; exit 1;;
  esac
done

mkdir -p "$EXPORT_DIR"
FAILED_LOG="${EXPORT_DIR}/failed-keys.log"
> "$FAILED_LOG"

echo -e "${PINK}KV → Redis Migration${RESET}"
echo -e "${BLUE}Target: ${ALICE} redis-cli (port 6379)${RESET}"
if [[ "$DRY_RUN" == true ]]; then
  echo -e "${AMBER}[DRY RUN] No data will be written to Redis${RESET}"
fi
echo ""

# Verify Redis is reachable
if [[ "$DRY_RUN" == false ]]; then
  echo -n "Checking Redis on Alice... "
  if ssh -o ConnectTimeout=5 "$ALICE" "redis-cli ping" 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}connected${RESET}"
  else
    echo -e "${RED}FAILED${RESET}"
    echo "Cannot reach Redis on Alice. Check SSH and Redis status."
    exit 1
  fi
  echo ""
fi

# Get all KV namespaces
echo -e "${BLUE}Discovering KV namespaces...${RESET}"
NAMESPACES=$(npx wrangler kv namespace list 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
for ns in data:
    print(f\"{ns['id']}|{ns['title']}\")
" 2>/dev/null)

NS_COUNT=$(echo "$NAMESPACES" | grep -c '|' 2>/dev/null || true)
NS_COUNT=$(echo "$NS_COUNT" | tr -d '[:space:]')
[[ -z "$NS_COUNT" ]] && NS_COUNT=0
echo -e "Found ${GREEN}${NS_COUNT}${RESET} namespaces"
echo ""

NS_MIGRATED=0

while IFS='|' read -r ns_id ns_title; do
  [[ -z "$ns_id" ]] && continue
  [[ -n "$SINGLE_NS" && "$ns_title" != "$SINGLE_NS" ]] && continue

  # Sanitize title for Redis key prefix
  prefix=$(echo "$ns_title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]/_/g')

  echo -e "${VIOLET}[${ns_title}]${RESET} (${ns_id:0:12}...)"

  # List keys in this namespace
  keys=$(npx wrangler kv key list --namespace-id="$ns_id" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for k in data:
        print(k['name'])
except:
    pass
" 2>/dev/null)

  key_count=$(echo "$keys" | grep -c . 2>/dev/null || true)
  key_count=$(echo "$key_count" | tr -d '[:space:]')
  [[ -z "$key_count" ]] && key_count=0

  if [[ "$key_count" -eq 0 ]]; then
    echo -e "  ${AMBER}Empty namespace, skipping${RESET}"
    echo ""
    continue
  fi

  echo -e "  Keys: ${key_count}"

  # Export each key-value pair
  redis_file="${EXPORT_DIR}/${prefix}.redis"
  > "$redis_file"
  ns_migrated=0
  ns_failed=0

  while IFS= read -r key; do
    [[ -z "$key" ]] && continue

    # Get value (use --text to avoid binary encoding issues)
    if value=$(npx wrangler kv key get --namespace-id="$ns_id" "$key" --text 2>/dev/null); then
      redis_key="kv:${prefix}:${key}"

      if [[ "$DRY_RUN" == true ]]; then
        echo -e "    ${BLUE}WOULD SET${RESET} ${redis_key}"
      else
        # Use redis-cli -x SET to safely pipe value (handles special chars)
        if echo "$value" | ssh "$ALICE" "redis-cli -x SET '${redis_key}'" >/dev/null 2>&1; then
          ns_migrated=$((ns_migrated + 1))
        else
          ns_failed=$((ns_failed + 1))
          echo "${ns_title}|${key}" >> "$FAILED_LOG"
        fi
      fi

      # Also save to local export file for backup
      printf 'SET "%s" ' "$redis_key" >> "$redis_file"
      echo "$value" | head -c 10000 >> "$redis_file"
      echo "" >> "$redis_file"
    else
      ns_failed=$((ns_failed + 1))
      echo "${ns_title}|${key}|FETCH_FAILED" >> "$FAILED_LOG"
    fi
  done <<< "$keys"

  TOTAL_KEYS=$((TOTAL_KEYS + key_count))
  TOTAL_MIGRATED=$((TOTAL_MIGRATED + ns_migrated))
  TOTAL_FAILED=$((TOTAL_FAILED + ns_failed))

  size=$(wc -c < "$redis_file" | tr -d ' ')
  echo -e "  ${GREEN}Exported: ${redis_file} (${size} bytes)${RESET}"

  if [[ "$DRY_RUN" == false ]]; then
    echo -e "  ${GREEN}✓ Migrated: ${ns_migrated}/${key_count}${RESET}"
    [[ "$ns_failed" -gt 0 ]] && echo -e "  ${RED}Failed: ${ns_failed}${RESET}"
  fi

  NS_MIGRATED=$((NS_MIGRATED + 1))
  echo ""
done <<< "$NAMESPACES"

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}KV → Redis Migration Complete${RESET}"
echo -e "  Namespaces: ${NS_MIGRATED}/${NS_COUNT}"
echo -e "  Total keys: ${TOTAL_KEYS}"
echo -e "  Migrated:   ${GREEN}${TOTAL_MIGRATED}${RESET}"
echo -e "  Failed:     ${RED}${TOTAL_FAILED}${RESET}"
echo -e "  Exports:    ${EXPORT_DIR}/"
if [[ "$TOTAL_FAILED" -gt 0 ]]; then
  echo -e "  Failed log: ${FAILED_LOG}"
fi
echo ""
echo -e "${BLUE}Verify: ssh ${ALICE} \"redis-cli keys 'kv:*' | wc -l\"${RESET}"
