#!/bin/bash
# Lucidia OS - AI-Native Operating System
# BlackRoad OS, Inc.

export LUCIDIA_VERSION="1.0.0"
export LUCIDIA_HOME="$HOME/.lucidia"
export PATH="$LUCIDIA_HOME/bin:$PATH"

# Ultra-minimal prompt
PS1='\w \$ '

# Banner on interactive login
if [[ $- == *i* ]] && [ -z "$LUCIDIA_INIT" ]; then
    cat "$LUCIDIA_HOME/banner.txt" 2>/dev/null
    echo "  $(hostname)"
    echo ""
    export LUCIDIA_INIT=1
fi

# Lucidia AI interface aliases
alias ai='lucidia'
alias ask='lucidia'
