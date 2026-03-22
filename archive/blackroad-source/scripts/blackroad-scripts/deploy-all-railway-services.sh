#!/bin/bash

echo "🚂 RAILWAY MASS DEPLOYMENT"
echo "══════════════════════════════════════════════════"
echo ""

SERVICES=(
    "brand"
    "core"
    "docs"
    "ideas"
    "infra"
    "prism-console"
)

cd ~/workspace/blackroad-fix

for service in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Deploying: blackroad-os-$service"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -d "blackroad-os-$service" ]; then
        cd "blackroad-os-$service"
        
        # Create Railway project
        echo "Creating Railway project..."
        railway init --name "blackroad-$service-production" 2>&1 | grep -E "(Created|project)" || echo "Project may exist"
        
        # Deploy
        echo "Deploying to Railway..."
        railway up 2>&1 | tail -10 &
        
        cd ..
        echo ""
    else
        echo "⚠️  Directory not found, skipping..."
        echo ""
    fi
done

echo "══════════════════════════════════════════════════"
echo "✅ All Railway deployments initiated!"
echo "   Check status: railway list"
echo "══════════════════════════════════════════════════"

