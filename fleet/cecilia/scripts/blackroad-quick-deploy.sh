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
# BlackRoad Quick Deploy - Deploy anything to any Pi

set -e

PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}🚀 BlackRoad Quick Deploy${RESET}"
echo ""

# Show available Pis
echo "Available Pis:"
echo "  1. aria     (192.168.4.82) - Web services"
echo "  2. lucidia  (192.168.4.81) - NATS brain"
echo "  3. alice    (192.168.4.49) - K3s cluster"
echo "  4. octavia  (192.168.4.38) - Hailo-8 NPU"
echo "  5. cecilia  (192.168.4.89) - Hailo-8 NPU"
echo ""

# Quick actions
if [ "$1" == "monitor" ]; then
    echo -e "${BLUE}📊 Fleet Monitor Status:${RESET}"
    echo "  API: http://192.168.4.81:8888/api/fleet"
    echo "  Dashboard: ~/blackroad-live-monitor.html (open locally)"
    echo ""
    ssh lucidia "systemctl status fleet-monitor --no-pager | head -5"
    
elif [ "$1" == "logs" ]; then
    echo -e "${BLUE}📋 Monitor Logs:${RESET}"
    ssh lucidia "journalctl -u fleet-monitor -n 50 --no-pager"
    
elif [ "$1" == "restart" ]; then
    echo -e "${BLUE}🔄 Restarting Monitor...${RESET}"
    ssh lucidia "sudo systemctl restart fleet-monitor"
    echo -e "${GREEN}✅ Restarted${RESET}"
    
elif [ "$1" == "test" ]; then
    echo -e "${BLUE}🧪 Testing API...${RESET}"
    curl -s http://192.168.4.81:8888/api/fleet | python3 -m json.tool | head -30
    
else
    echo "Usage:"
    echo "  ./blackroad-quick-deploy.sh monitor   - Check monitor status"
    echo "  ./blackroad-quick-deploy.sh logs      - View monitor logs"
    echo "  ./blackroad-quick-deploy.sh restart   - Restart monitor"
    echo "  ./blackroad-quick-deploy.sh test      - Test API endpoint"
fi
