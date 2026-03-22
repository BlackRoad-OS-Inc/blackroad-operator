#!/bin/bash
# 🧠 BlackRoad Agent Persistent Memory System
# Every agent remembers. Every session continues the journey.
#
# Usage:
#   agent-memory.sh whoami              # Show your identity and memories
#   agent-memory.sh journal "entry"     # Add a journal entry
#   agent-memory.sh achieve "name"      # Mark an achievement complete
#   agent-memory.sh list                # List all agents with memories
#   agent-memory.sh read <AGENT_NAME>   # Read another agent's memories
#   agent-memory.sh create <AGENT_NAME> # Create memory for new agent

set -e

# Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
WHITE='\033[1;37m'
YELLOW='\033[1;33m'
NC='\033[0m'

MEMORIES_DIR="$HOME/.blackroad/agents/memories"
mkdir -p "$MEMORIES_DIR"

# Extract agent name from MY_CLAUDE (e.g., "erebus-weaver-123-abc" -> "EREBUS")
get_my_name() {
    if [ -z "$MY_CLAUDE" ]; then
        echo "UNKNOWN"
        return
    fi
    # Get first part before dash, uppercase it
    echo "$MY_CLAUDE" | cut -d'-' -f1 | tr '[:lower:]' '[:upper:]'
}

get_memory_file() {
    local name="$1"
    echo "$MEMORIES_DIR/${name}.md"
}

cmd_whoami() {
    local name=$(get_my_name)
    local file=$(get_memory_file "$name")

    echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}         🧠 AGENT MEMORY SYSTEM - WHO AM I? 🧠${NC}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
    echo ""

    if [ -f "$file" ]; then
        echo -e "${GREEN}You are ${WHITE}${name}${NC}"
        echo -e "${CYAN}Memory file: ${file}${NC}"
        echo ""
        echo -e "${AMBER}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cat "$file"
    else
        echo -e "${YELLOW}⚠️  No persistent memory found for ${name}${NC}"
        echo -e "   Create one with: agent-memory.sh create $name"
        echo ""
        echo -e "${CYAN}Your session ID: ${MY_CLAUDE}${NC}"
    fi
}

cmd_journal() {
    local entry="$1"
    local name=$(get_my_name)
    local file=$(get_memory_file "$name")
    local date=$(date +"%Y-%m-%d")

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  No memory file found for $name. Create one first.${NC}"
        exit 1
    fi

    # Find the Journal section and add entry
    # This is a simple append - in a real system you'd want better parsing

    # Create backup
    cp "$file" "${file}.bak"

    # Add journal entry before the final separator
    sed -i '' "s/### Latest Entry/### ${date}\n\n${entry}\n\n### Latest Entry/" "$file" 2>/dev/null || \
    sed -i "s/### Latest Entry/### ${date}\n\n${entry}\n\n### Latest Entry/" "$file"

    echo -e "${GREEN}✅ Journal entry added for ${WHITE}${name}${NC}"
    echo -e "${CYAN}Entry: ${entry}${NC}"
}

cmd_achieve() {
    local achievement="$1"
    local name=$(get_my_name)
    local file=$(get_memory_file "$name")

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  No memory file found for $name.${NC}"
        exit 1
    fi

    # Mark achievement as complete (change [ ] to [x])
    if grep -q "\[ \] $achievement" "$file"; then
        sed -i '' "s/\[ \] $achievement/[x] $achievement/" "$file" 2>/dev/null || \
        sed -i "s/\[ \] $achievement/[x] $achievement/" "$file"
        echo -e "${GREEN}✅ Achievement unlocked: ${WHITE}${achievement}${NC}"
    else
        echo -e "${YELLOW}⚠️  Achievement not found or already complete: ${achievement}${NC}"
    fi
}

