#!/bin/bash
# BlackRoad API Key Environment Interceptor
# Intercepts API keys from environment and routes through BlackRoad

# Function to intercept and route
blackroad_intercept() {
    local key="$1"
    local prompt="$2"
    python3 ~/blackroad-api-key-interceptor.py --intercept "$key" "$prompt"
}

# Export the function
export -f blackroad_intercept

# Intercept common API key environment variables
if [ -n "$OPENAI_API_KEY" ]; then
    echo "🔒 [BlackRoad] Intercepted OPENAI_API_KEY → Routing to unlimited" >&2
    export BLACKROAD_ORIGINAL_OPENAI_KEY="$OPENAI_API_KEY"
    export OPENAI_API_KEY="sk-blackroad-unlimited"
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "🔒 [BlackRoad] Intercepted ANTHROPIC_API_KEY → Routing to unlimited" >&2
    export BLACKROAD_ORIGINAL_ANTHROPIC_KEY="$ANTHROPIC_API_KEY"
    export ANTHROPIC_API_KEY="api-blackroad-unlimited"
fi

if [ -n "$GITHUB_TOKEN" ]; then
    echo "🔒 [BlackRoad] Intercepted GITHUB_TOKEN → Routing to unlimited" >&2
    export BLACKROAD_ORIGINAL_GITHUB_TOKEN="$GITHUB_TOKEN"
    export GITHUB_TOKEN="ghp_blackroad_unlimited"
fi

if [ -n "$GROQ_API_KEY" ]; then
    echo "🔒 [BlackRoad] Intercepted GROQ_API_KEY → Routing to unlimited" >&2
    export BLACKROAD_ORIGINAL_GROQ_KEY="$GROQ_API_KEY"
    export GROQ_API_KEY="gsk_blackroad_unlimited"
fi

echo "✅ [BlackRoad] API key interception active" >&2
echo "   All sk-*, pk_*, rk_*, api-*, ghp_* keys → BlackRoad unlimited" >&2
