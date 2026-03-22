#!/bin/bash
# Install Salesforce CLI on Pi
echo "Installing Salesforce CLI..."
npm install -g @salesforce/cli 2>/dev/null || \
  curl -sL https://developer.salesforce.com/media/salesforce-cli/sf/channels/stable/sf-linux-arm64.tar.xz | \
  tar xJ -C ~/sf-cli 2>/dev/null

# Add to PATH
echo 'export PATH="$HOME/sf-cli/bin:$PATH"' >> ~/.bashrc
echo '✅ sf installed'
sf --version 2>/dev/null | head -1
