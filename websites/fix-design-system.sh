#!/bin/bash
# Fix all BlackRoad websites to match design system rules
# 1. Replace colored text with white + opacity
# 2. Fix CSS variable names
# 3. Update logo URLs to new BR mark
set -e

SITES="/Users/alexa/blackroad-operator/websites"
LOGO_URL="https://images.blackroad.io/brand/br-circle-256.png"
LOGO_32="https://images.blackroad.io/brand/br-circle-32.png"
FAVICON="https://images.blackroad.io/brand/favicon.png"
COUNT=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BlackRoad Design System Fixer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for html in "$SITES"/*/index.html; do
  [ -f "$html" ] || continue
  dir=$(basename "$(dirname "$html")")
  changed=false

  # ── Fix colored text: grays should be white with opacity ──
  # color:#737373 → color:rgba(255,255,255,0.45)
  if grep -q 'color:#737373\|color: #737373' "$html" 2>/dev/null; then
    sed -i '' 's/color:#737373/color:rgba(255,255,255,0.45)/g;s/color: #737373/color:rgba(255,255,255,0.45)/g' "$html"
    changed=true
  fi

  # color:#666 → color:rgba(255,255,255,0.4)
  if grep -q 'color:#666\b\|color: #666\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#666;/color:rgba(255,255,255,0.4);/g;s/color: #666;/color:rgba(255,255,255,0.4);/g' "$html"
    changed=true
  fi

  # color:#555 → color:rgba(255,255,255,0.35)
  if grep -q 'color:#555\b\|color: #555\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#555;/color:rgba(255,255,255,0.35);/g;s/color: #555;/color:rgba(255,255,255,0.35);/g' "$html"
    changed=true
  fi

  # color:#444 → color:rgba(255,255,255,0.3)
  if grep -q 'color:#444\b\|color: #444\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#444;/color:rgba(255,255,255,0.3);/g;s/color: #444;/color:rgba(255,255,255,0.3);/g' "$html"
    changed=true
  fi

  # color:#333 → color:rgba(255,255,255,0.25)
  if grep -q 'color:#333\b\|color: #333\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#333;/color:rgba(255,255,255,0.25);/g;s/color: #333;/color:rgba(255,255,255,0.25);/g' "$html"
    changed=true
  fi

  # color:#999 → color:rgba(255,255,255,0.5)
  if grep -q 'color:#999\b\|color: #999\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#999;/color:rgba(255,255,255,0.5);/g;s/color: #999;/color:rgba(255,255,255,0.5);/g' "$html"
    changed=true
  fi

  # color:#aaa → color:rgba(255,255,255,0.55)
  if grep -q 'color:#aaa\b\|color: #aaa\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#aaa;/color:rgba(255,255,255,0.55);/g;s/color: #aaa;/color:rgba(255,255,255,0.55);/g' "$html"
    changed=true
  fi

  # color:#ccc → color:rgba(255,255,255,0.7)
  if grep -q 'color:#ccc\b\|color: #ccc\b' "$html" 2>/dev/null; then
    sed -i '' 's/color:#ccc;/color:rgba(255,255,255,0.7);/g;s/color: #ccc;/color:rgba(255,255,255,0.7);/g' "$html"
    changed=true
  fi

  # ── Fix CSS variable names ──
  if grep -q 'var(--font-mono)' "$html" 2>/dev/null; then
    sed -i '' "s/var(--font-mono)/var(--jb)/g" "$html"
    changed=true
  fi
  if grep -q 'var(--font-serif)' "$html" 2>/dev/null; then
    sed -i '' "s/var(--font-serif)/var(--sg)/g" "$html"
    changed=true
  fi
  if grep -q 'var(--font-sans)' "$html" 2>/dev/null; then
    sed -i '' "s/var(--font-sans)/var(--sg)/g" "$html"
    changed=true
  fi

  # ── Update logo to new BR mark ──
  # Favicon
  if grep -q 'favicon' "$html" 2>/dev/null; then
    sed -i '' "s|href=\"/favicon\.ico\"|href=\"$FAVICON\"|g" "$html"
    sed -i '' "s|href=\"favicon\.ico\"|href=\"$FAVICON\"|g" "$html"
    sed -i '' "s|href=\"favicon\.png\"|href=\"$FAVICON\"|g" "$html"
  fi

  if [ "$changed" = true ]; then
    COUNT=$((COUNT + 1))
    echo "  [FIXED] $dir"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Fixed $COUNT websites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
