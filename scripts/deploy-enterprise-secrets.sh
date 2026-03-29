#!/bin/bash
# BlackRoad Enterprise Secrets Deployment
# Run after: gh auth refresh -h github.com -s admin:org
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}BlackRoad Enterprise Secret Deployment${RESET}"

# Source secrets
source /Users/alexa/blackroad/.env.secrets

# HQ org — all secrets, visible to all repos
ORG="BlackRoad-OS-Inc"
echo -e "${GREEN}Setting secrets on $ORG (HQ)${RESET}"

SECRETS=(
  "STRIPE_SECRET_KEY:$STRIPE_SECRET_KEY"
  "STRIPE_PUBLISHABLE_KEY:$STRIPE_PUBLISHABLE_KEY"
  "STRIPE_PRICE_ID:price_1TG8dW3e5FMFdlFwqeoU1gzs"
  "CLERK_SECRET_KEY:$CLERK_SECRET_KEY"
  "CLERK_PUBLISHABLE_KEY:$CLERK_PUBLISHABLE_KEY"
  "HF_TOKEN:$HF_TOKEN"
  "NPM_TOKEN:$NPM_TOKEN"
  "COINBASE_PROJECT_ID:$COINBASE_PROJECT_ID"
  "BASE44_API_KEY:$BASE44_API_KEY"
  "RAILWAY_PROJECT_ID:$RAILWAY_PROJECT_ID"
  "VERCEL_USER_ID:$VERCEL_USER_ID"
)

for entry in "${SECRETS[@]}"; do
  key="${entry%%:*}"
  val="${entry#*:}"
  gh secret set "$key" -b "$val" --org "$ORG" --visibility all 2>&1 | tail -1
  echo "  $key ✓"
done

echo ""
echo -e "${GREEN}All secrets deployed to $ORG${RESET}"
echo "Sub-orgs inherit via visibility=all"
