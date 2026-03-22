#!/usr/bin/env bash
# Bulk operations on all projects
set -euo pipefail

OPERATION="${1:-help}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

case "$OPERATION" in
  readme)
    echo -e "${BLUE}[BULK]${NC} Generating READMEs for all projects..."
    COUNT=0
    find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | while read script; do
      PROJECT_DIR=$(dirname "$script")
      cd "$PROJECT_DIR"
      bash ~/scripts/auto-readme-generator.sh "$PROJECT_DIR" 2>/dev/null && ((COUNT++)) || true
      echo "  ✓ $(basename $PROJECT_DIR)"
    done
    echo -e "${GREEN}✅ READMEs generated!${NC}"
    ;;
    
  stats)
    echo -e "${BLUE}[BULK]${NC} Analyzing all projects..."
    find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | head -10 | while read script; do
      PROJECT_DIR=$(dirname "$script")
      echo ""
      bash ~/scripts/code-stats-analyzer.sh "$PROJECT_DIR" 2>/dev/null
    done
    ;;
    
  ci)
    echo -e "${BLUE}[BULK]${NC} Adding CI/CD to all projects..."
    find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | while read script; do
      PROJECT_DIR=$(dirname "$script")
      cd "$PROJECT_DIR"
      if [[ ! -d .github/workflows ]]; then
        bash ~/scripts/memory-ci-setup.sh "$PROJECT_DIR" 2>/dev/null
        echo "  ✓ $(basename $PROJECT_DIR)"
      fi
    done
    echo -e "${GREEN}✅ CI/CD added to all projects!${NC}"
    ;;
    
  help|*)
    cat <<HELP
🔧 Bulk Operations

Usage: ~/scripts/bulk-operations.sh <operation>

Operations:
  readme    - Generate READMEs for all projects
  stats     - Analyze code stats for all projects
  ci        - Add CI/CD to all projects
  help      - Show this help

Examples:
  ~/scripts/bulk-operations.sh readme
  ~/scripts/bulk-operations.sh stats
  ~/scripts/bulk-operations.sh ci
HELP
    ;;
esac
