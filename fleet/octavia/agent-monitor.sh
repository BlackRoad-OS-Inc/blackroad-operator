#!/bin/bash
# Agent Army Monitor - Real-time fleet status

AGENT_STATE_DIR="$HOME/.blackroad/agent-army"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Agent Army Monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if any waves have been deployed
if [ ! -d "$AGENT_STATE_DIR" ] || [ -z "$(ls -A $AGENT_STATE_DIR 2>/dev/null)" ]; then
    echo "❌ No agents deployed yet"
    echo ""
    echo "💡 Deploy your first wave:"
    echo "   python3 ~/BlackRoad-Private/agent-army/agent-orchestrator.py 1 40"
    exit 0
fi

# Count total deployed agents
total_agents=0
for state_file in "$AGENT_STATE_DIR"/wave-*.json; do
    count=$(jq '.total_agents' "$state_file" 2>/dev/null || echo 0)
    total_agents=$((total_agents + count))
done

echo "📊 Fleet Status"
echo "  Total agents deployed: $total_agents"
echo "  Waves deployed: $(ls -1 $AGENT_STATE_DIR/wave-*.json 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Show most recent wave
latest_wave=$(ls -t "$AGENT_STATE_DIR"/wave-*.json 2>/dev/null | head -1)
if [ -n "$latest_wave" ]; then
    echo "🚀 Latest Wave:"
    echo "  Deployed: $(jq -r '.wave_deployed_at' "$latest_wave")"
    echo "  Agents: $(jq '.total_agents' "$latest_wave")"
    echo ""
    
    echo "👥 Agents by Node:"
    jq -r '.agents[] | .node' "$latest_wave" | sort | uniq -c | while read count node; do
        echo "  $node: $count agents"
    done
    echo ""
    
    echo "🤖 Sample Agents:"
    jq -r '.agents[:5] | .[] | "  \(.name) - \(.model) on \(.node)"' "$latest_wave"
    remaining=$(($(jq '.total_agents' "$latest_wave") - 5))
    if [ "$remaining" -gt 0 ]; then
        echo "  ... and $remaining more"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Commands:"
echo "  Deploy wave: python3 ~/BlackRoad-Private/agent-army/agent-orchestrator.py <wave> <count>"
echo "  Monitor:     ~/BlackRoad-Private/agent-army/agent-monitor.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
