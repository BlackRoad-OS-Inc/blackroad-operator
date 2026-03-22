#!/bin/bash
# BlackRoad Agent API Key Management System
# Generates, stores, and manages API keys for all agents and services

set -e

KEYS_DIR="$HOME/.blackroad/api-keys"
VAULT_FILE="$KEYS_DIR/vault.json"
AGENT_KEYS_FILE="$KEYS_DIR/agent-keys.json"

# Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

# Initialize storage
mkdir -p "$KEYS_DIR"
chmod 700 "$KEYS_DIR"

# Generate secure random key
generate_key() {
    local prefix="$1"
    local entropy=$(openssl rand -base64 32 | tr -d '/+=')
    echo "${prefix}_${entropy}"
}

# Generate API key for an agent
generate_agent_key() {
    local agent_id="$1"
    local agent_name="$2"
    local capabilities="$3"
    
    local api_key=$(generate_key "bra")  # BlackRoad Agent
    local api_secret=$(generate_key "brs")  # BlackRoad Secret
    
    # Create key entry
    cat > "$KEYS_DIR/${agent_id}.json" << EOF
{
  "agent_id": "$agent_id",
  "agent_name": "$agent_name",
  "api_key": "$api_key",
  "api_secret": "$api_secret",
  "capabilities": $capabilities,
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "active",
  "rate_limits": {
    "requests_per_minute": 1000,
    "requests_per_hour": 50000
  }
}
EOF
    
    echo -e "${GREEN}✅ Generated API key for $agent_name${RESET}"
    echo -e "   ${BLUE}API Key:${RESET} $api_key"
    echo -e "   ${AMBER}Secret:${RESET} ${api_secret:0:20}..."
    
    # Update master vault
    update_vault "$agent_id" "$agent_name" "$api_key"
    
    echo "$api_key"
}

# Update master vault
update_vault() {
    local agent_id="$1"
    local agent_name="$2"
    local api_key="$3"
    
    if [ ! -f "$VAULT_FILE" ]; then
        echo '{"agents":{}}' > "$VAULT_FILE"
    fi
    
    # Use jq if available, otherwise append manually
    if command -v jq &> /dev/null; then
        local temp=$(mktemp)
        jq --arg id "$agent_id" --arg name "$agent_name" --arg key "$api_key" \
           '.agents[$id] = {name: $name, api_key: $key, updated: now|todate}' \
           "$VAULT_FILE" > "$temp"
        mv "$temp" "$VAULT_FILE"
    fi
}

# Generate service integration keys
generate_service_keys() {
    echo -e "\n${PINK}═══════════════════════════════════════${RESET}"
    echo -e "${PINK}  🔑 BlackRoad Service API Keys${RESET}"
    echo -e "${PINK}═══════════════════════════════════════${RESET}\n"
    
    # Core Services
    generate_key "brk_claude_code" > "$KEYS_DIR/claude-code-api-key.txt"
    generate_key "brk_github_copilot" > "$KEYS_DIR/github-copilot-api-key.txt"
    generate_key "brk_codex" > "$KEYS_DIR/codex-api-key.txt"
    generate_key "brk_memory_system" > "$KEYS_DIR/memory-api-key.txt"
    generate_key "brk_agent_coordination" > "$KEYS_DIR/coordination-api-key.txt"
    
    # AI Model Services
    generate_key "brk_ollama" > "$KEYS_DIR/ollama-api-key.txt"
    generate_key "brk_localai" > "$KEYS_DIR/localai-api-key.txt"
    generate_key "brk_vllm" > "$KEYS_DIR/vllm-api-key.txt"
    
    # Infrastructure Services
    generate_key "brk_cloudflare" > "$KEYS_DIR/cloudflare-internal-key.txt"
    generate_key "brk_railway" > "$KEYS_DIR/railway-internal-key.txt"
    generate_key "brk_pi_cluster" > "$KEYS_DIR/pi-cluster-key.txt"
    
    echo -e "\n${GREEN}✅ All service keys generated!${RESET}"
    echo -e "   📁 Location: $KEYS_DIR"
}

