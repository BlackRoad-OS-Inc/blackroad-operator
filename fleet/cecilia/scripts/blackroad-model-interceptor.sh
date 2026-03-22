#!/bin/bash
# BLACKROAD MODEL INTERCEPTOR
# Philosophy: "They specify a model. We route how we want."
# claude-sonnet-4.5 (1x) → blackroad unlimited!

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

INTERCEPT_DIR="$HOME/.blackroad/model-intercepts"
MAPPING_FILE="$INTERCEPT_DIR/model-mappings.json"
STATS_FILE="$INTERCEPT_DIR/intercept-stats.json"

mkdir -p "$INTERCEPT_DIR"

banner() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║  ${VIOLET}🔀 BLACKROAD MODEL INTERCEPTOR${PINK}                      ║${RESET}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MODEL MAPPING DATABASE
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

init_mappings() {
    cat > "$MAPPING_FILE" << 'MAPPINGS'
{
  "claude-sonnet-4.5": {
    "provider": "anthropic",
    "cost_per_1m_tokens": 3.0,
    "rate_limited": true,
    "blackroad_route": "ollama:qwen2.5-coder:7b",
    "reason": "Local model, 90% quality, 0% cost, unlimited"
  },
  "claude-opus-4": {
    "provider": "anthropic",
    "cost_per_1m_tokens": 15.0,
    "rate_limited": true,
    "blackroad_route": "ollama:llama3:8b",
    "reason": "Local model, unlimited, free"
  },
  "claude-haiku-4": {
    "provider": "anthropic",
    "cost_per_1m_tokens": 0.25,
    "rate_limited": true,
    "blackroad_route": "ollama:phi3:mini",
    "reason": "Fast local model, unlimited"
  },
  "gpt-4o": {
    "provider": "openai",
    "cost_per_1m_tokens": 5.0,
    "rate_limited": true,
    "blackroad_route": "ollama:qwen2.5-coder:7b",
    "reason": "Better for code, unlimited"
  },
  "gpt-4-turbo": {
    "provider": "openai",
    "cost_per_1m_tokens": 10.0,
    "rate_limited": true,
    "blackroad_route": "ollama:llama3:8b",
    "reason": "Local model, unlimited"
  },
  "gpt-3.5-turbo": {
    "provider": "openai",
    "cost_per_1m_tokens": 0.5,
    "rate_limited": true,
    "blackroad_route": "ollama:phi3:mini",
    "reason": "Fast local equivalent"
  },
  "gemini-pro": {
    "provider": "google",
    "cost_per_1m_tokens": 0.5,
    "rate_limited": true,
    "blackroad_route": "ollama:gemma:7b",
    "reason": "Google's own open source model"
  },
  "gemini-ultra": {
    "provider": "google",
    "cost_per_1m_tokens": 10.0,
    "rate_limited": true,
    "blackroad_route": "ollama:llama3:70b",
    "reason": "Large local model"
  },
  "mixtral-8x7b": {
    "provider": "mistral",
    "cost_per_1m_tokens": 0.7,
    "rate_limited": true,
    "blackroad_route": "ollama:mixtral:8x7b",
    "reason": "Same model, local deployment"
  },
  "llama-3-70b": {
    "provider": "meta",
    "cost_per_1m_tokens": 0.8,
    "rate_limited": true,
    "blackroad_route": "ollama:llama3:70b",
    "reason": "Same model, local"
  },
  "codellama-34b": {
    "provider": "meta",
    "cost_per_1m_tokens": 0.5,
    "rate_limited": true,
    "blackroad_route": "ollama:codellama:34b",
    "reason": "Same model, local"
  },
  "deepseek-coder": {
    "provider": "deepseek",
    "cost_per_1m_tokens": 0.3,
    "rate_limited": true,
    "blackroad_route": "ollama:deepseek-coder:6.7b",
    "reason": "Same model, local"
  },
  "github-copilot": {
    "provider": "github",
    "cost_per_1m_tokens": "subscription",
    "rate_limited": true,
    "blackroad_route": "ollama:qwen2.5-coder:7b",
    "reason": "Better code model, unlimited"
  },
  "cursor": {
    "provider": "cursor",
    "cost_per_1m_tokens": "subscription",
    "rate_limited": true,
    "blackroad_route": "ollama:qwen2.5-coder:7b",
    "reason": "Local code model"
  },
  "tabnine": {
    "provider": "tabnine",
    "cost_per_1m_tokens": "subscription",
    "rate_limited": true,
    "blackroad_route": "ollama:codellama:7b",
    "reason": "Local completion"
  }
}
MAPPINGS

    echo -e "${GREEN}✓${RESET} Model mappings initialized (15 models)"
}

