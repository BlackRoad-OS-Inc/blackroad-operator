#!/usr/bin/env bash
# CIPHER Audit Scanner — BlackRoad Security
# Scans codebase for secrets, dangerous permissions, open ports, and supply chain risks.

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BLUE='\033[0;34m'; NC='\033[0m'

PASS=0; WARN=0; FAIL=0
REPORT_FILE="${REPORT_FILE:-/tmp/cipher-audit-$(date +%s).json}"

log_pass() { echo -e "${GREEN}✓${NC} $1"; ((PASS++)); }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; ((WARN++)); }
log_fail() { echo -e "${RED}✗${NC} $1"; ((FAIL++)); }
section()  { echo -e "\n${BLUE}═══${NC} ${CYAN}$1${NC}"; }

TARGET="${1:-.}"

echo -e "${CYAN}"
echo "╔══════════════════════════════════════╗"
echo "║  CIPHER Security Audit Scanner       ║"
echo "║  BlackRoad OS — Zero Trust Mode      ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"
echo "Target: $TARGET"
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ── 1. Secret patterns ────────────────────────────────────────────────────────

section "Secret Detection"

SECRET_PATTERNS=(
  "sk-[a-zA-Z0-9]{32,}"
  "sk-ant-[a-zA-Z0-9]{32,}"
  "AKIA[0-9A-Z]{16}"
  "ghp_[a-zA-Z0-9]{36}"
  "ghs_[a-zA-Z0-9]{36}"
  "xox[baprs]-[0-9a-zA-Z-]+"
  "AIza[0-9A-Za-z_\-]{35}"
  "EAACEdEose0cBA[0-9A-Za-z]+"
  "-----BEGIN [A-Z]+ PRIVATE KEY-----"
  "password\s*=\s*[\"'][^\"']{8,}"
  "secret\s*=\s*[\"'][^\"']{8,}"
  "api_key\s*=\s*[\"'][^\"']{8,}"
)

SECRETS_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  MATCHES=$(grep -r --include="*.{ts,tsx,js,py,sh,yaml,yml,json,env,toml}" \
    --exclude-dir=".git" --exclude-dir="node_modules" --exclude-dir=".venv" \
    -lE "$pattern" "$TARGET" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    log_fail "Potential secret found (pattern: ${pattern:0:20}...)"
    echo "$MATCHES" | while read -r f; do echo "    → $f"; done
    ((SECRETS_FOUND++))
  fi
done

if [ "$SECRETS_FOUND" -eq 0 ]; then
  log_pass "No hardcoded secrets detected"
fi

# ── 2. File permissions ───────────────────────────────────────────────────────

section "File Permissions"

# SSH keys
while IFS= read -r -d '' keyfile; do
  PERMS=$(stat -f "%OLp" "$keyfile" 2>/dev/null || stat -c "%a" "$keyfile" 2>/dev/null)
  if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
    log_fail "SSH key has insecure permissions $PERMS: $keyfile"
  else
    log_pass "SSH key permissions OK: $(basename "$keyfile") ($PERMS)"
  fi
done < <(find "$TARGET" -name "*.pem" -o -name "id_rsa" -o -name "id_ed25519" -print0 2>/dev/null)

# .env files should not be world-readable
while IFS= read -r -d '' envfile; do
  PERMS=$(stat -f "%OLp" "$envfile" 2>/dev/null || stat -c "%a" "$envfile" 2>/dev/null)
  if [[ "${PERMS: -1}" != "0" ]]; then
    log_warn ".env file world-readable ($PERMS): $envfile"
  else
    log_pass ".env permissions OK: $(basename "$envfile")"
  fi
done < <(find "$TARGET" -name ".env" -print0 2>/dev/null)

# ── 3. Dependency audit ───────────────────────────────────────────────────────

section "Dependency Audit"

if [ -f "$TARGET/package.json" ] && command -v npm >/dev/null 2>&1; then
  HIGH=$(cd "$TARGET" && npm audit --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('high',0))" 2>/dev/null || echo "?")
  CRIT=$(cd "$TARGET" && npm audit --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('critical',0))" 2>/dev/null || echo "?")
  if [[ "$CRIT" != "0" && "$CRIT" != "?" ]]; then
    log_fail "npm audit: $CRIT critical, $HIGH high vulnerabilities"
  elif [[ "$HIGH" != "0" && "$HIGH" != "?" ]]; then
    log_warn "npm audit: $HIGH high vulnerabilities (0 critical)"
  else
    log_pass "npm audit: no critical/high vulnerabilities"
  fi
fi

if [ -f "$TARGET/requirements.txt" ] && command -v pip >/dev/null 2>&1; then
  VULN=$(pip-audit -r "$TARGET/requirements.txt" --format=json 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
  if [[ "$VULN" != "0" && "$VULN" != "?" ]]; then
    log_warn "pip-audit: $VULN vulnerabilities found"
  else
    log_pass "pip-audit: no known vulnerabilities"
  fi
fi

# ── 4. Open ports ─────────────────────────────────────────────────────────────

section "Open Ports"

DANGEROUS_PORTS=(21 23 69 111 512 513 514 2049 6379 27017 27018)
for port in "${DANGEROUS_PORTS[@]}"; do
  if nc -z 127.0.0.1 "$port" 2>/dev/null; then
    log_warn "Port $port is open (potentially dangerous)"
  fi
done
log_pass "Port scan complete"

# Check gateway is localhost-only
if nc -z 0.0.0.0 8787 2>/dev/null; then
  log_warn "Gateway port 8787 bound to 0.0.0.0 — should be 127.0.0.1 only"
else
  log_pass "Gateway not externally accessible"
fi

# ── 5. .gitignore coverage ────────────────────────────────────────────────────

section ".gitignore Coverage"

REQUIRED_IGNORES=(".env" "*.pem" "*.key" "node_modules" "__pycache__" ".venv" "*.log")
if [ -f "$TARGET/.gitignore" ]; then
  for pattern in "${REQUIRED_IGNORES[@]}"; do
    if grep -q "$pattern" "$TARGET/.gitignore" 2>/dev/null; then
      log_pass ".gitignore covers: $pattern"
    else
      log_warn ".gitignore missing: $pattern"
    fi
  done
else
  log_fail "No .gitignore found"
fi

# ── Summary ───────────────────────────────────────────────────────────────────

TOTAL=$((PASS + WARN + FAIL))
echo ""
echo "════════════════════════════════════"
echo -e "  ${GREEN}PASS${NC}: $PASS   ${YELLOW}WARN${NC}: $WARN   ${RED}FAIL${NC}: $FAIL   Total: $TOTAL"

# JSON report
cat > "$REPORT_FILE" << JSONEOF
{
  "tool": "CIPHER Audit Scanner",
  "target": "$(realpath "$TARGET")",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": { "pass": $PASS, "warn": $WARN, "fail": $FAIL, "total": $TOTAL },
  "status": "$([ "$FAIL" -eq 0 ] && echo "PASS" || echo "FAIL")"
}
JSONEOF

echo "  Report: $REPORT_FILE"

[ "$FAIL" -eq 0 ]
