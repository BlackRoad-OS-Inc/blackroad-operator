#!/bin/bash

# 🚀 QUICK BLACKROAD STATUS CHECK...
echo "\ud83d\ude80 QUICK BLACKROAD STATUS CHECK..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test all components quickly
echo "🧠 Lucidia:"
curl -I -s https://blackroad.io/lucidia/ | head -1

echo -e "\n🛡️ Guardian:"
curl -I -s https://blackroad.io/guardian/ | head -1

echo -e "\n📚 Codex:"
curl -I -s https://blackroad.io/codex/ | head -1

echo -e "\n🔐 Login:"
curl -I -s https://blackroad.io/login/ | head -1

echo -e "\n🏠 Main Site:"
curl -I -s https://blackroad.io/ | head -1

echo -e "\n📊 Dashboard:"
curl -I -s https://blackroad.io/dashboard.html | head -1

# Quick success count
echo -e "\n🎯 SUCCESS COUNT:"
success=0

if curl -I -s https://blackroad.io/lucidia/ | grep -q "200"; then
    echo "✅ Lucidia working"
    ((success++))
fi

if curl -I -s https://blackroad.io/guardian/ | grep -q "200"; then
    echo "✅ Guardian working"
    ((success++))
fi

if curl -I -s https://blackroad.io/codex/ | grep -q "200"; then
    echo "✅ Codex working"
    ((success++))
fi

if curl -I -s https://blackroad.io/login/ | grep -q "200"; then
    echo "✅ Login working"
    ((success++))
fi

if curl -I -s https://blackroad.io/ | grep -q "200"; then
    echo "✅ Main Site working"
    ((success++))
fi

if curl -I -s https://blackroad.io/dashboard.html | grep -q "200"; then
    echo "✅ Dashboard working"
    ((success++))
fi

echo -e "\n🏆 RESULT: $success/6 components online!"

if [ $success -eq 6 ]; then
    echo -e "\n🎉 COMPLETE SUCCESS! ALL BLACKROAD APPS WORKING!"
elif [ $success -ge 4 ]; then
    echo -e "\n🎉 MAJOR SUCCESS! Most apps working!"
elif [ $success -ge 2 ]; then
    echo -e "\n🎯 Good progress! Core apps working!"
else
    echo -e "\n🔧 Still working on getting more online..."
fi

echo -e "\n🌐 Access your working components at:"

if curl -I -s https://blackroad.io/lucidia/ | grep -q "200"; then
    echo "  🧠 https://blackroad.io/lucidia/"
fi
if curl -I -s https://blackroad.io/guardian/ | grep -q "200"; then
    echo "  🛡️ https://blackroad.io/guardian/"
fi
if curl -I -s https://blackroad.io/codex/ | grep -q "200"; then
    echo "  📚 https://blackroad.io/codex/"
fi
if curl -I -s https://blackroad.io/login/ | grep -q "200"; then
    echo "  🔐 https://blackroad.io/login/"
fi
if curl -I -s https://blackroad.io/ | grep -q "200"; then
    echo "  🏠 https://blackroad.io/"
fi
if curl -I -s https://blackroad.io/dashboard.html | grep -q "200"; then
    echo "  📊 https://blackroad.io/dashboard.html"
fi
