#!/bin/bash

echo "⚖️🎖️ ADDING LICENSES & BADGES TO ALL REPOS!"
echo ""

MIT_LICENSE='MIT License

Copyright (c) 2026 BlackBox Programming

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.'

REPOS=(
  "blackroad-zapier"
  "blackroad-notion"
  "blackroad-linear"
  "blackroad-gitlab-ci"
  "blackroad-postman"
  "blackroad-mobile-app"
  "blackroad-chrome-extension"
  "blackroad-vscode-extension"
  "blackroad-api-sdks"
  "blackroad-desktop-app"
  "blackroad-figma-plugin"
  "blackroad-slack-bot"
  "blackroad-raycast"
  "blackroad-alfred"
  "blackroad-github-actions"
  "blackroad-product-hunt"
)

for repo in "${REPOS[@]}"; do
  cd ~/"$repo" || continue
  
  # Add LICENSE file
  echo "$MIT_LICENSE" > LICENSE
  
  # Add badges to README
  BADGES='[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/blackboxprogramming/'"$repo"'.svg?style=social&label=Star)](https://github.com/blackboxprogramming/'"$repo"')
[![GitHub forks](https://img.shields.io/github/forks/blackboxprogramming/'"$repo"'.svg?style=social&label=Fork)](https://github.com/blackboxprogramming/'"$repo"'/fork)

'
  
  # Prepend badges to README
  if [ -f README.md ]; then
    echo "$BADGES" | cat - README.md > temp && mv temp README.md
  fi
  
  git add LICENSE README.md
  git commit -m "chore: Add MIT license and badges"
  git push origin main
  
  echo "✅ $repo - License & badges added!"
  sleep 1
done

echo ""
echo "═══════════════════════════════════════"
echo "🎊 LICENSES & BADGES COMPLETE!"
echo "═══════════════════════════════════════"
