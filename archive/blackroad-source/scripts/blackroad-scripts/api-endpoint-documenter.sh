#!/usr/bin/env bash
# Auto-document API endpoints
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[API-DOCS]${NC} Scanning for API endpoints..."

cat > API.md <<'API'
# API Documentation

Auto-generated API endpoint documentation.

## Endpoints

API

FOUND=0

# Search for Express/Node routes
if [[ -f package.json ]]; then
  echo ""
  echo "### Node.js Routes" >> API.md
  echo "" >> API.md
  
  find . -type f -name "*.js" -o -name "*.ts" | grep -v node_modules | while read file; do
    grep -E "(app\.(get|post|put|delete|patch)|router\.(get|post|put|delete|patch))" "$file" 2>/dev/null | while read line; do
      METHOD=$(echo "$line" | grep -oE "(get|post|put|delete|patch)" | head -1 | tr '[:lower:]' '[:upper:]')
      ROUTE=$(echo "$line" | grep -oP "['\"](/[^'\"]*)" | tr -d "'\"")
      echo "- **$METHOD** \`$ROUTE\`" >> API.md
      ((FOUND++))
    done
  done
fi

# Search for Python Flask routes
if [[ -f requirements.txt ]]; then
  echo "" >> API.md
  echo "### Python Routes" >> API.md
  echo "" >> API.md
  
  find . -type f -name "*.py" | while read file; do
    grep -E "@app\.route|@bp\.route" "$file" 2>/dev/null | while read line; do
      ROUTE=$(echo "$line" | grep -oP "['\"](/[^'\"]*)" | tr -d "'\"")
      echo "- **GET/POST** \`$ROUTE\`" >> API.md
      ((FOUND++))
    done
  done
fi

echo "" >> API.md
echo "---" >> API.md
echo "*Auto-generated: $(date)*" >> API.md

if [[ $FOUND -gt 0 ]]; then
  echo -e "${GREEN}✓${NC} Found $FOUND endpoints"
  echo "  Documentation: $(pwd)/API.md"
else
  echo -e "${YELLOW}⚠${NC} No API endpoints found"
fi
