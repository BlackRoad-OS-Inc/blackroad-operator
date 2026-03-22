#!/bin/bash
# BlackRoad OS Launcher

# Colors
PURPLE='\033[38;5;141m'
WHITE='\033[38;5;255m'
RESET='\033[0m'

echo -e "${PURPLE}BlackRoad OS${RESET}"
echo -e "${WHITE}Terminal Operating System${RESET}"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found"
    exit 1
fi

# Check for required modules
REQUIRED_MODULES=(
    "blackroad-engine.py"
    "blackroad-renderer.py"
    "blackroad-input-router.py"
    "blackroad-command-executor.py"
    "blackroad-persistence.py"
    "blackroad-boot-sequence.py"
    "blackroad-os-boot-integrated.py"
)

MISSING=0
for module in "${REQUIRED_MODULES[@]}"; do
    if [ ! -f "$module" ]; then
        echo "✗ Missing: $module"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "Error: Some required modules are missing"
    echo "Make sure you're in the BlackRoad OS directory"
    exit 1
fi

echo "✓ All modules present"
echo ""

# Parse arguments
HEADLESS=0
if [ "$1" == "--headless" ] || [ "$1" == "-h" ]; then
    HEADLESS=1
fi

# Launch
if [ $HEADLESS -eq 1 ]; then
    echo "Starting in headless mode..."
    python3 blackroad-os-boot-integrated.py --headless
else
    echo "Starting with boot sequence..."
    echo "(Use --headless to skip splash)"
    echo ""
    python3 blackroad-os-boot-integrated.py
fi
