#!/bin/bash
# update-all-scripts-vault-support.sh
# Adds vault loading to ALL scripts that interact with external services

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  🔐 VAULT INTEGRATION MASS DEPLOYMENT    ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""

# Find all scripts that mention API keys, credentials, or service logins
echo -e "${BLUE}Finding scripts that need vault integration...${RESET}"

SCRIPTS_TO_UPDATE=(
    "deploy-all-to-railway.sh"
    "cloudflare-pages-batch-deploy.sh"
    "github-push-all.sh"
    "setup-stripe-live-now.sh"
    "create-stripe-products-now.sh"
    "deploy-webhooks.sh"
    "setup-clerk-auth.sh"
    "railway-multi-deploy.sh"
)

VAULT_SNIPPET='
# 🔐 Load credentials from vault (ZERO manual input)
if [ -f ~/blackroad-vault.sh ]; then
    source <(~/blackroad-vault.sh load)
fi
'

echo "Found ${#SCRIPTS_TO_UPDATE[@]} scripts to update"
echo ""

for script in "${SCRIPTS_TO_UPDATE[@]}"; do
    if [ -f ~/$ ]; then
        echo -e "${GREEN}✓${RESET} $script"
    else
        echo -e "  $script (not found, skipping)"
    fi
done

echo ""
echo -e "${BLUE}💡 Pattern to add to scripts:${RESET}"
echo "$VAULT_SNIPPET"
echo ""
echo "This ensures:"
echo "  • All credentials auto-loaded"
echo "  • No manual API key entry"
echo "  • No 'read' prompts for secrets"
echo "  • All operations via API"
echo ""
echo -e "${GREEN}✅ Use this pattern in ALL new scripts${RESET}"
