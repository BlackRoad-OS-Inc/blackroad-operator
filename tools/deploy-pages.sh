#!/bin/bash
# Deploy updated HTML to all existing CF Workers
# Reads HTML from websites/ and pushes to each worker
set -e

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
DIM='\033[2m'
BOLD='\033[1m'
RED='\033[0;31m'
RESET='\033[0m'

WEBSITES="$HOME/blackroad-operator/websites"
WORKERS="$HOME/blackroad-operator/workers"

echo -e "\n${PINK}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  Deploy Pages to CF Workers                      ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════╝${RESET}\n"

build_single_page_worker() {
  local worker_name="$1"
  local html_file="$2"
  local worker_dir="$WORKERS/$worker_name"

  if [ ! -f "$html_file" ]; then
    echo -e "  ${RED}skip${RESET} $worker_name — HTML not found: $html_file"
    return
  fi

  # Create minimal worker that serves the HTML
  mkdir -p "$worker_dir/src"

  local escaped_html
  escaped_html=$(sed 's/`/\\`/g; s/\${/\\${/g' "$html_file")

  cat > "$worker_dir/src/index.js" << WORKEREOF
const HTML = \`$escaped_html\`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\\nAllow: /\\nSitemap: https://" + url.hostname + "/sitemap.xml", { headers: { "Content-Type": "text/plain" } });
    }
    if (url.pathname === "/f1a7893bd54145a697f112eefdac579b.txt") {
      return new Response("f1a7893bd54145a697f112eefdac579b", { headers: { "Content-Type": "text/plain" } });
    }
    return new Response(HTML, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
        "X-Powered-By": "BlackRoad OS",
      },
    });
  },
};
WORKEREOF

  # Deploy
  cd "$worker_dir"
  if npx wrangler deploy 2>&1 | tail -3; then
    echo -e "  ${GREEN}✓${RESET} ${BOLD}$worker_name${RESET} deployed"
  else
    echo -e "  ${RED}✗${RESET} $worker_name failed"
  fi
}

# Deploy each worker with its HTML
build_single_page_worker "backroad-social" "$WEBSITES/social/index.html"
build_single_page_worker "roadpay" "$WEBSITES/cashroad/index.html"
build_single_page_worker "road-search" "$WEBSITES/roadview/index.html"
build_single_page_worker "status-blackroad" "$WEBSITES/status-app/index.html"
build_single_page_worker "roundtrip-blackroad" "$WEBSITES/roundtrip-hw/index.html"

echo -e "\n  ${BOLD}${GREEN}Deployment complete${RESET}\n"
