#!/bin/bash
# Deploy the BlackRoad Edge stack to the Pi fleet
# Makes us our own Cloudflare — self-hosted sites, DNS, CDN, Workers
#
# Usage: deploy-edge.sh [--all] [--router] [--dns] [--workers] [--cdn]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
DIM='\033[2m'
NC='\033[0m'

EDGE_DIR="$(cd "$(dirname "$0")" && pwd)"

deploy_router() {
  echo -e "${PINK}Deploying Edge Router → Alice${NC}"
  scp "$EDGE_DIR/edge-router.conf" pi@192.168.4.49:/tmp/blackroad-edge.conf
  ssh pi@192.168.4.49 "
    sudo cp /tmp/blackroad-edge.conf /etc/nginx/sites-available/blackroad-edge
    sudo ln -sf /etc/nginx/sites-available/blackroad-edge /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo 'Edge router deployed'
  " 2>/dev/null && echo -e "  ${GREEN}Done${NC}" || echo -e "  ${AMBER}Failed${NC}"
}

deploy_dns() {
  echo -e "${PINK}Checking DNS → Lucidia PowerDNS${NC}"
  ssh octavia@192.168.4.38 "
    docker ps | grep pdns && echo 'PowerDNS running' || echo 'PowerDNS not running'
  " 2>/dev/null
  echo -e "  ${DIM}PowerDNS admin: http://192.168.4.38:9192${NC}"
}

deploy_workers() {
  echo -e "${PINK}Deploying Workers Runtime → Octavia${NC}"
  ssh pi@192.168.4.101 "
    # Check if workerd is available
    which workerd 2>/dev/null && echo 'workerd installed' || {
      echo 'Installing workerd...'
      # workerd is available as npm package
      npm install -g workerd 2>/dev/null || echo 'workerd install failed — needs manual setup'
    }
  " 2>/dev/null && echo -e "  ${GREEN}Done${NC}" || echo -e "  ${AMBER}Needs manual setup${NC}"
}

deploy_cdn() {
  echo -e "${PINK}Deploying CDN → MinIO on Cecilia${NC}"
  ssh blackroad@192.168.4.96 "
    # Check MinIO
    curl -s http://localhost:9000/minio/health/live && echo 'MinIO healthy' || echo 'MinIO down'
    # Create brand bucket if not exists
    mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null
    mc mb local/blackroad-images 2>/dev/null || true
    mc mb local/blackroad-sites 2>/dev/null || true
    echo 'CDN buckets ready'
  " 2>/dev/null && echo -e "  ${GREEN}Done${NC}" || echo -e "  ${AMBER}Check MinIO${NC}"
}

deploy_sites() {
  echo -e "${PINK}Deploying static sites → Alice${NC}"
  # Sync website files to Alice for local serving
  rsync -az --delete \
    "$EDGE_DIR/../websites/" \
    pi@192.168.4.49:/var/www/blackroad-sites/ \
    --exclude node_modules \
    --exclude .git \
    --exclude .next \
    2>/dev/null && echo -e "  ${GREEN}Synced ${NC}$(ls $EDGE_DIR/../websites/ | wc -l | tr -d ' ')${GREEN} sites${NC}" || echo -e "  ${AMBER}Sync failed${NC}"
}

case "${1:---all}" in
  --router)  deploy_router ;;
  --dns)     deploy_dns ;;
  --workers) deploy_workers ;;
  --cdn)     deploy_cdn ;;
  --sites)   deploy_sites ;;
  --all)
    deploy_router
    deploy_dns
    deploy_cdn
    deploy_sites
    echo ""
    echo -e "${PINK}BlackRoad Edge — Self-Hosted Stack${NC}"
    echo -e "  ${DIM}Router:  Alice (nginx)${NC}"
    echo -e "  ${DIM}DNS:     Lucidia (PowerDNS)${NC}"
    echo -e "  ${DIM}CDN:     Cecilia (MinIO)${NC}"
    echo -e "  ${DIM}Workers: Octavia (workerd)${NC}"
    echo -e "  ${DIM}Mesh:    NATS on Octavia${NC}"
    echo ""
    echo -e "  ${DIM}BlackRoad OS — Pave Tomorrow.${NC}"
    ;;
  *)
    echo -e "${PINK}BlackRoad Edge Deploy${NC}"
    echo "  --all       Deploy everything"
    echo "  --router    Edge router (nginx → Alice)"
    echo "  --dns       DNS (PowerDNS → Lucidia)"
    echo "  --workers   Workers runtime (workerd → Octavia)"
    echo "  --cdn       CDN (MinIO → Cecilia)"
    echo "  --sites     Sync static sites → Alice"
    ;;
esac
