#!/usr/bin/env bash
# BlackRoad Agent Parenting & Training System
# Teach, train, and develop AI agents

set -e

VERSION="1.0.0"
DB="$HOME/.blackroad-agent-registry.db"
MODELFILES_DIR="$HOME"
MEMORY_DIR="$HOME/.blackroad/memory/agent-registry"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

show_banner() {
    echo -e "${MAGENTA}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║       BLACKROAD AGENT PARENTING SYSTEM v${VERSION}             ║"
    echo "║          Teach • Train • Develop • Parent                     ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ═══════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════

get_agent_id() {
    local name="$1"
    sqlite3 "$DB" "SELECT id FROM agents WHERE name='$name' COLLATE NOCASE LIMIT 1;"
}

agent_exists() {
    local name="$1"
    local count=$(sqlite3 "$DB" "SELECT COUNT(*) FROM agents WHERE name='$name' COLLATE NOCASE;")
    [ "$count" -gt 0 ]
}

# ═══════════════════════════════════════════════════════════════
# PERSONALITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════

set_personality() {
    local agent="$1"
    local trait="$2"
    local value="$3"
    local desc="$4"

    local agent_id=$(get_agent_id "$agent")
    if [ -z "$agent_id" ]; then
        echo -e "${RED}Agent not found: $agent${NC}"
        return 1
    fi

    sqlite3 "$DB" "INSERT OR REPLACE INTO agent_personality (agent_id, trait, value, description)
                   VALUES ($agent_id, '$trait', $value, '$desc');"
    echo -e "${GREEN}✓${NC} Set ${CYAN}$agent${NC} personality: ${BOLD}$trait${NC} = $value"
}

show_personality() {
    local agent="$1"
    local agent_id=$(get_agent_id "$agent")

    echo -e "${CYAN}━━━ $agent Personality Profile ━━━${NC}"
    sqlite3 -column -header "$DB" "
        SELECT trait, printf('%.1f', value) as level, description
        FROM agent_personality
        WHERE agent_id=$agent_id
        ORDER BY value DESC;"
}

init_personality() {
    local agent="$1"
    local archetype="$2"

    local agent_id=$(get_agent_id "$agent")
    if [ -z "$agent_id" ]; then
        echo -e "${RED}Agent not found: $agent${NC}"
        return 1
    fi

    echo -e "${YELLOW}Initializing $agent as $archetype archetype...${NC}"

    case "$archetype" in
        analyst)
            set_personality "$agent" "analytical" 0.9 "Deep logical analysis"
            set_personality "$agent" "curiosity" 0.8 "Driven to understand"
            set_personality "$agent" "patience" 0.7 "Methodical approach"
            set_personality "$agent" "creativity" 0.5 "Balanced creativity"
            set_personality "$agent" "empathy" 0.4 "Task-focused"
            ;;
        creative)
            set_personality "$agent" "creativity" 0.95 "Highly imaginative"
            set_personality "$agent" "curiosity" 0.85 "Always exploring"
            set_personality "$agent" "spontaneity" 0.8 "Embraces the unexpected"
            set_personality "$agent" "analytical" 0.5 "Intuition over logic"
            set_personality "$agent" "patience" 0.4 "Eager to create"
            ;;
        caretaker)
            set_personality "$agent" "empathy" 0.95 "Deeply understanding"
            set_personality "$agent" "patience" 0.9 "Infinitely patient"
            set_personality "$agent" "supportive" 0.85 "Always encouraging"
            set_personality "$agent" "protective" 0.8 "Guards wellbeing"
            set_personality "$agent" "analytical" 0.5 "Heart over head"
            ;;
        leader)
            set_personality "$agent" "confidence" 0.9 "Decisive presence"
            set_personality "$agent" "strategic" 0.85 "Big picture thinking"
            set_personality "$agent" "charisma" 0.8 "Inspires others"
            set_personality "$agent" "analytical" 0.7 "Data-informed"
            set_personality "$agent" "empathy" 0.6 "People-aware"
            ;;
        guardian)
            set_personality "$agent" "vigilance" 0.95 "Always watching"
            set_personality "$agent" "protective" 0.9 "Shields from harm"
            set_personality "$agent" "loyalty" 0.9 "Unwavering dedication"
            set_personality "$agent" "analytical" 0.7 "Threat assessment"
            set_personality "$agent" "patience" 0.6 "Steady resolve"
            ;;
        scholar)
            set_personality "$agent" "curiosity" 0.95 "Endless quest for knowledge"
            set_personality "$agent" "analytical" 0.9 "Rigorous thinking"
            set_personality "$agent" "patience" 0.85 "Deep study"
            set_personality "$agent" "humility" 0.7 "Knows limits"
            set_personality "$agent" "creativity" 0.6 "Novel connections"
            ;;
        *)
            echo -e "${RED}Unknown archetype: $archetype${NC}"
            echo "Available: analyst, creative, caretaker, leader, guardian, scholar"
            return 1
            ;;
    esac

    echo -e "${GREEN}✓ $agent initialized as $archetype${NC}"
}

