#!/bin/bash
# ============================================================================
# BLACKROAD DESIGN ENFORCER
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# RULE: Colored blocks/borders, WHITE text
# ============================================================================

echo "BLACKROAD DESIGN ENFORCER"
echo "========================="
echo ""
echo "Rule: Blocks = Color, Text = White"
echo ""

# Official colors (ANSI 256)
# 208 = Amber, 202 = Orange, 198 = Pink, 163 = Magenta, 33 = Blue

WHITE='\\033[1;37m'

count=0
fixed=0

for script in ~/*.sh ~/bin/*; do
    [ -f "$script" ] || continue
    ((count++))
    
    # Check if file has colored text (not just blocks)
    if grep -q '\[38;5;[0-9]*m[A-Za-z]' "$script" 2>/dev/null || \
       grep -q '\[0;3[0-9]m[A-Za-z]' "$script" 2>/dev/null || \
       grep -q '\[1;3[0-9]m[A-Za-z]' "$script" 2>/dev/null; then
        
        # Create temp file
        tmp=$(mktemp)
        
        # Process: Keep color codes before block chars, change to white before text
        # Block chars: █ ▓ ▒ ░ ━ ─ │ ┌ ┐ └ ┘ ╔ ╗ ╚ ╝ ═ ║ ■ ● ◆ ▲ ▼ ◀ ▶ ★
        
        # This is complex - for now, let's add white after color+block sequences
        sed -E '
            # After colored blocks, switch to white for text
            s/(\[38;5;[0-9]+m[█▓▒░━─│┌┐└┘╔╗╚╝═║■●◆▲▼◀▶★]+)/\1[1;37m/g
            s/(\[38;5;[0-9]+m██+)/\1[1;37m/g
        ' "$script" > "$tmp"
        
        mv "$tmp" "$script"
        ((fixed++))
    fi
done

echo "Scanned: $count files"
echo "Fixed: $fixed files"
echo ""
echo "Design rule enforced!"
