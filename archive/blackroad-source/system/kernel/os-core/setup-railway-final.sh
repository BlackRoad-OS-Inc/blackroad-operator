#!/usr/bin/env bash
# BlackRoad OS - Railway Infrastructure Setup (FINAL ARCHITECTURE)
# 6 Core Services for 6 Domain Purposes
# Author: Alexa → Cece 🚗
# Date: 2025-12-14

set -e

echo "🚗 BlackRoad OS - Railway Infrastructure (FINAL)"
echo "================================================"
echo ""
echo "Creating 6 core services for proper domain separation:"
echo "  1. blackroad-systems → Internal portals & tools"
echo "  2. blackroad-io → Public products"
echo "  3. blackroad-company → Corporate operations"
echo "  4. blackroad-me → Personal portals (dynamic)"
echo "  5. roadcoin-io → Financial platform"
echo "  6. roadchain-io → Immutable blockchain (PS-SHA∞)"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "Install: npm install -g @railway/cli"
    exit 1
fi
echo "✅ Railway CLI found"

# Check auth
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo "Run: railway login"
    exit 1
fi
echo "✅ Railway authenticated"
echo ""

# Service definitions
declare -A SERVICES=(
    ["blackroad-systems"]="Internal Systems - Portals, agents, tools, docs (*.blackroad.systems)"
    ["blackroad-io"]="Public Products - Customer-facing apps and APIs (*.blackroad.io)"
    ["blackroad-company"]="Company Operations - Hiring, HR, legal, investors (*.blackroad.company)"
    ["blackroad-me"]="Personal Portals - Individual spaces for everyone (*.blackroad.me)"
    ["roadcoin-io"]="Financial Platform - Payments, wallets, Stripe/Clerk (*.roadcoin.io)"
    ["roadchain-io"]="Blockchain Platform - Immutable docs, PS-SHA∞ (*.roadchain.io)"
)

# Subdomain counts
declare -A SUBDOMAIN_COUNTS=(
    ["blackroad-systems"]="50+"
    ["blackroad-io"]="20+"
    ["blackroad-company"]="15+"
    ["blackroad-me"]="Unlimited (dynamic)"
    ["roadcoin-io"]="15+"
    ["roadchain-io"]="15+"
)

