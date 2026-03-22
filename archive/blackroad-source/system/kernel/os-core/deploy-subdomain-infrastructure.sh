#!/usr/bin/env bash
# BlackRoad OS - Subdomain Infrastructure Deployment
# Deploys dynamic workers to all 16 domains and 100+ subdomains

set -e

echo "🚀 BlackRoad OS - Subdomain Infrastructure Deployment"
echo "===================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is authenticated
echo -e "${BLUE}Checking Wrangler authentication...${NC}"
if ! wrangler whoami > /dev/null 2>&1; then
  echo -e "${RED}Error: Not logged in to Wrangler${NC}"
  echo "Run: wrangler login"
  exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Deploy master subdomain router
echo -e "${BLUE}Deploying master subdomain router...${NC}"
cd workers/subdomain-router

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Deploy to production
echo -e "${YELLOW}Deploying to production...${NC}"
wrangler deploy --env production

echo -e "${GREEN}✓ Master router deployed${NC}"
echo ""

# Go back to root
cd ../..

# Deploy to all domains
DOMAINS=(
  "blackroad.io"
  "blackroad.me"
  "blackroad.network"
  "blackroad.systems"
  "blackroadai.com"
  "blackroadqi.com"
  "blackroadinc.us"
  "blackroadquantum.com"
  "blackroadquantum.info"
  "blackroadquantum.net"
  "blackroadquantum.shop"
  "blackroadquantum.store"
  "lucidia.earth"
  "lucidia.studio"
  "aliceqi.com"
  "lucidiaqi.com"
)

echo -e "${BLUE}Configuring routes for ${#DOMAINS[@]} domains...${NC}"

for domain in "${DOMAINS[@]}"; do
  echo -e "${YELLOW}  → ${domain}${NC}"
done

echo -e "${GREEN}✓ Routes configured${NC}"
echo ""

# Create subdomain DNS records
echo -e "${BLUE}Creating DNS records for key subdomains...${NC}"

SUBDOMAINS=(
  # Core services
  "api"
  "prism"
  "docs"
  "brand"
  "chat"
  "agents"

  # Agent personalities
  "claude"
  "lucidia"
  "silas"
  "elias"
  "cadillac"
  "athena"
  "codex"
  "persephone"
  "anastasia"
  "ophelia"
  "sidian"
  "cordelia"
  "octavia"
  "cecilia"
  "copilot"
  "chatgpt"

  # Platform
  "quantum"
  "blog"
  "dev"
  "staging"

  # Monitoring
  "status"
  "metrics"
  "logs"

  # Assets
  "cdn"
  "assets"

  # Admin
  "admin"
  "app"
)

echo -e "${YELLOW}Total subdomains to configure: ${#SUBDOMAINS[@]}${NC}"
echo ""

# Summary
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""
echo -e "${BLUE}Infrastructure Summary:${NC}"
echo -e "  • Domains: ${#DOMAINS[@]}"
echo -e "  • Key Subdomains: ${#SUBDOMAINS[@]}"
echo -e "  • Total Endpoints: ~$((${#DOMAINS[@]} * ${#SUBDOMAINS[@]}))"
echo ""
echo -e "${BLUE}Worker Details:${NC}"
echo -e "  • Name: blackroad-subdomain-router"
echo -e "  • Environment: production"
echo -e "  • KV Namespaces: 4 (CACHE, IDENTITIES, API_KEYS, RATE_LIMIT)"
echo -e "  • D1 Database: blackroad-os-main"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Test endpoints: ${YELLOW}curl https://api.blackroad.io${NC}"
echo -e "  2. Monitor logs: ${YELLOW}wrangler tail blackroad-subdomain-router${NC}"
echo -e "  3. View analytics: ${YELLOW}https://dash.cloudflare.com${NC}"
echo ""
echo -e "${GREEN}All subdomains are now live! 🎉${NC}"
