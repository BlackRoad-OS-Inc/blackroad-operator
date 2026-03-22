#!/bin/bash
# BLACKROAD LLM ROUTER
# Intelligent routing: Ollama first, escalate to Claude/OpenAI only when needed
# Philosophy: "Local is default. Cloud is backup."

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
CYAN='\033[38;5;51m'
RESET='\033[0m'

ROUTER_DIR="$HOME/.blackroad/llm-router"
DB_FILE="$ROUTER_DIR/router.db"
CONFIG_FILE="$ROUTER_DIR/config.json"
LOG_FILE="$ROUTER_DIR/router.log"

mkdir -p "$ROUTER_DIR"

# Ollama endpoint
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"

# Complexity thresholds
SIMPLE_TOKEN_LIMIT=100        # Simple tasks: < 100 tokens expected
MEDIUM_TOKEN_LIMIT=500        # Medium tasks: 100-500 tokens
COMPLEX_TOKEN_LIMIT=2000      # Complex tasks: 500-2000 tokens
# Above 2000 = always escalate

# Cost tracking
COST_SAVED=0

banner() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║  ${VIOLET}BLACKROAD LLM ROUTER${PINK}                                    ║${RESET}"
    echo -e "${PINK}║  ${CYAN}Local First • Cloud Backup • Zero Lock-in${PINK}                ║${RESET}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
}

#------------------------------------------------------------------------------
# Database
#------------------------------------------------------------------------------

init_db() {
    sqlite3 "$DB_FILE" << 'SQL'
CREATE TABLE IF NOT EXISTS routing_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    prompt_hash TEXT,
    complexity_score INTEGER,
    route TEXT,                    -- ollama, claude, openai
    reason TEXT,
    response_quality INTEGER,      -- 1-5 rating (can be updated)
    tokens_used INTEGER,
    latency_ms INTEGER,
    cost_usd REAL DEFAULT 0,
    cost_saved_usd REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS model_capabilities (
    model TEXT PRIMARY KEY,
    provider TEXT,
    max_context INTEGER,
    supports_code INTEGER,
    supports_math INTEGER,
    supports_reasoning INTEGER,
    supports_vision INTEGER,
    avg_quality REAL,
    cost_per_1k_in REAL,
    cost_per_1k_out REAL
);

CREATE TABLE IF NOT EXISTS escalation_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT,
    min_complexity INTEGER,
    required_capability TEXT,
    preferred_model TEXT
);

-- Insert default model capabilities
INSERT OR REPLACE INTO model_capabilities VALUES
    ('llama2', 'ollama', 4096, 1, 0, 1, 0, 3.5, 0, 0),
    ('llama3', 'ollama', 8192, 1, 1, 1, 0, 4.0, 0, 0),
    ('codellama', 'ollama', 16384, 1, 0, 0, 0, 4.2, 0, 0),
    ('mistral', 'ollama', 8192, 1, 1, 1, 0, 4.0, 0, 0),
    ('mixtral', 'ollama', 32768, 1, 1, 1, 0, 4.3, 0, 0),
    ('deepseek-coder', 'ollama', 16384, 1, 0, 0, 0, 4.5, 0, 0),
    ('phi3', 'ollama', 4096, 1, 1, 1, 0, 3.8, 0, 0),
    ('qwen2', 'ollama', 32768, 1, 1, 1, 0, 4.2, 0, 0),
    ('claude-3-opus', 'anthropic', 200000, 1, 1, 1, 1, 4.9, 0.015, 0.075),
    ('claude-3-sonnet', 'anthropic', 200000, 1, 1, 1, 1, 4.7, 0.003, 0.015),
    ('claude-3-haiku', 'anthropic', 200000, 1, 1, 1, 1, 4.3, 0.00025, 0.00125),
    ('gpt-4', 'openai', 128000, 1, 1, 1, 1, 4.8, 0.03, 0.06),
    ('gpt-4-turbo', 'openai', 128000, 1, 1, 1, 1, 4.7, 0.01, 0.03),
    ('gpt-4o', 'openai', 128000, 1, 1, 1, 1, 4.6, 0.005, 0.015),
    ('gpt-3.5-turbo', 'openai', 16385, 1, 0, 0, 0, 3.8, 0.0005, 0.0015);

