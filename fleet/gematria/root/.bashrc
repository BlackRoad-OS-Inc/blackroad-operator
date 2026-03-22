# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
[ -z "$PS1" ] && return

# don't put duplicate lines in the history. See bash(1) for more options
# ... or force ignoredups and ignorespace
HISTCONTROL=ignoredups:ignorespace

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "$debian_chroot" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
#if [ -f /etc/bash_completion ] && ! shopt -oq posix; then
#    . /etc/bash_completion
#fi

test -e "$HOME/.shellfishrc" && source "$HOME/.shellfishrc"
alias lucidia='ollama run llama3'
source ~/colors.sh
source ~/emoji-ui.sh

# BlackRoad Gradient Prompt
PS1='\[\e[38;5;208m\]◆\[\e[38;5;202m\]◆\[\e[38;5;198m\]◆\[\e[38;5;163m\]◆\[\e[38;5;33m\]◆\[\e[0m\] \[\e[38;5;255m\]\u\[\e[38;5;240m\]@\[\e[38;5;208m\]codex-infinity\[\e[0m\]:\[\e[38;5;33m\]\w\[\e[0m\]\$ '

# BlackRoad MOTD
blackroad_banner() {
  echo -e "\e[38;5;208m    ╔══════════════════════════════════════╗"
  echo -e "\e[38;5;202m    ║\e[38;5;255m      ◇  B L A C K R O A D  ◇       \e[38;5;202m║"
  echo -e "\e[38;5;198m    ║\e[38;5;240m         codex-infinity node         \e[38;5;198m║"
  echo -e "\e[38;5;163m    ╚══════════════════════════════════════╝\e[0m"
  echo -e "\e[38;5;33m              \\\\     //\e[0m"
  echo -e "\e[38;5;33m               \\\\   //\e[0m"
  echo -e "\e[38;5;240m                \\\\_//\e[0m"
}
blackroad_banner
~/blackroad-banner.sh
source ~/.blackroad-bashrc

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
alias br-info='echo -e "\033[38;5;204m🛣️  BlackRoad OS Node: $(hostname)\033[0m" && uptime && df -h / | tail -1'
alias br-status='systemctl status docker tailscaled 2>/dev/null | grep -E "Active:|●" || echo "Services check"'
alias ll='ls -la --color=auto'
alias gs='git status'
alias gp='git pull'

# Welcome
echo -e "\033[38;5;204m🛣️  Welcome to BlackRoad OS\033[0m"
echo -e "\033[38;5;240m   Node: $(hostname) | User: $(whoami)\033[0m"
echo ""
# ═══════════════════════════════════════════════════════════

# BlackRoad OS Configuration
BR_PINK="\[\033[38;5;204m\]"
BR_ORANGE="\[\033[38;5;208m\]"
BR_PURPLE="\[\033[38;5;129m\]"
BR_BLUE="\[\033[38;5;33m\]"
BR_GRAY="\[\033[38;5;240m\]"
BR_RESET="\[\033[0m\]"

export PS1="${BR_PINK}[${BR_ORANGE}\u${BR_GRAY}@${BR_PURPLE}\h${BR_PINK}]${BR_BLUE} \w ${BR_PINK}▸${BR_RESET} "

alias br-info='echo -e "\033[38;5;204m🛣️  BlackRoad OS Node: $(hostname)\033[0m" && uptime && df -h / | tail -1'
alias br-status='systemctl status docker tailscaled 2>/dev/null | grep -E "Active:|●" || echo "Services check"'

echo -e "\033[38;5;204m🛣️  Welcome to BlackRoad OS\033[0m"
echo -e "\033[38;5;240m   Node: $(hostname) | User: $(whoami)\033[0m"

# BlackRoad AI Shell - auto-launch
if [[ $- == *i* ]] && [[ -z "$BLACKROAD_SHELL_ACTIVE" ]]; then
    export BLACKROAD_SHELL_ACTIVE=1
    ~/blackroad-ai-shell.sh
fi
source ~/.lucidia/lucidia.sh
. "/root/.acme.sh/acme.sh.env"
