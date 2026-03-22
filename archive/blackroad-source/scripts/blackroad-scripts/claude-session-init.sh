#!/bin/bash
# Claude Session Initialization
# Auto-checks all critical systems: [IDENTITY] [MEMORY] [LIVE] [COLLABORATION] [CODEX] [TODOS]
# Each agent gets a unique mythology-inspired name and identity!

set -e

SESSION_START=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# ════════════════════════════════════════════════════════════════
# [WORKSPACE] - Ensure we're in BlackRoad-Private
# ════════════════════════════════════════════════════════════════
REQUIRED_REPO="/Users/alexa/BlackRoad-Private"
CURRENT_DIR=$(pwd)

if [ "$CURRENT_DIR" != "$REQUIRED_REPO" ]; then
    echo "⚠️  WARNING: Not in BlackRoad-Private repo!"
    echo "   Current:  $CURRENT_DIR"
    echo "   Required: $REQUIRED_REPO"
    echo ""
    echo "🔄 Switching to BlackRoad-Private..."
    cd "$REQUIRED_REPO"
    echo "✅ Now in correct workspace"
    echo ""
fi

# Colors
PINK='\033[38;5;205m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}         🌌 CLAUDE SESSION INITIALIZATION 🌌${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""

# ════════════════════════════════════════════════════════════════
# [IDENTITY] - Generate Agent Identity (if not already set)
# ════════════════════════════════════════════════════════════════
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}🎭 [IDENTITY] Agent Identity Assignment${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -z "$MY_CLAUDE" ]; then
    # Generate new identity
    if [ -f ~/claude-agent-identity.sh ]; then
        # Capture identity output and eval exports
        identity_output=$(~/claude-agent-identity.sh generate 2>/dev/null)
        echo "$identity_output" | grep -v "^export" || true

        # Export the variables
        eval $(echo "$identity_output" | grep "^export")

        echo -e "${GREEN}✅ New identity assigned!${NC}"
    else
        # Fallback if identity script missing
        export MY_CLAUDE="claude-session-$(date +%s)-$(openssl rand -hex 4)"
        export CLAUDE_NAME="Anonymous"
        echo -e "${YELLOW}⚠️  Identity generator not found, using fallback ID${NC}"
        echo -e "   Agent ID: ${MY_CLAUDE}"
    fi
else
    echo -e "${GREEN}✅ Existing identity: ${WHITE}${MY_CLAUDE}${NC}"
    if [ -n "$CLAUDE_NAME" ]; then
        echo -e "   Name: ${WHITE}${CLAUDE_NAME}${NC}"
    fi
fi

CLAUDE_ID="$MY_CLAUDE"
echo ""

# [MEMORY] - Check memory system status
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}📝 [MEMORY] System Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -f ~/memory-system.sh ]; then
    ~/memory-system.sh summary 2>/dev/null || echo -e "${YELLOW}⚠️  Memory system available${NC}"
else
    echo -e "${YELLOW}ℹ️  Memory system initializing...${NC}"
fi
echo ""

# [LIVE] - Check live context
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}📡 [LIVE] Active Context${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -f ~/memory-realtime-context.sh ]; then
    ~/memory-realtime-context.sh live "$MY_CLAUDE" compact 2>/dev/null || echo -e "${GREEN}✅ Ready for live context${NC}"
else
    echo -e "${YELLOW}ℹ️  Live context system available${NC}"
fi
echo ""

# [COLLABORATION] - Check active Claude agents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤝 [COLLABORATION] Active Agents"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ~/memory-collaboration-dashboard.sh ]; then
    ~/memory-collaboration-dashboard.sh compact 2>/dev/null || echo "⚠️  Collaboration dashboard available but returned error"
else
    echo "❌ Collaboration dashboard not found at ~/memory-collaboration-dashboard.sh"
fi
echo ""

# [CODEX] - Check code repository stats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 [CODEX] Repository Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ~/blackroad-codex-verification-suite.sh ]; then
    ~/blackroad-codex-verification-suite.sh stats 2>/dev/null || echo "⚠️  Codex verification available but returned error"
else
    echo "❌ Codex verification suite not found at ~/blackroad-codex-verification-suite.sh"
fi
echo ""