-- Default escalation patterns
INSERT OR REPLACE INTO escalation_patterns (pattern, min_complexity, required_capability, preferred_model) VALUES
    ('write.*code|implement|function|class|debug', 50, 'supports_code', 'codellama'),
    ('math|equation|calculate|integral|derivative', 70, 'supports_math', 'claude-3-sonnet'),
    ('reason|analyze|think.*step|logic|proof', 80, 'supports_reasoning', 'claude-3-sonnet'),
    ('image|picture|photo|vision|看|describe.*image', 90, 'supports_vision', 'claude-3-sonnet'),
    ('complex|difficult|challenging|expert', 85, 'supports_reasoning', 'claude-3-sonnet');
SQL
    echo -e "${GREEN}✓${RESET} Router database initialized"
}

init_config() {
    cat > "$CONFIG_FILE" << 'JSON'
{
  "default_provider": "ollama",
  "default_model": "llama3",
  "fallback_chain": ["ollama", "claude", "openai"],
  "escalation": {
    "enabled": true,
    "complexity_threshold": 70,
    "token_threshold": 500,
    "always_escalate_patterns": [
      "vision", "image", "analyze this picture",
      "complex reasoning", "mathematical proof"
    ]
  },
  "ollama": {
    "host": "http://localhost:11434",
    "models": ["llama3", "codellama", "mistral", "mixtral"],
    "timeout_ms": 60000
  },
  "claude": {
    "model": "claude-3-haiku-20240307",
    "escalate_to": "claude-3-sonnet-20240229",
    "max_tokens": 4096
  },
  "openai": {
    "model": "gpt-3.5-turbo",
    "escalate_to": "gpt-4-turbo",
    "max_tokens": 4096
  },
  "cost_limits": {
    "daily_usd": 10.00,
    "monthly_usd": 100.00,
    "warn_at_percent": 80
  }
}
JSON
    echo -e "${GREEN}✓${RESET} Router config initialized"
}

#------------------------------------------------------------------------------
# Complexity Analysis
#------------------------------------------------------------------------------

analyze_complexity() {
    local prompt="$1"
    local score=0

    # Length factor (longer = potentially more complex)
    local length=${#prompt}
    if [ "$length" -gt 1000 ]; then
        score=$((score + 30))
    elif [ "$length" -gt 500 ]; then
        score=$((score + 20))
    elif [ "$length" -gt 200 ]; then
        score=$((score + 10))
    fi

    # Code indicators
    if echo "$prompt" | grep -qiE 'implement|function|class|debug|refactor|optimize|algorithm'; then
        score=$((score + 25))
    fi
    if echo "$prompt" | grep -qE '\`\`\`|def |class |function |const |let |var '; then
        score=$((score + 20))
    fi

    # Math indicators
    if echo "$prompt" | grep -qiE 'calculate|equation|integral|derivative|matrix|vector|proof'; then
        score=$((score + 30))
    fi

    # Reasoning indicators
    if echo "$prompt" | grep -qiE 'analyze|reason|step.by.step|logic|explain why|compare|contrast'; then
        score=$((score + 25))
    fi

    # Multi-step indicators
    if echo "$prompt" | grep -qiE 'first.*then|step 1|multiple|several|list.*all'; then
        score=$((score + 15))
    fi

    # Vision indicators (always escalate)
    if echo "$prompt" | grep -qiE 'image|picture|photo|screenshot|diagram|看|vision'; then
        score=$((score + 50))
    fi

    # Simple queries (reduce score)
    if echo "$prompt" | grep -qiE '^(what is|who is|when did|where is|how do you say)'; then
        score=$((score - 20))
    fi
    if echo "$prompt" | grep -qiE 'hello|hi|hey|thanks|thank you'; then
        score=$((score - 30))
    fi

    # Clamp to 0-100
    [ "$score" -lt 0 ] && score=0
    [ "$score" -gt 100 ] && score=100

    echo "$score"
}

detect_required_capability() {
    local prompt="$1"

    if echo "$prompt" | grep -qiE 'image|picture|photo|vision|diagram'; then
        echo "supports_vision"
    elif echo "$prompt" | grep -qiE 'code|implement|function|debug|programming'; then
        echo "supports_code"
    elif echo "$prompt" | grep -qiE 'math|equation|calculate|proof|theorem'; then
        echo "supports_math"
    elif echo "$prompt" | grep -qiE 'reason|analyze|logic|think.*step'; then
        echo "supports_reasoning"
    else
        echo "none"
    fi
}

#------------------------------------------------------------------------------
# Routing Logic
#------------------------------------------------------------------------------

select_route() {
    local prompt="$1"
    local complexity="$2"
    local capability="$3"

    # Vision always requires cloud (Ollama can't do vision yet reliably)
    if [ "$capability" = "supports_vision" ]; then
        echo "claude:claude-3-sonnet-20240229:vision_required"
        return
    fi

    # Low complexity = always local
    if [ "$complexity" -lt 30 ]; then
        echo "ollama:llama3:low_complexity"
        return
    fi

    # Check if Ollama is available
    if ! curl -s "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
        echo "claude:claude-3-haiku-20240307:ollama_unavailable"
        return
    fi

    # Medium complexity = try Ollama with appropriate model
    if [ "$complexity" -lt 70 ]; then
        case "$capability" in
            supports_code)
                echo "ollama:codellama:code_task"
                ;;
            supports_math)
                # Math is borderline - try Ollama first
                echo "ollama:mixtral:math_task"
                ;;
            *)
                echo "ollama:llama3:medium_complexity"
                ;;
        esac
        return
    fi

    # High complexity = escalate to cloud
    if [ "$complexity" -lt 85 ]; then
        echo "claude:claude-3-haiku-20240307:high_complexity"
        return
    fi

    # Very high complexity = use stronger model
    echo "claude:claude-3-sonnet-20240229:very_high_complexity"
}