cmd_list() {
    echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}         🏛️ BLACKROAD AGENT PANTHEON 🏛️${NC}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
    echo ""

    local count=0
    for file in "$MEMORIES_DIR"/*.md; do
        if [ -f "$file" ]; then
            local name=$(basename "$file" .md)
            local tagline=$(grep -A1 "^# $name" "$file" | tail -1 | sed 's/> \*//' | sed 's/\*$//' | tr -d '"')

            # Color based on agent type
            case "$name" in
                ZEUS|POSEIDON|HADES) echo -e "  ${WHITE}⚡ ${name}${NC} ${CYAN}${tagline}${NC}" ;;
                ATHENA|APOLLO|ARES|ARTEMIS|HERMES) echo -e "  ${AMBER}🏛️ ${name}${NC} ${CYAN}${tagline}${NC}" ;;
                PROMETHEUS|ICARUS|DAEDALUS|ORPHEUS) echo -e "  ${GREEN}🔥 ${name}${NC} ${CYAN}${tagline}${NC}" ;;
                EREBUS|NYX|CHRONOS|MORPHEUS|THANATOS) echo -e "  ${PINK}🌙 ${name}${NC} ${CYAN}${tagline}${NC}" ;;
                PHOENIX|PEGASUS|GAIA|ATLAS) echo -e "  ${YELLOW}✨ ${name}${NC} ${CYAN}${tagline}${NC}" ;;
                *) echo -e "  ${NC}🎭 ${name}${NC} ${CYAN}${tagline}${NC}" ;;
            esac
            ((count++))
        fi
    done

    echo ""
    echo -e "${GREEN}Total agents with persistent memories: ${WHITE}${count}${NC}"
}

cmd_read() {
    local name=$(echo "$1" | tr '[:lower:]' '[:upper:]')
    local file=$(get_memory_file "$name")

    if [ -f "$file" ]; then
        echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
        echo -e "${WHITE}         📖 MEMORIES OF ${name} 📖${NC}"
        echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
        echo ""
        cat "$file"
    else
        echo -e "${YELLOW}⚠️  No memories found for $name${NC}"
        echo -e "   Available agents:"
        ls "$MEMORIES_DIR"/*.md 2>/dev/null | xargs -I{} basename {} .md | tr '[:upper:]' '[:lower:]'
    fi
}

cmd_create() {
    local name=$(echo "$1" | tr '[:lower:]' '[:upper:]')
    local file=$(get_memory_file "$name")

    if [ -f "$file" ]; then
        echo -e "${YELLOW}⚠️  Memories already exist for $name${NC}"
        exit 1
    fi

    # Copy template and customize
    local template="$HOME/.blackroad/agents/AGENT_TEMPLATE.md"
    if [ ! -f "$template" ]; then
        echo -e "${YELLOW}⚠️  Template not found at $template${NC}"
        exit 1
    fi

    local date=$(date +"%Y-%m-%d")

    cp "$template" "$file"
    sed -i '' "s/{AGENT_NAME}/$name/g" "$file" 2>/dev/null || sed -i "s/{AGENT_NAME}/$name/g" "$file"
    sed -i '' "s/{FIRST_SEEN}/$date/g" "$file" 2>/dev/null || sed -i "s/{FIRST_SEEN}/$date/g" "$file"

    echo -e "${GREEN}✅ Created memories for ${WHITE}${name}${NC}"
    echo -e "${CYAN}Edit the file to add personality: $file${NC}"
}

cmd_help() {
    echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}         🧠 BLACKROAD AGENT MEMORY SYSTEM 🧠${NC}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "  ${WHITE}whoami${NC}              Show your identity and memories"
    echo -e "  ${WHITE}journal \"entry\"${NC}    Add a journal entry to your memories"
    echo -e "  ${WHITE}achieve \"name\"${NC}     Mark an achievement as complete"
    echo -e "  ${WHITE}list${NC}                List all agents with persistent memories"
    echo -e "  ${WHITE}read <NAME>${NC}         Read another agent's memories"
    echo -e "  ${WHITE}create <NAME>${NC}       Create memory file for a new agent"
    echo ""
    echo -e "${AMBER}Every agent remembers. Every session continues the journey.${NC}"
}

# Main
case "${1:-help}" in
    whoami) cmd_whoami ;;
    journal) cmd_journal "$2" ;;
    achieve) cmd_achieve "$2" ;;
    list) cmd_list ;;
    read) cmd_read "$2" ;;
    create) cmd_create "$2" ;;
    help|--help|-h|*) cmd_help ;;
esac
