#!/bin/bash
# BlackRoad Agent CLI Installation Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHELL_CONFIG=""

echo "🤖 BlackRoad Agent CLI Installation"
echo "===================================="
echo ""

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    echo "Detected: zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    echo "Detected: bash"
else
    echo "Warning: Unknown shell. Defaulting to ~/.bashrc"
    SHELL_CONFIG="$HOME/.bashrc"
fi

echo ""
echo "Configuration file: $SHELL_CONFIG"
echo "Scripts directory: $SCRIPT_DIR"
echo ""

# Check if already in PATH
if echo "$PATH" | grep -q "$SCRIPT_DIR"; then
    echo "✅ Scripts directory already in PATH"
else
    echo "📝 Adding to PATH..."
    echo "" >> "$SHELL_CONFIG"
    echo "# BlackRoad Agent CLI" >> "$SHELL_CONFIG"
    echo "export PATH=\"\$PATH:$SCRIPT_DIR\"" >> "$SHELL_CONFIG"
    echo "✅ Added to $SHELL_CONFIG"
fi

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x "$SCRIPT_DIR"/br-*
echo "✅ Scripts are now executable"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Reload your shell:"
echo "   source $SHELL_CONFIG"
echo ""
echo "2. Try a command:"
echo "   br-agent help"
echo ""
echo "3. Quick start:"
echo "   br-finance    # Launch financial analyst"
echo "   br-research   # Launch research assistant"
echo "   br-devops     # Launch DevOps engineer"
echo ""
echo "📖 Full guide: BR-AGENT-CLI-GUIDE.md"
echo ""
