#!/bin/zsh
# BR Security — Secrets Rotation Helper
# Helps rotate API keys and secrets across services

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

VAULT_DIR="${BLACKROAD_VAULT_DIR:-$HOME/.blackroad/vault}"
LOG_FILE="$HOME/.blackroad/logs/rotation.log"

log_rotation() {
    local service="$1"
    local key_name="$2"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ROTATED $service/$key_name" >> "$LOG_FILE"
}

check_expiry() {
    echo -e "\n${CYAN}🔍 Checking key expiry...${NC}\n"
    
    # Check for keys older than 90 days in vault
    if [ -d "$VAULT_DIR/keys" ]; then
        find "$VAULT_DIR/keys" -type f -mtime +90 -print | while read f; do
            echo -e "${YELLOW}⚠ Expired (>90 days): $f${NC}"
        done
    fi
    
    # Check .env files for hardcoded keys
    find . -name ".env" -not -path "*/.git/*" 2>/dev/null | while read f; do
        echo -e "${YELLOW}⚠ Potential plaintext secrets in: $f${NC}"
    done
}

rotate_service() {
    local service="$1"
    echo -e "${CYAN}Rotating secrets for: $service${NC}"
    
    case "$service" in
        cloudflare)
            echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
            echo "2. Revoke old token"
            echo "3. Create new token with same permissions"
            echo "4. Run: br env update CLOUDFLARE_API_TOKEN <new-token>"
            ;;
        github)
            echo "1. Go to: https://github.com/settings/tokens"
            echo "2. Delete old PAT"
            echo "3. Generate new PAT with same scopes"
            echo "4. Run: br env update GITHUB_TOKEN <new-token>"
            ;;
        railway)
            echo "1. Run: railway logout && railway login"
            echo "2. Copy new token from Railway dashboard"
            echo "3. Run: br env update RAILWAY_TOKEN <new-token>"
            ;;
        *)
            echo -e "${RED}Unknown service: $service${NC}"
            echo "Known services: cloudflare, github, railway, vercel, digitalocean"
            ;;
    esac
}

audit_access() {
    echo -e "\n${CYAN}🔒 Access Audit${NC}\n"
    
    # Check SSH keys
    echo "SSH Keys:"
    ls -la ~/.ssh/*.pub 2>/dev/null | awk '{print $1, $NF}' || echo "  None found"
    
    # Check Cloudflare tunnel
    echo -e "\nCloudflare Tunnel:"
    cloudflared tunnel list 2>/dev/null || echo "  cloudflared not running"
    
    # Check environment for secrets
    echo -e "\nEnvironment check:"
    env | grep -iE "(key|token|secret|password|api)" | grep -v "PATH" | \
        sed 's/=.*/=**REDACTED**/' || echo "  No secret env vars found"
}

case "${1:-help}" in
    check)   check_expiry ;;
    rotate)  rotate_service "${2:-}" ;;
    audit)   audit_access ;;
    help|*)
        echo "BR Security — Secrets Rotation"
        echo ""
        echo "Usage:"
        echo "  $0 check          # Check for expired secrets"
        echo "  $0 rotate <svc>   # Rotation guide for service"
        echo "  $0 audit          # Audit current access"
        echo ""
        echo "Services: cloudflare, github, railway, vercel, digitalocean"
        ;;
esac