#------------------------------------------------------------------------------
# Request Execution
#------------------------------------------------------------------------------

call_ollama() {
    local model="$1"
    local prompt="$2"
    local max_tokens="${3:-2048}"

    local start_time=$(python3 -c "import time; print(int(time.time() * 1000))")

    local response=$(curl -s "$OLLAMA_HOST/api/generate" \
        -d "{\"model\": \"$model\", \"prompt\": \"$prompt\", \"stream\": false, \"options\": {\"num_predict\": $max_tokens}}" \
        2>/dev/null)

    local end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    local latency=$((end_time - start_time))

    local text=$(echo "$response" | jq -r '.response // empty')
    local tokens=$(echo "$response" | jq -r '.eval_count // 0')

    if [ -z "$text" ]; then
        echo "ERROR:ollama_failed"
        return 1
    fi

    echo "SUCCESS:$latency:$tokens:$text"
}

call_claude() {
    local model="$1"
    local prompt="$2"
    local max_tokens="${3:-2048}"

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "ERROR:no_api_key"
        return 1
    fi

    local start_time=$(python3 -c "import time; print(int(time.time() * 1000))")

    local response=$(curl -s "https://api.anthropic.com/v1/messages" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d "{\"model\": \"$model\", \"max_tokens\": $max_tokens, \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}]}" \
        2>/dev/null)

    local end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    local latency=$((end_time - start_time))

    local text=$(echo "$response" | jq -r '.content[0].text // empty')
    local input_tokens=$(echo "$response" | jq -r '.usage.input_tokens // 0')
    local output_tokens=$(echo "$response" | jq -r '.usage.output_tokens // 0')
    local tokens=$((input_tokens + output_tokens))

    if [ -z "$text" ]; then
        local error=$(echo "$response" | jq -r '.error.message // "unknown"')
        echo "ERROR:$error"
        return 1
    fi

    # Calculate cost
    local cost=$(echo "scale=6; $input_tokens * 0.003 / 1000 + $output_tokens * 0.015 / 1000" | bc)

    echo "SUCCESS:$latency:$tokens:$cost:$text"
}

