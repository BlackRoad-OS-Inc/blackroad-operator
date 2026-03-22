#!/bin/bash
# Deploy all BlackRoad platforms to infrastructure

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_header() { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}\n"; }

DEPLOY_CMD="$HOME/blackroad-deploy/br-deploy"

log_header "BlackRoad Ecosystem Deployment"

echo "This will deploy 8 applications across your infrastructure:"
echo "  • RoadMap     → aria64     (Project Planning)"
echo "  • RoadWork    → aria64     (Jobs & Entrepreneurs)"
echo "  • RoadWorld   → shellfish  (Metaverse)"
echo "  • RoadChain   → shellfish  (Blockchain)"
echo "  • RoadCoin    → shellfish  (Funding)"
echo "  • RoadView    → aria64     (Creative Suite)"
echo "  • PitStop     → aria64     (Infrastructure Dashboard)"
echo "  • RoadSide    → aria64     (Deploy Portal)"
echo ""

read -p "Continue with deployment? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

log_header "Deploying Applications"

# Deploy to aria64 (Raspberry Pi)
log_info "Deploying to aria64..."

log_info "1/8 RoadMap (Next.js)"
$DEPLOY_CMD deploy roadmap aria64 roadmap

log_info "2/8 RoadWork (Node.js)"
$DEPLOY_CMD deploy roadwork aria64 roadwork

log_info "6/8 RoadView (Node.js)"
$DEPLOY_CMD deploy roadview aria64 roadview

log_info "7/8 PitStop (Go)"
$DEPLOY_CMD deploy pitstop aria64 pitstop

log_info "8/8 RoadSide (Node.js)"
$DEPLOY_CMD deploy roadside aria64 roadside

# Deploy to shellfish (Droplet)
log_info "Deploying to shellfish..."

log_info "3/8 RoadWorld (Go)"
$DEPLOY_CMD deploy roadworld shellfish roadworld

log_info "4/8 RoadChain (Rust)"
$DEPLOY_CMD deploy roadchain shellfish roadchain

log_info "5/8 RoadCoin (Python)"
$DEPLOY_CMD deploy roadcoin shellfish roadcoin

log_header "Deployment Complete!"

echo ""
echo "Applications deployed:"
echo ""
echo "📋 aria64 (Raspberry Pi):"
echo "   • RoadMap    - Project planning platform"
echo "   • RoadWork   - Job & entrepreneur portal"
echo "   • RoadView   - Creative suite"
echo "   • PitStop    - Infrastructure dashboard"
echo "   • RoadSide   - Deploy management"
echo ""
echo "🌊 shellfish (Droplet):"
echo "   • RoadWorld  - Metaverse platform"
echo "   • RoadChain  - Blockchain system"
echo "   • RoadCoin   - Funding platform"
echo ""

log_info "View all deployments:"
echo "  aria64:     $DEPLOY_CMD list aria64"
echo "  shellfish:  $DEPLOY_CMD list shellfish"
echo ""

log_success "Full BlackRoad ecosystem deployed! 🎉"
