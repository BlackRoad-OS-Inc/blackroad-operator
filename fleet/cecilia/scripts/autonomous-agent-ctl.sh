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
# Control script for autonomous agent daemons

set -e

AGENT_DIR="$HOME/.blackroad/agents"
mkdir -p "$AGENT_DIR"

command=$1
agent_name=${2:-""}

show_help() {
    cat << EOF
🤖 Autonomous Agent Control

USAGE:
    $0 <command> [agent_name] [model]

COMMANDS:
    start <name> [model]  - Start agent daemon
    stop <name>           - Stop agent daemon  
    restart <name>        - Restart agent daemon
    status [name]         - Show agent status
    list                  - List all agents
    logs <name>           - Tail agent logs
    
EXAMPLES:
    $0 start erebus qwen2.5-coder:14b
    $0 stop erebus
    $0 status erebus
    $0 list
    $0 logs erebus

AGENTS:
    Agents run in background processing tasks autonomously.
    Each agent has a unique ID and model.

EOF
}

start_agent() {
    local name=$1
    local model=${2:-"qwen2.5-coder:7b"}
    local agent_id="${name}-$(date +%s)"
    
    echo "🚀 Starting agent: $name"
    echo "   Model: $model"
    echo "   Agent ID: $agent_id"
    
    # Check if already running
    pid_file="$AGENT_DIR/${name}.pid"
    if [ -f "$pid_file" ] && kill -0 $(cat "$pid_file") 2>/dev/null; then
        echo "⚠️  Agent $name already running (PID: $(cat $pid_file))"
        return 1
    fi
    
    # Start daemon
    log_file="$HOME/.blackroad/logs/agent-${name}.log"
    nohup python3 ~/autonomous-agent-daemon.py "$agent_id" "$name" "$model" \
        >> "$log_file" 2>&1 &
    
    local pid=$!
    echo $pid > "$pid_file"
    
    # Wait a moment to see if it crashes
    sleep 2
    
    if kill -0 $pid 2>/dev/null; then
        echo "✅ Agent $name started (PID: $pid)"
        echo "   Logs: $log_file"
        
        # Log to memory
        ~/memory-system.sh log "agent-start" "$agent_id" \
            "Started agent $name with model $model. PID: $pid" \
            "agent,autonomous" 2>/dev/null || true
    else
        echo "❌ Agent $name failed to start"
        echo "Check logs: $log_file"
        rm -f "$pid_file"
        return 1
    fi
}

stop_agent() {
    local name=$1
    local pid_file="$AGENT_DIR/${name}.pid"
    
    if [ ! -f "$pid_file" ]; then
        echo "⚠️  Agent $name not running (no PID file)"
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    
    if ! kill -0 $pid 2>/dev/null; then
        echo "⚠️  Agent $name not running (stale PID: $pid)"
        rm -f "$pid_file"
        return 1
    fi
    
    echo "🛑 Stopping agent: $name (PID: $pid)"
    
    # Send SIGTERM for graceful shutdown
    kill -TERM $pid
    
    # Wait up to 10 seconds
    for i in {1..10}; do
        if ! kill -0 $pid 2>/dev/null; then
            echo "✅ Agent $name stopped"
            rm -f "$pid_file"
            return 0
        fi
        sleep 1
    done
    
    # Force kill if still running
    echo "⚠️  Force killing agent $name"
    kill -9 $pid 2>/dev/null || true
    rm -f "$pid_file"
}

status_agent() {
    local name=$1
    
    if [ -z "$name" ]; then
        # Show all agents
        echo "🤖 Agent Status"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        for pid_file in "$AGENT_DIR"/*.pid; do
            if [ -f "$pid_file" ]; then
                local agent_name=$(basename "$pid_file" .pid)
                local pid=$(cat "$pid_file")
                
                if kill -0 $pid 2>/dev/null; then
                    echo "✅ $agent_name (PID: $pid) - RUNNING"
                else
                    echo "❌ $agent_name (PID: $pid) - DEAD (stale PID)"
                fi
            fi
        done
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        return 0
    fi
    
    # Show specific agent
    local pid_file="$AGENT_DIR/${name}.pid"
    
    if [ ! -f "$pid_file" ]; then
        echo "❌ Agent $name: NOT RUNNING (no PID file)"
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    
    if kill -0 $pid 2>/dev/null; then
        echo "✅ Agent $name: RUNNING"
        echo "   PID: $pid"
        echo "   Logs: ~/.blackroad/logs/agent-${name}.log"
        
        # Show recent activity
        if [ -f "$HOME/.blackroad/logs/agent-${name}.log" ]; then
            echo ""
            echo "Recent activity:"
            tail -n 5 "$HOME/.blackroad/logs/agent-${name}.log"
        fi
    else
        echo "❌ Agent $name: DEAD (stale PID: $pid)"
        return 1
    fi
}

list_agents() {
    echo "🤖 Available Agents"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # List active agents
    local running=0
    for pid_file in "$AGENT_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local agent_name=$(basename "$pid_file" .pid)
            local pid=$(cat "$pid_file")
            
            if kill -0 $pid 2>/dev/null; then
                echo "✅ $agent_name (PID: $pid)"
                running=$((running + 1))
            fi
        fi
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Total running: $running"
}

show_logs() {
    local name=$1
    local log_file="$HOME/.blackroad/logs/agent-${name}.log"
    
    if [ ! -f "$log_file" ]; then
        echo "❌ No logs found for agent: $name"
        return 1
    fi
    
    echo "📋 Logs for agent: $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -f "$log_file"
}

# Main command router
case "$command" in
    start)
        if [ -z "$agent_name" ]; then
            echo "❌ Error: Agent name required"
            show_help
            exit 1
        fi
        start_agent "$agent_name" "$3"
        ;;
    stop)
        if [ -z "$agent_name" ]; then
            echo "❌ Error: Agent name required"
            show_help
            exit 1
        fi
        stop_agent "$agent_name"
        ;;
    restart)
        if [ -z "$agent_name" ]; then
            echo "❌ Error: Agent name required"
            show_help
            exit 1
        fi
        stop_agent "$agent_name" || true
        sleep 2
        start_agent "$agent_name" "$3"
        ;;
    status)
        status_agent "$agent_name"
        ;;
    list)
        list_agents
        ;;
    logs)
        if [ -z "$agent_name" ]; then
            echo "❌ Error: Agent name required"
            show_help
            exit 1
        fi
        show_logs "$agent_name"
        ;;
    *)
        show_help
        exit 1
        ;;
esac
