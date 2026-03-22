#!/bin/bash
# setup-zero-credential-infrastructure.sh
# Master setup script - runs ALL one-time CLI logins
# After this, NEVER ask for credentials again

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo ""
echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  🚀 ZERO-CREDENTIAL INFRASTRUCTURE SETUP ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BLUE}This script runs ONE-TIME setup for all services.${RESET}"
echo -e "${BLUE}After this, all automation is forever automated.${RESET}"
echo ""
echo "Services to configure:"
echo "  ✓ Stripe (payments)"
echo "  ✓ Railway (hosting)"
echo "  ✓ Cloudflare (edge/DNS)"
echo "  ✓ GitHub (already logged in)"
echo "  ✓ Clerk (auth) - manual API key"
echo "  ✓ OpenAI (AI) - manual API key"
echo "  ✓ Anthropic (AI) - manual API key"
echo ""
read -p "Ready to start? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Track what needs setup
declare -a NEEDS_SETUP=()

# ============================================================================
# 1. GitHub (check existing)
# ============================================================================
echo ""
echo -e "${PINK}[1/7] Checking GitHub...${RESET}"
if gh auth status &>/dev/null; then
    echo -e "${GREEN}✅ GitHub already logged in${RESET}"
else
    echo -e "${AMBER}⚠️  GitHub not logged in${RESET}"
    NEEDS_SETUP+=("github")
fi

# ============================================================================
# 2. Stripe
# ============================================================================
echo ""
echo -e "${PINK}[2/7] Checking Stripe...${RESET}"
if stripe config --list &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ Stripe already logged in${RESET}"
else
    echo -e "${AMBER}⚠️  Stripe needs login${RESET}"
    NEEDS_SETUP+=("stripe")
fi

# ============================================================================
# 3. Railway
# ============================================================================
echo ""
echo -e "${PINK}[3/7] Checking Railway...${RESET}"
if railway whoami &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ Railway already logged in${RESET}"
else
    echo -e "${AMBER}⚠️  Railway needs login${RESET}"
    NEEDS_SETUP+=("railway")
fi

# ============================================================================
# 4. Cloudflare
# ============================================================================
echo ""
echo -e "${PINK}[4/7] Checking Cloudflare...${RESET}"
if wrangler whoami &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ Cloudflare already logged in${RESET}"
else
    echo -e "${AMBER}⚠️  Cloudflare needs login${RESET}"
    NEEDS_SETUP+=("cloudflare")
fi

# ============================================================================
# 5. Clerk (manual)
# ============================================================================
echo ""
echo -e "${PINK}[5/7] Checking Clerk...${RESET}"
if [ -f ~/.blackroad/vault/clerk_secret_key ]; then
    echo -e "${GREEN}✅ Clerk key already saved${RESET}"
else
    echo -e "${AMBER}⚠️  Clerk key needed${RESET}"
    NEEDS_SETUP+=("clerk")
fi

# ============================================================================
# 6. OpenAI (manual)
# ============================================================================
echo ""
echo -e "${PINK}[6/7] Checking OpenAI...${RESET}"
if [ -f ~/.blackroad/vault/openai_api_key ]; then
    echo -e "${GREEN}✅ OpenAI key already saved${RESET}"
else
    echo -e "${AMBER}⚠️  OpenAI key needed (optional)${RESET}"
    NEEDS_SETUP+=("openai")
fi

# ============================================================================
# 7. Anthropic (manual)
# ============================================================================
echo ""
echo -e "${PINK}[7/7] Checking Anthropic...${RESET}"
if [ -f ~/.blackroad/vault/anthropic_api_key ]; then
    echo -e "${GREEN}✅ Anthropic key already saved${RESET}"
else
    echo -e "${AMBER}⚠️  Anthropic key needed (optional)${RESET}"
    NEEDS_SETUP+=("anthropic")
fi

# ============================================================================
# Run setup for missing services
# ============================================================================
echo ""
echo -e "${PINK}═══════════════════════════════════════════${RESET}"
echo ""

