#!/bin/zsh
# Deploy BlackRoad Cloud Gateway to Cloudflare Workers

set -e

WORKER_NAME="blackroad-cloud-gateway"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-848cf0b18d51e0170e0d1537aec3505a}"

echo "🚀 Deploying $WORKER_NAME..."

# Type check
echo "  → Type checking..."
npx tsc --noEmit

# Deploy
echo "  → Deploying to Cloudflare..."
npx wrangler deploy

echo "✓ Deployed! Worker URL:"
echo "  https://$WORKER_NAME.blackroad.workers.dev"
