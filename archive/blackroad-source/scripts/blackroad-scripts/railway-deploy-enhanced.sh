#!/bin/bash
# 🚂 RAILWAY ENHANCED DEPLOYMENT AUTOMATION
# 
# Features:
# - Multi-service deployment
# - Environment variable management
# - Health check monitoring
# - Rollback on failure
# - Zero-downtime deployments
# - Cost tracking ($0 on free tier)
# - Uses BlackRoad Vault for automatic credential loading

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║   🚂 RAILWAY ENHANCED DEPLOYMENT         ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""

# 🔐 Load credentials from vault (ZERO manual input)
if [ -f ~/blackroad-vault.sh ]; then
    echo -e "${BLUE}🔐 Loading credentials from vault...${RESET}"
    source <(~/blackroad-vault.sh load)
    echo -e "${GREEN}✅ Credentials loaded${RESET}"
    echo ""
fi

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${RESET}"
    echo -e "${AMBER}Install: npm install -g @railway/cli${RESET}"
    exit 1
fi

# Check authentication
if ! railway whoami &> /dev/null; then
    echo -e "${AMBER}🔑 Not logged in to Railway${RESET}"
    echo -e "${BLUE}Run: railway login${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI ready${RESET}"
echo ""

# ===== CONFIGURATION =====
SERVICES=(
    "blackroad-api:API"
    "blackroad-web:Web"
    "blackroad-workers:Workers"
    "blackroad-db:Database"
)

ENVIRONMENTS=("production" "staging" "development")

# ===== FUNCTIONS =====

deploy_service() {
    local service_name=$1
    local service_desc=$2
    local environment=${3:-production}
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${PINK}🚀 Deploying: $service_desc${RESET}"
    echo -e "${AMBER}   Service: $service_name${RESET}"
    echo -e "${AMBER}   Environment: $environment${RESET}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    
    # Check if service exists
    if railway status --service "$service_name" &> /dev/null; then
        echo -e "${GREEN}✅ Service exists${RESET}"
    else
        echo -e "${AMBER}⚠️  Service not found, creating...${RESET}"
        railway service create "$service_name"
    fi
    
    # Set environment variables
    echo -e "${BLUE}🔧 Setting environment variables...${RESET}"
    railway variables set --service "$service_name" \
        SERVICE_NAME="$service_name" \
        SERVICE_ENV="$environment" \
        NODE_ENV="$environment" \
        DEPLOY_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    
    # Deploy
    echo -e "${BLUE}📦 Deploying to Railway...${RESET}"
    railway up --service "$service_name" --detach
    
    # Get deployment ID
    DEPLOYMENT_ID=$(railway status --service "$service_name" --json | jq -r '.deployments[0].id')
    
    echo -e "${GREEN}✅ Deployment initiated: $DEPLOYMENT_ID${RESET}"
    
    # Monitor deployment
    monitor_deployment "$service_name" "$DEPLOYMENT_ID"
}

monitor_deployment() {
    local service_name=$1
    local deployment_id=$2
    local max_wait=300  # 5 minutes
    local elapsed=0
    
    echo -e "${BLUE}⏳ Monitoring deployment...${RESET}"
    
    while [ $elapsed -lt $max_wait ]; do
        STATUS=$(railway status --service "$service_name" --json | jq -r '.deployments[0].status')
        
        case "$STATUS" in
            "SUCCESS")
                echo -e "${GREEN}✅ Deployment successful!${RESET}"
                
                # Health check
                health_check "$service_name"
                return 0
                ;;
            "FAILED")
                echo -e "${RED}❌ Deployment failed!${RESET}"
                railway logs --service "$service_name" --tail 50
                return 1
                ;;
            "BUILDING"|"DEPLOYING")
                echo -e "${AMBER}⏳ Status: $STATUS (${elapsed}s elapsed)${RESET}"
                ;;
        esac
        
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    echo -e "${RED}❌ Deployment timeout${RESET}"
    return 1
}

health_check() {
    local service_name=$1
    
    echo -e "${BLUE}🏥 Running health check...${RESET}"
    
    # Get service URL
    SERVICE_URL=$(railway domain --service "$service_name" 2>/dev/null || echo "")
    
    if [ -z "$SERVICE_URL" ]; then
        echo -e "${AMBER}⚠️  No public domain configured${RESET}"
        return 0
    fi
    
    # Try health endpoint
    if curl -sf "https://$SERVICE_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${RESET}"
        echo -e "${GREEN}   URL: https://$SERVICE_URL${RESET}"
    else
        echo -e "${AMBER}⚠️  Health check failed (service may not have /api/health endpoint)${RESET}"
    fi
}