if [ ${#NEEDS_SETUP[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All services already configured!${RESET}"
else
    echo -e "${AMBER}⚠️  Need to configure: ${NEEDS_SETUP[*]}${RESET}"
    echo ""
    
    for service in "${NEEDS_SETUP[@]}"; do
        case $service in
            github)
                echo -e "${PINK}→ Setting up GitHub...${RESET}"
                gh auth login
                echo -e "${GREEN}✅ GitHub configured${RESET}"
                ;;
            stripe)
                echo -e "${PINK}→ Setting up Stripe...${RESET}"
                echo "This will open your browser for login."
                stripe login
                echo -e "${GREEN}✅ Stripe configured${RESET}"
                ;;
            railway)
                echo -e "${PINK}→ Setting up Railway...${RESET}"
                echo "This will open your browser for login."
                railway login
                echo -e "${GREEN}✅ Railway configured${RESET}"
                ;;
            cloudflare)
                echo -e "${PINK}→ Setting up Cloudflare...${RESET}"
                echo "This will open your browser for login."
                wrangler login
                echo -e "${GREEN}✅ Cloudflare configured${RESET}"
                ;;
            clerk)
                echo -e "${PINK}→ Setting up Clerk...${RESET}"
                echo "Get your secret key from: https://dashboard.clerk.com"
                echo "Go to: API Keys → Show API Keys → Copy 'Secret Key'"
                echo ""
                read -sp "Paste Clerk Secret Key: " CLERK_KEY
                echo ""
                mkdir -p ~/.blackroad/vault
                echo "$CLERK_KEY" > ~/.blackroad/vault/clerk_secret_key
                chmod 600 ~/.blackroad/vault/clerk_secret_key
                echo -e "${GREEN}✅ Clerk key saved${RESET}"
                ;;
            openai)
                echo -e "${PINK}→ Setting up OpenAI (optional)...${RESET}"
                read -p "Do you want to configure OpenAI now? (y/n) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    echo "Get your API key from: https://platform.openai.com/api-keys"
                    echo ""
                    read -sp "Paste OpenAI API Key: " OPENAI_KEY
                    echo ""
                    mkdir -p ~/.blackroad/vault
                    echo "$OPENAI_KEY" > ~/.blackroad/vault/openai_api_key
                    chmod 600 ~/.blackroad/vault/openai_api_key
                    echo -e "${GREEN}✅ OpenAI key saved${RESET}"
                else
                    echo "Skipped (you can add later)"
                fi
                ;;
            anthropic)
                echo -e "${PINK}→ Setting up Anthropic (optional)...${RESET}"
                read -p "Do you want to configure Anthropic now? (y/n) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    echo "Get your API key from: https://console.anthropic.com"
                    echo ""
                    read -sp "Paste Anthropic API Key: " ANTHROPIC_KEY
                    echo ""
                    mkdir -p ~/.blackroad/vault
                    echo "$ANTHROPIC_KEY" > ~/.blackroad/vault/anthropic_api_key
                    chmod 600 ~/.blackroad/vault/anthropic_api_key
                    echo -e "${GREEN}✅ Anthropic key saved${RESET}"
                else
                    echo "Skipped (you can add later)"
                fi
                ;;
        esac
        echo ""
    done
fi

# ============================================================================
# Rediscover all credentials
# ============================================================================
echo ""
echo -e "${PINK}🔍 Rediscovering all credentials...${RESET}"
~/blackroad-vault.sh discover

# ============================================================================
# Success summary
# ============================================================================
echo ""
echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  ✅ ZERO-CREDENTIAL SETUP COMPLETE        ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${GREEN}All credentials stored in: ~/.blackroad/vault/${RESET}"
echo ""
echo "What's configured:"
~/blackroad-vault.sh show
echo ""
echo -e "${BLUE}From now on, all scripts auto-load credentials.${RESET}"
echo -e "${BLUE}You will NEVER be asked for API keys again.${RESET}"
echo ""
echo "Next steps:"
echo "  1. Create Stripe products:  ./stripe-full-auto-setup.sh"
echo "  2. Deploy services:         ./railway-deploy-enhanced.sh deploy-all"
echo "  3. Deploy webhooks:         (automatic in Railway deploy)"
echo ""
echo -e "${GREEN}✨ Zero-credential infrastructure is LIVE!${RESET}"
