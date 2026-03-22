#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     CLOUDFLARE PAGES - PROJECT CREATION CHECKLIST              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 CREATE THESE 6 PROJECTS:"
echo ""

PROJECTS=(
    "blackroad-os-api"
    "blackroad-os-core"
    "blackroad-os-operator"
    "blackroad-os-ideas"
    "blackroad-os-infra"
    "blackroad-os-research"
)

for i in "${!PROJECTS[@]}"; do
    num=$((i + 1))
    echo "[$num/6] ${PROJECTS[$i]}"
    echo "    → GitHub: BlackRoad-OS/${PROJECTS[$i]}"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 BUILD SETTINGS (use for all 6):"
echo ""
echo "   Framework preset: Next.js"
echo "   Build command: npm run build"
echo "   Build output directory: .next"
echo "   Install command: npm install"
echo "   Node version: 20"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ AFTER CREATING EACH PROJECT:"
echo ""
echo "   1. It will auto-deploy from GitHub"
echo "   2. Wait 2-5 minutes for build"
echo "   3. Check status in Cloudflare dashboard"
echo "   4. Move to next project"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎯 WHEN DONE, RUN: ~/check-cloudflare-deployments.sh"
echo ""

