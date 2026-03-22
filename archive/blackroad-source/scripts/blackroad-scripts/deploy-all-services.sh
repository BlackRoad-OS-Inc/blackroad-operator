#!/bin/bash
#
# BlackRoad Services - Mass Deployment Script
# Deploys all services to Vercel production
#

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service directories
SERVICES=(
  "api"
  "brand"
  "core"
  "demo"
  "docs"
  "ideas"
  "infra"
  "operator"
  "prism"
  "research"
  "web"
)

echo -e "${BLUE}🚀 BlackRoad Mass Deployment Script${NC}"
echo -e "${BLUE}====================================${NC}\n"

# Track results
SUCCESSFUL=()
FAILED=()
SKIPPED=()

# Function to deploy a service
deploy_service() {
  local service=$1
  local service_path="services/$service"
  
  echo -e "${BLUE}📦 Deploying: ${service}${NC}"
  
  # Check if service exists
  if [ ! -d "$service_path" ]; then
    echo -e "${YELLOW}⚠️  Service directory not found: $service_path${NC}"
    SKIPPED+=("$service")
    return 1
  fi
  
  # Check if package.json exists
  if [ ! -f "$service_path/package.json" ]; then
    echo -e "${YELLOW}⚠️  No package.json found in $service_path${NC}"
    SKIPPED+=("$service")
    return 1
  fi
  
  # Deploy to Vercel
  cd "$service_path"
  
  if vercel --prod --yes 2>&1 | tee /tmp/deploy-$service.log | tail -1; then
    # Extract URL from log
    URL=$(grep -oE 'https://[a-z0-9-]+\.vercel\.app' /tmp/deploy-$service.log | tail -1)
    echo -e "${GREEN}✅ Successfully deployed: $service${NC}"
    echo -e "${GREEN}   URL: $URL${NC}\n"
    SUCCESSFUL+=("$service:$URL")
  else
    echo -e "${RED}❌ Failed to deploy: $service${NC}\n"
    FAILED+=("$service")
  fi
  
  cd - > /dev/null
}

# Main deployment loop
echo -e "${BLUE}Starting deployment of ${#SERVICES[@]} services...${NC}\n"

for service in "${SERVICES[@]}"; do
  deploy_service "$service"
  sleep 2  # Brief pause between deployments
done

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${GREEN}✅ Successful (${#SUCCESSFUL[@]}):${NC}"
for item in "${SUCCESSFUL[@]}"; do
  service="${item%%:*}"
  url="${item##*:}"
  echo -e "   - $service → $url"
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo -e "\n${RED}❌ Failed (${#FAILED[@]}):${NC}"
  for service in "${FAILED[@]}"; do
    echo -e "   - $service"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo -e "\n${YELLOW}⚠️  Skipped (${#SKIPPED[@]}):${NC}"
  for service in "${SKIPPED[@]}"; do
    echo -e "   - $service"
  done
fi

echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}================================${NC}\n"

# Exit with error if any failed
if [ ${#FAILED[@]} -gt 0 ]; then
  exit 1
fi

exit 0
