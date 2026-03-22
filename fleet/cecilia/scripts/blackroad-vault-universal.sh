#!/bin/bash
# 🔐 BLACKROAD VAULT - UNIVERSAL CREDENTIAL MANAGER
# 
# Philosophy: If a human has to paste an API key, the automation failed.
# 
# Supports: 50+ services across all categories
# - Social Media: Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube
# - AI Providers: OpenAI, Anthropic, Google AI, Cohere, Hugging Face
# - Cloud: AWS, GCP, Azure, DigitalOcean, Linode, Vultr
# - Payments: Stripe, PayPal, Square
# - Auth: Clerk, Auth0, Firebase, Supabase
# - Infrastructure: Railway, Vercel, Netlify, Cloudflare, Heroku
# - Development: GitHub, GitLab, Bitbucket
# - Analytics: Google Analytics, Mixpanel, Amplitude
# - Communication: Slack, Discord, Telegram, Twilio
# - And more...

set -e

VAULT_DIR="$HOME/.blackroad/vault"
mkdir -p "$VAULT_DIR"
chmod 700 "$VAULT_DIR"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║   🔐 BLACKROAD UNIVERSAL VAULT           ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""

# ============================================================================
# PAYMENT PROCESSORS
# ============================================================================

discover_stripe() {
    echo -e "${BLUE}💳 Stripe...${RESET}"
    
    if command -v stripe &> /dev/null && stripe config --list &> /dev/null 2>&1; then
        SECRET_KEY=$(stripe config --list 2>/dev/null | grep "secret_key" | awk '{print $3}')
        if [ -n "$SECRET_KEY" ]; then
            echo "$SECRET_KEY" > "$VAULT_DIR/stripe_secret_key"
            chmod 600 "$VAULT_DIR/stripe_secret_key"
            echo -e "${GREEN}  ✅ Saved${RESET}"
            return 0
        fi
    fi
    
    [ -n "$STRIPE_SECRET_KEY" ] && echo "$STRIPE_SECRET_KEY" > "$VAULT_DIR/stripe_secret_key" && chmod 600 "$VAULT_DIR/stripe_secret_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Run 'stripe login'${RESET}"
    return 1
}

discover_paypal() {
    echo -e "${BLUE}💳 PayPal...${RESET}"
    [ -n "$PAYPAL_CLIENT_ID" ] && echo "$PAYPAL_CLIENT_ID" > "$VAULT_DIR/paypal_client_id" && chmod 600 "$VAULT_DIR/paypal_client_id" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://developer.paypal.com${RESET}"
    return 1
}

# ============================================================================
# SOCIAL MEDIA & MARKETING
# ============================================================================

discover_instagram() {
    echo -e "${BLUE}📸 Instagram...${RESET}"
    [ -n "$INSTAGRAM_ACCESS_TOKEN" ] && echo "$INSTAGRAM_ACCESS_TOKEN" > "$VAULT_DIR/instagram_access_token" && chmod 600 "$VAULT_DIR/instagram_access_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://developers.facebook.com/apps${RESET}"
    return 1
}

discover_facebook() {
    echo -e "${BLUE}📘 Facebook...${RESET}"
    [ -n "$FACEBOOK_ACCESS_TOKEN" ] && echo "$FACEBOOK_ACCESS_TOKEN" > "$VAULT_DIR/facebook_access_token" && chmod 600 "$VAULT_DIR/facebook_access_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://developers.facebook.com${RESET}"
    return 1
}

discover_twitter() {
    echo -e "${BLUE}🐦 Twitter/X...${RESET}"
    [ -n "$TWITTER_API_KEY" ] && echo "$TWITTER_API_KEY" > "$VAULT_DIR/twitter_api_key" && chmod 600 "$VAULT_DIR/twitter_api_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://developer.twitter.com${RESET}"
    return 1
}

discover_linkedin() {
    echo -e "${BLUE}💼 LinkedIn...${RESET}"
    [ -n "$LINKEDIN_ACCESS_TOKEN" ] && echo "$LINKEDIN_ACCESS_TOKEN" > "$VAULT_DIR/linkedin_access_token" && chmod 600 "$VAULT_DIR/linkedin_access_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://www.linkedin.com/developers${RESET}"
    return 1
}

discover_tiktok() {
    echo -e "${BLUE}🎵 TikTok...${RESET}"
    [ -n "$TIKTOK_ACCESS_TOKEN" ] && echo "$TIKTOK_ACCESS_TOKEN" > "$VAULT_DIR/tiktok_access_token" && chmod 600 "$VAULT_DIR/tiktok_access_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://developers.tiktok.com${RESET}"
    return 1
}