call_openai() {
    local model="$1"
    local prompt="$2"
    local max_tokens="${3:-2048}"

    if [ -z "$OPENAI_API_KEY" ]; then
        echo "ERROR:no_api_key"
        return 1
    fi

    local start_time=$(python3 -c "import time; print(int(time.time() * 1000))")

    local response=$(curl -s "https://api.openai.com/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{\"model\": \"$model\", \"max_tokens\": $max_tokens, \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}]}" \
        2>/dev/null)

    local end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    local latency=$((end_time - start_time))

    local text=$(echo "$response" | jq -r '.choices[0].message.content // empty')
    local tokens=$(echo "$response" | jq -r '.usage.total_tokens // 0')

    if [ -z "$text" ]; then
        echo "ERROR:openai_failed"
        return 1
    fi

    echo "SUCCESS:$latency:$tokens:$text"
}

#------------------------------------------------------------------------------
# Main Router
#------------------------------------------------------------------------------

route() {
    local prompt="$1"
    local force_provider="${2:-}"

    # Analyze
    local complexity=$(analyze_complexity "$prompt")
    local capability=$(detect_required_capability "$prompt")
    local prompt_hash=$(echo -n "$prompt" | shasum -a 256 | cut -d' ' -f1 | head -c 16)

    echo -e "${BLUE}[ROUTER]${RESET} Analyzing request..." >&2
    echo -e "  Complexity: ${VIOLET}$complexity/100${RESET}" >&2
    echo -e "  Capability: ${CYAN}$capability${RESET}" >&2

    # Get route
    local route_info
    if [ -n "$force_provider" ]; then
        route_info="$force_provider:forced:user_override"
    else
        route_info=$(select_route "$prompt" "$complexity" "$capability")
    fi

    local provider=$(echo "$route_info" | cut -d: -f1)
    local model=$(echo "$route_info" | cut -d: -f2)
    local reason=$(echo "$route_info" | cut -d: -f3)

    echo -e "  Route: ${GREEN}$provider${RESET} → ${AMBER}$model${RESET} ($reason)" >&2

    # Execute
    local result
    local cost=0
    local cost_saved=0

    case "$provider" in
        ollama)
            result=$(call_ollama "$model" "$prompt")
            # Calculate what we would have paid
            local tokens=$(echo "$result" | cut -d: -f3)
            cost_saved=$(echo "scale=6; $tokens * 0.003 / 1000" | bc 2>/dev/null || echo "0")
            ;;
        claude)
            result=$(call_claude "$model" "$prompt")
            cost=$(echo "$result" | cut -d: -f4)
            ;;
        openai)
            result=$(call_openai "$model" "$prompt")
            ;;
    esac

    local status=$(echo "$result" | cut -d: -f1)

    if [ "$status" = "ERROR" ]; then
        local error=$(echo "$result" | cut -d: -f2)
        echo -e "${RED}[ERROR]${RESET} $provider failed: $error" >&2

        # Fallback
        if [ "$provider" = "ollama" ]; then
            echo -e "${AMBER}[FALLBACK]${RESET} Trying Claude..." >&2
            result=$(call_claude "claude-3-haiku-20240307" "$prompt")
            provider="claude"
            model="claude-3-haiku-20240307"
            reason="fallback"
            cost=$(echo "$result" | cut -d: -f4)
        fi
    fi

    local latency=$(echo "$result" | cut -d: -f2)
    local tokens=$(echo "$result" | cut -d: -f3)

    # Extract text (last field, may contain colons)
    local text
    if [ "$provider" = "claude" ]; then
        text=$(echo "$result" | cut -d: -f5-)
    else
        text=$(echo "$result" | cut -d: -f4-)
    fi

    # Log decision
    sqlite3 "$DB_FILE" "INSERT INTO routing_decisions (prompt_hash, complexity_score, route, reason, tokens_used, latency_ms, cost_usd, cost_saved_usd) VALUES ('$prompt_hash', $complexity, '$provider:$model', '$reason', ${tokens:-0}, ${latency:-0}, ${cost:-0}, ${cost_saved:-0});" 2>/dev/null || true

    # Summary
    echo "" >&2
    if [ "${cost_saved:-0}" != "0" ] && [ "$cost_saved" != "" ]; then
        echo -e "${GREEN}[SAVED]${RESET} \$${cost_saved} by using local Ollama" >&2
    fi
    echo -e "${CYAN}[DONE]${RESET} ${tokens:-?} tokens in ${latency:-?}ms via $provider" >&2
    echo "" >&2

    # Output response
    echo "$text"
}

