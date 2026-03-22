# BlackRoad OS Aliases
alias br-info='echo -e "\033[38;5;204m🛣️  BlackRoad OS Node: $(hostname)\033[0m" && uptime && df -h / | tail -1'
alias br-status='systemctl status docker tailscaled 2>/dev/null | grep -E "Active:|●" || echo "Services check"'
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias gs='git status'
alias gp='git pull'
alias ask="~/blackroad-nl-shell.sh"
alias ai="~/blackroad-nl-shell.sh"
