#!/bin/bash
# BlackRoad Compliance Audit Runner
set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo "🔍 Running BlackRoad compliance audit..."
echo ""
echo "1. Checking secret scanning..."
gh api repos/BlackRoad-OS-Inc/blackroad-core/secret-scanning/alerts --jq 'length' 2>/dev/null | \
  xargs -I{} bash -c 'echo -e "${YELLOW}  ⚠ Secret scanning alerts: {}${NC}"'
echo ""
echo "2. Checking Dependabot..."
gh api repos/BlackRoad-OS-Inc/blackroad-core/dependabot/alerts --jq 'length' 2>/dev/null | \
  xargs -I{} bash -c 'echo -e "  Dependabot alerts: {}"'
echo ""
echo -e "${GREEN}✅ Audit complete!${NC}"