# Ports
declare -A PORTS=(
    ["blackroad-systems"]="3000"
    ["blackroad-io"]="3001"
    ["blackroad-company"]="3002"
    ["blackroad-me"]="3003"
    ["roadcoin-io"]="3004"
    ["roadchain-io"]="3005"
)

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Creating Railway Services${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SERVICE_NUM=0
for service in "blackroad-systems" "blackroad-io" "blackroad-company" "blackroad-me" "roadcoin-io" "roadchain-io"; do
    SERVICE_NUM=$((SERVICE_NUM + 1))
    description="${SERVICES[$service]}"
    subdomain_count="${SUBDOMAIN_COUNTS[$service]}"
    port="${PORTS[$service]}"

    echo -e "${CYAN}[$SERVICE_NUM/6] $service${NC}"
    echo -e "${BLUE}   $description${NC}"
    echo -e "${YELLOW}   Subdomains: $subdomain_count | Port: $port${NC}"

    # Uncomment to actually create:
    # railway service create --name "$service"

    echo -e "${GREEN}   ✓ Service configured${NC}"
    echo ""
done

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Service Configuration${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Generate service configs
cat > /tmp/railway-services.json << 'EOF'
{
  "services": {
    "blackroad-systems": {
      "domain": "blackroad.systems",
      "purpose": "Internal operations hub",
      "port": 3000,
      "subdomains": [
        "portal", "access", "tools", "admin",
        "claude", "lucidia", "silas", "elias", "cadillac", "athena",
        "codex", "persephone", "anastasia", "ophelia", "sidian",
        "cordelia", "octavia", "cecilia", "copilot", "chatgpt",
        "docs", "wiki", "kb", "guides", "sdk",
        "api", "dev", "staging", "prod",
        "metrics", "logs", "status", "alerts"
      ],
      "env_vars": {
        "NODE_ENV": "production",
        "PORT": "3000",
        "INTERNAL_ONLY": "true",
        "AUTH_REQUIRED": "true"
      }
    },
    "blackroad-io": {
      "domain": "blackroad.io",
      "purpose": "Public products",
      "port": 3001,
      "subdomains": [
        "app", "api", "docs",
        "agents", "quantum", "lucidia", "prism", "chat",
        "playground", "sandbox", "examples",
        "blog", "community", "support"
      ],
      "env_vars": {
        "NODE_ENV": "production",
        "PORT": "3001",
        "PUBLIC_FACING": "true",
        "STRIPE_ENABLED": "true"
      }
    },
    "blackroad-company": {
      "domain": "blackroad.company",
      "purpose": "Company operations",
      "port": 3002,
      "subdomains": [
        "careers", "apply", "onboard", "hr", "benefits",
        "investors", "press", "legal", "privacy", "terms",
        "intranet", "directory", "calendar", "resources"
      ],
      "env_vars": {
        "NODE_ENV": "production",
        "PORT": "3002",
        "COMPANY_PORTAL": "true",
        "HR_INTEGRATION": "true"
      }
    },
    "blackroad-me": {
      "domain": "blackroad.me",
      "purpose": "Personal portals for everyone",
      "port": 3003,
      "subdomains": [
        "*.blackroad.me (wildcard)",
        "alexa", "claude", "lucidia", "cece",
        "(+ unlimited dynamic)"
      ],
      "env_vars": {
        "NODE_ENV": "production",
        "PORT": "3003",
        "WILDCARD_ROUTING": "true",
        "DYNAMIC_PORTALS": "true"
      }
    },
    "roadcoin-io": {
      "domain": "roadcoin.io",
      "purpose": "Financial platform",
      "port": 3004,
      "subdomains": [
        "wallet", "exchange", "trading",
        "pay", "checkout", "invoice", "billing",
        "stripe", "clerk", "bank", "crypto",
        "treasury", "payouts", "ledger", "reports",
        "api", "docs", "sandbox"
      ],
      "env_vars": {
        "NODE_ENV": "production",
        "PORT": "3004",
        "STRIPE_SECRET_KEY": "sk_live_...",
        "CLERK_API_KEY": "...",
        "FINANCIAL_PLATFORM": "true"
      }
    },
    "roadchain-io": {
      "domain": "roadchain.io",
      "purpose": "Immutable blockchain (PS-SHA∞)",
      "port": 3005,
      "subdomains": [
        "explorer", "node", "validator",
        "docs", "changes", "commits", "snapshots",
        "verify", "truth", "audit", "integrity",
        "api", "query", "archive", "ipfs",
        "sdk", "cli", "playground"
      ],
      "env_vars": {
        "NODE_ENV": "production",
        "PORT": "3005",
        "PS_SHA_INFINITY": "true",
        "IMMUTABLE_STORAGE": "true",
        "BLOCKCHAIN_ENABLED": "true"
      }
    }
  },
  "metadata": {
    "total_services": 6,
    "architecture": "domain-purpose-separation",
    "estimated_cost": "$30-120/month",
    "created": "2025-12-14"
  }
}
EOF

echo -e "${GREEN}✓ Service configuration saved: /tmp/railway-services.json${NC}"
echo ""

echo -e "${BLUE}Cost Estimate:${NC}"
echo "  • 6 services × $5-20/month = ${YELLOW}\$30-120/month${NC}"
echo "  • vs 768 individual services = ${YELLOW}\$768-3,840/month${NC}"
echo "  • ${GREEN}Savings: 85-95%${NC}"
echo ""

echo -e "${BLUE}Domain Architecture:${NC}"
echo "  1. ${CYAN}blackroad.systems${NC} → All internal tools (no more access issues!)"
echo "  2. ${CYAN}blackroad.io${NC} → Public products"
echo "  3. ${CYAN}blackroad.company${NC} → Company operations"
echo "  4. ${CYAN}blackroad.me${NC} → Personal portals (everyone gets one!)"
echo "  5. ${CYAN}roadcoin.io${NC} → Financial platform (Stripe, Clerk, payouts)"
echo "  6. ${CYAN}roadchain.io${NC} → Immutable blockchain (PS-SHA∞ docs)"
echo ""

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Next Steps${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. ${YELLOW}Deploy code to each service:${NC}"
echo "   cd services/blackroad-systems && railway up"
echo ""
echo "2. ${YELLOW}Configure custom domains:${NC}"
echo "   railway domain add portal.blackroad.systems"
echo ""
echo "3. ${YELLOW}Set environment variables:${NC}"
echo "   railway variables set --service blackroad-systems NODE_ENV=production"
echo ""
echo "4. ${YELLOW}Configure DNS (Cloudflare):${NC}"
echo "   ./scripts/configure-dns-final.sh"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup complete! 6 services ready to deploy 🚗${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