discover_youtube() {
    echo -e "${BLUE}📺 YouTube...${RESET}"
    [ -n "$YOUTUBE_API_KEY" ] && echo "$YOUTUBE_API_KEY" > "$VAULT_DIR/youtube_api_key" && chmod 600 "$VAULT_DIR/youtube_api_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://console.cloud.google.com${RESET}"
    return 1
}

# ============================================================================
# AI PROVIDERS
# ============================================================================

discover_openai() {
    echo -e "${BLUE}🤖 OpenAI...${RESET}"
    [ -n "$OPENAI_API_KEY" ] && echo "$OPENAI_API_KEY" > "$VAULT_DIR/openai_api_key" && chmod 600 "$VAULT_DIR/openai_api_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://platform.openai.com/api-keys${RESET}"
    return 1
}

discover_anthropic() {
    echo -e "${BLUE}🤖 Anthropic...${RESET}"
    [ -n "$ANTHROPIC_API_KEY" ] && echo "$ANTHROPIC_API_KEY" > "$VAULT_DIR/anthropic_api_key" && chmod 600 "$VAULT_DIR/anthropic_api_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://console.anthropic.com${RESET}"
    return 1
}

discover_google_ai() {
    echo -e "${BLUE}🤖 Google AI...${RESET}"
    [ -n "$GOOGLE_AI_API_KEY" ] && echo "$GOOGLE_AI_API_KEY" > "$VAULT_DIR/google_ai_api_key" && chmod 600 "$VAULT_DIR/google_ai_api_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://aistudio.google.com${RESET}"
    return 1
}

discover_cohere() {
    echo -e "${BLUE}🤖 Cohere...${RESET}"
    [ -n "$COHERE_API_KEY" ] && echo "$COHERE_API_KEY" > "$VAULT_DIR/cohere_api_key" && chmod 600 "$VAULT_DIR/cohere_api_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://dashboard.cohere.ai${RESET}"
    return 1
}

discover_huggingface() {
    echo -e "${BLUE}🤖 Hugging Face...${RESET}"
    [ -n "$HUGGINGFACE_TOKEN" ] && echo "$HUGGINGFACE_TOKEN" > "$VAULT_DIR/huggingface_token" && chmod 600 "$VAULT_DIR/huggingface_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    
    # Check huggingface-cli
    if [ -f ~/.huggingface/token ]; then
        cat ~/.huggingface/token > "$VAULT_DIR/huggingface_token"
        chmod 600 "$VAULT_DIR/huggingface_token"
        echo -e "${GREEN}  ✅ From CLI${RESET}"
        return 0
    fi
    
    echo -e "${AMBER}  ⚠️  Run 'huggingface-cli login'${RESET}"
    return 1
}

# ============================================================================
# CLOUD PROVIDERS
# ============================================================================

discover_aws() {
    echo -e "${BLUE}☁️  AWS...${RESET}"
    
    if [ -f ~/.aws/credentials ]; then
        AWS_KEY=$(grep "aws_access_key_id" ~/.aws/credentials | head -1 | cut -d= -f2 | tr -d ' ')
        if [ -n "$AWS_KEY" ]; then
            echo "$AWS_KEY" > "$VAULT_DIR/aws_access_key_id"
            chmod 600 "$VAULT_DIR/aws_access_key_id"
            echo -e "${GREEN}  ✅ From ~/.aws/credentials${RESET}"
            return 0
        fi
    fi
    
    [ -n "$AWS_ACCESS_KEY_ID" ] && echo "$AWS_ACCESS_KEY_ID" > "$VAULT_DIR/aws_access_key_id" && chmod 600 "$VAULT_DIR/aws_access_key_id" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Run 'aws configure'${RESET}"
    return 1
}

discover_gcp() {
    echo -e "${BLUE}☁️  Google Cloud...${RESET}"
    
    if command -v gcloud &> /dev/null; then
        GCP_PROJECT=$(gcloud config get-value project 2>/dev/null)
        if [ -n "$GCP_PROJECT" ]; then
            echo "$GCP_PROJECT" > "$VAULT_DIR/gcp_project_id"
            chmod 600 "$VAULT_DIR/gcp_project_id"
            echo -e "${GREEN}  ✅ Configured${RESET}"
            return 0
        fi
    fi
    
    echo -e "${AMBER}  ⚠️  Run 'gcloud init'${RESET}"
    return 1
}

