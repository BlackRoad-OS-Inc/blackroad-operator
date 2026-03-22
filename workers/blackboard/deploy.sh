#!/bin/bash
# BlackBoard — Deploy sovereign analytics
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

cd "$(dirname "$0")"

echo -e "${PINK}=== BlackBoard — Sovereign Analytics ===${RESET}"
echo ""

# Step 1: Create D1 database (if needed)
echo -e "${GREEN}[1/4]${RESET} Creating D1 database..."
DB_OUTPUT=$(wrangler d1 create blackboard 2>&1 || true)
if echo "$DB_OUTPUT" | grep -q "database_id"; then
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | head -1 | awk '{print $NF}' | tr -d '"')
    echo "  Created database: $DB_ID"
    # Update wrangler.toml with real ID
    sed -i '' "s/database_id   = \"PLACEHOLDER\"/database_id   = \"$DB_ID\"/" wrangler.toml
elif echo "$DB_OUTPUT" | grep -q "already exists"; then
    echo "  Database already exists"
    # Get existing ID
    DB_ID=$(wrangler d1 list 2>/dev/null | grep blackboard | awk '{print $1}' || echo "PLACEHOLDER")
    if [ "$DB_ID" != "PLACEHOLDER" ]; then
        sed -i '' "s/database_id   = \"PLACEHOLDER\"/database_id   = \"$DB_ID\"/" wrangler.toml
    fi
else
    echo "  $DB_OUTPUT"
fi

# Step 2: Create KV namespace (if needed)
echo -e "${GREEN}[2/4]${RESET} Creating KV namespace..."
KV_OUTPUT=$(wrangler kv namespace create REALTIME 2>&1 || true)
if echo "$KV_OUTPUT" | grep -q "id"; then
    KV_ID=$(echo "$KV_OUTPUT" | grep "id" | head -1 | awk -F'"' '{print $2}')
    echo "  Created KV: $KV_ID"
    sed -i '' "s/id      = \"PLACEHOLDER\"/id      = \"$KV_ID\"/" wrangler.toml
else
    echo "  KV may already exist — check wrangler.toml"
fi

# Step 3: Run schema
echo -e "${GREEN}[3/4]${RESET} Applying D1 schema..."
wrangler d1 execute blackboard --file=schema.sql --remote 2>/dev/null || echo "  Schema may already be applied"

# Step 4: Deploy worker
echo -e "${GREEN}[4/4]${RESET} Deploying BlackBoard worker..."
wrangler deploy

echo ""
echo -e "${GREEN}=== BlackBoard deployed ===${RESET}"
echo ""
echo "Dashboard:  https://blackboard.blackroad-operator.workers.dev"
echo "Beacon JS:  https://blackboard.blackroad-operator.workers.dev/bb.js"
echo ""
echo "To add a custom domain (bb.blackroad.io):"
echo "  1. Add CNAME: bb.blackroad.io -> blackboard.blackroad-operator.workers.dev"
echo "  2. Add route in Cloudflare: bb.blackroad.io/* -> blackboard"
echo ""
echo "Embed on any site:"
echo '  <script src="https://bb.blackroad.io/bb.js"></script>'
echo ""
echo "Then update bb.js beacon URL in src/index.js from:"
echo "  var B='https://bb.blackroad.io'"
echo "to your actual worker URL."
