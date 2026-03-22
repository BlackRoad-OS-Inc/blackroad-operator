#!/bin/bash
# ROADWORK CLI Installation Script
# Run this to install ROADWORK as a standalone CLI tool

set -e

echo "🚗 Installing ROADWORK CLI..."

# Create bin directory if it doesn't exist
mkdir -p ~/.local/bin

# Copy the CLI files
echo "📦 Copying CLI files..."
cp /Users/alexa/blackroad-sandbox/job-applier-os-v2.py ~/.local/bin/roadwork
chmod +x ~/.local/bin/roadwork

# Add shebang to make it executable
sed -i.bak '1i\
#!/opt/homebrew/bin/python3
' ~/.local/bin/roadwork || true
rm -f ~/.local/bin/roadwork.bak

# Install required Python packages
echo "📚 Installing dependencies..."
pip3 install --user --break-system-packages requests beautifulsoup4 playwright sentence-transformers 2>/dev/null || \
pip3 install --user requests beautifulsoup4 playwright sentence-transformers

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo ""
    echo "⚠️  Add this to your ~/.zshrc or ~/.bashrc:"
    echo ""
    echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi

echo ""
echo "✅ ROADWORK CLI installed!"
echo ""
echo "Usage:"
echo "    roadwork                 # Interactive mode"
echo "    roadwork --help          # Show help"
echo ""
echo "Your profile is stored at: ~/.applier/profile.json"
echo ""
