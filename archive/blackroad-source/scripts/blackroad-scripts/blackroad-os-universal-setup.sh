#!/bin/bash
# BlackRoad OS Universal Setup Script
# Deploys consistent branding across all nodes

# BlackRoad Official Colors (xterm-256)
BR_HOT_PINK=204      # #FF0066 - Primary brand
BR_ORANGE=208        # #FF6B00
BR_PURPLE=129        # #7700FF
BR_BLUE=33           # #0066FF
BR_BLACK=232         # Deep black
BR_WHITE=255         # Pure white
BR_GRAY=240          # Charcoal

HOSTNAME=$(hostname)
USER=$(whoami)

# Create BlackRoad banner
cat > /tmp/blackroad-motd << 'MOTD'
[38;5;204m╔═══════════════════════════════════════════════════════════╗[0m
[38;5;204m║[0m [38;5;208m██████[0m [38;5;204m██[0m      [38;5;208m█████[0m   [38;5;204m██████[0m [38;5;208m██   ██[0m [38;5;204m██████[0m   [38;5;208m█████[0m  [38;5;204m██████[0m  [38;5;204m║[0m
[38;5;204m║[0m [38;5;208m██   ██[0m[38;5;204m██[0m     [38;5;208m██   ██[0m [38;5;204m██[0m      [38;5;208m██  ██[0m  [38;5;204m██   ██[0m [38;5;208m██   ██[0m [38;5;204m██   ██[0m [38;5;204m║[0m
[38;5;204m║[0m [38;5;208m██████[0m [38;5;204m██[0m     [38;5;208m███████[0m [38;5;204m██[0m      [38;5;208m█████[0m   [38;5;204m██████[0m  [38;5;208m██   ██[0m [38;5;204m███████[0m [38;5;204m║[0m
[38;5;204m║[0m [38;5;208m██   ██[0m[38;5;204m██[0m     [38;5;208m██   ██[0m [38;5;204m██[0m      [38;5;208m██  ██[0m  [38;5;204m██   ██[0m [38;5;208m██   ██[0m [38;5;204m██   ██[0m [38;5;204m║[0m
[38;5;204m║[0m [38;5;208m██████[0m [38;5;204m███████[0m[38;5;208m██   ██[0m  [38;5;204m██████[0m[38;5;208m██   ██[0m [38;5;204m██   ██[0m  [38;5;208m█████[0m  [38;5;204m██████[0m  [38;5;204m║[0m
[38;5;204m╠═══════════════════════════════════════════════════════════╣[0m
[38;5;204m║[0m  [38;5;129m████████[0m  [38;5;33m███████[0m                                        [38;5;204m║[0m
[38;5;204m║[0m  [38;5;129m██    ██[0m  [38;5;33m██[0m                                             [38;5;204m║[0m
[38;5;204m║[0m  [38;5;129m██    ██[0m  [38;5;33m███████[0m   [38;5;240m The Sovereign Operating System[0m      [38;5;204m║[0m
[38;5;204m║[0m  [38;5;129m██    ██[0m       [38;5;33m██[0m                                        [38;5;204m║[0m
[38;5;204m║[0m  [38;5;129m████████[0m  [38;5;33m███████[0m                                        [38;5;204m║[0m
[38;5;204m╚═══════════════════════════════════════════════════════════╝[0m
MOTD

# Create simple welcome for SSH
cat > /tmp/blackroad-welcome << 'WELCOME'
[38;5;204m🛣️  Welcome to BlackRoad OS[0m
[38;5;240m   Node: HOSTNAME_PLACEHOLDER | User: USER_PLACEHOLDER[0m

WELCOME

# Create bashrc additions
cat > /tmp/blackroad-bashrc << 'BASHRC'
# BlackRoad OS Shell Configuration
# Colors
BR_PINK="\[\033[38;5;204m\]"
BR_ORANGE="\[\033[38;5;208m\]"
BR_PURPLE="\[\033[38;5;129m\]"
BR_BLUE="\[\033[38;5;33m\]"
BR_GRAY="\[\033[38;5;240m\]"
BR_RESET="\[\033[0m\]"

# BlackRoad Prompt
export PS1="${BR_PINK}[${BR_ORANGE}\u${BR_GRAY}@${BR_PURPLE}\h${BR_PINK}]${BR_BLUE} \w ${BR_PINK}▸${BR_RESET} "

# Aliases
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias ..='cd ..'
alias ...='cd ../..'
alias gs='git status'
alias gp='git pull'
alias df='df -h'
alias free='free -h'
alias ports='netstat -tuln'

# BlackRoad Info
alias br-info='echo -e "\033[38;5;204m🛣️  BlackRoad OS Node: $(hostname)\033[0m" && uptime && df -h / | tail -1'
alias br-status='systemctl status docker tailscaled 2>/dev/null | grep -E "Active:|●"'

# Welcome message on login
if [ -f ~/.blackroad-welcome ]; then
    cat ~/.blackroad-welcome
fi
BASHRC

echo "BlackRoad OS Universal Setup created."
echo "Deploy with: scp /tmp/blackroad-* <host>:~/"