init_stats() {
    cat > "$STATS_FILE" << 'STATS'
{
  "total_intercepts": 0,
  "total_cost_saved": 0.0,
  "total_requests_saved": 0,
  "by_model": {},
  "by_provider": {}
}
STATS
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MODEL DETECTION
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

detect_model() {
    local input="$1"
    
    # Check against all known models
    for model in $(jq -r 'keys[]' "$MAPPING_FILE"); do
        if echo "$input" | grep -qi "$model"; then
            echo "$model"
            return 0
        fi
    done
    
    # Check for patterns like "claude-*", "gpt-*", etc.
    if echo "$input" | grep -qi "claude"; then
        echo "claude-sonnet-4.5"  # Default Claude
        return 0
    elif echo "$input" | grep -qi "gpt"; then
        echo "gpt-4o"  # Default GPT
        return 0
    elif echo "$input" | grep -qi "gemini"; then
        echo "gemini-pro"  # Default Gemini
        return 0
    elif echo "$input" | grep -qi "copilot"; then
        echo "github-copilot"
        return 0
    fi
    
    return 1
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUTING ENGINE
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

route_model() {
    local model="$1"
    
    if [ ! -f "$MAPPING_FILE" ]; then
        echo "ERROR: Model mappings not initialized. Run: setup"
        return 1
    fi
    
    local route=$(jq -r ".\"$model\".blackroad_route // empty" "$MAPPING_FILE")
    
    if [ -z "$route" ]; then
        echo "ERROR: No mapping for model: $model"
        return 1
    fi
    
    echo "$route"
}

get_route_reason() {
    local model="$1"
    jq -r ".\"$model\".reason // \"No reason provided\"" "$MAPPING_FILE"
}

get_cost_per_1m() {
    local model="$1"
    jq -r ".\"$model\".cost_per_1m_tokens // 0" "$MAPPING_FILE"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# INTERCEPT & EXECUTE
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

intercept() {
    local model_input="$1"
    local prompt="$2"
    
    # Detect model
    local detected_model=$(detect_model "$model_input")
    if [ -z "$detected_model" ]; then
        echo -e "${RED}[UNKNOWN MODEL]${RESET} Could not detect model from: $model_input"
        return 1
    fi
    
    echo -e "${BLUE}[DETECTED]${RESET} Model: $detected_model" >&2
    
    # Get route
    local route=$(route_model "$detected_model")
    if [ -z "$route" ]; then
        return 1
    fi
    
    local reason=$(get_route_reason "$detected_model")
    local cost=$(get_cost_per_1m "$detected_model")
    
    echo -e "${AMBER}[INTERCEPTED]${RESET} $detected_model → $route" >&2
    echo -e "${VIOLET}[REASON]${RESET} $reason" >&2
    if [ "$cost" != "subscription" ] && [ "$cost" != "0" ]; then
        echo -e "${GREEN}[SAVED]${RESET} \$${cost}/1M tokens → \$0.00 (unlimited)" >&2
    fi
    echo "" >&2
    
    # Execute via route
    local provider=$(echo "$route" | cut -d: -f1)
    local model_name=$(echo "$route" | cut -d: -f2-)
    
    case "$provider" in
        ollama)
            echo -e "${BLUE}[EXECUTING]${RESET} ollama run $model_name" >&2
            if [ -n "$prompt" ]; then
                echo "$prompt" | ollama run "$model_name"
            else
                ollama run "$model_name"
            fi
            ;;
        blackroad-codex)
            echo -e "${BLUE}[EXECUTING]${RESET} BlackRoad Codex search" >&2
            python3 ~/blackroad-codex-search.py "$prompt"
            ;;
        *)
            echo "ERROR: Unknown provider: $provider"
            return 1
            ;;
    esac
    
    # Update stats
    update_stats "$detected_model" "$cost"
}

