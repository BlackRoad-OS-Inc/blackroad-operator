#!/bin/bash
# ============================================================================
# BLACKROAD COLORS - Simplified wrapper
# Sources the canonical color equations
# ============================================================================

# Source the equations
if [ -f "$HOME/BLACKROAD_COLOR_EQUATIONS.sh" ]; then
    source "$HOME/BLACKROAD_COLOR_EQUATIONS.sh"
else
    echo "ERROR: BLACKROAD_COLOR_EQUATIONS.sh not found" >&2
    exit 1
fi

# Legacy compatibility (these now use equations)
BR_AMBER="$BR_AMBER"
BR_ORANGE="$BR_AMBER"  # Orange = Amber in our palette
BR_PINK="$BR_PINK"
BR_MAGENTA="$BR_VIOLET"  # Magenta = Violet in our palette
BR_BLUE="$BR_BLUE"
BR_TEXT="$BR_WHITE"

export BR_AMBER BR_ORANGE BR_PINK BR_MAGENTA BR_BLUE BR_TEXT BR_WHITE BR_RESET NC
