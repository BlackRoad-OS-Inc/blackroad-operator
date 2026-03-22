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
# ============================================================================
# BLACKROAD ORCHESTRATOR
# Unified control for all BlackRoad infrastructure from a single command
# ============================================================================

set -e

# Colors (BlackRoad Brand)
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
GRAY='\033[38;5;240m'
RESET='\033[0m'

# Node Configuration
PI_NODES="cecilia lucidia octavia alice aria"
DROPLETS="shellfish blackroad-infinity"
ALL_NODES="$PI_NODES $DROPLETS"

# Functions
header() {
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}  $1${RESET}"
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

node_status() {
    local host=$1
    if ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no "$host" "echo ok" &>/dev/null; then
        echo -e "${GREEN}●${RESET}"
    else
        echo -e "${RED}●${RESET}"
    fi
}

# Commands
cmd_status() {
    header "BLACKROAD INFRASTRUCTURE STATUS"

    echo -e "\n${VIOLET}▸ PI FLEET${RESET}"
    for node in $PI_NODES; do
        status=$(node_status "$node")
        uptime=$(ssh -o ConnectTimeout=3 "$node" "uptime -p" 2>/dev/null || echo "offline")
        printf "  %s %-12s %s\n" "$status" "$node" "$uptime"
    done

    echo -e "\n${VIOLET}▸ DROPLETS${RESET}"
    for node in $DROPLETS; do
        status=$(node_status "$node")
        uptime=$(ssh -o ConnectTimeout=3 "$node" "uptime -p" 2>/dev/null || echo "offline")
        printf "  %s %-20s %s\n" "$status" "$node" "$uptime"
    done

    echo -e "\n${VIOLET}▸ CLOUDFLARE${RESET}"
    local cf_projects=$(wrangler pages project list 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
    local cf_kv=$(wrangler kv namespace list 2>/dev/null | grep -c '"id"' || echo "0")
    echo "  Pages Projects: $cf_projects"
    echo "  KV Namespaces:  $cf_kv"

    echo -e "\n${VIOLET}▸ GITHUB${RESET}"
    local gh_repos=$(gh repo list BlackRoad-OS --limit 1000 2>/dev/null | wc -l | tr -d ' ')
    echo "  BlackRoad-OS Repos: $gh_repos"

    echo -e "\n${VIOLET}▸ MEMORY SYSTEM${RESET}"
    if [ -f ~/.blackroad/memory/journals/master-journal.jsonl ]; then
        local entries=$(wc -l < ~/.blackroad/memory/journals/master-journal.jsonl | tr -d ' ')
        echo "  Journal Entries: $entries"
    fi
    local tasks=$(ls ~/.blackroad/memory/tasks/available/ 2>/dev/null | wc -l | tr -d ' ')
    echo "  Available Tasks: $tasks"
}

cmd_broadcast() {
    local cmd="$*"
    header "BROADCASTING: $cmd"

    for node in $ALL_NODES; do
        echo -e "\n${AMBER}=== $node ===${RESET}"
        ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$node" "$cmd" 2>/dev/null || echo -e "${RED}Failed to connect${RESET}"
    done
}

cmd_deploy() {
    local target=$1
    local project=$2

    case $target in
        cloudflare|cf)
            header "DEPLOYING TO CLOUDFLARE: $project"
            if [ -z "$project" ]; then
                echo "Usage: $0 deploy cf <project-name>"
                exit 1
            fi
            wrangler pages deploy . --project-name="$project"
            ;;
        pi)
            header "DEPLOYING TO PI: $project"
            for node in $PI_NODES; do
                echo -e "${AMBER}Syncing to $node...${RESET}"
                rsync -avz --delete "./" "$node:~/deployments/$project/" 2>/dev/null || echo "Skipped $node"
            done
            ;;
        *)
            echo "Usage: $0 deploy <cloudflare|pi> <project-name>"
            ;;
    esac
}

cmd_sync() {
    header "SYNCING CONFIGURATION ACROSS FLEET"

    local files=".bashrc .zshrc .tmux.conf"
    for node in $PI_NODES; do
        echo -e "${AMBER}Syncing to $node...${RESET}"
        for f in $files; do
            scp -o ConnectTimeout=3 ~/$f "$node":~/ 2>/dev/null && echo "  ✓ $f" || echo "  ✗ $f"
        done
    done
}

