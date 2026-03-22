#!/usr/bin/env bash
# Ultimate project setup wizard
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🧙 ULTIMATE PROJECT SETUP WIZARD 🧙          ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

read -p "📦 Project name: " PROJECT_NAME
read -p "🏷️  Project type (node/python/go): " PROJECT_TYPE

echo ""
echo -e "${CYAN}[CREATING PROJECT...]${NC}"

mkdir -p ~/"$PROJECT_NAME"
cd ~/"$PROJECT_NAME"

# Initialize git
git init
echo -e "${GREEN}✓${NC} Git initialized"

# Create basic files based on type
case $PROJECT_TYPE in
  node)
    cat > package.json <<NPM
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "Created with BlackRoad Setup Wizard",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
NPM
    echo "console.log('Hello from $PROJECT_NAME!');" > index.js
    echo -e "${GREEN}✓${NC} Node.js project created"
    ;;
    
  python)
    cat > requirements.txt <<PY
flask==2.3.0
PY
    cat > app.py <<PYAPP
def main():
    print("Hello from $PROJECT_NAME!")

if __name__ == "__main__":
    main()
PYAPP
    echo -e "${GREEN}✓${NC} Python project created"
    ;;
    
  go)
    cat > go.mod <<GO
module $PROJECT_NAME

go 1.21
GO
    cat > main.go <<GOMAIN
package main

import "fmt"

func main() {
    fmt.Println("Hello from $PROJECT_NAME!")
}
GOMAIN
    echo -e "${GREEN}✓${NC} Go project created"
    ;;
esac

# Create README
cat > README.md <<README
# $PROJECT_NAME

Created with BlackRoad Ultimate Setup Wizard 🚀

## Getting Started

\`\`\`bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
# (instructions based on project type)

# Run
# (instructions based on project type)
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## License

MIT
README
echo -e "${GREEN}✓${NC} README created"

# Create .gitignore
cat > .gitignore <<IGNORE
node_modules/
.env
*.log
.DS_Store
dist/
build/
__pycache__/
*.pyc
IGNORE
echo -e "${GREEN}✓${NC} .gitignore created"

# Create LICENSE
cat > LICENSE <<LICENSE
MIT License

Copyright (c) $(date +%Y)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
LICENSE
echo -e "${GREEN}✓${NC} LICENSE created"

# Initial commit
git add -A
git commit -m "🚀 Initial commit - Created with BlackRoad Wizard"
echo -e "${GREEN}✓${NC} Initial commit created"

# Create GitHub repo
if command -v gh >/dev/null 2>&1; then
  read -p "Create GitHub repo? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh repo create "$PROJECT_NAME" --public --source=. --remote=origin --push
    echo -e "${GREEN}✓${NC} GitHub repo created and pushed!"
  fi
fi

# Enable auto-deploy
if [[ -f ~/scripts/memory-git-auto.sh ]]; then
  ~/scripts/memory-git-auto.sh . >/dev/null 2>&1
  echo -e "${GREEN}✓${NC} Auto-deploy enabled"
fi

echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        ✅ PROJECT READY! ✅                          ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  📍 Location: $HOME/$PROJECT_NAME"
echo "  🎯 Type: $PROJECT_TYPE"
echo "  ✅ Git: Initialized"
echo "  ✅ README: Created"
echo "  ✅ LICENSE: MIT"
echo "  ✅ .gitignore: Created"
echo "  🚀 Auto-deploy: Enabled"
echo ""
echo "Next: cd ~/$PROJECT_NAME && start coding!"
