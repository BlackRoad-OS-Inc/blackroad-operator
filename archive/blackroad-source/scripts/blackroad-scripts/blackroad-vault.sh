#!/bin/bash
# 🔐 BLACKROAD VAULT - ZERO MANUAL CREDENTIALS
# 
# Philosophy: If a human has to paste an API key, the automation failed.
# 
# This vault auto-discovers, stores, and distributes credentials
# across all services. Scripts read from here - never ask users.

set -e

VAULT_DIR="$HOME/.blackroad/vault"
mkdir -p "$VAULT_DIR"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║   🔐 BLACKROAD VAULT - AUTO CREDENTIALS  ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""

# ===== AUTO-DISCOVERY FUNCTIONS =====

discover_stripe() {
    echo -e "${BLUE}🔍 Discovering Stripe credentials...${RESET}"
    
    if command -v stripe &> /dev/null; then
        # Get keys from Stripe CLI config
        SECRET_KEY=$(stripe config --list 2>/dev/null | grep "secret_key" | awk '{print $3}')
        PUBLISHABLE_KEY=$(stripe config --list 2>/dev/null | grep "publishable_key" | awk '{print $3}')
        
        if [ -n "$SECRET_KEY" ]; then
            echo "$SECRET_KEY" > "$VAULT_DIR/stripe_secret_key"
            echo "$PUBLISHABLE_KEY" > "$VAULT_DIR/stripe_publishable_key"
            echo -e "${GREEN}✅ Stripe keys saved${RESET}"
            return 0
        fi
    fi
    
    # Check environment variables
    if [ -n "$STRIPE_SECRET_KEY" ]; then
        echo "$STRIPE_SECRET_KEY" > "$VAULT_DIR/stripe_secret_key"
        echo "$STRIPE_PUBLISHABLE_KEY" > "$VAULT_DIR/stripe_publishable_key"
        echo -e "${GREEN}✅ Stripe keys from environment${RESET}"
        return 0
    fi
    
    echo -e "${AMBER}⚠️  Stripe: Run 'stripe login' once${RESET}"
    return 1
}

