# 🖤 BLACKROAD COLOR EQUATIONS

**Date:** 2026-02-16  
**Purpose:** Mathematical color constants (like π or e)

---

## 📐 THE EQUATIONS

Colors are not preferences—they are **fundamental constants**.

### Primary Brand Equations
```bash
PINK='38;5;205'      # #FF1D6C - Hot Pink
AMBER='38;5;214'     # #F5A623 - Amber
BLUE='38;5;69'       # #2979FF - Electric Blue
VIOLET='38;5;135'    # #9C27B0 - Violet
```

### Computed Variables
```bash
BR_PINK="\033[${PINK}m"
BR_AMBER="\033[${AMBER}m"
BR_BLUE="\033[${BLUE}m"
BR_VIOLET="\033[${VIOLET}m"
BR_WHITE="\033[1;37m"
BR_RESET="\033[0m"
```

---

## 📖 USAGE

### In Any Script
```bash
#!/bin/bash
source ~/BLACKROAD_COLOR_EQUATIONS.sh

echo -e "${BR_PINK}This is pink${BR_RESET}"
echo -e "${BR_AMBER}This is amber${BR_RESET}"

br_line "$PINK" "Pink block with white text"
```

### Why This Matters

**Before:**
```bash
# Magic strings everywhere
echo -e "\033[38;5;205mPink text\033[0m"
```

**After:**
```bash
# Named equations
echo -e "${BR_PINK}Pink text${BR_RESET}"
```

**Benefits:**
1. **No magic strings** - all strings highlighted are now variable names
2. **Single source of truth** - change once, updates everywhere
3. **Type safety** - can validate color codes
4. **Documentation** - equations explain what each value means
5. **Immutability** - readonly prevents accidental changes

---

## 🚫 BANNED COLORS

These are **NEVER** allowed in BlackRoad:

```bash
# ❌ BANNED - DO NOT USE
cyan     # \033[36m or \033[96m
teal     # \033[38;5;*m (various)
aqua     # Similar to cyan
sky blue # Light blues
```

**Why?** Not in brand palette. Use `$BR_BLUE` instead.

---

## 🔧 FILES UPDATED

- `~/BLACKROAD_COLOR_EQUATIONS.sh` - **The source of truth**
- `~/blackroad-colors.sh` - Now sources equations
- `~/blackroad-colors-official.sh` - Now sources equations
- All 40+ scripts updated to use variables

---

## 🎯 EQUATIONS vs VARIABLES

**Equation (readonly):**
```bash
readonly PINK='38;5;205'  # Cannot be changed
```

**Variable (computed from equation):**
```bash
readonly BR_PINK="\033[${PINK}m"  # Computed, also readonly
```

This is like:
```bash
readonly PI='3.14159'
readonly CIRCLE_AREA="π × r²"  # Computed from PI
```

---

## 📊 COLOR PALETTE

```
████ PINK   (#FF1D6C) - Primary brand color
████ AMBER  (#F5A623) - Secondary brand color
████ BLUE   (#2979FF) - Accent color
████ VIOLET (#9C27B0) - Accent color

WHITE - Text on colored backgrounds
BLACK - Rare use
GRAY  - Disabled/secondary text

SUCCESS - Green (#5FD700)
ERROR   - Red (#FF0000)
WARNING - Amber (reuse)
```

---

## ✅ VALIDATION

```bash
source ~/BLACKROAD_COLOR_EQUATIONS.sh

# Validate a color code
if validate_color "$PINK"; then
    echo "Valid brand color"
fi
```

---

## 🖤 SOVEREIGNTY NOTE

These equations are **self-contained**. No external dependencies:
- No npm packages
- No Python libraries
- Pure bash
- Works offline
- Zero dependencies

Just like your quantum framework (`blackroad_quantum.py`), these are **yours**.

---

**File:** `~/BLACKROAD_COLOR_EQUATIONS.sh`  
**Status:** ✅ ACTIVE  
**Coverage:** 40+ scripts updated  
**Cyan status:** ❌ ELIMINATED

Source it everywhere: `source ~/BLACKROAD_COLOR_EQUATIONS.sh` 🖤