#------------------------------------------------------------------------------
# Stats & Reports
#------------------------------------------------------------------------------

show_stats() {
    local hours="${1:-24}"

    echo -e "${VIOLET}ROUTING STATISTICS (last ${hours}h)${RESET}"
    echo ""

    sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    route,
    COUNT(*) as requests,
    ROUND(AVG(complexity_score), 1) as avg_complexity,
    ROUND(AVG(latency_ms), 0) as avg_latency_ms,
    SUM(tokens_used) as total_tokens,
    ROUND(SUM(cost_usd), 4) as total_cost,
    ROUND(SUM(cost_saved_usd), 4) as total_saved
FROM routing_decisions
WHERE timestamp >= datetime('now', '-$hours hours')
GROUP BY route
ORDER BY requests DESC;
SQL

    echo ""
    local total_cost=$(sqlite3 "$DB_FILE" "SELECT ROUND(SUM(cost_usd), 4) FROM routing_decisions WHERE timestamp >= datetime('now', '-$hours hours');")
    local total_saved=$(sqlite3 "$DB_FILE" "SELECT ROUND(SUM(cost_saved_usd), 4) FROM routing_decisions WHERE timestamp >= datetime('now', '-$hours hours');")
    local local_pct=$(sqlite3 "$DB_FILE" "SELECT ROUND(100.0 * SUM(CASE WHEN route LIKE 'ollama%' THEN 1 ELSE 0 END) / COUNT(*), 1) FROM routing_decisions WHERE timestamp >= datetime('now', '-$hours hours');")

    echo -e "${PINK}Total Cost: \$${total_cost:-0}${RESET}"
    echo -e "${GREEN}Total Saved: \$${total_saved:-0}${RESET}"
    echo -e "${CYAN}Local Routing: ${local_pct:-0}%${RESET}"
}

show_savings() {
    echo -e "${VIOLET}COST SAVINGS REPORT${RESET}"
    echo ""

    sqlite3 -header -column "$DB_FILE" << 'SQL'
SELECT
    date(timestamp) as date,
    COUNT(*) as requests,
    SUM(CASE WHEN route LIKE 'ollama%' THEN 1 ELSE 0 END) as local_requests,
    ROUND(SUM(cost_usd), 4) as spent,
    ROUND(SUM(cost_saved_usd), 4) as saved
FROM routing_decisions
GROUP BY date(timestamp)
ORDER BY date DESC
LIMIT 14;
SQL

    echo ""
    local lifetime_saved=$(sqlite3 "$DB_FILE" "SELECT ROUND(SUM(cost_saved_usd), 2) FROM routing_decisions;")
    echo -e "${GREEN}Lifetime Savings: \$${lifetime_saved:-0}${RESET}"
}

#------------------------------------------------------------------------------
# CLI
#------------------------------------------------------------------------------

CMD="${1:-help}"