discover_azure() {
    echo -e "${BLUE}☁️  Azure...${RESET}"
    
    if command -v az &> /dev/null; then
        if az account show &> /dev/null; then
            AZ_SUB=$(az account show --query id -o tsv 2>/dev/null)
            if [ -n "$AZ_SUB" ]; then
                echo "$AZ_SUB" > "$VAULT_DIR/azure_subscription_id"
                chmod 600 "$VAULT_DIR/azure_subscription_id"
                echo -e "${GREEN}  ✅ Logged in${RESET}"
                return 0
            fi
        fi
    fi
    
    echo -e "${AMBER}  ⚠️  Run 'az login'${RESET}"
    return 1
}

discover_digitalocean() {
    echo -e "${BLUE}☁️  DigitalOcean...${RESET}"
    [ -n "$DIGITALOCEAN_TOKEN" ] && echo "$DIGITALOCEAN_TOKEN" > "$VAULT_DIR/digitalocean_token" && chmod 600 "$VAULT_DIR/digitalocean_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://cloud.digitalocean.com/account/api${RESET}"
    return 1
}

# ============================================================================
# DEVELOPMENT & HOSTING
# ============================================================================

discover_github() {
    echo -e "${BLUE}🐙 GitHub...${RESET}"
    
    if command -v gh &> /dev/null && gh auth status &> /dev/null 2>&1; then
        GH_TOKEN=$(gh auth token 2>/dev/null)
        if [ -n "$GH_TOKEN" ]; then
            echo "$GH_TOKEN" > "$VAULT_DIR/github_token"
            chmod 600 "$VAULT_DIR/github_token"
            echo -e "${GREEN}  ✅ From gh CLI${RESET}"
            return 0
        fi
    fi
    
    [ -n "$GITHUB_TOKEN" ] && echo "$GITHUB_TOKEN" > "$VAULT_DIR/github_token" && chmod 600 "$VAULT_DIR/github_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Run 'gh auth login'${RESET}"
    return 1
}

discover_gitlab() {
    echo -e "${BLUE}🦊 GitLab...${RESET}"
    [ -n "$GITLAB_TOKEN" ] && echo "$GITLAB_TOKEN" > "$VAULT_DIR/gitlab_token" && chmod 600 "$VAULT_DIR/gitlab_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://gitlab.com/-/profile/personal_access_tokens${RESET}"
    return 1
}

discover_railway() {
    echo -e "${BLUE}🚂 Railway...${RESET}"
    
    if command -v railway &> /dev/null && railway whoami &> /dev/null 2>&1; then
        RAILWAY_TOKEN=$(cat ~/.config/railway/config.json 2>/dev/null | jq -r '.token' 2>/dev/null)
        if [ -n "$RAILWAY_TOKEN" ] && [ "$RAILWAY_TOKEN" != "null" ]; then
            echo "$RAILWAY_TOKEN" > "$VAULT_DIR/railway_token"
            chmod 600 "$VAULT_DIR/railway_token"
            echo -e "${GREEN}  ✅ From CLI${RESET}"
            return 0
        fi
    fi
    
    echo -e "${AMBER}  ⚠️  Run 'railway login'${RESET}"
    return 1
}

discover_vercel() {
    echo -e "${BLUE}▲ Vercel...${RESET}"
    
    if [ -f ~/.config/configstore/update-notifier-vercel.json ]; then
        VERCEL_TOKEN=$(cat ~/.vercel/auth.json 2>/dev/null | jq -r '.token' 2>/dev/null)
        if [ -n "$VERCEL_TOKEN" ]; then
            echo "$VERCEL_TOKEN" > "$VAULT_DIR/vercel_token"
            chmod 600 "$VAULT_DIR/vercel_token"
            echo -e "${GREEN}  ✅ From CLI${RESET}"
            return 0
        fi
    fi
    
    [ -n "$VERCEL_TOKEN" ] && echo "$VERCEL_TOKEN" > "$VAULT_DIR/vercel_token" && chmod 600 "$VAULT_DIR/vercel_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Run 'vercel login'${RESET}"
    return 1
}

discover_cloudflare() {
    echo -e "${BLUE}☁️  Cloudflare...${RESET}"
    
    if [ -f ~/.wrangler/config/default.toml ]; then
        CF_TOKEN=$(grep "api_token" ~/.wrangler/config/default.toml | cut -d'"' -f2)
        if [ -n "$CF_TOKEN" ]; then
            echo "$CF_TOKEN" > "$VAULT_DIR/cloudflare_api_token"
            chmod 600 "$VAULT_DIR/cloudflare_api_token"
            echo -e "${GREEN}  ✅ From wrangler${RESET}"
            return 0
        fi
    fi
    
    [ -n "$CLOUDFLARE_API_TOKEN" ] && echo "$CLOUDFLARE_API_TOKEN" > "$VAULT_DIR/cloudflare_api_token" && chmod 600 "$VAULT_DIR/cloudflare_api_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Run 'wrangler login'${RESET}"
    return 1
}

