#!/bin/bash

echo "🦊 Context Bridge - Firefox Test"
echo "=================================="
echo ""

# Check if Firefox is installed
if [ ! -d "/Applications/Firefox.app" ]; then
    echo "❌ Firefox not found at /Applications/Firefox.app"
    echo ""
    echo "Install Firefox from: https://www.mozilla.org/firefox/"
    exit 1
fi

echo "✅ Firefox found"
echo ""

# Extension path
EXT_PATH="/Users/alexa/context-bridge/extension-firefox"

if [ ! -d "$EXT_PATH" ]; then
    echo "❌ Firefox extension not found at: $EXT_PATH"
    exit 1
fi

echo "✅ Firefox extension found"
echo ""

# Check manifest
if [ -f "$EXT_PATH/manifest.json" ]; then
    VERSION=$(cat "$EXT_PATH/manifest.json" | grep manifest_version | awk '{print $2}' | tr -d ',')
    echo "✅ Manifest version: $VERSION (should be 2 for Firefox)"
else
    echo "❌ manifest.json missing!"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Quick Start:"
echo ""
echo "1. Opening Firefox debugging page..."

# Open Firefox to debugging page
open -a Firefox "about:debugging#/runtime/this-firefox"

sleep 2

echo ""
echo "2. Click 'Load Temporary Add-on...'"
echo ""
echo "3. Navigate to and select:"
echo "   $EXT_PATH/manifest.json"
echo ""
echo "4. Extension should load!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Then test on ChatGPT:"
echo "  https://chatgpt.com"
echo ""
echo "Look for:"
echo "  🟣 Purple 'Insert Context' button"
echo ""
echo "Check Console (F12):"
echo "  ✅ 'Context Bridge: Loaded on ChatGPT'"
echo "  ✅ 'Context Bridge: Button injected'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
