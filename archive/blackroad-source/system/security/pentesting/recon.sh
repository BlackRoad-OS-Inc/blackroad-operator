#!/bin/bash
# BlackRoad Recon Script
# Performs passive recon on BlackRoad infrastructure endpoints
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

TARGET="${1:-blackroad.io}"
REPORT_DIR="${HOME}/.blackroad/pentest-reports/$(date +%Y-%m-%d)"
mkdir -p "$REPORT_DIR"
REPORT="$REPORT_DIR/recon-${TARGET}.md"

header() { echo -e "${CYAN}── $1 ──${NC}"; echo -e "\n## $1" >> "$REPORT"; }
log()    { echo -e "${GREEN}✓${NC} $1"; echo "- $1" >> "$REPORT"; }
warn()   { echo -e "${YELLOW}⚠${NC} $1"; echo "- ⚠ $1" >> "$REPORT"; }

echo "# Recon: $TARGET — $(date)" > "$REPORT"

header "DNS Enumeration"
if command -v dig >/dev/null 2>&1; then
  echo "### A Records" >> "$REPORT"
  dig +short A "$TARGET" | tee -a "$REPORT" | while read ip; do log "A: $ip"; done
  dig +short MX "$TARGET" | tee -a "$REPORT" | while read mx; do log "MX: $mx"; done
  dig +short TXT "$TARGET" | head -5 | tee -a "$REPORT"
fi

header "HTTP Headers"
if command -v curl >/dev/null 2>&1; then
  HEADERS=$(curl -sI --max-time 10 "https://$TARGET" 2>/dev/null)
  echo "\`\`\`" >> "$REPORT"
  echo "$HEADERS" | head -20 >> "$REPORT"
  echo "\`\`\`" >> "$REPORT"
  
  # Check security headers
  for header_name in "Strict-Transport-Security" "Content-Security-Policy" "X-Frame-Options" "X-Content-Type-Options"; do
    if echo "$HEADERS" | grep -qi "$header_name"; then
      log "Security header present: $header_name"
    else
      warn "Missing security header: $header_name"
    fi
  done
fi

header "Port Scan (common ports)"
if command -v nc >/dev/null 2>&1; then
  for port in 22 80 443 3000 8080 8787 8888; do
    if nc -z -w2 "$TARGET" "$port" 2>/dev/null; then
      warn "Port $port: OPEN"
    else
      log "Port $port: closed"
    fi
  done
fi

echo -e "\n${GREEN}Recon complete!${NC} Report: $REPORT"
