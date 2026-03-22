#!/bin/bash
# Lucidia OS Installer
# BlackRoad OS, Inc.
#
# Install: curl -sL https://raw.githubusercontent.com/BlackRoad-OS/lucidia-os/main/install.sh | bash

set -euo pipefail

LUCIDIA_HOME="$HOME/.lucidia"
REPO="https://github.com/BlackRoad-OS/lucidia-os.git"

echo "Installing Lucidia OS..."
echo ""

# Clone or update
if [ -d "$LUCIDIA_HOME" ]; then
    echo "Updating existing installation..."
    cd "$LUCIDIA_HOME"
    git pull --rebase
else
    echo "Cloning repository..."
    git clone "$REPO" "$LUCIDIA_HOME"
fi

# Make scripts executable
chmod +x "$LUCIDIA_HOME/bin/"*

# Add to bashrc if not already present
if ! grep -q "source.*lucidia.sh" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Lucidia OS" >> ~/.bashrc
    echo "source ~/.lucidia/lucidia.sh" >> ~/.bashrc
    echo "Added to ~/.bashrc"
fi

echo ""
echo "Lucidia installed successfully!"
echo "Run: source ~/.bashrc"
echo ""
echo "BlackRoad OS, Inc. | AI-Native"