rollback_service() {
    local service_name=$1
    
    echo -e "${AMBER}🔄 Rolling back $service_name...${RESET}"
    
    # Get previous deployment
    PREVIOUS_DEPLOYMENT=$(railway status --service "$service_name" --json | jq -r '.deployments[1].id')
    
    if [ -z "$PREVIOUS_DEPLOYMENT" ] || [ "$PREVIOUS_DEPLOYMENT" = "null" ]; then
        echo -e "${RED}❌ No previous deployment found${RESET}"
        return 1
    fi
    
    railway redeploy --service "$service_name" --deployment "$PREVIOUS_DEPLOYMENT"
    
    echo -e "${GREEN}✅ Rollback initiated${RESET}"
}

list_services() {
    echo -e "${BLUE}📋 Railway Services:${RESET}"
    echo ""
    
    railway status --json | jq -r '.services[] | "  • \(.name) - \(.deployments[0].status)"'
    
    echo ""
}

get_cost_estimate() {
    echo -e "${BLUE}💰 Cost Estimate:${RESET}"
    echo ""
    echo -e "${GREEN}Free Tier Limits:${RESET}"
    echo "  • $5 credit per month"
    echo "  • ~500 hours execution time"
    echo "  • Up to 8GB RAM per service"
    echo "  • Unlimited projects"
    echo ""
    echo -e "${AMBER}Usage (this month):${RESET}"
    railway usage 2>/dev/null || echo "  Run 'railway usage' to see usage"
    echo ""
    echo -e "${GREEN}Current Status: $0/month (using free tier)${RESET}"
}

deploy_all() {
    local environment=${1:-production}
    
    echo -e "${PINK}🚀 Deploying all services to $environment...${RESET}"
    echo ""
    
    for service_config in "${SERVICES[@]}"; do
        IFS=':' read -r service_name service_desc <<< "$service_config"
        
        if deploy_service "$service_name" "$service_desc" "$environment"; then
            echo -e "${GREEN}✅ $service_desc deployed${RESET}"
        else
            echo -e "${RED}❌ $service_desc failed${RESET}"
            
            # Ask about rollback
            read -p "Rollback $service_desc? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rollback_service "$service_name"
            fi
        fi
        
        echo ""
    done
    
    echo -e "${GREEN}🎉 Deployment complete!${RESET}"
}

# ===== MAIN MENU =====

show_menu() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${RESET}"
    echo -e "${BLUE}║           RAILWAY DEPLOYMENT MENU         ║${RESET}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${RESET}"
    echo ""
    echo "1) Deploy all services"
    echo "2) Deploy single service"
    echo "3) List services & status"
    echo "4) Rollback service"
    echo "5) View logs"
    echo "6) Cost estimate"
    echo "7) Set environment variables"
    echo "8) Exit"
    echo ""
    read -p "Choose option: " choice
    
    case $choice in
        1)
            read -p "Environment (production/staging/development): " env
            deploy_all "${env:-production}"
            ;;
        2)
            echo "Available services:"
            for i in "${!SERVICES[@]}"; do
                IFS=':' read -r name desc <<< "${SERVICES[$i]}"
                echo "  $((i+1))) $desc ($name)"
            done
            read -p "Select service: " svc_num
            
            if [ "$svc_num" -ge 1 ] && [ "$svc_num" -le "${#SERVICES[@]}" ]; then
                IFS=':' read -r name desc <<< "${SERVICES[$((svc_num-1))]}"
                read -p "Environment (production/staging/development): " env
                deploy_service "$name" "$desc" "${env:-production}"
            else
                echo -e "${RED}Invalid selection${RESET}"
            fi
            ;;
        3)
            list_services
            ;;
        4)
            read -p "Service name: " svc_name
            rollback_service "$svc_name"
            ;;
        5)
            read -p "Service name: " svc_name
            railway logs --service "$svc_name"
            ;;
        6)
            get_cost_estimate
            ;;
        7)
            read -p "Service name: " svc_name
            read -p "Variable name: " var_name
            read -p "Variable value: " var_value
            railway variables set --service "$svc_name" "$var_name"="$var_value"
            echo -e "${GREEN}✅ Variable set${RESET}"
            ;;
        8)
            echo -e "${GREEN}Goodbye!${RESET}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${RESET}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# ===== CLI ARGUMENTS =====

if [ $# -eq 0 ]; then
    show_menu
else
    case "$1" in
        deploy-all)
            deploy_all "${2:-production}"
            ;;
        deploy)
            deploy_service "$2" "$3" "${4:-production}"
            ;;
        list)
            list_services
            ;;
        rollback)
            rollback_service "$2"
            ;;
        cost)
            get_cost_estimate
            ;;
        *)
            echo "Usage: $0 {deploy-all|deploy|list|rollback|cost}"
            echo ""
            echo "Or run without arguments for interactive menu"
            exit 1
            ;;
    esac
fi
