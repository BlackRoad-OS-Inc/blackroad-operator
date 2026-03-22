#!/bin/bash

# Deploy all Railway projects in recommended order
# Usage: ./scripts/deploy-railway-all.sh

set -e  # Exit on error

echo "🚂 BlackRoad OS - Complete Railway Deployment"
echo "=============================================="
echo ""
echo "This will deploy all 14 Railway projects in the recommended order."
echo ""
echo "Estimated total cost: $113-123/month"
echo ""
echo "Deployment phases:"
echo "  Phase 1: Core Infrastructure ($30/month)"
echo "  Phase 2: Control Plane (+$40/month)"
echo "  Phase 3: Domain Packs (+$28/month)"
echo "  Phase 4: Staging & Dashboards (+$15/month)"
echo ""

read -p "Continue with full deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled."
  exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Phase 1: Core Infrastructure
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 1: Core Infrastructure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Project 01: RoadWork Production"
./scripts/deploy-railway-project.sh 01
echo ""

echo "📦 Project 03: BlackRoad Core Services"
./scripts/deploy-railway-project.sh 03
echo ""

read -p "Phase 1 complete. Continue to Phase 2? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment paused. Resume later with:"
  echo "  ./scripts/deploy-railway-project.sh 04  # Continue from here"
  exit 0
fi

# Phase 2: Control Plane
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 2: Control Plane"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Project 04: BlackRoad Operator"
./scripts/deploy-railway-project.sh 04
echo ""

echo "📦 Project 05: BlackRoad Master"
./scripts/deploy-railway-project.sh 05
echo ""

echo "📦 Project 06: BlackRoad Beacon"
./scripts/deploy-railway-project.sh 06
echo ""

read -p "Phase 2 complete. Continue to Phase 3? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment paused. Resume later with:"
  echo "  ./scripts/deploy-railway-project.sh 07  # Continue from here"
  exit 0
fi

# Phase 3: Domain Packs
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 3: Domain Packs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Project 07: BlackRoad Packs"
./scripts/deploy-railway-project.sh 07
echo ""

read -p "Phase 3 complete. Continue to Phase 4? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment paused. Resume later with:"
  echo "  ./scripts/deploy-railway-project.sh 02  # Continue from here"
  exit 0
fi

# Phase 4: Staging & Dashboards
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 4: Staging & Dashboards"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Project 02: RoadWork Staging"
./scripts/deploy-railway-project.sh 02
echo ""

echo "📦 Project 08: Prism Console"
echo "💡 Recommended: Deploy to Cloudflare Pages instead (free)"
read -p "Deploy to Railway anyway? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./scripts/deploy-railway-project.sh 08
fi
echo ""

echo "📦 Project 09: BlackRoad Home"
echo "💡 Recommended: Deploy to Cloudflare Pages instead (free)"
read -p "Deploy to Railway anyway? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./scripts/deploy-railway-project.sh 09
fi
echo ""

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All Railway Projects Deployed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Deployed Projects:"
echo "  ✓ Project 01: RoadWork Production"
echo "  ✓ Project 02: RoadWork Staging"
echo "  ✓ Project 03: BlackRoad Core Services"
echo "  ✓ Project 04: BlackRoad Operator"
echo "  ✓ Project 05: BlackRoad Master"
echo "  ✓ Project 06: BlackRoad Beacon"
echo "  ✓ Project 07: BlackRoad Packs"
echo "  ✓ Project 08: Prism Console (optional)"
echo "  ✓ Project 09: BlackRoad Home (optional)"
echo ""
echo "📋 Next Steps:"
echo "  1. Set environment variables for each service"
echo "  2. Configure custom domains"
echo "  3. Set up monitoring alerts"
echo "  4. Test all health endpoints"
echo "  5. Deploy frontends to Cloudflare Pages"
echo ""
echo "📚 Documentation:"
echo "  - RAILWAY_PROJECT_CONFIGURATION.md - Complete config guide"
echo "  - RAILWAY_INFRASTRUCTURE.md - Project IDs and commands"
echo "  - roadwork/DEPLOYMENT_STATUS.md - RoadWork checklist"
echo ""
echo "💰 Estimated Monthly Cost: $113-123"
echo ""
echo "🎯 Access Railway Dashboard:"
echo "  railway open"
echo ""
