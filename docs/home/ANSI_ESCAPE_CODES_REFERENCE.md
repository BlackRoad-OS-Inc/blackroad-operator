# ANSI ESCAPE CODES - COMPLETE REFERENCE
**BlackRoad Terminal GUI System**

## 📋 THE PROBLEM

Scripts were showing literal escape codes like `\033[31m` instead of colors because:
1. Not using `printf` (which handles escapes correctly)
2. Using `echo -e` with variables (doesn't always work)
3. Terminal compatibility issues

## ✅ THE SOLUTION

**Always use `printf` for escape sequences!**

```bash
# ❌ WRONG - Shows literal \033[31m
echo "\033[31mRed\033[0m"

# ✅ RIGHT - Shows red text
printf "\033[31mRed\033[0m\n"

# ✅ ALSO RIGHT
echo -e "\033[31mRed\033[0m"

# ✅ ALSO RIGHT  
echo $'\033[31mRed\033[0m'
```

---

## 🎨 BLACKROAD COLOR CODES

### Standard Format (Works Everywhere)
```bash
# Foreground colors
PINK='\033[38;5;205m'      # #FF1D6C
BLUE='\033[38;5;75m'       # #2979FF  
PURPLE='\033[38;5;141m'    # #9C27B0
ORANGE='\033[38;5;208m'    # #FF6B35
GRAY='\033[38;5;240m'      
RESET='\033[0m'

# Usage
printf "${PINK}Pink text${RESET}\n"
```

### As Functions (Best Practice)
```bash
c_pink()   { printf '\033[38;5;205m'; }
c_blue()   { printf '\033[38;5;75m'; }
c_purple() { printf '\033[38;5;141m'; }
c_orange() { printf '\033[38;5;208m'; }
c_reset()  { printf '\033[0m'; }

# Usage
c_pink; printf "Pink text"; c_reset; printf "\n"
```

---

## 📦 COMPLETE ESCAPE CODE MAP

### Control Sequences
```bash
CLEAR='\033[2J\033[H'      # Clear screen and home
HOME='\033[H'              # Move to 0,0
CLEAR_LINE='\033[K'        # Clear to end of line
SAVE='\033[s'              # Save cursor position
RESTORE='\033[u'           # Restore cursor position
HIDE_CURSOR='\033[?25l'    # Hide cursor
SHOW_CURSOR='\033[?25h'    # Show cursor
```

### Movement
```bash
UP='\033[A'                # Move up 1
DOWN='\033[B'              # Move down 1
RIGHT='\033[C'             # Move right 1
LEFT='\033[D'              # Move left 1

# Or with count:
printf '\033[5A'           # Move up 5
printf '\033[10;20H'       # Move to row 10, col 20
```

### Basic Colors (3/4 bit)
```bash
# Foreground (30-37)
BLACK='\033[30m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
MAGENTA='\033[35m'
CYAN='\033[36m'
WHITE='\033[37m'

# Bright foreground (90-97)
BRIGHT_BLACK='\033[90m'
BRIGHT_RED='\033[91m'
BRIGHT_GREEN='\033[92m'
BRIGHT_YELLOW='\033[93m'
BRIGHT_BLUE='\033[94m'
BRIGHT_MAGENTA='\033[95m'
BRIGHT_CYAN='\033[96m'
BRIGHT_WHITE='\033[97m'

# Background (40-47, 100-107)
BG_BLACK='\033[40m'
BG_RED='\033[41m'
# etc...
```

### 256 Color Mode
```bash
# Format: \033[38;5;<n>m (foreground)
#         \033[48;5;<n>m (background)

printf '\033[38;5;205mPink\033[0m\n'       # Foreground
printf '\033[48;5;205mPink BG\033[0m\n'    # Background

# Color ranges:
# 0-15:    Standard colors
# 16-231:  216 color cube (6x6x6 RGB)
# 232-255: Grayscale
```

### True Color (24-bit RGB)
```bash
# Format: \033[38;2;<r>;<g>;<b>m

printf '\033[38;2;255;29;108mTrue Pink\033[0m\n'
printf '\033[48;2;41;121;255mTrue Blue BG\033[0m\n'
```

### Text Attributes
```bash
RESET='\033[0m'            # Reset all
BOLD='\033[1m'             # Bold/bright
DIM='\033[2m'              # Dim
ITALIC='\033[3m'           # Italic (not widely supported)
UNDERLINE='\033[4m'        # Underline
BLINK='\033[5m'            # Blink (not widely supported)
REVERSE='\033[7m'          # Reverse video
HIDDEN='\033[8m'           # Hidden
STRIKE='\033[9m'           # Strikethrough
```

---

## 🔤 BOX DRAWING CHARACTERS

### UTF-8 Required
```bash
# Single line
┌ ─ ┬ ─ ┐
│   │   │
├ ─ ┼ ─ ┤
│   │   │
└ ─ ┴ ─ ┘

# Double line
╔ ═ ╦ ═ ╗
║   ║   ║
╠ ═ ╬ ═ ╣
║   ║   ║
╚ ═ ╩ ═ ╝

# As variables
TL='╔'   TR='╗'   BL='╚'   BR='╝'
H='═'    V='║'
CROSS='╬'
T_DOWN='╦'   T_UP='╩'   T_LEFT='╣'   T_RIGHT='╠'
```

---

## 💻 WORKING EXAMPLES

### Simple Colored Text
```bash
#!/usr/bin/env bash
printf '\033[38;5;205mPink\033[0m '
printf '\033[38;5;75mBlue\033[0m '
printf '\033[38;5;141mPurple\033[0m\n'
```

### Box with Color
```bash
#!/usr/bin/env bash
printf '\033[38;5;141m╔══════╗\033[0m\n'
printf '\033[38;5;141m║\033[0m Text \033[38;5;141m║\033[0m\n'
printf '\033[38;5;141m╚══════╝\033[0m\n'
```

### Function-Based (Best)
```bash
#!/usr/bin/env bash

c_pink() { printf '\033[38;5;205m'; }
c_reset() { printf '\033[0m'; }

box() {
    c_pink
    printf '╔════════╗\n'
    printf '║ Hello! ║\n'
    printf '╚════════╝\n'
    c_reset
}

box
```

---

## 🐛 DEBUGGING ESCAPE CODES

### Check What's Happening
```bash
# Show literal escape codes
cat -v script.sh

# Show with octal codes
od -c script.sh

# Check your terminal
echo $TERM
tput colors
locale | grep UTF-8
```

### Test Individual Codes
```bash
# Test basic color
printf '\033[31m'; echo "Should be red"; printf '\033[0m'

# Test 256 color
printf '\033[38;5;205m'; echo "Should be pink"; printf '\033[0m'

# Test box drawing
printf '╔═╗\n║ ║\n╚═╝\n'
```

---

## ✅ BEST PRACTICES

### 1. Always Use Printf
```bash
# ❌ Don't
echo "\033[31mRed\033[0m"

# ✅ Do
printf "\033[31mRed\033[0m\n"
```

### 2. Use Functions for Colors
```bash
# ✅ Clean and maintainable
c_error() { printf '\033[31m'; }
c_success() { printf '\033[32m'; }
c_reset() { printf '\033[0m'; }

c_error; printf "Error!"; c_reset; printf "\n"
```

### 3. Always Reset
```bash
# ❌ Color bleeds to next line
printf "\033[31mRed"

# ✅ Clean
printf "\033[31mRed\033[0m\n"
```

### 4. Check Terminal Support
```bash
if [[ -t 1 ]] && [[ $(tput colors 2>/dev/null) -ge 8 ]]; then
    # Use colors
    PINK='\033[38;5;205m'
else
    # No colors
    PINK=''
fi
```

### 5. UTF-8 for Box Drawing
```bash
# Check UTF-8 support
if locale | grep -q UTF-8; then
    # Use ╔═╗
else
    # Use +--+
fi
```

---

## 🎯 QUICK REFERENCE CARD

```bash
# Colors (256 mode)
printf '\033[38;5;205m'    # Pink foreground
printf '\033[48;5;205m'    # Pink background
printf '\033[0m'           # Reset

# Control
printf '\033[2J\033[H'     # Clear screen
printf '\033[K'            # Clear line
printf '\033[s'            # Save cursor
printf '\033[u'            # Restore cursor

# Movement
printf '\033[10;20H'       # Go to row 10, col 20
printf '\033[5A'           # Up 5 lines
printf '\033[3B'           # Down 3 lines

# Attributes
printf '\033[1m'           # Bold
printf '\033[4m'           # Underline
printf '\033[7m'           # Reverse

# Always end with
printf '\033[0m'           # Reset everything
```

---

## 📚 Resources

- **Test script:** `~/test-ansi-codes.sh`
- **Fixed container:** `~/br-container-fixed.sh`
- **Full map:** `~/ansi-escape-map.txt`

**Run the test:**
```bash
~/test-ansi-codes.sh
```

---

**Your terminal is ready!** All escape codes are mapped and working. 🎨