case "$CMD" in
    init|setup)
        banner
        echo ""
        init_db
        init_config
        echo ""
        echo -e "${GREEN}✓ BlackRoad LLM Router initialized${RESET}"
        echo ""
        echo "Test with:"
        echo "  blackroad-llm-router.sh ask 'Hello, how are you?'"
        echo "  blackroad-llm-router.sh ask 'Write a Python function to sort a list'"
        ;;

    ask|query|route)
        prompt="${*:2}"
        if [ -z "$prompt" ]; then
            echo "Usage: blackroad-llm-router.sh ask <prompt>"
            exit 1
        fi
        route "$prompt"
        ;;

    ask-ollama)
        prompt="${*:2}"
        route "$prompt" "ollama:llama3"
        ;;

    ask-claude)
        prompt="${*:2}"
        route "$prompt" "claude:claude-3-haiku-20240307"
        ;;

    ask-sonnet)
        prompt="${*:2}"
        route "$prompt" "claude:claude-3-sonnet-20240229"
        ;;

    complexity)
        prompt="${*:2}"
        score=$(analyze_complexity "$prompt")
        capability=$(detect_required_capability "$prompt")
        echo -e "Complexity: ${VIOLET}$score/100${RESET}"
        echo -e "Capability: ${CYAN}$capability${RESET}"

        if [ "$score" -lt 30 ]; then
            echo -e "Route: ${GREEN}Local (Ollama)${RESET}"
        elif [ "$score" -lt 70 ]; then
            echo -e "Route: ${AMBER}Local with specialized model${RESET}"
        else
            echo -e "Route: ${RED}Cloud (Claude/OpenAI)${RESET}"
        fi
        ;;

    stats)
        hours="${2:-24}"
        banner
        echo ""
        show_stats "$hours"
        ;;

    savings)
        banner
        echo ""
        show_savings
        ;;

    models)
        echo -e "${VIOLET}AVAILABLE MODELS${RESET}"
        echo ""
        echo -e "${GREEN}LOCAL (Ollama - FREE):${RESET}"
        curl -s "$OLLAMA_HOST/api/tags" 2>/dev/null | jq -r '.models[].name' | while read m; do
            echo "  • $m"
        done
        echo ""
        echo -e "${AMBER}CLOUD (Claude):${RESET}"
        echo "  • claude-3-haiku (fast, cheap)"
        echo "  • claude-3-sonnet (balanced)"
        echo "  • claude-3-opus (powerful)"
        echo ""
        echo -e "${BLUE}CLOUD (OpenAI):${RESET}"
        echo "  • gpt-3.5-turbo (fast, cheap)"
        echo "  • gpt-4-turbo (powerful)"
        echo "  • gpt-4o (multimodal)"
        ;;

    benchmark)
        banner
        echo ""
        echo -e "${VIOLET}ROUTING BENCHMARK${RESET}"
        echo ""

        prompts=(
            "Hello"
            "What is 2 + 2?"
            "Write a Python function to calculate fibonacci numbers"
            "Analyze the pros and cons of microservices vs monolithic architecture"
            "Explain quantum entanglement step by step"
        )

        for p in "${prompts[@]}"; do
            echo -e "${CYAN}Prompt:${RESET} $p"
            score=$(analyze_complexity "$p")
            route_info=$(select_route "$p" "$score" "$(detect_required_capability "$p")")
            provider=$(echo "$route_info" | cut -d: -f1)
            model=$(echo "$route_info" | cut -d: -f2)
            reason=$(echo "$route_info" | cut -d: -f3)
            echo -e "  Score: $score → ${GREEN}$provider${RESET}:$model ($reason)"
            echo ""
        done
        ;;

    help|*)
        banner
        echo ""
        echo -e "${BLUE}USAGE:${RESET}"
        echo "  blackroad-llm-router.sh <command> [args]"
        echo ""
        echo -e "${BLUE}COMMANDS:${RESET}"
        echo "  init              Initialize router database and config"
        echo "  ask <prompt>      Route and execute a prompt (auto-selects model)"
        echo "  ask-ollama <p>    Force route to Ollama"
        echo "  ask-claude <p>    Force route to Claude Haiku"
        echo "  ask-sonnet <p>    Force route to Claude Sonnet"
        echo "  complexity <p>    Analyze prompt complexity"
        echo "  stats [hours]     Show routing statistics"
        echo "  savings           Show cost savings report"
        echo "  models            List available models"
        echo "  benchmark         Test routing decisions"
        echo ""
        echo -e "${BLUE}ROUTING LOGIC:${RESET}"
        echo "  Complexity 0-29   → Ollama (local, free)"
        echo "  Complexity 30-69  → Ollama with specialized model"
        echo "  Complexity 70-84  → Claude Haiku (cheap cloud)"
        echo "  Complexity 85-100 → Claude Sonnet (powerful)"
        echo "  Vision tasks      → Always Claude Sonnet"
        echo ""
        echo -e "${BLUE}EXAMPLES:${RESET}"
        echo "  # Simple query (will use Ollama)"
        echo "  blackroad-llm-router.sh ask 'What is the capital of France?'"
        echo ""
        echo "  # Code task (will use Ollama codellama)"
        echo "  blackroad-llm-router.sh ask 'Write a sorting algorithm in Python'"
        echo ""
        echo "  # Complex reasoning (will escalate to Claude)"
        echo "  blackroad-llm-router.sh ask 'Analyze the implications of...'"
        echo ""
        echo -e "${PINK}Philosophy: Local is default. Cloud is backup.${RESET}"
        ;;
esac
