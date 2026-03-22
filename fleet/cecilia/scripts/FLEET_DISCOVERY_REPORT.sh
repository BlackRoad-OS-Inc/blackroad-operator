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
# Phase 1 Discovery Results - BlackRoad Pi Fleet

# Generated: 2026-02-16

echo "🌌 BlackRoad Pi Fleet Discovery Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'DISCOVERY'
## ✅ CECILIA (Primary AI Node)
Hostname: cecilia
OS: Linux 6.12.62 (Debian, aarch64)
Hardware: Raspberry Pi 5 + Hailo-8 + Pironman 5 case
Storage: 457GB NVME (8% used, 400GB free)
RAM: 7.9GB total (3.4GB used, 4.5GB available)

Running Services:
  ✅ cloudflared.service - Cloudflare tunnel active
  ✅ ollama.service - AI inference running
  ❌ nginx - NOT installed
  ❌ postfix - NOT installed

Status: ONLINE ✅
Health: Excellent (low utilization, plenty of space)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ OCTAVIA (GPU Workload Node) 
Hostname: octavia
OS: Linux (Jetson Orin Nano)
Hardware: Jetson Orin Nano + NVME storage
Storage: 235GB (26% used, 166GB free)
RAM: 7.9GB total (2.9GB used, 5.0GB available)

Running Services:
  ✅ cloudflared.service - Cloudflare tunnel active
  ✅ nginx.service - Web server RUNNING ✨
  ✅ ollama-bridge.service - Custom service running
  ✅ ollama.service - AI inference running
  ❌ postfix - NOT installed

Status: ONLINE ✅
Health: Good (moderate utilization)
Notes: ONLY Pi with nginx already installed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⚠️ LUCIDIA (SSH routing issue)
Last Known: Raspberry Pi 5 + Hailo-8L + Pironman 5
Note: SSH connected to octavia instead of lucidia
Reason: Possible hostname resolution or Tailscale routing issue

Services Detected (via octavia):
  ✅ cloudflared.service
  ✅ ollama.service

Status: ONLINE but SSH MISDIRECTED ⚠️
Action Required: Fix Tailscale/SSH routing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ❌ ALICE (Offline)
Last Known: Raspberry Pi 4 (standard case)
Connection: SSH timeout after 30 seconds

Status: OFFLINE ❌
Action Required: 
  - Check power status
  - Verify network connection
  - Check Tailscale connectivity

DISCOVERY

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Fleet Summary"
echo ""
echo "Total Devices: 4"
echo "  ✅ Online: 2 (cecilia, octavia)"
echo "  ⚠️  Needs Fix: 1 (lucidia - SSH routing)"
echo "  ❌ Offline: 1 (alice)"
echo ""
echo "Service Status:"
echo "  cloudflared: 2/4 confirmed running"
echo "  ollama: 2/4 confirmed running"
echo "  nginx: 1/4 running (octavia only)"
echo "  postfix: 0/4 installed"
echo ""
echo "Storage Health: ✅ Excellent (all devices <50% used)"
echo "RAM Utilization: ✅ Good (sufficient free memory)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next Actions"
echo ""
echo "Priority 1: Fix lucidia SSH routing"
echo "Priority 2: Bring alice online"
echo "Priority 3: Install nginx on cecilia + lucidia + alice"
echo "Priority 4: Install postfix on all 4 devices"
echo "Priority 5: Set up TTS (piper) on all devices"
echo "Priority 6: Configure security hardening"
echo ""
echo "Ready to proceed with Phase 2!"
