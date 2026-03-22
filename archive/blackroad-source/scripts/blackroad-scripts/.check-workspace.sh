#!/bin/bash
# Quick workspace check - run at start of every session

REQUIRED="/Users/alexa/BlackRoad-Private"
CURRENT=$(pwd)

if [ "$CURRENT" != "$REQUIRED" ]; then
    echo "⚠️  NOT IN BLACKROAD-PRIVATE!"
    echo "   Run: cd /Users/alexa/BlackRoad-Private"
    return 1
else
    echo "✅ Workspace: BlackRoad-Private"
    echo "📍 $(git branch --show-current) @ $(git log --oneline -1 | head -c 60)"
    return 0
fi