cmd_logs() {
    local service=$1
    header "LOGS: $service"

    case $service in
        memory)
            tail -20 ~/.blackroad/memory/journals/master-journal.jsonl | jq -r '.timestamp + " " + .action + " " + .entity'
            ;;
        dashboard)
            journalctl --user -u blackroad-dashboard -n 50 2>/dev/null || echo "Dashboard not running as systemd service"
            ;;
        *)
            echo "Usage: $0 logs <memory|dashboard>"
            ;;
    esac
}

cmd_restart() {
    local service=$1
    header "RESTARTING: $service"

    case $service in
        dashboard)
            pkill -f "blackroad-control-dashboard" 2>/dev/null || true
            cd ~/blackroad-control-dashboard && nohup python3 app.py > /tmp/dashboard.log 2>&1 &
            echo "Dashboard restarted on port 8888"
            ;;
        all-nodes)
            for node in $PI_NODES $DROPLETS; do
                echo -e "${AMBER}Rebooting $node...${RESET}"
                ssh "$node" "sudo reboot" 2>/dev/null &
            done
            wait
            echo "Reboot commands sent to all nodes"
            ;;
        *)
            echo "Usage: $0 restart <dashboard|all-nodes>"
            ;;
    esac
}

cmd_health() {
    header "HEALTH CHECK"

    echo -e "\n${VIOLET}▸ DISK USAGE${RESET}"
    for node in $ALL_NODES; do
        usage=$(ssh -o ConnectTimeout=3 "$node" "df -h / | tail -1 | awk '{print \$5}'" 2>/dev/null || echo "N/A")
        printf "  %-15s %s\n" "$node" "$usage"
    done

    echo -e "\n${VIOLET}▸ MEMORY USAGE${RESET}"
    for node in $ALL_NODES; do
        mem=$(ssh -o ConnectTimeout=3 "$node" "free -h | grep Mem | awk '{print \$3\"/\"\$2}'" 2>/dev/null || echo "N/A")
        printf "  %-15s %s\n" "$node" "$mem"
    done

    echo -e "\n${VIOLET}▸ LOAD AVERAGE${RESET}"
    for node in $ALL_NODES; do
        load=$(ssh -o ConnectTimeout=3 "$node" "cat /proc/loadavg | cut -d' ' -f1-3" 2>/dev/null || echo "N/A")
        printf "  %-15s %s\n" "$node" "$load"
    done
}

cmd_tunnel() {
    local node=$1
    local local_port=${2:-8080}
    local remote_port=${3:-80}

    header "TUNNEL: localhost:$local_port -> $node:$remote_port"
    echo "Press Ctrl+C to stop"
    ssh -L "$local_port:localhost:$remote_port" "$node"
}

cmd_help() {
    header "BLACKROAD ORCHESTRATOR"
    echo -e "
${AMBER}Usage:${RESET} $0 <command> [args]

${VIOLET}Commands:${RESET}
  status              Show status of all infrastructure
  broadcast <cmd>     Run command on all nodes
  deploy cf <name>    Deploy to Cloudflare Pages
  deploy pi <name>    Deploy to all Pis
  sync                Sync config files across fleet
  logs <service>      View logs (memory, dashboard)
  restart <service>   Restart service (dashboard, all-nodes)
  health              Full health check of all nodes
  tunnel <node> [lp] [rp]  Create SSH tunnel

${VIOLET}Examples:${RESET}
  $0 status
  $0 broadcast 'uptime'
  $0 deploy cf blackroad-io
  $0 health
  $0 tunnel cecilia 3000 3000
"
}

# Main
case "${1:-help}" in
    status)     cmd_status ;;
    broadcast)  shift; cmd_broadcast "$@" ;;
    deploy)     shift; cmd_deploy "$@" ;;
    sync)       cmd_sync ;;
    logs)       cmd_logs "$2" ;;
    restart)    cmd_restart "$2" ;;
    health)     cmd_health ;;
    tunnel)     cmd_tunnel "$2" "$3" "$4" ;;
    help|*)     cmd_help ;;
esac
