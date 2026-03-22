#!/bin/bash

# BlackRoad Agents - Deploy All Railway Services
# Deploys 3 GPU services for 8 agent domains

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  BlackRoad Agents - Railway Deployment${NC}"
echo -e "${GREEN}  3 GPU Services, 8 Domains${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Check prerequisites
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Error: railway CLI not found${NC}"
    echo "Install with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged into Railway${NC}"
    echo "Run: railway login"
    exit 1
fi

# Check R2 credentials
if [ -z "$R2_ACCOUNT_ID" ] || [ -z "$R2_ACCESS_KEY_ID" ] || [ -z "$R2_SECRET_ACCESS_KEY" ]; then
    echo -e "${YELLOW}⚠️  R2 credentials not set!${NC}"
    echo ""
    echo "Please set these environment variables:"
    echo ""
    echo "export R2_ACCOUNT_ID=\"848cf0b18d51e0170e0d1537aec3505a\""
    echo "export R2_ACCESS_KEY_ID=\"<YOUR_ACCESS_KEY_ID>\""
    echo "export R2_SECRET_ACCESS_KEY=\"<YOUR_SECRET_ACCESS_KEY>\""
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"
echo ""

# Function to deploy service
deploy_service() {
    local service_name="$1"
    local config_file="$2"
    local domains="$3"

    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Deploying: $service_name${NC}"
    echo -e "${YELLOW}Domains: $domains${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""

    # Create new Railway project
    echo -e "${BLUE}Creating Railway project...${NC}"
    railway init --name "$service_name"

    # Link to project
    railway link "$service_name"

    # Set R2 credentials
    if [ -n "$R2_ACCOUNT_ID" ]; then
        echo -e "${BLUE}Setting R2 credentials...${NC}"
        railway variables set \
            R2_ACCOUNT_ID="$R2_ACCOUNT_ID" \
            R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
            R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
    fi

    # Copy config
    echo -e "${BLUE}Copying configuration...${NC}"
    cp "$config_file" railway.toml

    # Deploy
    echo -e "${BLUE}Deploying to Railway...${NC}"
    railway up --detach

    echo -e "${GREEN}✓ $service_name deployed!${NC}"
    echo ""

    # Get deployment URL
    echo -e "${BLUE}Getting deployment URL...${NC}"
    railway domain 2>&1 || echo "Domain will be available after deployment completes"
    echo ""
}

# Deploy all 3 services
echo -e "${GREEN}Starting deployment of 3 services...${NC}"
echo ""

# Service 1: Primary
deploy_service \
    "blackroad-agents-primary" \
    "railway-primary.toml" \
    "agents.blackroad.io, agents.blackroad.systems"

# Service 2: Specialist
deploy_service \
    "blackroad-agents-specialist" \
    "railway-specialist.toml" \
    "agents.blackroad.company, agents.blackroad.me"

# Service 3: Governance
deploy_service \
    "blackroad-agents-governance" \
    "railway-governance.toml" \
    "agents.lucidia.earth, agents.roadchain.io, agents.roadcoin.io, agents.blackroadinc.us"

# Summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Deployment Summary${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "All 3 services deployed!"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Wait for services to start (~15-20 minutes for model download)"
echo "  2. Check logs: railway logs --service <service-name>"
echo "  3. Get URLs: railway domain --service <service-name>"
echo "  4. Configure DNS in Cloudflare"
echo "  5. Test all endpoints: ./test-all-domains.sh"
echo ""
echo -e "${GREEN}✓ Deployment initiated!${NC}"
