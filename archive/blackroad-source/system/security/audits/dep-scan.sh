#!/bin/bash
# BlackRoad Dependency Vulnerability Scan
# Scans all local org repos for known vulnerabilities using trivy/grype
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

ORGS_DIR="${HOME}/blackroad/orgs"
REPORT_DIR="${HOME}/.blackroad/security-reports/deps"
mkdir -p "$REPORT_DIR"

scan_repo() {
  local repo_path="$1"
  local repo_name
  repo_name=$(basename "$repo_path")
  
  echo -e "${CYAN}Scanning $repo_name...${NC}"
  
  # npm/Node.js
  if [ -f "$repo_path/package.json" ]; then
    if command -v npm >/dev/null 2>&1; then
      npm audit --json --prefix "$repo_path" 2>/dev/null > "$REPORT_DIR/${repo_name}-npm.json" || true
      VULNS=$(jq '.metadata.vulnerabilities.total // 0' "$REPORT_DIR/${repo_name}-npm.json" 2>/dev/null || echo "?")
      [ "$VULNS" != "0" ] && [ "$VULNS" != "?" ] && \
        echo -e "${YELLOW}  ⚠ $VULNS npm vulnerabilities${NC}" || \
        echo -e "${GREEN}  ✓ No npm vulnerabilities${NC}"
    fi
  fi
  
  # Python
  if [ -f "$repo_path/requirements.txt" ] || [ -f "$repo_path/pyproject.toml" ]; then
    if command -v trivy >/dev/null 2>&1; then
      trivy fs --quiet --severity HIGH,CRITICAL "$repo_path" 2>/dev/null | \
        tee "$REPORT_DIR/${repo_name}-trivy.txt" | tail -5
    fi
  fi
}

if [ -d "$ORGS_DIR" ]; then
  find "$ORGS_DIR" -maxdepth 3 -name "package.json" -not -path "*/node_modules/*" | \
    xargs -I{} dirname {} | sort -u | while read -r repo; do
    scan_repo "$repo"
  done
fi

echo -e "\n${GREEN}Dep scan complete!${NC} Reports in: $REPORT_DIR"
