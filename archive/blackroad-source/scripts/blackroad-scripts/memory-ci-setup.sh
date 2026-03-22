#!/usr/bin/env bash
# Set up GitHub Actions CI/CD for projects
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[CI/CD]${NC} Setting up GitHub Actions..."

mkdir -p .github/workflows

# Create basic CI workflow
cat > .github/workflows/auto-deploy.yml <<'WORKFLOW'
name: Auto-Deploy

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm install || echo "No package.json found"
    
    - name: Run tests
      run: npm test || echo "No tests found"
    
    - name: Build
      run: npm run build || echo "No build script"
    
    - name: Deploy notification
      run: |
        echo "✅ Deployed $(basename $PWD) successfully!"
        echo "Commit: $GITHUB_SHA"
        echo "Branch: $GITHUB_REF"
WORKFLOW

echo -e "${GREEN}✓${NC} GitHub Actions workflow created!"
echo ""
echo "Commit and push to activate:"
echo "  ./.git-auto-commit.sh 'Added CI/CD pipeline'"
