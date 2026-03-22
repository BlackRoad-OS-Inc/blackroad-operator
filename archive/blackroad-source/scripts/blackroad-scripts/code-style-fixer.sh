#!/usr/bin/env bash
# Auto-fix code style issues
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[STYLE-FIXER]${NC} Fixing code style..."

FIXED=0

# Fix JavaScript/TypeScript
if command -v prettier >/dev/null 2>&1; then
  echo "  Running Prettier..."
  prettier --write "**/*.{js,ts,jsx,tsx}" --log-level silent 2>/dev/null && ((FIXED++))
fi

# Fix Python
if command -v black >/dev/null 2>&1; then
  echo "  Running Black..."
  black . --quiet 2>/dev/null && ((FIXED++))
fi

# Create .editorconfig if missing
if [[ ! -f .editorconfig ]]; then
  cat > .editorconfig <<'CONFIG'
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.py]
indent_size = 4
CONFIG
  echo -e "${GREEN}✓${NC} Created .editorconfig"
  ((FIXED++))
fi

# Create .prettierrc if missing and has package.json
if [[ -f package.json ]] && [[ ! -f .prettierrc ]]; then
  cat > .prettierrc <<'PRETTIER'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
PRETTIER
  echo -e "${GREEN}✓${NC} Created .prettierrc"
  ((FIXED++))
fi

echo ""
if [[ $FIXED -gt 0 ]]; then
  echo -e "${GREEN}✅ Fixed $FIXED style issues!${NC}"
else
  echo -e "${YELLOW}⚠${NC} No style tools found (install prettier/black for auto-fixing)"
fi