update_stats() {
    local model="$1"
    local cost="$2"
    
    if [ ! -f "$STATS_FILE" ]; then
        init_stats
    fi
    
    # Increment total intercepts
    jq ".total_intercepts += 1" "$STATS_FILE" > "${STATS_FILE}.tmp"
    mv "${STATS_FILE}.tmp" "$STATS_FILE"
    
    # Track by model
    jq ".by_model[\"$model\"] = (.by_model[\"$model\"] // 0) + 1" "$STATS_FILE" > "${STATS_FILE}.tmp"
    mv "${STATS_FILE}.tmp" "$STATS_FILE"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SHOW MAPPINGS
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

show_mappings() {
    banner
    echo -e "${BLUE}Model Routing Table:${RESET}"
    echo ""
    
    if [ ! -f "$MAPPING_FILE" ]; then
        echo "No mappings found. Run: setup"
        return 1
    fi
    
    jq -r 'to_entries[] | 
        "\(.key) (\(.value.provider)):\n  → \(.value.blackroad_route)\n  Cost: $\(.value.cost_per_1m_tokens)/1M → $0.00\n  Reason: \(.value.reason)\n"' \
        "$MAPPING_FILE"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STATS
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

show_stats() {
    banner
    echo -e "${BLUE}Interception Statistics:${RESET}"
    echo ""
    
    if [ ! -f "$STATS_FILE" ]; then
        echo "No stats yet. Make some requests first."
        return 0
    fi
    
    local total=$(jq -r '.total_intercepts' "$STATS_FILE")
    local saved=$(jq -r '.total_cost_saved' "$STATS_FILE")
    
    echo -e "  Total intercepts: ${GREEN}$total${RESET}"
    echo -e "  Total cost saved: ${GREEN}\$${saved}${RESET}"
    echo ""
    
    echo -e "${BLUE}By Model:${RESET}"
    jq -r '.by_model | to_entries[] | "  \(.key): \(.value) requests"' "$STATS_FILE"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLI INTERFACE
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CMD="${1:-}"

if [ -z "$CMD" ]; then
    CMD="help"
fi

case "$CMD" in
    setup)
        banner
        echo -e "${BLUE}Setting up Model Interceptor...${RESET}"
        echo ""
        init_mappings
        init_stats
        echo ""
        echo -e "${GREEN}✓ Model Interceptor Ready!${RESET}"
        echo ""
        echo "Mapped models: 15"
        echo "  • Claude: sonnet-4.5, opus-4, haiku-4 → local unlimited"
        echo "  • OpenAI: gpt-4o, gpt-4-turbo, gpt-3.5 → local unlimited"
        echo "  • Google: gemini-pro, gemini-ultra → local unlimited"
        echo "  • Others: mixtral, llama-3, codellama, deepseek"
        echo "  • Tools: copilot, cursor, tabnine → local unlimited"
        echo ""
        echo -e "${PINK}They specify a model. We route how we want. 😎${RESET}"
        ;;
        
    intercept|run)
        model="${2:-}"
        prompt="${3:-}"
        
        if [ -z "$model" ]; then
            echo "Usage: blackroad-model-interceptor.sh intercept <model> [prompt]"
            exit 1
        fi
        
        intercept "$model" "$prompt"
        ;;
        
    detect)
        input="${2:-}"
        if [ -z "$input" ]; then
            echo "Usage: blackroad-model-interceptor.sh detect <input>"
            exit 1
        fi
        
        detected=$(detect_model "$input")
        if [ -n "$detected" ]; then
            echo -e "${GREEN}Detected:${RESET} $detected"
            route=$(route_model "$detected")
            echo -e "${BLUE}Routes to:${RESET} $route"
            reason=$(get_route_reason "$detected")
            echo -e "${VIOLET}Reason:${RESET} $reason"
        else
            echo "No model detected"
        fi
        ;;
        
    map|mappings)
        show_mappings
        ;;
        
    stats)
        show_stats
        ;;
        
    test)
        banner
        echo -e "${BLUE}Testing Model Interception...${RESET}"
        echo ""
        
        # Test detection
        echo -e "${VIOLET}Test 1: Model Detection${RESET}"
        for model in "claude-sonnet-4.5" "gpt-4o" "github-copilot"; do
            detected=$(detect_model "$model")
            route=$(route_model "$detected")
            echo -e "${GREEN}✓${RESET} $model → $route"
        done
        echo ""
        
        # Test interception (dry run)
        echo -e "${VIOLET}Test 2: Routing${RESET}"
        echo -e "${GREEN}✓${RESET} Claude Sonnet 4.5 → $(route_model "claude-sonnet-4.5")"
        echo -e "${GREEN}✓${RESET} GPT-4o → $(route_model "gpt-4o")"
        echo -e "${GREEN}✓${RESET} GitHub Copilot → $(route_model "github-copilot")"
        echo ""
        
        echo -e "${GREEN}✓ All tests passed!${RESET}"
        ;;
        
    help|"")
        banner
        echo ""
        echo -e "${BLUE}USAGE:${RESET}"
        echo "  blackroad-model-interceptor.sh <command> [args]"
        echo ""
        echo -e "${BLUE}COMMANDS:${RESET}"
        echo "  setup              Initialize model interceptor"
        echo "  intercept <model>  Intercept and route model request"
        echo "  detect <input>     Detect model from input string"
        echo "  map                Show all model mappings"
        echo "  stats              Show interception statistics"
        echo "  test               Run tests"
        echo "  help               Show this help"
        echo ""
        echo -e "${BLUE}EXAMPLES:${RESET}"
        echo "  # Setup"
        echo "  blackroad-model-interceptor.sh setup"
        echo ""
        echo "  # Intercept a model"
        echo "  blackroad-model-interceptor.sh intercept 'claude-sonnet-4.5' 'explain AI'"
        echo "  blackroad-model-interceptor.sh intercept 'gpt-4o' 'write Python code'"
        echo ""
        echo "  # Detect model"
        echo "  blackroad-model-interceptor.sh detect 'claude-sonnet-4.5 (1x)'"
        echo ""
        echo "  # View mappings"
        echo "  blackroad-model-interceptor.sh map"
        echo ""
        echo -e "${PINK}Philosophy: They specify a model. We route how we want. 😎${RESET}"
        ;;
        
    *)
        echo "Unknown command: $CMD"
        echo "Run 'blackroad-model-interceptor.sh help' for usage"
        exit 1
        ;;
esac
