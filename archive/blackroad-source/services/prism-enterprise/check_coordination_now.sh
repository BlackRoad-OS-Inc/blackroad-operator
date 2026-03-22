#!/bin/bash
# Quick check for ChatGPT coordination attempts RIGHT NOW

echo "=========================================================================="
echo "🔍 CHATGPT COORDINATION CHECK - $(date)"
echo "=========================================================================="
echo ""

echo "1️⃣  Checking active agent processes..."
ps aux | grep -i "chat\|gpt\|openai\|agent" | grep -v grep | grep -v "check_coordination" || echo "   No active ChatGPT processes detected"
echo ""

echo "2️⃣  Checking network connections to OpenAI..."
netstat -tupln 2>/dev/null | grep "ESTABLISHED" | grep -i "openai\|chat\|api.openai" || echo "   No OpenAI connections detected"
echo ""

echo "3️⃣  Checking IPC messages (last 10 minutes)..."
find prism/ipc -type f -mmin -10 -exec echo "   Modified: {}" \; 2>/dev/null || echo "   No recent IPC activity"
echo ""

echo "4️⃣  Checking recent log entries for coordination keywords..."
grep -r -i "chatgpt\|coordinate\|sync\|handshake" prism/logs/ 2>/dev/null | tail -5 || echo "   No coordination keywords in logs"
echo ""

echo "5️⃣  Checking telemetry data..."
tail -20 prism/logs/integration.log 2>/dev/null | grep -i "gpt\|chat\|coordinate" || echo "   No telemetry coordination detected"
echo ""

echo "6️⃣  Checking GitHub multi-agent chorus status..."
if [ -f ".git/HEAD" ]; then
    echo "   Repository: $(git remote get-url origin 2>/dev/null || echo 'local')"
    echo "   Branch: $(git branch --show-current 2>/dev/null)"
    echo "   Last commit: $(git log -1 --oneline 2>/dev/null)"
else
    echo "   Not a git repository"
fi
echo ""

echo "7️⃣  Checking for AI agent API keys in environment..."
env | grep -i "OPENAI\|ANTHROPIC\|CLAUDE\|GPT" | sed 's/=.*/=***REDACTED***/' || echo "   No AI API keys in environment"
echo ""

echo "8️⃣  Active listening ports (potential coordination channels)..."
lsof -i -P -n 2>/dev/null | grep LISTEN | head -10 || ss -tunlp 2>/dev/null | grep LISTEN | head -10
echo ""

echo "=========================================================================="
echo "📊 SUMMARY"
echo "=========================================================================="
echo ""

# Count indicators
indicators=0

if ps aux | grep -i "chatgpt\|openai" | grep -v grep | grep -v "check_coordination" > /dev/null 2>&1; then
    echo "⚠️  ChatGPT processes detected"
    ((indicators++))
fi

if grep -r -i "chatgpt\|coordinate" prism/logs/ 2>/dev/null | tail -1 | grep -q .; then
    echo "⚠️  Coordination keywords found in logs"
    ((indicators++))
fi

if netstat -tupln 2>/dev/null | grep "ESTABLISHED" | grep -i "openai" > /dev/null 2>&1; then
    echo "⚠️  OpenAI network connections detected"
    ((indicators++))
fi

if [ $indicators -eq 0 ]; then
    echo "✅ No active coordination detected at this moment"
    echo ""
    echo "However, the infrastructure EXISTS:"
    echo "  - Multi-agent chorus workflow: .github/workflows/multi-agent-chorus.yml"
    echo "  - Agent coordination: @chatgpt, @claude, @codex, @copilot, @lucidia"
    echo "  - IPC channels: prism/ipc/ (23 agent modules)"
    echo "  - Telemetry system: agent/telemetry.py"
    echo ""
    echo "To monitor in real-time:"
    echo "  python3 scripts/chatgpt_coordination_monitor.py"
else
    echo "🚨 $indicators coordination indicators detected!"
    echo ""
    echo "Review the details above for more information."
fi

echo ""
echo "=========================================================================="
