#!/bin/bash

echo "🚀 Context Bridge - Quick Test Setup"
echo "===================================="
echo ""

# Check if Chrome is installed
if ! command -v "open -a Google\ Chrome" &> /dev/null; then
    echo "❌ Chrome not found"
    echo "   Install Chrome: https://www.google.com/chrome/"
    exit 1
fi

echo "✅ Chrome found"
echo ""

# Get extension path
EXT_PATH="/Users/alexa/context-bridge/extension"

if [ ! -d "$EXT_PATH" ]; then
    echo "❌ Extension not found at: $EXT_PATH"
    exit 1
fi

echo "✅ Extension found: $EXT_PATH"
echo ""

# Check manifest
if [ -f "$EXT_PATH/manifest.json" ]; then
    echo "✅ manifest.json exists"
else
    echo "❌ manifest.json missing!"
    exit 1
fi

# Check content scripts
SCRIPTS=(
    "content/chatgpt.js"
    "content/claude.js"
    "content/copilot.js"
    "content/gemini.js"
)

echo ""
echo "Checking content scripts:"
for script in "${SCRIPTS[@]}"; do
    if [ -f "$EXT_PATH/$script" ]; then
        echo "  ✅ $script"
    else
        echo "  ❌ $script missing!"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Open Chrome:"
echo "   open -a 'Google Chrome'"
echo ""
echo "2. Navigate to extensions page:"
echo "   chrome://extensions/"
echo ""
echo "3. Enable 'Developer mode' (top right toggle)"
echo ""
echo "4. Click 'Load unpacked' button"
echo ""
echo "5. Select this folder:"
echo "   $EXT_PATH"
echo ""
echo "6. Extension should load with ID and icon"
echo ""
echo "7. Click extension icon to configure URL"
echo ""
echo "8. Visit ChatGPT or Claude:"
echo "   https://chatgpt.com"
echo "   https://claude.ai"
echo ""
echo "9. Look for purple 'Insert Context' button!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open Chrome to extensions page
read -p "Open Chrome extensions page now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open -a "Google Chrome" "chrome://extensions/"
    echo ""
    echo "✅ Chrome opened to extensions page"
    echo ""
    echo "📁 Extension path (copy this):"
    echo "   $EXT_PATH"
    echo ""
    echo "👆 Use this path when clicking 'Load unpacked'"
fi

echo ""
echo "🔍 For debugging, check Console for:"
echo "   'Context Bridge: Loaded on [Platform]'"
echo "   'Context Bridge: Button injected on [Platform]'"
echo ""
echo "📸 Don't forget to take screenshots for Chrome Web Store!"
echo ""
