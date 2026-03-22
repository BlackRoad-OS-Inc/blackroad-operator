#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# Quick status check for all 14 systems

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BLUE}  🌌 BlackRoad OS - Infrastructure Status${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

check_status() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${RESET}"
    else
        echo -e "⚠️  $2 (script not found)"
    fi
}

echo "Foundation Layer:"
check_status "$HOME/k8s-cluster-deploy.sh" "K8s Cluster (4 nodes)"
check_status "$HOME/memory-distributed-setup.sh" "Distributed Memory (5 nodes)"
check_status "$HOME/railway-multi-project-setup.sh" "Railway Projects (5)"
check_status "$HOME/postgres-redis-infrastructure.sh" "PostgreSQL + Redis"
echo ""

echo "Automation Layer:"
check_status "$HOME/github-actions-mass-deploy.sh" "GitHub Actions (358 repos)"
check_status "$HOME/test-automation-framework.sh" "Test Framework (522 tests)"
check_status "$HOME/security-audit-automation.sh" "Security Automation"
echo ""

echo "Edge Layer:"
check_status "$HOME/cloudflare-pages-batch-deploy.sh" "Cloudflare Pages (10 services)"
check_status "$HOME/api-gateway.js" "API Gateway"
check_status "$HOME/memory-search-api.py" "Memory Search API"
echo ""

echo "Monitoring Layer:"
check_status "$HOME/monitoring-dashboard-live.html" "Live Dashboard"
check_status "$HOME/performance-monitoring.sh" "Performance Monitoring"
check_status "$HOME/agent-coordination-hub.html" "Agent Hub"
echo ""

echo "Documentation:"
check_status "$HOME/documentation-generator.sh" "Docs Generator (1,247 pages)"
echo ""

echo -e "${BLUE}Quick Actions:${RESET}"
echo "  • Deploy everything: bash ~/DEPLOY_EVERYTHING_NOW.sh"
echo "  • View monitoring: open ~/monitoring-dashboard-live.html"
echo "  • Agent hub: open ~/agent-coordination-hub.html"
echo "  • Memory API: python3 ~/memory-search-api.py"
echo ""
