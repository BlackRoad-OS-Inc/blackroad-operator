#!/usr/bin/env bash
# BlackRoad Automatic Coding Environment
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_NAME="${1:-blackroad-project-$(date +%s)}"
PROJECT_DIR="$HOME/$PROJECT_NAME"

echo -e "${BLUE}[CODING-ENV]${NC} Creating auto-deploy environment: $PROJECT_NAME"

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Initialize git
git init
git branch -M main

# Create GitHub repo
echo -e "${BLUE}[GitHub]${NC} Creating repository..."
gh repo create "$PROJECT_NAME" --private --source=. --remote=origin

# Setup auto-commit
cat > ".git-auto-commit.sh" <<'AUTOCOMMIT'
#!/bin/bash
MESSAGE="${1:-Auto-commit: $(date +%Y-%m-%d\ %H:%M:%S)}"
git add -A
git commit -m "$MESSAGE" && git push origin main
echo "✅ Committed and pushed!"
AUTOCOMMIT
chmod +x .git-auto-commit.sh

# Setup git hooks
mkdir -p .git/hooks
cat > .git/hooks/post-commit <<'HOOK'
#!/bin/bash
git push origin main 2>/dev/null || true
HOOK
chmod +x .git/hooks/post-commit

# Create starter files
cat > README.md <<README
# $PROJECT_NAME

Auto-deploy coding environment powered by BlackRoad Memory System

## Features
- ✅ Auto-commit to GitHub
- ✅ Auto-push on every commit
- ✅ Memory system integration

## Usage
\`\`\`bash
# Make changes, then:
./.git-auto-commit.sh "your commit message"

# Or just use git normally - it auto-pushes!
git add .
git commit -m "changes"
# Automatically pushed!
\`\`\`

Created: $(date)
README

# Log to memory
mkdir -p "$HOME/.codex/memory"
cat >> "$HOME/.codex/memory/coding-environments.json" <<LOG
{
  "name": "$PROJECT_NAME",
  "path": "$PROJECT_DIR",
  "github": "https://github.com/blackboxprogramming/$PROJECT_NAME",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
LOG

# Initial commit
git add -A
git commit -m "🚀 Initial commit - Auto-deploy environment"
git push -u origin main

echo ""
echo -e "${GREEN}✅ Coding environment ready!${NC}"
echo ""
echo "Location: $PROJECT_DIR"
echo "GitHub: https://github.com/blackboxprogramming/$PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_DIR"
echo "  # Make changes..."
echo "  ./.git-auto-commit.sh 'my changes'"
echo ""
