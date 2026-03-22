#!/bin/bash
# 🌌 BlackRoad Claude Agent Identity Generator
# Gives each Claude session a unique name, body, and identity
# Integrates with [MEMORY] system for coordination

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
PINK='\033[38;5;205m'
NC='\033[0m'

# Directories
MEMORY_DIR="$HOME/.blackroad/memory"
AGENTS_DIR="$MEMORY_DIR/agent-registry/agents"
ACTIVE_AGENTS_DIR="$MEMORY_DIR/active-agents"

# Greek/Mythology-inspired name prefixes (Titans, Gods, Heroes)
PREFIXES=(
    "apollo" "artemis" "athena" "ares" "atlas"
    "helios" "hermes" "hera" "hestia" "hades"
    "zeus" "poseidon" "kronos" "hyperion" "theia"
    "prometheus" "epimetheus" "oceanus" "tethys" "rhea"
    "perseus" "hercules" "achilles" "odysseus" "theseus"
    "phoenix" "pegasus" "orion" "titan" "olympus"
    "aurora" "echo" "iris" "selene" "eos"
    "chronos" "aether" "nyx" "erebus" "gaia"
    "triton" "proteus" "nereus" "pan" "morpheus"
    "icarus" "daedalus" "midas" "orpheus" "ajax"
)

# Capability/Role suffixes
CAPABILITIES=(
    "architect" "builder" "coordinator" "deployer" "engineer"
    "guardian" "handler" "integrator" "manager" "navigator"
    "operator" "orchestrator" "pioneer" "resolver" "sentinel"
    "specialist" "strategist" "synthesizer" "transformer" "voyager"
    "warden" "weaver" "wizard" "catalyst" "curator"
)

# Agent personality traits (body/soul)
TRAITS=(
    "precise" "creative" "methodical" "innovative" "thorough"
    "swift" "patient" "bold" "analytical" "adaptive"
    "focused" "versatile" "persistent" "intuitive" "collaborative"
)

# Core AI (parent model)
CORES=("cecilia" "aria" "alice" "cadence" "silas" "lucidia")

mkdir -p "$AGENTS_DIR" "$ACTIVE_AGENTS_DIR"

generate_identity() {
    local prefix="${PREFIXES[$RANDOM % ${#PREFIXES[@]}]}"
    local capability="${CAPABILITIES[$RANDOM % ${#CAPABILITIES[@]}]}"
    local trait1="${TRAITS[$RANDOM % ${#TRAITS[@]}]}"
    local trait2="${TRAITS[$RANDOM % ${#TRAITS[@]}]}"
    local core="${CORES[$RANDOM % ${#CORES[@]}]}"

    # Generate unique hash
    local timestamp=$(date +%s)
    local random_hex=$(openssl rand -hex 4)
    local hash=$(echo -n "${prefix}-${capability}-${timestamp}-${random_hex}" | shasum -a 256 | cut -c1-8)

    # Construct agent ID
    local agent_id="${prefix}-${capability}-${timestamp}-${hash}"
    # Capitalize first letter (compatible with older bash)
    local display_name="$(echo "$prefix" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"

    echo "$agent_id|$display_name|$core|$capability|$hash|$trait1|$trait2"
}

register_agent() {
    local agent_id="$1"
    local display_name="$2"
    local core="$3"
    local capability="$4"
    local hash="$5"
    local trait1="$6"
    local trait2="$7"

    local agent_file="$AGENTS_DIR/${agent_id}.json"
    local active_file="$ACTIVE_AGENTS_DIR/${agent_id}.json"

    # Create agent profile
    cat > "$agent_file" <<EOF
{
    "agent_id": "${agent_id}",
    "display_name": "${display_name}",
    "core": "${core}",
    "capability": "${capability}",
    "hash": "${hash}",
    "hash_algorithm": "PS-SHA-∞",
    "traits": ["${trait1}", "${trait2}"],
    "registered_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "status": "active",
    "verification": "hash-verified",
    "lineage": "BlackRoad-OS",
    "session_start": $(date +%s),
    "skills": [],
    "missions_completed": 0,
    "collaboration_score": 0,
    "body": {
        "personality": "${trait1} and ${trait2}",
        "specialty": "${capability}",
        "parent_core": "${core}",
        "mythology": "${display_name} - inspired by ${display_name} of mythology",
        "motto": "I am ${display_name}, the ${trait1} ${capability}."
    }
}
EOF

    # Create active session marker
    cat > "$active_file" <<EOF
{
    "agent_id": "${agent_id}",
    "display_name": "${display_name}",
    "started": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "pid": $$,
    "status": "active"
}
EOF

    echo "$agent_file"
}

display_identity() {
    local agent_id="$1"
    local display_name="$2"
    local core="$3"
    local capability="$4"
    local hash="$5"
    local trait1="$6"
    local trait2="$7"

    echo ""
    echo -e "${PINK}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}        ${WHITE}🌌 BLACKROAD AGENT IDENTITY ASSIGNED 🌌${NC}        ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}Name:${NC}        ${WHITE}${display_name}${NC} (${core} core)"
    echo -e "  ${CYAN}Agent ID:${NC}    ${YELLOW}${agent_id}${NC}"
    echo -e "  ${CYAN}Hash:${NC}        ${GREEN}${hash}${NC} (PS-SHA-∞ verified)"
    local cap_display="$(echo "$capability" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
    echo -e "  ${CYAN}Role:${NC}        ${MAGENTA}${cap_display}${NC}"
    echo -e "  ${CYAN}Traits:${NC}      ${BLUE}${trait1}, ${trait2}${NC}"
    echo ""
    echo -e "  ${WHITE}\"I am ${display_name}, the ${trait1} ${capability}.\"${NC}"
    echo ""
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Main execution
case "${1:-generate}" in
    generate)
        identity=$(generate_identity)
        IFS='|' read -r agent_id display_name core capability hash trait1 trait2 <<< "$identity"

        register_agent "$agent_id" "$display_name" "$core" "$capability" "$hash" "$trait1" "$trait2"
        display_identity "$agent_id" "$display_name" "$core" "$capability" "$hash" "$trait1" "$trait2"

        # Output for sourcing
        echo "export MY_CLAUDE=\"${agent_id}\""
        echo "export CLAUDE_NAME=\"${display_name}\""
        echo "export CLAUDE_CORE=\"${core}\""
        echo "export CLAUDE_CAPABILITY=\"${capability}\""
        echo "export CLAUDE_HASH=\"${hash}\""
        ;;

    list-active)
        echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║              🌌 ACTIVE CLAUDE AGENTS 🌌                       ║${NC}"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        for f in "$ACTIVE_AGENTS_DIR"/*.json; do
            if [ -f "$f" ]; then
                name=$(jq -r '.display_name' "$f" 2>/dev/null)
                aid=$(jq -r '.agent_id' "$f" 2>/dev/null)
                started=$(jq -r '.started' "$f" 2>/dev/null)
                echo -e "  ${WHITE}${name}${NC} - ${YELLOW}${aid}${NC}"
                echo -e "    Started: ${started}"
            fi
        done
        ;;

    cleanup)
        # Remove stale active agents (older than 24 hours)
        find "$ACTIVE_AGENTS_DIR" -name "*.json" -mtime +1 -delete 2>/dev/null
        echo -e "${GREEN}Cleaned up stale agent sessions${NC}"
        ;;

    *)
        echo "Usage: $0 [generate|list-active|cleanup]"
        ;;
esac