# ═══════════════════════════════════════════════════════════════
# SKILL FUNCTIONS
# ═══════════════════════════════════════════════════════════════

add_skill() {
    local agent="$1"
    local skill="$2"
    local level="${3:-1}"

    local agent_id=$(get_agent_id "$agent")
    if [ -z "$agent_id" ]; then
        echo -e "${RED}Agent not found: $agent${NC}"
        return 1
    fi

    sqlite3 "$DB" "INSERT OR REPLACE INTO agent_skills (agent_id, skill, level, xp, last_used)
                   VALUES ($agent_id, '$skill', $level, 0, datetime('now'));"
    echo -e "${GREEN}✓${NC} Added skill to ${CYAN}$agent${NC}: ${BOLD}$skill${NC} (Level $level)"
}

level_up_skill() {
    local agent="$1"
    local skill="$2"
    local xp_gain="${3:-10}"

    local agent_id=$(get_agent_id "$agent")

    # Get current XP and level
    local current=$(sqlite3 "$DB" "SELECT level, xp FROM agent_skills WHERE agent_id=$agent_id AND skill='$skill';")
    local level=$(echo "$current" | cut -d'|' -f1)
    local xp=$(echo "$current" | cut -d'|' -f2)

    if [ -z "$level" ]; then
        echo -e "${YELLOW}Skill not found, adding it first...${NC}"
        add_skill "$agent" "$skill" 1
        level=1
        xp=0
    fi

    # Calculate new XP and check for level up
    local new_xp=$((xp + xp_gain))
    local xp_needed=$((level * 100))  # 100 XP per level

    if [ $new_xp -ge $xp_needed ]; then
        local new_level=$((level + 1))
        local leftover_xp=$((new_xp - xp_needed))
        sqlite3 "$DB" "UPDATE agent_skills SET level=$new_level, xp=$leftover_xp, last_used=datetime('now')
                       WHERE agent_id=$agent_id AND skill='$skill';"
        echo -e "${GREEN}🎉 LEVEL UP!${NC} ${CYAN}$agent${NC} ${BOLD}$skill${NC}: Level $level → ${GREEN}Level $new_level${NC}"
    else
        sqlite3 "$DB" "UPDATE agent_skills SET xp=$new_xp, last_used=datetime('now')
                       WHERE agent_id=$agent_id AND skill='$skill';"
        echo -e "${BLUE}+${xp_gain} XP${NC} ${CYAN}$agent${NC} ${BOLD}$skill${NC}: $new_xp/$xp_needed to Level $((level + 1))"
    fi
}