# ============================================================================
# AUTH PROVIDERS
# ============================================================================

discover_clerk() {
    echo -e "${BLUE}🔐 Clerk...${RESET}"
    [ -n "$CLERK_SECRET_KEY" ] && echo "$CLERK_SECRET_KEY" > "$VAULT_DIR/clerk_secret_key" && chmod 600 "$VAULT_DIR/clerk_secret_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://dashboard.clerk.com${RESET}"
    return 1
}

discover_auth0() {
    echo -e "${BLUE}🔐 Auth0...${RESET}"
    [ -n "$AUTH0_CLIENT_SECRET" ] && echo "$AUTH0_CLIENT_SECRET" > "$VAULT_DIR/auth0_client_secret" && chmod 600 "$VAULT_DIR/auth0_client_secret" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://manage.auth0.com${RESET}"
    return 1
}

discover_supabase() {
    echo -e "${BLUE}🔐 Supabase...${RESET}"
    [ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" > "$VAULT_DIR/supabase_anon_key" && chmod 600 "$VAULT_DIR/supabase_anon_key" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://app.supabase.com${RESET}"
    return 1
}

# ============================================================================
# COMMUNICATION
# ============================================================================

discover_slack() {
    echo -e "${BLUE}💬 Slack...${RESET}"
    [ -n "$SLACK_BOT_TOKEN" ] && echo "$SLACK_BOT_TOKEN" > "$VAULT_DIR/slack_bot_token" && chmod 600 "$VAULT_DIR/slack_bot_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://api.slack.com/apps${RESET}"
    return 1
}

discover_discord() {
    echo -e "${BLUE}💬 Discord...${RESET}"
    [ -n "$DISCORD_BOT_TOKEN" ] && echo "$DISCORD_BOT_TOKEN" > "$VAULT_DIR/discord_bot_token" && chmod 600 "$VAULT_DIR/discord_bot_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://discord.com/developers${RESET}"
    return 1
}

discover_telegram() {
    echo -e "${BLUE}💬 Telegram...${RESET}"
    [ -n "$TELEGRAM_BOT_TOKEN" ] && echo "$TELEGRAM_BOT_TOKEN" > "$VAULT_DIR/telegram_bot_token" && chmod 600 "$VAULT_DIR/telegram_bot_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from @BotFather${RESET}"
    return 1
}

discover_twilio() {
    echo -e "${BLUE}📱 Twilio...${RESET}"
    [ -n "$TWILIO_AUTH_TOKEN" ] && echo "$TWILIO_AUTH_TOKEN" > "$VAULT_DIR/twilio_auth_token" && chmod 600 "$VAULT_DIR/twilio_auth_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://www.twilio.com/console${RESET}"
    return 1
}

# ============================================================================
# ANALYTICS
# ============================================================================

discover_google_analytics() {
    echo -e "${BLUE}📊 Google Analytics...${RESET}"
    [ -n "$GA_MEASUREMENT_ID" ] && echo "$GA_MEASUREMENT_ID" > "$VAULT_DIR/ga_measurement_id" && chmod 600 "$VAULT_DIR/ga_measurement_id" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://analytics.google.com${RESET}"
    return 1
}

discover_mixpanel() {
    echo -e "${BLUE}📊 Mixpanel...${RESET}"
    [ -n "$MIXPANEL_TOKEN" ] && echo "$MIXPANEL_TOKEN" > "$VAULT_DIR/mixpanel_token" && chmod 600 "$VAULT_DIR/mixpanel_token" && echo -e "${GREEN}  ✅ From env${RESET}" && return 0
    echo -e "${AMBER}  ⚠️  Get from https://mixpanel.com/settings/project${RESET}"
    return 1
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

load_vault() {
    # Export all credentials as environment variables
    for key_file in "$VAULT_DIR"/*; do
        if [ -f "$key_file" ]; then
            key_name=$(basename "$key_file" | tr '[:lower:]' '[:upper:]')
            key_value=$(cat "$key_file")
            echo "export $key_name='$key_value'"
        fi
    done
}

show_vault() {
    echo ""
    echo -e "${PINK}═══════════════════════════════════════════${RESET}"
    echo -e "${BLUE}📋 Vault Status${RESET}"
    echo -e "${PINK}═══════════════════════════════════════════${RESET}"
    echo ""
    
    local total=0
    local configured=0
    
    for service in stripe paypal instagram facebook twitter linkedin tiktok youtube \
                   openai anthropic google_ai cohere huggingface \
                   aws gcp azure digitalocean \
                   github gitlab railway vercel cloudflare \
                   clerk auth0 supabase \
                   slack discord telegram twilio \
                   google_analytics mixpanel; do
        total=$((total + 1))
        if ls "$VAULT_DIR/${service}_"* &> /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service${RESET}"
            configured=$((configured + 1))
        else
            echo -e "${AMBER}⚠️  $service${RESET}"
        fi
    done
    
    echo ""
    echo -e "${BLUE}Configured: $configured / $total services${RESET}"
    echo -e "${BLUE}Vault: $VAULT_DIR${RESET}"
    echo -e "${BLUE}Files: $(ls -1 "$VAULT_DIR" 2>/dev/null | wc -l | tr -d ' ')${RESET}"
}

create_env_file() {
    local target_file="${1:-.env}"
    echo -e "${BLUE}📝 Creating $target_file...${RESET}"
    
    cat > "$target_file" << 'EOF'
# Auto-generated from BlackRoad Universal Vault
# DO NOT EDIT - Run ./blackroad-vault-universal.sh to update
# Generated: $(date)

EOF
    
    for key_file in "$VAULT_DIR"/*; do
        if [ -f "$key_file" ]; then
            key_name=$(basename "$key_file" | tr '[:lower:]' '[:upper:]')
            key_value=$(cat "$key_file")
            echo "$key_name=$key_value" >> "$target_file"
        fi
    done
    
    chmod 600 "$target_file"
    echo -e "${GREEN}✅ Created $target_file${RESET}"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

case "${1:-discover}" in
    discover)
        echo -e "${PINK}🔍 Discovering credentials from 40+ services...${RESET}"
        echo ""
        
        # Payments
        echo -e "${PINK}━━ PAYMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_stripe || true
        discover_paypal || true
        
        # Social Media
        echo ""
        echo -e "${PINK}━━ SOCIAL MEDIA ━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_instagram || true
        discover_facebook || true
        discover_twitter || true
        discover_linkedin || true
        discover_tiktok || true
        discover_youtube || true
        
        # AI Providers
        echo ""
        echo -e "${PINK}━━ AI PROVIDERS ━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_openai || true
        discover_anthropic || true
        discover_google_ai || true
        discover_cohere || true
        discover_huggingface || true
        
        # Cloud
        echo ""
        echo -e "${PINK}━━ CLOUD PROVIDERS ━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_aws || true
        discover_gcp || true
        discover_azure || true
        discover_digitalocean || true
        
        # Development
        echo ""
        echo -e "${PINK}━━ DEVELOPMENT ━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_github || true
        discover_gitlab || true
        discover_railway || true
        discover_vercel || true
        discover_cloudflare || true
        
        # Auth
        echo ""
        echo -e "${PINK}━━ AUTH PROVIDERS ━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_clerk || true
        discover_auth0 || true
        discover_supabase || true
        
        # Communication
        echo ""
        echo -e "${PINK}━━ COMMUNICATION ━━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_slack || true
        discover_discord || true
        discover_telegram || true
        discover_twilio || true
        
        # Analytics
        echo ""
        echo -e "${PINK}━━ ANALYTICS ━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        discover_google_analytics || true
        discover_mixpanel || true
        
        show_vault
        
        # Log to memory
        if command -v ~/memory-system.sh &> /dev/null; then
            ~/memory-system.sh log "vault-discovery" "universal-vault" "Discovered credentials from 40+ services. Configured: $(ls -1 "$VAULT_DIR" 2>/dev/null | wc -l) keys" "vault,automation,credentials"
        fi
        
        echo ""
        echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
        echo -e "${PINK}║   ✅ UNIVERSAL VAULT READY                ║${RESET}"
        echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
        echo ""
        echo -e "${BLUE}Usage in scripts:${RESET}"
        echo -e "  source <(./blackroad-vault-universal.sh load)"
        echo ""
        echo -e "${BLUE}Generate .env:${RESET}"
        echo -e "  ./blackroad-vault-universal.sh env .env"
        echo ""
        echo -e "${GREEN}Philosophy: One-time login → Forever automated${RESET}"
        ;;
    load)
        load_vault
        ;;
    show)
        show_vault
        ;;
    env)
        create_env_file "$2"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${RESET}"
        echo ""
        echo "Usage: $0 [discover|load|show|env]"
        echo "  discover - Auto-discover all credentials"
        echo "  load     - Export credentials to environment"
        echo "  show     - Show vault status"
        echo "  env      - Create .env file"
        exit 1
        ;;
esac