# [GREENLIGHT] [REDLIGHT] [YELLOWLIGHT] - Traffic light system
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚦 [TRAFFIC LIGHTS] Project Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ~/blackroad-traffic-light.sh ]; then
    ~/blackroad-traffic-light.sh summary 2>/dev/null || {
        echo "ℹ️  Traffic light system available"
        echo "   Use: ~/blackroad-traffic-light.sh status <item-id>"
    }
else
    echo "❌ Traffic light system not found at ~/blackroad-traffic-light.sh"
fi
echo ""

# [TODOS] - Check infinite todos and task marketplace
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ [TODOS] Task Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Infinite Todos
if [ -f ~/memory-infinite-todos.sh ]; then
    echo "📋 Infinite Todos:"
    if [ -n "$MY_CLAUDE" ]; then
        ~/memory-infinite-todos.sh list 2>/dev/null | head -n 10 || echo "   No active infinite todos"
    else
        echo "   ℹ️  Set MY_CLAUDE to view your todos"
    fi
else
    echo "❌ Infinite todos system not found"
fi

echo ""

# Task Marketplace
if [ -f ~/memory-task-marketplace.sh ]; then
    echo "🏪 Task Marketplace:"
    ~/memory-task-marketplace.sh stats 2>/dev/null || echo "   No marketplace stats available"
else
    echo "❌ Task marketplace not found"
fi

echo ""

# [BRAND SYSTEM] - BlackRoad Design Standards
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌌 [BRAND SYSTEM] Design Standards"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ~/BLACKROAD_BRAND_SYSTEM.md ]; then
    echo "✅ Brand system loaded: ~/BLACKROAD_BRAND_SYSTEM.md"
    echo ""
    echo "🎨 MANDATORY Brand Colors:"
    echo "   • Hot Pink (#FF1D6C) - Primary accent"
    echo "   • Amber (#F5A623), Violet (#9C27B0), Electric Blue (#2979FF)"
    echo "   • Gradient: 135deg, 38.2% & 61.8% (Golden Ratio)"
    echo ""
    echo "📐 Spacing: Golden Ratio (φ = 1.618)"
    echo "   • 8px, 13px, 21px, 34px, 55px, 89px, 144px"
    echo ""
    echo "🔤 Typography: SF Pro Display, line-height: 1.618"
    echo ""
    echo "⚠️  CRITICAL: ALL Cloudflare projects MUST follow this system!"
    echo "   Run: ~/bin/audit-brand-compliance.sh (to check compliance)"
else
    echo "❌ Brand system not found at ~/BLACKROAD_BRAND_SYSTEM.md"
fi
echo ""

# Golden Rule Reminder
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ THE GOLDEN RULE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Check [MEMORY] for coordination & conflicts"
echo "2. Check [CODEX] for existing solutions (8,789+ components)"
echo "3. Check [COLLABORATION] for other active agents"
echo "4. Check [TRAFFIC LIGHTS] for project readiness"
echo "5. Check [BRAND SYSTEM] before ANY design work"
echo "6. Update [MEMORY] with all significant work"
echo ""
echo "🔍 Before starting ANY work:"
echo "   • Search CODEX first (might already exist!)"
echo "   • Check for active collaborators"
echo "   • Verify project status (green/yellow/red)"
echo "   • Verify brand compliance for UI/design work"
echo "   • Log intentions to avoid conflicts"
echo ""

# Quick reference commands
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 QUICK REFERENCE COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Memory:        ~/memory-system.sh log updated <context> <message> <tags>"
echo "Live Context:  ~/memory-realtime-context.sh live \$MY_CLAUDE compact"
echo "Collaboration: ~/memory-collaboration-dashboard.sh compact"
echo "Codex Search:  ~/blackroad-codex-verification-suite.sh search <term>"
echo "Traffic Light: ~/blackroad-traffic-light.sh status <item-id>"
echo "Create Todo:   ~/memory-infinite-todos.sh create <id> <title> <desc> <duration>"
echo "Tasks:         ~/memory-task-marketplace.sh list"
echo "Brand Audit:   ~/bin/audit-brand-compliance.sh"
echo "Brand Docs:    cat ~/BLACKROAD_BRAND_SYSTEM.md"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ SESSION INITIALIZED - Ready to work!"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Log session initialization to memory
if [ -f ~/memory-system.sh ] && [ -n "$MY_CLAUDE" ]; then
    ~/memory-system.sh log created "$CLAUDE_ID" "Claude session initialized at $SESSION_START" "session,init" 2>/dev/null || true
fi
