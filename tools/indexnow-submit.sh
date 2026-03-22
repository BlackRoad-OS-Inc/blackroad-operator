#!/bin/bash
# IndexNow submission — run weekly to keep Bing/Yandex fresh
KEY="f1a7893bd54145a697f112eefdac579b"
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"blackroad.io\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://blackroad.io/$KEY.txt\",
    \"urlList\": [
      \"https://blackroad.io/\",
      \"https://blackroad.io/blogs\",
      \"https://blackroad.io/blog-quit-finance\",
      \"https://blackroad.io/blog-sovereign-os-150\",
      \"https://blackroad.io/blog-amundson-sequence\",
      \"https://blackroad.io/blog-wireguard-mesh\",
      \"https://blackroad.io/blog-200-agents\",
      \"https://blackroad.io/blog-search-engine-pis\",
      \"https://blackroad.io/blog-zero-to-629\",
      \"https://blackroad.io/api-docs\",
      \"https://blackroad.io/demo\",
      \"https://blackroad.io/getting-started\",
      \"https://blackroad.io/status-live\"
    ]
  }" >> /tmp/indexnow.log 2>&1
echo "[$(date -u)] IndexNow submitted" >> /tmp/indexnow.log
