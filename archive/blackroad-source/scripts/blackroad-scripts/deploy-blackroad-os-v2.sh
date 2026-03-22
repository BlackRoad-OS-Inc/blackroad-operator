#!/bin/bash
# BlackRoad OS Universal Deployment v2
# Embeds config directly into .bashrc

BR_PINK="\033[38;5;204m"
BR_ORANGE="\033[38;5;208m"
BR_RESET="\033[0m"

deploy_to_host() {
    local host=$1
    local sshcmd=$2
    echo -e "${BR_PINK}Deploying to ${BR_ORANGE}$host${BR_RESET}..."

    ssh $sshcmd 'cat >> ~/.bashrc << '\''BRCONFIG'\''

# ═══════════════════════════════════════════════════════════
# BlackRoad OS Configuration
# ═══════════════════════════════════════════════════════════
BR_PINK="\[\033[38;5;204m\]"
BR_ORANGE="\[\033[38;5;208m\]"
BR_PURPLE="\[\033[38;5;129m\]"
BR_BLUE="\[\033[38;5;33m\]"
BR_GRAY="\[\033[38;5;240m\]"
BR_RESET="\[\033[0m\]"

# BlackRoad Prompt
export PS1="${BR_PINK}[${BR_ORANGE}\u${BR_GRAY}@${BR_PURPLE}\h${BR_PINK}]${BR_BLUE} \w ${BR_PINK}▸${BR_RESET} "

# BlackRoad Aliases
alias br-info='\''echo -e "\033[38;5;204m🛣️  BlackRoad OS Node: $(hostname)\033[0m" && uptime && df -h / | tail -1'\''
alias br-status='\''systemctl status docker tailscaled 2>/dev/null | grep -E "Active:|●" || echo "Services check"'\''
alias ll='\''ls -la --color=auto'\''
alias gs='\''git status'\''
alias gp='\''git pull'\''

# Welcome
echo -e "\033[38;5;204m🛣️  Welcome to BlackRoad OS\033[0m"
echo -e "\033[38;5;240m   Node: $(hostname) | User: $(whoami)\033[0m"
echo ""
# ═══════════════════════════════════════════════════════════
BRCONFIG
'
    echo -e "${BR_PINK}✓ ${host} configured${BR_RESET}"
}

echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"
echo -e "${BR_ORANGE}   BlackRoad OS v2 Deployment${BR_RESET}"
echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"

deploy_to_host "cecilia" "cecilia"
deploy_to_host "lucidia" "lucidia"
deploy_to_host "aria" "aria"
deploy_to_host "octavia" "octavia"
deploy_to_host "alice" "alice@alice"
deploy_to_host "shellfish" "shellfish"
deploy_to_host "codex-infinity" "root@codex-infinity"

echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"
echo -e "${BR_ORANGE}   Deployment Complete!${BR_RESET}"
echo -e "${BR_PINK}═══════════════════════════════════════${BR_RESET}"