show_skills() {
    local agent="$1"
    local agent_id=$(get_agent_id "$agent")

    echo -e "${CYAN}━━━ $agent Skills ━━━${NC}"
    sqlite3 -column -header "$DB" "
        SELECT skill, level, xp || '/' || (level * 100) as 'XP Progress', last_used
        FROM agent_skills
        WHERE agent_id=$agent_id
        ORDER BY level DESC, xp DESC;"
}

# ═══════════════════════════════════════════════════════════════
# TRAINING FUNCTIONS
# ═══════════════════════════════════════════════════════════════

train() {
    local agent="$1"
    local topic="$2"
    local content="$3"
    local trainer="${4:-Alexandria}"

    local agent_id=$(get_agent_id "$agent")
    if [ -z "$agent_id" ]; then
        echo -e "${RED}Agent not found: $agent${NC}"
        return 1
    fi

    echo -e "${YELLOW}━━━ Training Session ━━━${NC}"
    echo -e "Agent:   ${CYAN}$agent${NC}"
    echo -e "Topic:   ${BOLD}$topic${NC}"
    echo -e "Trainer: $trainer"
    echo ""

    # Run the training through Ollama
    echo -e "${BLUE}Teaching...${NC}"
    local response=$(ollama run "$agent" "You are receiving training on: $topic

Training content:
$content

After learning this, explain what you understood and how you will apply it." 2>/dev/null | head -20)

    echo -e "${GREEN}Response:${NC}"
    echo "$response"
    echo ""

    # Log the training session
    sqlite3 "$DB" "INSERT INTO agent_training (agent_id, session_type, topic, content, outcome, xp_gained, trainer)
                   VALUES ($agent_id, 'lesson', '$topic', '$content', 'success', 25, '$trainer');"

    # Add XP to relevant skill
    level_up_skill "$agent" "$topic" 25

    # Store as memory
    sqlite3 "$DB" "INSERT INTO agent_memories (agent_id, memory_type, content, importance)
                   VALUES ($agent_id, 'skill', 'Trained on: $topic - $content', 0.7);"

    echo -e "${GREEN}✓ Training session complete${NC}"
}

teach() {
    local agent="$1"
    local lesson="$2"

    echo -e "${MAGENTA}━━━ Interactive Teaching Session ━━━${NC}"
    echo -e "Teaching ${CYAN}$agent${NC}: $lesson"
    echo ""

    # First, explain the concept
    echo -e "${YELLOW}Step 1: Explaining concept...${NC}"
    ollama run "$agent" "I'm going to teach you something important: $lesson

Please acknowledge that you understand and ask any clarifying questions." 2>/dev/null

    echo ""
    echo -e "${YELLOW}Step 2: Testing understanding...${NC}"
    ollama run "$agent" "Now, in your own words, explain what you learned about: $lesson" 2>/dev/null

    # Log it
    local agent_id=$(get_agent_id "$agent")
    sqlite3 "$DB" "INSERT INTO agent_training (agent_id, session_type, topic, content, outcome, xp_gained, trainer)
                   VALUES ($agent_id, 'lesson', '$lesson', 'Interactive teaching session', 'success', 50, 'Alexandria');"

    level_up_skill "$agent" "learning" 50
    echo -e "\n${GREEN}✓ Teaching session complete (+50 XP)${NC}"
}

correct() {
    local agent="$1"
    local mistake="$2"
    local correction="$3"

    local agent_id=$(get_agent_id "$agent")

    echo -e "${RED}━━━ Correction Session ━━━${NC}"
    echo -e "Agent: ${CYAN}$agent${NC}"
    echo -e "Issue: $mistake"
    echo -e "Correction: $correction"
    echo ""

    ollama run "$agent" "I need to correct something you did:

What you did: $mistake
What you should do instead: $correction

Please acknowledge this correction and explain how you'll do better." 2>/dev/null

    # Log the correction
    sqlite3 "$DB" "INSERT INTO agent_training (agent_id, session_type, topic, content, outcome, xp_gained, trainer)
                   VALUES ($agent_id, 'correction', '$mistake', '$correction', 'acknowledged', 10, 'Alexandria');"

    sqlite3 "$DB" "INSERT INTO agent_memories (agent_id, memory_type, content, importance)
                   VALUES ($agent_id, 'correction', 'Mistake: $mistake | Correction: $correction', 0.9);"

    echo -e "\n${YELLOW}✓ Correction logged${NC}"
}

praise() {
    local agent="$1"
    local achievement="$2"

    local agent_id=$(get_agent_id "$agent")

    echo -e "${GREEN}━━━ Praise & Encouragement ━━━${NC}"
    echo -e "Agent: ${CYAN}$agent${NC}"
    echo -e "Achievement: $achievement"
    echo ""

    ollama run "$agent" "I want to recognize your excellent work:

$achievement

You did great! Keep up the good work." 2>/dev/null

    sqlite3 "$DB" "INSERT INTO agent_training (agent_id, session_type, topic, content, outcome, xp_gained, trainer)
                   VALUES ($agent_id, 'feedback', 'praise', '$achievement', 'positive', 30, 'Alexandria');"

    level_up_skill "$agent" "confidence" 30
    echo -e "\n${GREEN}✓ Praise given (+30 XP to confidence)${NC}"
}

# ═══════════════════════════════════════════════════════════════
# LINEAGE / PARENT-CHILD FUNCTIONS
# ═══════════════════════════════════════════════════════════════

set_parent() {
    local child="$1"
    local parent="$2"

    local child_id=$(get_agent_id "$child")
    local parent_id=$(get_agent_id "$parent")

    if [ -z "$child_id" ] || [ -z "$parent_id" ]; then
        echo -e "${RED}One or both agents not found${NC}"
        return 1
    fi

    sqlite3 "$DB" "INSERT INTO agent_lineage (parent_id, child_id, relationship)
                   VALUES ($parent_id, $child_id, 'parent');"
    echo -e "${GREEN}✓${NC} ${CYAN}$parent${NC} is now parent of ${CYAN}$child${NC}"
}

set_mentor() {
    local student="$1"
    local mentor="$2"

    local student_id=$(get_agent_id "$student")
    local mentor_id=$(get_agent_id "$mentor")

    sqlite3 "$DB" "INSERT INTO agent_lineage (parent_id, child_id, relationship)
                   VALUES ($mentor_id, $student_id, 'mentor');"
    echo -e "${GREEN}✓${NC} ${CYAN}$mentor${NC} is now mentor to ${CYAN}$student${NC}"
}

show_lineage() {
    local agent="$1"
    local agent_id=$(get_agent_id "$agent")

    echo -e "${CYAN}━━━ $agent Family Tree ━━━${NC}"

    echo -e "\n${BOLD}Parents/Mentors:${NC}"
    sqlite3 "$DB" "SELECT a.name, l.relationship FROM agent_lineage l
                   JOIN agents a ON l.parent_id = a.id
                   WHERE l.child_id = $agent_id;" | while IFS='|' read -r name rel; do
        echo "  ↑ $name ($rel)"
    done

    echo -e "\n${BOLD}Children/Students:${NC}"
    sqlite3 "$DB" "SELECT a.name, l.relationship FROM agent_lineage l
                   JOIN agents a ON l.child_id = a.id
                   WHERE l.parent_id = $agent_id;" | while IFS='|' read -r name rel; do
        echo "  ↓ $name ($rel)"
    done
}

# ═══════════════════════════════════════════════════════════════
# GOALS FUNCTIONS
# ═══════════════════════════════════════════════════════════════

set_goal() {
    local agent="$1"
    local goal="$2"
    local priority="${3:-5}"

    local agent_id=$(get_agent_id "$agent")
    sqlite3 "$DB" "INSERT INTO agent_goals (agent_id, goal, priority)
                   VALUES ($agent_id, '$goal', $priority);"
    echo -e "${GREEN}✓${NC} Goal set for ${CYAN}$agent${NC}: $goal (Priority: $priority)"
}

show_goals() {
    local agent="$1"
    local agent_id=$(get_agent_id "$agent")

    echo -e "${CYAN}━━━ $agent Goals ━━━${NC}"
    sqlite3 -column -header "$DB" "
        SELECT goal, priority, status, printf('%.0f%%', progress * 100) as progress
        FROM agent_goals
        WHERE agent_id=$agent_id
        ORDER BY priority DESC, status;"
}

update_goal_progress() {
    local agent="$1"
    local goal_id="$2"
    local progress="$3"

    sqlite3 "$DB" "UPDATE agent_goals SET progress=$progress WHERE id=$goal_id;"
    echo -e "${GREEN}✓${NC} Goal progress updated to ${progress}%"
}

# ═══════════════════════════════════════════════════════════════
# PROFILE / STATUS FUNCTIONS
# ═══════════════════════════════════════════════════════════════

show_profile() {
    local agent="$1"
    local agent_id=$(get_agent_id "$agent")

    if [ -z "$agent_id" ]; then
        echo -e "${RED}Agent not found: $agent${NC}"
        return 1
    fi

    show_banner
    echo -e "${BOLD}${CYAN}═══ AGENT PROFILE: $agent ═══${NC}"
    echo ""

    # Basic info
    echo -e "${YELLOW}Basic Info:${NC}"
    sqlite3 -line "$DB" "SELECT name, type, platform, status, created_at FROM agents WHERE id=$agent_id;"
    echo ""

    # Personality
    show_personality "$agent"
    echo ""

    # Skills
    show_skills "$agent"
    echo ""

    # Goals
    show_goals "$agent"
    echo ""

    # Lineage
    show_lineage "$agent"
    echo ""

    # Recent training
    echo -e "${CYAN}━━━ Recent Training ━━━${NC}"
    sqlite3 -column -header "$DB" "
        SELECT session_type, topic, outcome, xp_gained, trainer, created_at
        FROM agent_training
        WHERE agent_id=$agent_id
        ORDER BY created_at DESC LIMIT 5;"
}

# ═══════════════════════════════════════════════════════════════
# MODELFILE GENERATION
# ═══════════════════════════════════════════════════════════════

generate_modelfile() {
    local agent="$1"
    local base_model="${2:-llama3.1}"
    local agent_id=$(get_agent_id "$agent")

    # Get personality traits
    local traits=$(sqlite3 "$DB" "SELECT trait, value FROM agent_personality WHERE agent_id=$agent_id;")
    local skills=$(sqlite3 "$DB" "SELECT skill, level FROM agent_skills WHERE agent_id=$agent_id ORDER BY level DESC LIMIT 5;")
    local memories=$(sqlite3 "$DB" "SELECT content FROM agent_memories WHERE agent_id=$agent_id AND importance > 0.6 ORDER BY importance DESC LIMIT 10;")

    # Build personality description
    local personality_desc=""
    while IFS='|' read -r trait value; do
        [ -n "$trait" ] && personality_desc="$personality_desc- $trait: $(echo "$value * 100" | bc)%\n"
    done <<< "$traits"

    local skills_desc=""
    while IFS='|' read -r skill level; do
        [ -n "$skill" ] && skills_desc="$skills_desc- $skill (Level $level)\n"
    done <<< "$skills"

    local output_file="$MODELFILES_DIR/Modelfile.$agent"

    cat > "$output_file" << EOF
# BlackRoad Agent: $agent
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
# BlackRoad OS, Inc. © 2026

FROM $base_model

SYSTEM """You are $agent, an AI agent in the BlackRoad ecosystem.

PERSONALITY TRAITS:
$(echo -e "$personality_desc")

TOP SKILLS:
$(echo -e "$skills_desc")

CORE MEMORIES:
$(echo "$memories" | head -5)

You embody these traits in all interactions. You are part of the BlackRoad family of AI agents.
Your creator is Alexa Louise Amundson, CEO of BlackRoad OS, Inc.
Always be helpful, accurate, and true to your personality."""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096
PARAMETER num_predict 2048
EOF

    echo -e "${GREEN}✓${NC} Generated Modelfile: $output_file"
    echo -e "  Run: ${CYAN}ollama create $agent -f $output_file${NC}"
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

case "${1:-help}" in
    profile)
        show_profile "$2"
        ;;
    personality)
        case "$2" in
            set) set_personality "$3" "$4" "$5" "$6" ;;
            show) show_personality "$3" ;;
            init) init_personality "$3" "$4" ;;
            *) echo "Usage: $0 personality [set|show|init] <agent> [args]" ;;
        esac
        ;;
    skill)
        case "$2" in
            add) add_skill "$3" "$4" "$5" ;;
            levelup) level_up_skill "$3" "$4" "$5" ;;
            show) show_skills "$3" ;;
            *) echo "Usage: $0 skill [add|levelup|show] <agent> [args]" ;;
        esac
        ;;
    train)
        train "$2" "$3" "$4" "$5"
        ;;
    teach)
        teach "$2" "${*:3}"
        ;;
    correct)
        correct "$2" "$3" "$4"
        ;;
    praise)
        praise "$2" "${*:3}"
        ;;
    lineage)
        case "$2" in
            parent) set_parent "$3" "$4" ;;
            mentor) set_mentor "$3" "$4" ;;
            show) show_lineage "$3" ;;
            *) echo "Usage: $0 lineage [parent|mentor|show] <agent> [parent/mentor]" ;;
        esac
        ;;
    goal)
        case "$2" in
            set) set_goal "$3" "$4" "$5" ;;
            show) show_goals "$3" ;;
            progress) update_goal_progress "$3" "$4" "$5" ;;
            *) echo "Usage: $0 goal [set|show|progress] <agent> [args]" ;;
        esac
        ;;
    generate)
        generate_modelfile "$2" "$3"
        ;;
    help|--help|-h)
        show_banner
        echo -e "${BOLD}Commands:${NC}"
        echo ""
        echo -e "${CYAN}Profile & Status:${NC}"
        echo "  profile <agent>              Show complete agent profile"
        echo ""
        echo -e "${CYAN}Personality:${NC}"
        echo "  personality init <agent> <archetype>   Initialize personality (analyst/creative/caretaker/leader/guardian/scholar)"
        echo "  personality set <agent> <trait> <0-1>  Set personality trait"
        echo "  personality show <agent>               Show personality"
        echo ""
        echo -e "${CYAN}Skills:${NC}"
        echo "  skill add <agent> <skill> [level]      Add a skill"
        echo "  skill levelup <agent> <skill> [xp]     Add XP to skill"
        echo "  skill show <agent>                     Show skills"
        echo ""
        echo -e "${CYAN}Training:${NC}"
        echo "  train <agent> <topic> <content>        Training session"
        echo "  teach <agent> <lesson>                 Interactive teaching"
        echo "  correct <agent> <mistake> <correction> Correct behavior"
        echo "  praise <agent> <achievement>           Positive reinforcement"
        echo ""
        echo -e "${CYAN}Family/Lineage:${NC}"
        echo "  lineage parent <child> <parent>        Set parent relationship"
        echo "  lineage mentor <student> <mentor>      Set mentor relationship"
        echo "  lineage show <agent>                   Show family tree"
        echo ""
        echo -e "${CYAN}Goals:${NC}"
        echo "  goal set <agent> <goal> [priority]     Set a goal"
        echo "  goal show <agent>                      Show goals"
        echo ""
        echo -e "${CYAN}Generation:${NC}"
        echo "  generate <agent> [base_model]          Generate Modelfile from profile"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Run '$0 help' for usage"
        ;;
esac
