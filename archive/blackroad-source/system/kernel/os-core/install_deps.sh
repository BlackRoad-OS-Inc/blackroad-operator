#!/bin/bash
# Installation script for BlackRoad OS dependencies

set -e

echo "🔧 Installing BlackRoad OS Dependencies..."
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version)
echo "Python version: $PYTHON_VERSION"
echo ""

# Option 1: Try to install with user flag
echo "Attempting installation with --user flag..."
if pip3 install --user fastapi uvicorn pydantic pydantic-settings; then
    echo "✅ Installed successfully with --user flag"
    echo ""
    echo "Add this to your ~/.zshrc or ~/.bashrc:"
    echo 'export PATH="$HOME/Library/Python/3.14/bin:$PATH"'
    exit 0
fi

# Option 2: Try with --break-system-packages (Homebrew Python)
echo ""
echo "Attempting installation with --break-system-packages..."
if pip3 install --break-system-packages fastapi uvicorn pydantic pydantic-settings; then
    echo "✅ Installed successfully with --break-system-packages"
    exit 0
fi

# Option 3: Suggest virtual environment
echo ""
echo "❌ Direct installation failed."
echo ""
echo "💡 Recommended: Use a virtual environment"
echo ""
echo "Run these commands:"
echo "  python3 -m venv venv"
echo "  source venv/bin/activate"
echo "  pip install -r roadwork/requirements.txt"
echo ""

exit 1
