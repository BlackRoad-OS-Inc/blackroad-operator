#!/bin/bash
# 🚀 Agent Health Quick Start
# Get up and running with agent health monitoring in 60 seconds

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║        🏥 BLACKROAD AGENT HEALTH - QUICK START                  ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Initialize
echo "📋 Step 1: Initializing health monitoring system..."
python3 -c "
import asyncio
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('agent_health_monitor', Path.home() / 'agent-health-monitor.py')
ahm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ahm)
monitor = ahm.AgentHealthMonitor()
print('✅ Initialized')
"

# Step 2: Run test
echo ""
echo "📊 Step 2: Running system test..."
python3 test-agent-health.py | grep "TEST SUMMARY" -A 10

# Step 3: Show status
echo ""
echo "📈 Step 3: Checking system status..."
./agent-health status

# Step 4: Generate dashboard
echo ""
echo "📊 Step 4: Generating dashboard..."
python3 agent-health-dashboard.py

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║                    ✅ QUICK START COMPLETE!                      ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Next Steps:"
echo "   1. View dashboard: open agent-health-dashboard.html"
echo "   2. Check alerts:   ./agent-health alerts"
echo "   3. Monitor live:   ./agent-health monitor"
echo "   4. Get help:       ./agent-health --help"
echo ""
echo "📚 Documentation: AGENT_HEALTH_ENHANCEMENT_COMPLETE.md"
echo "🧪 Test suite:    python3 test-agent-health.py"
echo ""
echo "🎉 Happy monitoring!"