discover_clerk() {
    echo -e "${BLUE}🔍 Discovering Clerk credentials...${RESET}"
    
    # Check environment
    if [ -n "$CLERK_SECRET_KEY" ]; then
        echo "$CLERK_SECRET_KEY" > "$VAULT_DIR/clerk_secret_key"
        echo "$CLERK_PUBLISHABLE_KEY" > "$VAULT_DIR/clerk_publishable_key"
        echo -e "${GREEN}✅ Clerk keys from environment${RESET}"
        return 0
    fi
    
    # Check .env files in common locations
    for env_file in ~/.env .env */".env" projects/*/.env services/*/.env; do
        if [ -f "$env_file" ]; then
            CLERK_KEY=$(grep "CLERK_SECRET_KEY" "$env_file" 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'")
            if [ -n "$CLERK_KEY" ]; then
                echo "$CLERK_KEY" > "$VAULT_DIR/clerk_secret_key"
                echo -e "${GREEN}✅ Clerk key from $env_file${RESET}"
                return 0
            fi
        fi
    done
    
    echo -e "${AMBER}⚠️  Clerk: Get from https://dashboard.clerk.com${RESET}"
    return 1
}

discover_railway() {
    echo -e "${BLUE}🔍 Discovering Railway credentials...${RESET}"
    
    if command -v railway &> /dev/null; then
        # Check if logged in
        if railway whoami &> /dev/null; then
            # Get token from config
            RAILWAY_TOKEN=$(cat ~/.config/railway/config.json 2>/dev/null | jq -r '.token' 2>/dev/null)
            if [ -n "$RAILWAY_TOKEN" ] && [ "$RAILWAY_TOKEN" != "null" ]; then
                echo "$RAILWAY_TOKEN" > "$VAULT_DIR/railway_token"
                echo -e "${GREEN}✅ Railway token saved${RESET}"
                return 0
            fi
        fi
    fi
    
    echo -e "${AMBER}⚠️  Railway: Run 'railway login' once${RESET}"
    return 1
}

discover_github() {
    echo -e "${BLUE}🔍 Discovering GitHub credentials...${RESET}"
    
    # Check gh CLI
    if command -v gh &> /dev/null; then
        if gh auth status &> /dev/null; then
            GH_TOKEN=$(gh auth token 2>/dev/null)
            if [ -n "$GH_TOKEN" ]; then
                echo "$GH_TOKEN" > "$VAULT_DIR/github_token"
                echo -e "${GREEN}✅ GitHub token saved${RESET}"
                return 0
            fi
        fi
    fi
    
    # Check environment
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "$GITHUB_TOKEN" > "$VAULT_DIR/github_token"
        echo -e "${GREEN}✅ GitHub token from environment${RESET}"
        return 0
    fi
    
    echo -e "${AMBER}⚠️  GitHub: Run 'gh auth login' once${RESET}"
    return 1
}

discover_cloudflare() {
    echo -e "${BLUE}🔍 Discovering Cloudflare credentials...${RESET}"
    
    # Check wrangler config
    if [ -f ~/.wrangler/config/default.toml ]; then
        CF_TOKEN=$(grep "api_token" ~/.wrangler/config/default.toml | cut -d'"' -f2)
        if [ -n "$CF_TOKEN" ]; then
            echo "$CF_TOKEN" > "$VAULT_DIR/cloudflare_api_token"
            echo -e "${GREEN}✅ Cloudflare token saved${RESET}"
            return 0
        fi
    fi
    
    if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
        echo "$CLOUDFLARE_API_TOKEN" > "$VAULT_DIR/cloudflare_api_token"
        echo -e "${GREEN}✅ Cloudflare token from environment${RESET}"
        return 0
    fi
    
    echo -e "${AMBER}⚠️  Cloudflare: Run 'wrangler login' once${RESET}"
    return 1
}

discover_openai() {
    echo -e "${BLUE}🔍 Discovering OpenAI credentials...${RESET}"
    
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "$OPENAI_API_KEY" > "$VAULT_DIR/openai_api_key"
        echo -e "${GREEN}✅ OpenAI key from environment${RESET}"
        return 0
    fi
    
    echo -e "${AMBER}⚠️  OpenAI: Get from https://platform.openai.com/api-keys${RESET}"
    return 1
}

discover_anthropic() {
    echo -e "${BLUE}🔍 Discovering Anthropic credentials...${RESET}"
    
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo "$ANTHROPIC_API_KEY" > "$VAULT_DIR/anthropic_api_key"
        echo -e "${GREEN}✅ Anthropic key from environment${RESET}"
        return 0
    fi
    
    echo -e "${AMBER}⚠️  Anthropic: Get from https://console.anthropic.com${RESET}"
    return 1
}

# ===== LOAD FUNCTION =====
load_vault() {
    echo -e "${BLUE}📥 Loading credentials from vault...${RESET}"
    
    # Export all credentials as environment variables
    for key_file in "$VAULT_DIR"/*; do
        if [ -f "$key_file" ]; then
            key_name=$(basename "$key_file" | tr '[:lower:]' '[:upper:]')
            key_value=$(cat "$key_file")
            export "$key_name=$key_value"
        fi
    done
    
    echo -e "${GREEN}✅ Vault loaded${RESET}"
}

# ===== SHOW FUNCTION =====
show_vault() {
    echo -e "${BLUE}📋 Vault Status:${RESET}"
    echo ""
    
    for service in stripe clerk railway github cloudflare openai anthropic; do
        if ls "$VAULT_DIR/${service}_"* &> /dev/null; then
            echo -e "${GREEN}✅ $service${RESET}"
        else
            echo -e "${AMBER}⚠️  $service (not configured)${RESET}"
        fi
    done
    
    echo ""
    echo -e "${BLUE}Vault location: $VAULT_DIR${RESET}"
    echo -e "${BLUE}File count: $(ls -1 "$VAULT_DIR" 2>/dev/null | wc -l)${RESET}"
}

# ===== CREATE ENV FILE =====
create_env_file() {
    local target_file="${1:-.env}"
    
    echo -e "${BLUE}📝 Creating $target_file from vault...${RESET}"
    
    cat > "$target_file" << EOF
# Auto-generated from BlackRoad Vault
# DO NOT EDIT - Run ./blackroad-vault.sh to update

EOF
    
    for key_file in "$VAULT_DIR"/*; do
        if [ -f "$key_file" ]; then
            key_name=$(basename "$key_file" | tr '[:lower:]' '[:upper:]')
            key_value=$(cat "$key_file")
            echo "$key_name=$key_value" >> "$target_file"
        fi
    done
    
    echo -e "${GREEN}✅ Created $target_file${RESET}"
}

# ===== MAIN EXECUTION =====

case "${1:-discover}" in
    discover)
        echo -e "${PINK}🔍 Auto-discovering all credentials...${RESET}"
        echo ""
        discover_stripe || true
        discover_clerk || true
        discover_railway || true
        discover_github || true
        discover_cloudflare || true
        discover_openai || true
        discover_anthropic || true
        echo ""
        show_vault
        ;;
    load)
        load_vault
        ;;
    show)
        show_vault
        ;;
    env)
        create_env_file "${2:-.env}"
        ;;
    *)
        echo "Usage: $0 {discover|load|show|env [file]}"
        exit 1
        ;;
esac

# Log to memory
~/memory-system.sh log "vault-setup" "infrastructure" \
    "BlackRoad Vault initialized. Auto-discovering credentials from CLI tools. Zero manual key management." \
    "automation,credentials,vault" 2>/dev/null || true

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║   ✅ VAULT READY                          ║${RESET}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BLUE}Usage in scripts:${RESET}"
echo "  source <(./blackroad-vault.sh load)"
echo "  # All credentials now in environment"
echo ""
echo -e "${BLUE}Generate .env file:${RESET}"
echo "  ./blackroad-vault.sh env .env"
echo ""
echo -e "${AMBER}Philosophy: One-time CLI login → Forever automated${RESET}"
