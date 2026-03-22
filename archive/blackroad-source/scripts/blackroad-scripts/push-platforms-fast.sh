#!/bin/bash

echo "🚀 FAST GITHUB PUSH - ALL PLATFORMS!"
echo ""

PLATFORMS=(
  "blackroad-zapier:Zapier integration - Connect to 5000+ apps"
  "blackroad-notion:Notion integration - Perfect docs sync"
  "blackroad-linear:Linear integration - Project management"
  "blackroad-gitlab-ci:GitLab CI/CD pipeline configuration"
  "blackroad-postman:Postman API collection"
  "blackroad-mobile-app:iOS + Android mobile app - React Native"
  "blackroad-chrome-extension:Chrome DevTools extension"
  "blackroad-vscode-extension:VS Code extension with deploy commands"
  "blackroad-api-sdks:JavaScript, Python, Go, and Ruby SDKs"
  "blackroad-desktop-app:Cross-platform desktop app - Electron"
  "blackroad-figma-plugin:Figma plugin for design to code"
  "blackroad-slack-bot:Slack bot with slash commands"
  "blackroad-raycast:Raycast extension for Mac"
  "blackroad-alfred:Alfred workflow for Mac automation"
  "blackroad-github-actions:GitHub Actions for CI/CD"
  "blackroad-product-hunt:Product Hunt launch materials"
)

SUCCESS=0
FAILED=0
SKIPPED=0

for entry in "${PLATFORMS[@]}"; do
  IFS=':' read -r name desc <<< "$entry"
  
  if [ ! -d ~/"$name" ]; then
    echo "⚠️  Skipping $name (not found)"
    ((SKIPPED++))
    continue
  fi
  
  cd ~/"$name" || continue
  
  # Check if repo already exists
  if gh repo view "blackboxprogramming/$name" &> /dev/null; then
    echo "✅ $name - already exists, pushing updates..."
    git remote add origin "https://github.com/blackboxprogramming/$name.git" 2>/dev/null
    git push -u origin main 2>&1 | grep -E "(up-to-date|branch|Everything)"
    ((SUCCESS++))
  else
    echo "📦 Creating: $name"
    if gh repo create "blackboxprogramming/$name" --public --description "$desc" --source=. --remote=origin 2>&1; then
      git push -u origin main 2>&1 | grep -E "(branch|Writing|Counting)"
      echo "✅ $name created and pushed!"
      ((SUCCESS++))
    else
      echo "❌ Failed: $name"
      ((FAILED++))
    fi
  fi
  
  sleep 2  # Rate limit buffer
done

echo ""
echo "═══════════════════════════════════════"
echo "🎊 GITHUB PUSH COMPLETE!"
echo "═══════════════════════════════════════"
echo "✅ Success: $SUCCESS repos"
echo "❌ Failed: $FAILED repos"
echo "⚠️  Skipped: $SKIPPED repos"
echo ""
echo "🌍 View at: https://github.com/blackboxprogramming?tab=repositories"
