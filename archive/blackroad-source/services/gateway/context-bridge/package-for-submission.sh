#!/bin/bash

# Package Context Bridge extensions for submission
# Creates clean ZIPs ready for Chrome Web Store and Firefox Add-ons

set -e

echo "📦 Packaging Context Bridge for submission..."
echo ""

# Clean up old builds
rm -f context-bridge-chrome.zip context-bridge-firefox.zip
rm -rf build/ dist/

# Create build directory
mkdir -p build

echo "1️⃣  Packaging Chrome extension..."

# Create Chrome ZIP
cd extension
zip -r ../build/context-bridge-chrome.zip \
  manifest.json \
  popup/ \
  content/ \
  background/ \
  styles/ \
  icons/ \
  templates/ \
  -x "*.DS_Store" \
  -x "*/.git/*" \
  -x "*/node_modules/*" \
  -x "*.log" \
  -x "*~" \
  -x "*.swp"

cd ..

echo "✅ Chrome extension packaged: build/context-bridge-chrome.zip"
unzip -l build/context-bridge-chrome.zip | tail -5
echo ""

echo "2️⃣  Packaging Firefox extension..."

# Create Firefox ZIP
cd extension-firefox
zip -r ../build/context-bridge-firefox.zip \
  manifest.json \
  popup/ \
  content/ \
  background/ \
  styles/ \
  icons/ \
  templates/ \
  -x "*.DS_Store" \
  -x "*/.git/*" \
  -x "*/node_modules/*" \
  -x "*.log" \
  -x "*~" \
  -x "*.swp"

cd ..

echo "✅ Firefox extension packaged: build/context-bridge-firefox.zip"
unzip -l build/context-bridge-firefox.zip | tail -5
echo ""

echo "3️⃣  Generating checksums..."

# Generate SHA256 checksums
cd build
shasum -a 256 context-bridge-chrome.zip > context-bridge-chrome.zip.sha256
shasum -a 256 context-bridge-firefox.zip > context-bridge-firefox.zip.sha256
cd ..

echo "✅ Checksums generated"
cat build/*.sha256
echo ""

echo "4️⃣  Package summary..."

# Show file sizes
ls -lh build/*.zip

echo ""
echo "📊 Package Statistics:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Chrome ZIP:  $(du -h build/context-bridge-chrome.zip | cut -f1)"
echo "Firefox ZIP: $(du -h build/context-bridge-firefox.zip | cut -f1)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ All packages ready for submission!"
echo ""
echo "📁 Files created:"
echo "  - build/context-bridge-chrome.zip"
echo "  - build/context-bridge-chrome.zip.sha256"
echo "  - build/context-bridge-firefox.zip"
echo "  - build/context-bridge-firefox.zip.sha256"
echo ""
echo "🚀 Next steps:"
echo "  1. Upload context-bridge-chrome.zip to Chrome Web Store"
echo "  2. Upload context-bridge-firefox.zip to Firefox Add-ons"
echo "  3. Keep .sha256 files for verification"