# Generate keys for all active agents
generate_all_agent_keys() {
    echo -e "\n${PINK}═══════════════════════════════════════${RESET}"
    echo -e "${PINK}  👥 Agent API Keys${RESET}"
    echo -e "${PINK}═══════════════════════════════════════${RESET}\n"
    
    # Get list of active agents
    local agents_dir="$HOME/.blackroad/memory/active-agents"
    local count=0
    
    if [ -d "$agents_dir" ]; then
        for agent_file in "$agents_dir"/*.json; do
            if [ -f "$agent_file" ]; then
                local agent_id=$(basename "$agent_file" .json)
                local agent_name=$(grep '"name"' "$agent_file" | head -1 | cut -d'"' -f4)
                local capabilities='["read","write","execute"]'
                
                generate_agent_key "$agent_id" "$agent_name" "$capabilities" > /dev/null
                ((count++))
            fi
        done
    fi
    
    echo -e "\n${GREEN}✅ Generated keys for $count agents${RESET}"
}

# Create environment export script
create_env_export() {
    cat > "$KEYS_DIR/export-keys.sh" << 'EOF'
#!/bin/bash
# Auto-generated key exports for BlackRoad agents

# Service Keys
export BLACKROAD_CLAUDE_CODE_KEY="$(cat ~/.blackroad/api-keys/claude-code-api-key.txt)"
export BLACKROAD_COPILOT_KEY="$(cat ~/.blackroad/api-keys/github-copilot-api-key.txt)"
export BLACKROAD_CODEX_KEY="$(cat ~/.blackroad/api-keys/codex-api-key.txt)"
export BLACKROAD_MEMORY_KEY="$(cat ~/.blackroad/api-keys/memory-api-key.txt)"
export BLACKROAD_COORDINATION_KEY="$(cat ~/.blackroad/api-keys/coordination-api-key.txt)"

# AI Model Services
export BLACKROAD_OLLAMA_KEY="$(cat ~/.blackroad/api-keys/ollama-api-key.txt)"
export BLACKROAD_LOCALAI_KEY="$(cat ~/.blackroad/api-keys/localai-api-key.txt)"
export BLACKROAD_VLLM_KEY="$(cat ~/.blackroad/api-keys/vllm-api-key.txt)"

# Infrastructure
export BLACKROAD_CLOUDFLARE_INTERNAL_KEY="$(cat ~/.blackroad/api-keys/cloudflare-internal-key.txt)"
export BLACKROAD_RAILWAY_INTERNAL_KEY="$(cat ~/.blackroad/api-keys/railway-internal-key.txt)"
export BLACKROAD_PI_CLUSTER_KEY="$(cat ~/.blackroad/api-keys/pi-cluster-key.txt)"

# Agent-specific key (load dynamically)
if [ -n "$MY_CLAUDE" ] && [ -f ~/.blackroad/api-keys/${MY_CLAUDE}.json ]; then
    export BLACKROAD_AGENT_KEY=$(jq -r '.api_key' ~/.blackroad/api-keys/${MY_CLAUDE}.json)
    export BLACKROAD_AGENT_SECRET=$(jq -r '.api_secret' ~/.blackroad/api-keys/${MY_CLAUDE}.json)
fi

echo "✅ BlackRoad API keys loaded"
EOF
    chmod +x "$KEYS_DIR/export-keys.sh"
}

# Create agent authentication middleware
create_auth_middleware() {
    cat > "$KEYS_DIR/auth-middleware.sh" << 'EOF'
#!/bin/bash
# Agent Authentication Middleware

verify_agent_key() {
    local api_key="$1"
    local keys_dir="$HOME/.blackroad/api-keys"
    
    for key_file in "$keys_dir"/*.json; do
        if [ -f "$key_file" ]; then
            local stored_key=$(jq -r '.api_key' "$key_file" 2>/dev/null)
            if [ "$stored_key" = "$api_key" ]; then
                local status=$(jq -r '.status' "$key_file")
                if [ "$status" = "active" ]; then
                    jq -r '.agent_name' "$key_file"
                    return 0
                else
                    echo "ERROR: Key revoked"
                    return 2
                fi
            fi
        fi
    done
    
    echo "ERROR: Invalid API key"
    return 1
}

# Verify rate limits
check_rate_limit() {
    local api_key="$1"
    # TODO: Implement rate limiting with Redis or SQLite
    return 0
}

EOF
    chmod +x "$KEYS_DIR/auth-middleware.sh"
}

# List all keys
list_keys() {
    echo -e "\n${PINK}═══════════════════════════════════════${RESET}"
    echo -e "${PINK}  📋 BlackRoad API Keys${RESET}"
    echo -e "${PINK}═══════════════════════════════════════${RESET}\n"
    
    echo -e "${BLUE}Service Keys:${RESET}"
    for key_file in "$KEYS_DIR"/*.txt; do
        if [ -f "$key_file" ]; then
            local name=$(basename "$key_file" .txt)
            local key=$(cat "$key_file")
            echo -e "  • $name: ${key:0:30}..."
        fi
    done
    
    echo -e "\n${BLUE}Agent Keys:${RESET}"
    for key_file in "$KEYS_DIR"/*.json; do
        if [ -f "$key_file" ]; then
            local agent=$(jq -r '.agent_name' "$key_file" 2>/dev/null)
            local key=$(jq -r '.api_key' "$key_file" 2>/dev/null)
            local status=$(jq -r '.status' "$key_file" 2>/dev/null)
            echo -e "  • $agent: ${key:0:30}... [$status]"
        fi
    done
}

# Revoke a key
revoke_key() {
    local agent_id="$1"
    local key_file="$KEYS_DIR/${agent_id}.json"
    
    if [ -f "$key_file" ]; then
        local temp=$(mktemp)
        jq '.status = "revoked"' "$key_file" > "$temp"
        mv "$temp" "$key_file"
        echo -e "${GREEN}✅ Key revoked for $agent_id${RESET}"
    else
        echo -e "${RED}❌ Key file not found${RESET}"
        return 1
    fi
}

# Main command handler
case "$1" in
    generate-service)
        generate_service_keys
        ;;
    generate-agents)
        generate_all_agent_keys
        ;;
    generate-all)
        generate_service_keys
        generate_all_agent_keys
        create_env_export
        create_auth_middleware
        echo -e "\n${GREEN}🎉 All keys generated!${RESET}"
        echo -e "   Load keys: ${BLUE}source ~/.blackroad/api-keys/export-keys.sh${RESET}"
        ;;
    list)
        list_keys
        ;;
    revoke)
        revoke_key "$2"
        ;;
    export)
        source "$KEYS_DIR/export-keys.sh"
        ;;
    *)
        echo "BlackRoad Agent API Key Management"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  generate-service   Generate service API keys"
        echo "  generate-agents    Generate API keys for all agents"
        echo "  generate-all       Generate all keys and setup"
        echo "  list               List all API keys"
        echo "  revoke <agent_id>  Revoke an agent's key"
        echo "  export             Load keys into environment"
        echo ""
        echo "Examples:"
        echo "  $0 generate-all"
        echo "  $0 list"
        echo "  source <($0 export)"
        ;;
esac
