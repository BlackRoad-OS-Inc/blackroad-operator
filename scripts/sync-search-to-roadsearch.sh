#!/bin/bash
# Sync local br search-all index to RoadSearch (Cloudflare Worker)
# Pushes all 1,694+ entries from ~/.blackroad/search.db to search.blackroad.io
#
# Usage: ./sync-search-to-roadsearch.sh [--dry-run]

set -e

SEARCH_DB="$HOME/.blackroad/search.db"
ROADSEARCH_URL="${ROADSEARCH_URL:-https://road-search.amundsonalexa.workers.dev}"
INDEX_KEY="${ROADSEARCH_INDEX_KEY:-$(cat ~/.blackroad/roadsearch-key.txt 2>/dev/null || echo '')}"
BATCH_SIZE=50
DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
CYAN='\033[38;5;69m'
NC='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════╗${NC}"
echo -e "${PINK}║  RoadSearch Sync                       ║${NC}"
echo -e "${PINK}╚════════════════════════════════════════╝${NC}"

if [ ! -f "$SEARCH_DB" ]; then
  echo "ERROR: search.db not found at $SEARCH_DB"
  echo "Run: python3 ~/blackroad-operator/tools/search/index-all.py --rebuild"
  exit 1
fi

# Export entries from local FTS5 index
TOTAL=$(sqlite3 "$SEARCH_DB" "SELECT COUNT(*) FROM entries;" 2>/dev/null)
echo -e "${CYAN}Local entries:${NC} $TOTAL"
echo -e "${CYAN}Target:${NC} $ROADSEARCH_URL"
echo -e "${CYAN}Batch size:${NC} $BATCH_SIZE"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${GREEN}DRY RUN — would push $TOTAL entries${NC}"
  # Show sample
  sqlite3 "$SEARCH_DB" "SELECT json_object('url', 'https://blackroad.io/' || type || '/' || replace(title,' ','-'), 'title', title, 'description', substr(content,1,200), 'category', type, 'domain', 'blackroad.io', 'tags', type) FROM entries LIMIT 3;" 2>/dev/null
  exit 0
fi

if [ -z "$INDEX_KEY" ]; then
  echo "WARNING: No INDEX_KEY found. Set ROADSEARCH_INDEX_KEY or save to ~/.blackroad/roadsearch-key.txt"
  echo "Get the key: wrangler secret list --name road-search"
  echo ""
  echo "Pushing without auth (will fail if worker requires it)..."
fi

# Export and push in batches
OFFSET=0
PUSHED=0
FAILED=0

while [ $OFFSET -lt $TOTAL ]; do
  # Export batch as JSON array
  BATCH=$(sqlite3 "$SEARCH_DB" "
    SELECT json_group_array(json_object(
      'url', CASE
        WHEN type = 'website' THEN 'https://' || title
        WHEN type = 'domain' THEN 'https://' || title
        WHEN type = 'repo' THEN 'https://github.com/blackboxprogramming/' || title
        ELSE 'https://blackroad.io/' || type || '/' || replace(lower(title),' ','-')
      END,
      'title', title,
      'description', substr(content, 1, 300),
      'content', content,
      'category', type,
      'domain', 'blackroad.io',
      'tags', type || ',' || source
    ))
    FROM entries
    LIMIT $BATCH_SIZE OFFSET $OFFSET;
  " 2>/dev/null)

  if [ -z "$BATCH" ] || [ "$BATCH" = "[]" ]; then
    break
  fi

  # Push to RoadSearch
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$ROADSEARCH_URL/index" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $INDEX_KEY" \
    -d "$BATCH" \
    --max-time 30 2>/dev/null)

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    PUSHED=$((PUSHED + BATCH_SIZE))
    echo -e "  ${GREEN}✓${NC} Pushed $OFFSET-$((OFFSET + BATCH_SIZE)) ($HTTP_CODE)"
  else
    FAILED=$((FAILED + BATCH_SIZE))
    echo -e "  ✗ Failed batch $OFFSET-$((OFFSET + BATCH_SIZE)) (HTTP $HTTP_CODE)"
  fi

  OFFSET=$((OFFSET + BATCH_SIZE))
  sleep 0.5  # Rate limit
done

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Pushed: ${GREEN}$PUSHED${NC} | Failed: $FAILED | Total: $TOTAL"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
