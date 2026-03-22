#!/bin/bash
# BlackRoad Security Audit Script
# Runs comprehensive security checks across the BlackRoad infrastructure
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

REPORT_DIR="${HOME}/.blackroad/security-reports/$(date +%Y-%m-%d)"
mkdir -p "$REPORT_DIR"
REPORT="$REPORT_DIR/audit-$(date +%H%M%S).md"

log()   { echo -e "${GREEN}✓${NC} $1"; echo "- ✓ $1" >> "$REPORT"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; echo "- ⚠ WARNING: $1" >> "$REPORT"; }
fail()  { echo -e "${RED}✗${NC} $1"; echo "- ✗ FAIL: $1" >> "$REPORT"; }
header(){ echo -e "\n${CYAN}══ $1 ══${NC}"; echo -e "\n## $1" >> "$REPORT"; }

echo "# BlackRoad Security Audit - $(date)" > "$REPORT"
echo "**Auditor:** $USER | **Host:** $(hostname)" >> "$REPORT"

header "1. File Permissions"
check_perms() {
  local file="$1" expected="$2"
  if [ -f "$file" ]; then
    local actual
    actual=$(stat -f "%OLp" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)
    if [ "$actual" = "$expected" ]; then
      log "$file has correct permissions ($expected)"
    else
      fail "$file: expected $expected, got $actual"
    fi
  fi
}
check_perms "$HOME/.blackroad/vault/.master.key" "400"
check_perms "$HOME/.ssh/id_rsa" "600"
check_perms "$HOME/.ssh/id_ed25519" "600"

header "2. Secret Scanning"
BR_ROOT="${BLACKROAD_ROOT:-$HOME/blackroad}"
if [ -d "$BR_ROOT" ]; then
  # Scan for hardcoded secrets
  PATTERNS="sk-[a-zA-Z0-9]{20,}" # OpenAI pattern
  FOUND=$(grep -r --include="*.ts" --include="*.js" --include="*.py" --include="*.sh" \
    -E "sk-[a-zA-Z0-9]{20,}|AKIA[A-Z0-9]{16}|ghp_[a-zA-Z0-9]{36}" \
    "$BR_ROOT/blackroad-core" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$FOUND" -eq 0 ]; then
    log "No hardcoded secrets found in blackroad-core"
  else
    fail "Found $FOUND potential secrets in blackroad-core"
  fi
fi

header "3. Network Exposure"
# Check if gateway is only on localhost
if command -v lsof >/dev/null 2>&1; then
  GW_BIND=$(lsof -i :8787 -n -P 2>/dev/null | grep LISTEN | awk '{print $9}')
  if echo "$GW_BIND" | grep -q "127.0.0.1:8787"; then
    log "Gateway bound to localhost (secure)"
  elif [ -z "$GW_BIND" ]; then
    warn "Gateway not running"
  else
    fail "Gateway exposed on: $GW_BIND"
  fi
fi

header "4. SSH Key Audit"
if [ -d "$HOME/.ssh" ]; then
  KEY_COUNT=$(ls "$HOME/.ssh"/*.pub 2>/dev/null | wc -l | tr -d ' ')
  log "Found $KEY_COUNT SSH public keys"
  for pub in "$HOME/.ssh"/*.pub; do
    [ -f "$pub" ] && log "  $pub: $(ssh-keygen -l -f "$pub" 2>/dev/null | awk '{print $1, $4}')"
  done
fi

header "5. Environment Variables"
RISKY_VARS="ANTHROPIC_API_KEY OPENAI_API_KEY AWS_SECRET_ACCESS_KEY GITHUB_TOKEN"
for var in $RISKY_VARS; do
  if env | grep -q "^${var}="; then
    warn "$var is set in environment (ensure not in agent context)"
  else
    log "$var not set in current environment"
  fi
done

echo -e "\n---\n**Report saved:** $REPORT" | tee -a "$REPORT"
echo -e "${GREEN}Audit complete!${NC} Report: $REPORT"
