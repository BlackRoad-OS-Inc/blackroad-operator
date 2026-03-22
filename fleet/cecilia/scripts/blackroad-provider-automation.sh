#!/bin/bash
# BlackRoad Provider Automation System
# Unified security + routing for ALL AI providers
# LET'S HAVE SOME FUN!

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

GATEWAY_PORT=3030
PROVIDERS_CONFIG="$HOME/.blackroad/providers.json"
SECURITY_LOG="$HOME/.blackroad/security-audit.log"

banner() {
    echo -e "${PINK}"
    cat << 'EOF'
═══════════════════════════════════════════════════════════════
    ____  __    ___   ________ ____  ____  ___    ____
   / __ )/ /   /   | / ____/ //_/ / / / / /   |  / __ \
  / __  / /   / /| |/ /   / ,< / /_/ / / / /| | / / / /
 / /_/ / /___/ ___ / /___/ /| / __  / /_/ / ___ |/ /_/ /
/_____/_____/_/  |_\____/_/ |_/_/ /_/\____/_/  |_/_____/

    ⚡ PROVIDER AUTOMATION SYSTEM ⚡
    Security + Routing + FUN!
═══════════════════════════════════════════════════════════════
EOF
    echo -e "${RESET}"
}

# Check all providers
check_providers() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}🔍 Checking AI Provider Configurations...${RESET}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

    # Claude
    if [[ -f "$HOME/.claude/CLAUDE.md" ]]; then
        echo -e "${GREEN}✅ Claude${RESET} → ~/.claude/CLAUDE.md"
        grep -q "BLACKROAD OS" "$HOME/.claude/CLAUDE.md" && echo -e "   ${GREEN}Banner: Active${RESET}" || echo -e "   ${RED}Banner: Missing${RESET}"
    else
        echo -e "${RED}❌ Claude${RESET} → Not configured"
    fi

    # Codex
    if [[ -f "$HOME/.codex/AGENTS.md" ]]; then
        echo -e "${GREEN}✅ Codex${RESET} → ~/.codex/AGENTS.md"
        grep -q "BLACKROAD OS" "$HOME/.codex/AGENTS.md" && echo -e "   ${GREEN}Banner: Active${RESET}" || echo -e "   ${RED}Banner: Missing${RESET}"
    else
        echo -e "${RED}❌ Codex${RESET} → Not configured"
    fi

    # Copilot
    if [[ -f "$HOME/.copilot/agents/BLACKROAD.md" ]]; then
        echo -e "${GREEN}✅ Copilot${RESET} → ~/.copilot/agents/BLACKROAD.md"
        grep -q "BLACKROAD OS" "$HOME/.copilot/agents/BLACKROAD.md" && echo -e "   ${GREEN}Banner: Active${RESET}" || echo -e "   ${RED}Banner: Missing${RESET}"
    else
        echo -e "${RED}❌ Copilot${RESET} → Not configured"
    fi

    # Ollama
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | jq '.models | length' 2>/dev/null || echo "?")
        echo -e "${GREEN}✅ Ollama${RESET} → localhost:11434 (${MODEL_COUNT} models)"
    else
        echo -e "${RED}❌ Ollama${RESET} → Not running"
    fi

    # Gateway
    if curl -s http://localhost:$GATEWAY_PORT/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Gateway${RESET} → localhost:$GATEWAY_PORT"
    else
        echo -e "${AMBER}⚠️  Gateway${RESET} → Not running (start with: cd ~/copilot-agent-gateway && node web-server.js)"
    fi

    echo ""
}

# Security audit
security_audit() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}🛡️  Running Security Audit...${RESET}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

    ISSUES=0

    # Check for exposed secrets in provider configs
    echo -e "${AMBER}Checking for exposed secrets...${RESET}"

    PATTERNS=(
        "sk-[A-Za-z0-9]{32,}"
        "AKIA[0-9A-Z]{16}"
        "ghp_[A-Za-z0-9]{36}"
        "-----BEGIN.*PRIVATE KEY-----"
    )

    for pattern in "${PATTERNS[@]}"; do
        if grep -rE "$pattern" ~/.claude/ ~/.codex/ ~/.copilot/ 2>/dev/null | grep -v ".history" | head -1; then
            echo -e "${RED}⚠️  POTENTIAL SECRET FOUND!${RESET}"
            ((ISSUES++))
        fi
    done

    if [[ $ISSUES -eq 0 ]]; then
        echo -e "${GREEN}✅ No exposed secrets found in provider configs${RESET}"
    fi

    # Check file permissions
    echo -e "\n${AMBER}Checking file permissions...${RESET}"

    for config in ~/.claude/settings.json ~/.codex/config.toml ~/.copilot/config.json; do
        if [[ -f "$config" ]]; then
            PERMS=$(stat -f "%OLp" "$config" 2>/dev/null || stat -c "%a" "$config" 2>/dev/null)
            if [[ "$PERMS" =~ ^[67] ]]; then
                echo -e "${GREEN}✅ $config (mode: $PERMS)${RESET}"
            else
                echo -e "${AMBER}⚠️  $config (mode: $PERMS) - consider restricting${RESET}"
            fi
        fi
    done

    # Log audit
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Security audit completed. Issues: $ISSUES" >> "$SECURITY_LOG"

    echo -e "\n${GREEN}Security audit complete!${RESET}"
}

