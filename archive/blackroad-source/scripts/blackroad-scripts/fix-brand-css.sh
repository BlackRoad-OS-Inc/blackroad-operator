#!/bin/bash
# BlackRoad Brand CSS Fixer
# Replaces non-compliant colors with official brand colors

# Brand Colors
HOT_PINK="#FF1D6C"
AMBER="#F5A623"
ELECTRIC_BLUE="#2979FF"
VIOLET="#9C27B0"

echo "🎨 BlackRoad Brand CSS Fixer"
echo "============================"

# Find all HTML files with non-compliant colors
files=$(grep -rl "00ff88\|00ffff\|ff00ff\|#0f0\|#0ff\|#f0f\|Courier New" ~/blackroad-*/*.html 2>/dev/null)
count=$(echo "$files" | wc -l | tr -d ' ')

echo "Found $count non-compliant files"
echo ""

for file in $files; do
    echo "Fixing: $file"

    # Make writable
    chmod 644 "$file" 2>/dev/null

    # Replace non-compliant colors
    sed -i '' \
        -e "s/#00ff88/${HOT_PINK}/gi" \
        -e "s/#00ffff/${ELECTRIC_BLUE}/gi" \
        -e "s/#ff00ff/${VIOLET}/gi" \
        -e "s/#0f0/${HOT_PINK}/gi" \
        -e "s/#0ff/${ELECTRIC_BLUE}/gi" \
        -e "s/#f0f/${VIOLET}/gi" \
        -e "s/rgba(0,255,136/rgba(255,29,108/gi" \
        -e "s/rgba(0,255,255/rgba(41,121,255/gi" \
        -e "s/rgba(255,0,255/rgba(156,39,176/gi" \
        -e "s/'Courier New', monospace/-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif/gi" \
        -e "s/font-family: monospace/font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif/gi" \
        "$file"
done

echo ""
echo "✅ Brand CSS fixes applied!"
echo ""
echo "Official Brand Colors:"
echo "  Hot Pink: $HOT_PINK (primary accent)"
echo "  Amber: $AMBER"
echo "  Electric Blue: $ELECTRIC_BLUE"
echo "  Violet: $VIOLET"
echo ""
echo "Gradient: linear-gradient(135deg, amber 0%, hot-pink 38.2%, violet 61.8%, electric-blue 100%)"
