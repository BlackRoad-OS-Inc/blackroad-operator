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
# Configure cron jobs for autonomous agent execution

set -e

echo "⏰ Setting up autonomous agent cron jobs..."
echo ""

# Backup existing crontab
crontab -l > ~/crontab.backup 2>/dev/null || touch ~/crontab.backup
echo "✅ Backed up existing crontab to ~/crontab.backup"

# Create new crontab entries
CRON_FILE="/tmp/blackroad-cron.txt"

cat > "$CRON_FILE" << 'EOF'
# BlackRoad Autonomous Agent Cron Jobs
# Generated: AUTO_GENERATED_DATE

# Memory System Maintenance (every hour)
0 * * * * ~/memory-system.sh compact >> ~/.blackroad/memory/cron-compact.log 2>&1

# Memory Index Rebuild (daily at 3 AM)
0 3 * * * python3 ~/memory-indexer.py rebuild >> ~/.blackroad/memory/cron-index.log 2>&1

# Agent Health Check (every 15 minutes)
*/15 * * * * python3 ~/autonomous-monitor-agent.py 60 >> ~/.blackroad/logs/monitor.log 2>&1 &

# Task Queue Processor (every 5 minutes)
*/5 * * * * python3 ~/task-queue-processor.py >> ~/.blackroad/logs/task-queue.log 2>&1

# GitHub Actions Health Check (every hour)
0 * * * * gh run list --limit 5 --json status | python3 -c "import sys, json; data=json.load(sys.stdin); sys.exit(1 if any(r['status']=='failure' for r in data) else 0)" || echo "GitHub Actions failures detected" | ~/memory-system.sh log "monitoring" "cron" "GitHub Actions failures detected" "monitoring,github"

# Disk Space Check (daily at 2 AM)
0 2 * * * df -h | awk '$5 > 80 {print}' >> ~/.blackroad/logs/disk-alerts.log

# Auto-update dependencies (weekly on Sunday at 4 AM)
0 4 * * 0 cd ~ && npm update -g >> ~/.blackroad/logs/npm-update.log 2>&1

# Backup memory system (daily at 1 AM)
0 1 * * * tar -czf ~/.blackroad/backups/memory-$(date +\%Y\%m\%d).tar.gz ~/.blackroad/memory/ >> ~/.blackroad/logs/backup.log 2>&1

# Clean old logs (weekly on Sunday at 5 AM)
0 5 * * 0 find ~/.blackroad/logs -name "*.log" -mtime +30 -delete

# Agent coordination check (every 30 minutes)
*/30 * * * * ~/memory-realtime-context.sh live auto compact >> ~/.blackroad/logs/coordination.log 2>&1

# BlackRoad OS update (daily at midnight)
0 0 * * * python3 ~/blackroad-blackroad os-scanner.py >> ~/.blackroad/logs/blackroad os-scan.log 2>&1

EOF

# Replace date placeholder
sed -i.bak "s/AUTO_GENERATED_DATE/$(date)/" "$CRON_FILE"
rm "${CRON_FILE}.bak"

echo "📋 Cron jobs to be installed:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$CRON_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create log directories
mkdir -p ~/.blackroad/logs
mkdir -p ~/.blackroad/backups

echo "📁 Created log directories"

# Ask for confirmation
echo ""
read -p "Install these cron jobs? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Merge with existing crontab
    (crontab -l 2>/dev/null || true; cat "$CRON_FILE") | crontab -
    
    echo "✅ Cron jobs installed!"
    echo ""
    echo "View with: crontab -l"
    echo "Edit with: crontab -e"
    echo "Remove with: crontab -r"
    echo ""
    echo "📊 Logs will be written to:"
    echo "   ~/.blackroad/logs/*.log"
    echo ""
    echo "🔍 Monitor logs with:"
    echo "   tail -f ~/.blackroad/logs/monitor.log"
    echo "   tail -f ~/.blackroad/logs/task-queue.log"
    
    # Log to memory
    ~/memory-system.sh log "cron-setup" "autonomous-system" \
        "Installed 11 cron jobs for autonomous operation: memory maintenance, monitoring, task processing, health checks, backups" \
        "autonomous,cron,setup" 2>/dev/null || true
else
    echo "❌ Installation cancelled"
    echo "Cron configuration saved to: $CRON_FILE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ Autonomous Agent Cron Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