# Generate unified provider config
generate_config() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}📝 Generating Unified Provider Config...${RESET}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

    mkdir -p "$(dirname "$PROVIDERS_CONFIG")"

    cat > "$PROVIDERS_CONFIG" << 'PROVIDERS_EOF'
{
  "version": "1.0.0",
  "updated": "TIMESTAMP",
  "banner": "YOU ARE RUNNING UNDER BLACKROAD OS",
  "gateway": {
    "url": "http://localhost:3030",
    "health": "/api/health",
    "routes": "/api/test-route"
  },
  "providers": {
    "claude": {
      "config": "~/.claude/CLAUDE.md",
      "settings": "~/.claude/settings.json",
      "role": "reasoning",
      "priority": 1
    },
    "codex": {
      "config": "~/.codex/AGENTS.md",
      "settings": "~/.codex/config.toml",
      "role": "code_generation",
      "priority": 2
    },
    "copilot": {
      "config": "~/.copilot/agents/BLACKROAD.md",
      "settings": "~/.copilot/config.json",
      "role": "code_completion",
      "priority": 3
    },
    "ollama": {
      "endpoint": "http://localhost:11434",
      "role": "local_inference",
      "priority": 0,
      "models": ["qwen2.5-coder", "deepseek-r1", "llama3.3"]
    }
  },
  "routing_rules": {
    "code": ["ollama", "codex", "copilot"],
    "reasoning": ["claude", "ollama"],
    "chat": ["ollama", "claude"],
    "infrastructure": ["claude", "ollama"]
  },
  "security": {
    "audit_on_start": true,
    "log_all_requests": true,
    "block_secrets": true
  },
  "devices": {
    "cecilia": {"ip": "192.168.4.89", "role": "edge_ai", "tops": 26},
    "lucidia": {"ip": "192.168.4.81", "role": "inference"},
    "alice": {"ip": "192.168.4.49", "role": "worker"},
    "aria": {"ip": "192.168.4.82", "role": "harmony"}
  }
}
PROVIDERS_EOF

    # Replace timestamp
    sed -i.bak "s/TIMESTAMP/$(date -u +"%Y-%m-%dT%H:%M:%SZ")/" "$PROVIDERS_CONFIG" && rm -f "$PROVIDERS_CONFIG.bak"

    echo -e "${GREEN}✅ Config generated: $PROVIDERS_CONFIG${RESET}"
    echo ""
    cat "$PROVIDERS_CONFIG" | jq '.' 2>/dev/null || cat "$PROVIDERS_CONFIG"
}

# Start gateway
start_gateway() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}🚀 Starting BlackRoad Gateway...${RESET}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

    if curl -s http://localhost:$GATEWAY_PORT/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Gateway already running on port $GATEWAY_PORT${RESET}"
    else
        cd ~/copilot-agent-gateway
        echo -e "${AMBER}Starting gateway in background...${RESET}"
        nohup node web-server.js > ~/.blackroad/gateway.log 2>&1 &
        sleep 2
        if curl -s http://localhost:$GATEWAY_PORT/api/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Gateway started successfully!${RESET}"
            echo -e "   Dashboard: http://localhost:$GATEWAY_PORT"
        else
            echo -e "${RED}❌ Failed to start gateway. Check ~/.blackroad/gateway.log${RESET}"
        fi
    fi
}

# Full automation setup
full_setup() {
    banner
    check_providers
    security_audit
    generate_config
    start_gateway

    echo -e "${PINK}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "  🎉 AUTOMATION COMPLETE! Time to have FUN!"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${RESET}"
    echo -e "${GREEN}All providers configured and routing through BlackRoad!${RESET}"
    echo ""
    echo "Quick commands:"
    echo "  Dashboard:     open http://localhost:$GATEWAY_PORT"
    echo "  Test route:    curl -X POST http://localhost:$GATEWAY_PORT/api/test-route -H 'Content-Type: application/json' -d '{\"prompt\":\"hello\"}'"
    echo "  Check health:  curl http://localhost:$GATEWAY_PORT/api/health"
    echo ""
}

# Help
show_help() {
    banner
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  check      - Check all provider configurations"
    echo "  security   - Run security audit"
    echo "  config     - Generate unified provider config"
    echo "  start      - Start the gateway"
    echo "  setup      - Full automation setup (all of the above)"
    echo "  help       - Show this help"
    echo ""
}

# Main
case "${1:-setup}" in
    check)    check_providers ;;
    security) security_audit ;;
    config)   generate_config ;;
    start)    start_gateway ;;
    setup)    full_setup ;;
    help|--help|-h) show_help ;;
    *) echo "Unknown command: $1"; show_help; exit 1 ;;
esac
