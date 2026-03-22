#!/bin/bash
# Auto-post new blog content to BackRoad social
# Checks RSS feed, posts any items not already in BackRoad
# Run via cron: 0 */4 * * * bash ~/blackroad-operator/tools/auto-post-backroad.sh

API="https://social.blackroad.io/api"
FEED="https://blackroad.io/feed.xml"
POSTED_FILE="/tmp/backroad-posted.txt"

touch "$POSTED_FILE"

# Get RSS items
curl -sL "$FEED" 2>/dev/null | grep -o '<link>[^<]*</link>' | sed 's/<[^>]*>//g' | grep "/blog" | while read url; do
  # Skip if already posted
  grep -q "$url" "$POSTED_FILE" && continue
  
  # Get title
  title=$(curl -sL "$url" 2>/dev/null | grep -o '<title>[^<]*</title>' | head -1 | sed 's/<[^>]*>//g' | sed 's/ — BlackRoad OS//')
  
  [ -z "$title" ] && continue
  
  # Post to BackRoad
  curl -s -X POST "$API/posts" \
    -H "Content-Type: application/json" \
    -d "{\"handle\":\"blackroad\",\"author\":\"BlackRoad OS\",\"content\":\"New: $title\\n\\n$url\",\"tags\":[\"blog\",\"auto-post\"]}" >/dev/null 2>&1
  
  echo "$url" >> "$POSTED_FILE"
  echo "[$(date -u)] Posted: $title" >> /tmp/backroad-autopost.log
done
