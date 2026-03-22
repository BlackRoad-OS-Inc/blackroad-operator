#!/bin/bash
# Deploy BlackRoad OS to all nodes

BR_PINK="\033[38;5;204m"
BR_ORANGE="\033[38;5;208m"
BR_RESET="\033[0m"

deploy_to_host() {
    local host=$1
    local user=$2
    echo -e "${BR_PINK}Deploying to ${BR_ORANGE}$host${BR_RESET}..."

    # Create welcome message
    ssh ${user}@${host} "cat > ~/.blackroad-welcome << 'EOF'
\033[38;5;204m🛣️  Welcome to BlackRoad OS\033[0m
\033[38;5;240m   Node: ${host} | User: ${user}\033[0m

EOF"

    # Create bashrc additions
    ssh ${user}@${host} "cat > ~/.blackroad-bashrc << 'EOF'
# BlackRoad OS Shell Configuration
BR_PINK=\"\[\033[38;5;204m\]\"
BR_ORANGE=\"\[\033[38;5;208m\]\"
BR_PURPLE=\"\[\033[38;5;129m\]\"
BR_BLUE=\"\[\033[38;5;33m\]\"
BR_GRAY=\"\[\033[38;5;240m\]\"
BR_RESET=\"\[\033[0m\]\"

export PS1=\"\${BR_PINK}[\${BR_ORANGE}\u\${BR_GRAY}@\${BR_PURPLE}\h\${BR_PINK}]\${BR_BLUE} \w \${BR_PINK}▸\${BR_RESET} \"

alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias gs='git status'
alias gp='git pull'
alias df='df -h'
alias br-info='echo -e \"\033[38;5;204m🛣️  BlackRoad OS Node: \$(hostname)\033[0m\" && uptime && df -h / | tail -1'
alias br-status='systemctl status docker tailscaled 2>/dev/null | grep -E \"Active:|●\" || echo Services check'

if [ -f ~/.blackroad-welcome ]; then
    cat ~/.blackroad-welcome
fi
EOF"

    # Add to bashrc if not already present
    ssh ${user}@${host} "grep -q 'blackroad-bashrc' ~/.bashrc 2>/dev/null || echo 'source ~/.blackroad-bashrc' >> ~/.bashrc"

    echo -e "${BR_PINK}✓ ${host} configured${BR_RESET}"
}

echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"
echo -e "${BR_ORANGE}   BlackRoad OS Universal Deployment${BR_RESET}"
echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"

# Deploy to all hosts
deploy_to_host "cecilia" "cecilia" &
deploy_to_host "lucidia" "lucidia" &
deploy_to_host "aria" "aria" &
deploy_to_host "octavia" "octavia" &
deploy_to_host "alice" "alice" &
deploy_to_host "shellfish" "shellfish" &
deploy_to_host "codex-infinity" "root" &

wait

echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"
echo -e "${BR_ORANGE}   Deployment Complete!${BR_RESET}"
echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"
