#!/bin/bash
# Health check all services

echo "🏥 BlackRoad Health Check - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# nginx
if systemctl is-active --quiet nginx; then
    echo "✅ nginx: RUNNING"
else
    echo "❌ nginx: DOWN"
fi

# ollama
if systemctl is-active --quiet ollama; then
    echo "✅ ollama: RUNNING"
    curl -s http://localhost:11434/api/tags > /dev/null && echo "  └─ API responding" || echo "  └─ API not responding"
else
    echo "❌ ollama: DOWN"
fi

# cloudflared
if systemctl is-active --quiet cloudflared; then
    echo "✅ cloudflared: RUNNING"
else
    echo "❌ cloudflared: DOWN"
fi

# TTS API
if systemctl --user is-active --quiet tts-api; then
    echo "✅ tts-api: RUNNING"
    curl -s http://localhost:5001/health > /dev/null && echo "  └─ API responding" || echo "  └─ API not responding"
else
    echo "❌ tts-api: DOWN"
fi

echo ""
echo "System Resources:"
echo "  CPU: $(uptime | awk -F'load average:' '{print $2}')"
echo "  RAM: $(free -h | awk '/Mem:/ {print $3 "/" $2}')"
echo "  Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"
