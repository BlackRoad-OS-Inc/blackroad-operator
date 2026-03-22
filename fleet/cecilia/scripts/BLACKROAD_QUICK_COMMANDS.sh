#!/bin/bash
# BlackRoad Quick Commands - Copy/Paste Ready

# ═══════════════════════════════════════════════════════════
# AI COMMANDS (Use single quotes to avoid shell issues!)
# ═══════════════════════════════════════════════════════════

# Generate code
blackroad-ai suggest 'write hello world in rust'
blackroad-ai suggest 'create a REST API in Go'
blackroad-ai suggest 'implement quicksort in python'

# Explain code
blackroad-ai explain 'what does this regex do: ^[a-z]+$'
blackroad-ai explain 'how does async/await work in javascript'

# Check status
blackroad-ai status
blackroad-ai methods

# ═══════════════════════════════════════════════════════════
# INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════

# Check what's online
for host in cecilia lucidia alice octavia anastasia aria; do
    ssh -o ConnectTimeout=2 $host "hostname" 2>/dev/null && echo "$host: ✅" || echo "$host: ❌"
done

# Deploy gateway to online Pis
ssh cecilia 'mkdir -p ~/copilot-gateway'
ssh lucidia 'mkdir -p ~/copilot-gateway'
ssh alice 'mkdir -p ~/copilot-gateway'

# ═══════════════════════════════════════════════════════════
# WEB SERVICES
# ═══════════════════════════════════════════════════════════

# Start web service
cd ~/services/web
npm install  # First time only
npm run dev  # Port 3000

# Start gateway dashboard (separate terminal)
cd ~/copilot-agent-gateway
node gateway-web.js  # Port 3030

# Test gateway
curl http://localhost:3030/api/stats

# ═══════════════════════════════════════════════════════════
# SYSTEM STATUS
# ═══════════════════════════════════════════════════════════

# Full system overview
blackroad-help

# Check specific services
blackroad-status
blackroad-health
blackroad-stats

# List all commands
ls ~/bin/blackroad-*

# ═══════════════════════════════════════════════════════════
# QUICK FIXES
# ═══════════════════════════════════════════════════════════

# Shell history expansion issue (!)
# ❌ Don't use: "write hello!"
# ✅ Use: 'write hello!' (single quotes)
# ✅ Or: "write hello\!" (escape it)
# ✅ Or: setopt NO_BANG_HIST (disable in zsh)

# Add to ~/.zshrc to disable permanently:
echo "setopt NO_BANG_HIST" >> ~/.zshrc

# Next.js command not found
cd ~/services/web && npm install

# Gateway not responding
# Check if running: lsof -i :3030
# Start: node ~/copilot-agent-gateway/gateway-web.js

# ═══════════════════════════════════════════════════════════
# ALIASES (Add to ~/.zshrc)
# ═══════════════════════════════════════════════════════════

alias ai='blackroad-ai suggest'
alias explain='blackroad-ai explain'
alias brs='blackroad-status'
alias brh='blackroad-help'
alias brai='blackroad-ai'

# Then use:
# ai 'write hello world in python'
# explain 'how does map work'
