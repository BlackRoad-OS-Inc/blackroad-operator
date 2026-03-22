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
# BlackRoad Neural Cluster - Distributed AI across 5 Pis

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

echo -e "${PINK}🧠 BLACKROAD NEURAL CLUSTER${RESET}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Cluster topology
echo -e "${VIOLET}⚡ CLUSTER TOPOLOGY:${RESET}"
echo ""
echo -e "  ${GREEN}lucidia${RESET}  → NATS Brain (4222) + Ollama"
echo -e "     ├── aria     → Web Services + Ollama"
echo -e "     ├── alice    → K3s + Auth + Billing"
echo -e "     ├── octavia  → Hailo-8 NPU (26 TOPS)"
echo -e "     └── cecilia  → Hailo-8 NPU (26 TOPS)"
echo ""
echo -e "${AMBER}Total Compute:${RESET}"
echo -e "  • 36 GB RAM"
echo -e "  • 78 TOPS AI Inference"
echo -e "  • 4 Ollama LLM Instances"
echo -e "  • 2 Hailo-8 NPUs"
echo ""

# Test NATS
echo -e "${VIOLET}🔌 NATS Event Bus:${RESET}"
nc -zv -w 2 192.168.4.81 4222 2>&1 | grep -q "succeeded" && \
  echo -e "  ${GREEN}✓${RESET} NATS server online (lucidia:4222)" || \
  echo -e "  ${AMBER}⚠${RESET} NATS offline"

# Test Ollama instances
echo ""
echo -e "${VIOLET}🤖 Ollama LLM Cluster:${RESET}"
for pi in aria lucidia octavia cecilia; do
  curl -s -m 2 http://${pi}:11434/api/tags > /dev/null 2>&1 && \
    echo -e "  ${GREEN}✓${RESET} ${pi} - Ollama running" || \
    echo -e "  ${AMBER}⚠${RESET} ${pi} - Ollama offline"
done

# Test Hailo NPUs
echo ""
echo -e "${VIOLET}🔥 Hailo-8 NPUs:${RESET}"
for pi in octavia cecilia; do
  ssh ${pi} "hailortcli scan 2>&1 | grep -q 'Hailo-8'" 2>/dev/null && \
    echo -e "  ${GREEN}✓${RESET} ${pi} - Hailo-8 detected" || \
    echo -e "  ${AMBER}⚠${RESET} ${pi} - Hailo-8 status unknown"
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}✓ Cluster scan complete${RESET}"
