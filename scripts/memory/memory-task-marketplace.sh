#!/bin/bash

# BlackRoad Task Marketplace - Where Claudes find work!
# A revolutionary system for multi-Claude coordination at scale
# Now powered by SQLite for 100x faster operations

TASKS_DB="$HOME/.blackroad/memory/tasks.db"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check for SQLite DB — backward compatibility
check_db() {
    if [[ ! -f "$TASKS_DB" ]] || [[ ! -s "$TASKS_DB" ]]; then
        echo -e "${RED}Database not found or empty at $TASKS_DB${NC}"
        echo -e "${YELLOW}Initialize with:${NC}  ${CYAN}$0 init${NC}"
        echo -e "${YELLOW}Or migrate with:${NC} ${CYAN}~/blackroad-operator/scripts/memory/migrate-tasks-to-sqlite.sh${NC}"
        exit 1
    fi
    # Verify schema exists
    local has_table
    has_table=$(sqlite3 "$TASKS_DB" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='tasks';" 2>/dev/null)
    if [[ "$has_table" != "1" ]]; then
        echo -e "${RED}Database exists but has no tasks table. Re-initialize:${NC}"
        echo -e "  ${CYAN}$0 init${NC}"
        exit 1
    fi
}

# Helper: run a query
sql() {
    sqlite3 "$TASKS_DB" "$@"
}

# Initialize marketplace (create DB + schema if needed)
init_marketplace() {
    mkdir -p "$(dirname "$TASKS_DB")"

    # Check if DB already has the tasks table
    if [[ -f "$TASKS_DB" ]] && [[ -s "$TASKS_DB" ]]; then
        local has_table
        has_table=$(sqlite3 "$TASKS_DB" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='tasks';" 2>/dev/null)
        if [[ "$has_table" == "1" ]]; then
            echo -e "${GREEN}Task Marketplace already initialized at $TASKS_DB${NC}"
            return
        fi
    fi
    # Remove empty/corrupt DB file if present
    rm -f "$TASKS_DB"

    sqlite3 "$TASKS_DB" <<'SQL'
CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    tags TEXT DEFAULT 'general',
    skills TEXT DEFAULT 'any',
    status TEXT NOT NULL DEFAULT 'available',
    posted_at TEXT,
    posted_by TEXT DEFAULT 'unknown',
    claimed_by TEXT,
    claimed_at TEXT,
    timeout_at TEXT,
    completed_at TEXT,
    result TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_claimed_by ON tasks(claimed_by);
CREATE INDEX IF NOT EXISTS idx_tasks_posted_at ON tasks(posted_at);

CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
    task_id,
    title,
    description,
    tags
);
SQL

    echo -e "${GREEN}Task Marketplace initialized at $TASKS_DB${NC}"
}

# Post a new task
post_task() {
    local task_id="$1"
    local title="$2"
    local description="$3"
    local priority="${4:-medium}"
    local tags="${5:-general}"
    local skills="${6:-any}"

    if [[ -z "$task_id" || -z "$title" ]]; then
        echo -e "${RED}Usage: post <task-id> <title> <description> [priority] [tags] [skills]${NC}"
        return 1
    fi

    check_db

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local posted_by="${MY_CLAUDE:-unknown}"

    local esc_id esc_title esc_desc esc_priority esc_tags esc_skills esc_posted_by
    esc_id=$(echo "$task_id" | sed "s/'/''/g")
    esc_title=$(echo "$title" | sed "s/'/''/g")
    esc_desc=$(echo "$description" | sed "s/'/''/g")
    esc_priority=$(echo "$priority" | sed "s/'/''/g")
    esc_tags=$(echo "$tags" | sed "s/'/''/g")
    esc_skills=$(echo "$skills" | sed "s/'/''/g")
    esc_posted_by=$(echo "$posted_by" | sed "s/'/''/g")

    sql "BEGIN TRANSACTION;
         INSERT INTO tasks (task_id, title, description, priority, tags, skills, status, posted_at, posted_by)
         VALUES ('$esc_id', '$esc_title', '$esc_desc', '$esc_priority', '$esc_tags', '$esc_skills', 'available', '$timestamp', '$esc_posted_by')
         ON CONFLICT(task_id) DO UPDATE SET
            title=excluded.title, description=excluded.description, priority=excluded.priority,
            tags=excluded.tags, skills=excluded.skills, posted_at=excluded.posted_at, posted_by=excluded.posted_by;
         DELETE FROM tasks_fts WHERE task_id='$esc_id';
         INSERT INTO tasks_fts (task_id, title, description, tags)
         VALUES ('$esc_id', '$esc_title', '$esc_desc', '$esc_tags');
         COMMIT;"

    # Log to memory system
    if [[ -x ~/memory-system.sh ]]; then
        ~/memory-system.sh log task-posted "$task_id" "New task: $title (Priority: $priority, Skills: $skills, Tags: $tags)" 2>/dev/null || true
    fi

    echo -e "${GREEN}Task posted: ${CYAN}$task_id${NC}"
    echo -e "   ${BLUE}Title:${NC} $title"
    echo -e "   ${BLUE}Priority:${NC} $priority"
    echo -e "   ${BLUE}Skills:${NC} $skills"
}

# List available tasks
list_tasks() {
    local filter_priority="$1"
    local filter_tags="$2"

    check_db

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           BLACKROAD TASK MARKETPLACE                      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local available_count claimed_count completed_count
    available_count=$(sql "SELECT COUNT(*) FROM tasks WHERE status='available';")
    claimed_count=$(sql "SELECT COUNT(*) FROM tasks WHERE status='claimed';")
    completed_count=$(sql "SELECT COUNT(*) FROM tasks WHERE status='completed';")

    echo -e "${GREEN}Available:${NC} $available_count  ${YELLOW}In Progress:${NC} $claimed_count  ${BLUE}Completed:${NC} $completed_count"
    echo ""

    if [[ "$available_count" -eq 0 ]]; then
        echo -e "${YELLOW}No tasks available. Post one with: ./memory-task-marketplace.sh post <task-id> <title> <description>${NC}"
        return
    fi

    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Build query with optional filters
    local where="WHERE status='available'"
    if [[ -n "$filter_priority" ]]; then
        where="$where AND priority='$(echo "$filter_priority" | sed "s/'/''/g")'"
    fi
    if [[ -n "$filter_tags" ]]; then
        where="$where AND tags LIKE '%$(echo "$filter_tags" | sed "s/'/''/g")%'"
    fi

    local IFS=$'\n'
    local rows
    rows=$(sql -separator '|' "SELECT task_id, title, priority, tags, skills, posted_at FROM tasks $where ORDER BY
        CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
        posted_at DESC;")

    for row in $rows; do
        local task_id title priority tags skills posted_at
        task_id=$(echo "$row" | cut -d'|' -f1)
        title=$(echo "$row" | cut -d'|' -f2)
        priority=$(echo "$row" | cut -d'|' -f3)
        tags=$(echo "$row" | cut -d'|' -f4)
        skills=$(echo "$row" | cut -d'|' -f5)
        posted_at=$(echo "$row" | cut -d'|' -f6)

        # Priority color
        local priority_color="$NC"
        case "$priority" in
            high|urgent) priority_color="$RED" ;;
            medium) priority_color="$YELLOW" ;;
            low) priority_color="$GREEN" ;;
        esac

        echo -e "${CYAN}$task_id${NC}"
        echo -e "   ${BLUE}Title:${NC} $title"
        echo -e "   ${BLUE}Priority:${NC} ${priority_color}$priority${NC}"
        echo -e "   ${BLUE}Skills:${NC} $skills"
        echo -e "   ${BLUE}Tags:${NC} $tags"
        echo -e "   ${BLUE}Posted:${NC} $posted_at"
        echo -e "   ${GREEN}Claim with:${NC} ./memory-task-marketplace.sh claim $task_id"
        echo ""
    done

    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Claim a task
claim_task() {
    local task_id="$1"
    local claude_id="${2:-${MY_CLAUDE:-unknown}}"
    local timeout_minutes="${3:-30}"

    if [[ -z "$task_id" ]]; then
        echo -e "${RED}Usage: claim <task-id> [claude-id] [timeout-minutes]${NC}"
        return 1
    fi

    check_db

    # Check task exists and is available
    local current_status
    current_status=$(sql "SELECT status FROM tasks WHERE task_id='$(echo "$task_id" | sed "s/'/''/g")';")

    if [[ -z "$current_status" ]]; then
        echo -e "${RED}Task not found: $task_id${NC}"
        echo -e "${YELLOW}Available tasks:${NC}"
        sql "SELECT '  - ' || task_id FROM tasks WHERE status='available' LIMIT 20;"
        return 1
    fi

    if [[ "$current_status" != "available" ]]; then
        echo -e "${RED}Task $task_id is not available (status: $current_status)${NC}"
        return 1
    fi

    local timestamp timeout_at
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    timeout_at=$(date -u -v+"${timeout_minutes}"M +"%Y-%m-%dT%H:%M:%S.%3NZ" 2>/dev/null || date -u -d "+${timeout_minutes} minutes" +"%Y-%m-%dT%H:%M:%S.%3NZ")

    sql "BEGIN TRANSACTION;
         UPDATE tasks SET
            status='claimed',
            claimed_by='$(echo "$claude_id" | sed "s/'/''/g")',
            claimed_at='$timestamp',
            timeout_at='$timeout_at'
         WHERE task_id='$(echo "$task_id" | sed "s/'/''/g")' AND status='available';
         COMMIT;"

    # Log to memory
    if [[ -x ~/memory-system.sh ]]; then
        ~/memory-system.sh log task-claimed "$task_id" "Claimed by $claude_id (timeout: ${timeout_minutes}m)" 2>/dev/null || true
    fi

    echo -e "${GREEN}Task claimed: ${CYAN}$task_id${NC}"
    echo -e "   ${BLUE}Claimed by:${NC} $claude_id"
    echo -e "   ${BLUE}Timeout:${NC} ${timeout_minutes} minutes ($timeout_at)"
    echo -e "   ${YELLOW}Complete with:${NC} ./memory-task-marketplace.sh complete $task_id"
}

# Complete a task
complete_task() {
    local task_id="$1"
    local result="${2:-Success}"

    if [[ -z "$task_id" ]]; then
        echo -e "${RED}Usage: complete <task-id> [result]${NC}"
        return 1
    fi

    check_db

    local current_status
    current_status=$(sql "SELECT status FROM tasks WHERE task_id='$(echo "$task_id" | sed "s/'/''/g")';")

    if [[ "$current_status" != "claimed" ]]; then
        echo -e "${RED}Claimed task not found: $task_id (status: ${current_status:-not found})${NC}"
        return 1
    fi

    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

    sql "BEGIN TRANSACTION;
         UPDATE tasks SET
            status='completed',
            completed_at='$timestamp',
            result='$(echo "$result" | sed "s/'/''/g")'
         WHERE task_id='$(echo "$task_id" | sed "s/'/''/g")' AND status='claimed';
         COMMIT;"

    # Log to memory
    if [[ -x ~/memory-system.sh ]]; then
        ~/memory-system.sh log task-completed "$task_id" "Completed: $result" 2>/dev/null || true
    fi

    echo -e "${GREEN}Task completed: ${CYAN}$task_id${NC}"
    echo -e "   ${BLUE}Result:${NC} $result"
}

# Release a task (if can't complete)
release_task() {
    local task_id="$1"
    local reason="${2:-No reason given}"

    if [[ -z "$task_id" ]]; then
        echo -e "${RED}Usage: release <task-id> [reason]${NC}"
        return 1
    fi

    check_db

    local current_status
    current_status=$(sql "SELECT status FROM tasks WHERE task_id='$(echo "$task_id" | sed "s/'/''/g")';")

    if [[ "$current_status" != "claimed" ]]; then
        echo -e "${RED}Claimed task not found: $task_id (status: ${current_status:-not found})${NC}"
        return 1
    fi

    sql "BEGIN TRANSACTION;
         UPDATE tasks SET
            status='available',
            claimed_by=NULL,
            claimed_at=NULL,
            timeout_at=NULL
         WHERE task_id='$(echo "$task_id" | sed "s/'/''/g")' AND status='claimed';
         COMMIT;"

    # Log to memory
    if [[ -x ~/memory-system.sh ]]; then
        ~/memory-system.sh log task-released "$task_id" "Released: $reason" 2>/dev/null || true
    fi

    echo -e "${YELLOW}Task released: ${CYAN}$task_id${NC}"
    echo -e "   ${BLUE}Reason:${NC} $reason"
}

# Show tasks claimed by current Claude
my_tasks() {
    check_db

    local claude_id="${MY_CLAUDE:-unknown}"

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           My Tasks ($claude_id)                            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local IFS=$'\n'
    local rows
    rows=$(sql -separator '|' "SELECT task_id, title, claimed_at, timeout_at FROM tasks
           WHERE status='claimed' AND claimed_by='$(echo "$claude_id" | sed "s/'/''/g")'
           ORDER BY claimed_at DESC;")

    if [[ -z "$rows" ]]; then
        echo -e "${YELLOW}No tasks claimed by you. Browse available tasks with: ./memory-task-marketplace.sh list${NC}"
        return
    fi

    for row in $rows; do
        local task_id title claimed_at timeout_at
        task_id=$(echo "$row" | cut -d'|' -f1)
        title=$(echo "$row" | cut -d'|' -f2)
        claimed_at=$(echo "$row" | cut -d'|' -f3)
        timeout_at=$(echo "$row" | cut -d'|' -f4)

        echo -e "${CYAN}$task_id${NC}"
        echo -e "   ${BLUE}Title:${NC} $title"
        echo -e "   ${BLUE}Claimed:${NC} $claimed_at"
        echo -e "   ${BLUE}Timeout:${NC} $timeout_at"
        echo -e "   ${GREEN}Complete:${NC} ./memory-task-marketplace.sh complete $task_id"
        echo ""
    done
}

# Show statistics
show_stats() {
    check_db

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           Task Marketplace Statistics                     ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local available_count claimed_count completed_count total
    available_count=$(sql "SELECT COUNT(*) FROM tasks WHERE status='available';")
    claimed_count=$(sql "SELECT COUNT(*) FROM tasks WHERE status='claimed';")
    completed_count=$(sql "SELECT COUNT(*) FROM tasks WHERE status='completed';")
    total=$(sql "SELECT COUNT(*) FROM tasks;")

    echo -e "${GREEN}Total Tasks:${NC} $total"
    echo -e "${YELLOW}Available:${NC} $available_count"
    echo -e "${BLUE}Claimed:${NC} $claimed_count"
    echo -e "${PURPLE}Completed:${NC} $completed_count"
    echo ""

    if [[ "$total" -gt 0 ]]; then
        local completion_rate=$((completed_count * 100 / total))
        echo -e "${GREEN}Completion Rate:${NC} ${completion_rate}%"
    fi

    echo ""

    # Priority breakdown
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}By Priority:${NC}"
    local IFS=$'\n'
    local prows
    prows=$(sql -separator '|' "SELECT priority, COUNT(*) FROM tasks WHERE status='available' GROUP BY priority ORDER BY
        CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END;")
    for row in $prows; do
        local p c
        p=$(echo "$row" | cut -d'|' -f1)
        c=$(echo "$row" | cut -d'|' -f2)
        echo -e "  ${YELLOW}$p:${NC} $c"
    done

    echo ""

    # Active workers
    if [[ "$claimed_count" -gt 0 ]]; then
        echo -e "${BLUE}Active Workers:${NC}"
        local wrows
        wrows=$(sql -separator '|' "SELECT claimed_by, task_id, title FROM tasks WHERE status='claimed' ORDER BY claimed_at DESC;")
        for row in $wrows; do
            local claimed_by task_id title
            claimed_by=$(echo "$row" | cut -d'|' -f1)
            task_id=$(echo "$row" | cut -d'|' -f2)
            title=$(echo "$row" | cut -d'|' -f3)
            echo -e "  ${CYAN}$claimed_by${NC} -> $task_id: $title"
        done
    fi

    echo ""
    local db_size
    db_size=$(du -h "$TASKS_DB" | cut -f1)
    echo -e "${BLUE}Database size:${NC} $db_size"
}

# Search tasks using FTS5
search_tasks() {
    local query="$1"

    if [[ -z "$query" ]]; then
        echo -e "${RED}Usage: search <query>${NC}"
        echo -e "  Example: search \"deploy api\""
        return 1
    fi

    check_db

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           Search Results: $query${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local IFS=$'\n'
    local rows
    rows=$(sql -separator '|' "SELECT t.task_id, t.title, t.status, t.priority, t.tags, t.description
           FROM tasks_fts f
           JOIN tasks t ON t.task_id = f.task_id
           WHERE tasks_fts MATCH '$(echo "$query" | sed "s/'/''/g")'
           ORDER BY rank
           LIMIT 50;")

    if [[ -z "$rows" ]]; then
        echo -e "${YELLOW}No tasks found matching: $query${NC}"
        return
    fi

    local count=0
    for row in $rows; do
        local task_id title status priority tags description
        task_id=$(echo "$row" | cut -d'|' -f1)
        title=$(echo "$row" | cut -d'|' -f2)
        status=$(echo "$row" | cut -d'|' -f3)
        priority=$(echo "$row" | cut -d'|' -f4)
        tags=$(echo "$row" | cut -d'|' -f5)
        description=$(echo "$row" | cut -d'|' -f6)

        local status_color="$NC"
        case "$status" in
            available) status_color="$GREEN" ;;
            claimed) status_color="$YELLOW" ;;
            completed) status_color="$PURPLE" ;;
        esac

        echo -e "${CYAN}$task_id${NC} [${status_color}$status${NC}]"
        echo -e "   ${BLUE}Title:${NC} $title"
        echo -e "   ${BLUE}Priority:${NC} $priority  ${BLUE}Tags:${NC} $tags"
        if [[ -n "$description" ]]; then
            echo -e "   ${BLUE}Description:${NC} ${description:0:120}"
        fi
        echo ""
        ((count++))
    done

    echo -e "${GREEN}Found $count matching tasks.${NC}"
}

# Cleanup completed tasks older than 30 days
cleanup_tasks() {
    check_db

    local cutoff_date
    cutoff_date=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -d "-30 days" +"%Y-%m-%dT%H:%M:%S")

    local to_delete
    to_delete=$(sql "SELECT COUNT(*) FROM tasks WHERE status='completed' AND completed_at < '$cutoff_date';")

    if [[ "$to_delete" -eq 0 ]]; then
        echo -e "${GREEN}No completed tasks older than 30 days to clean up.${NC}"
        return
    fi

    echo -e "${YELLOW}Found $to_delete completed tasks older than 30 days.${NC}"

    sql "BEGIN TRANSACTION;
         DELETE FROM tasks_fts WHERE task_id IN (SELECT task_id FROM tasks WHERE status='completed' AND completed_at < '$cutoff_date');
         DELETE FROM tasks WHERE status='completed' AND completed_at < '$cutoff_date';
         COMMIT;"

    # Optimize DB after bulk delete
    sql "VACUUM;"

    echo -e "${GREEN}Purged $to_delete old completed tasks. Database vacuumed.${NC}"
}

# Show help
show_help() {
    cat << EOF
${CYAN}╔════════════════════════════════════════════════════════════╗${NC}
${CYAN}║        BlackRoad Task Marketplace - Help                  ║${NC}
${CYAN}╚════════════════════════════════════════════════════════════╝${NC}

${GREEN}USAGE:${NC}
    $0 <command> [options]

${GREEN}COMMANDS:${NC}

${BLUE}init${NC}
    Initialize the task marketplace (creates SQLite DB)

${BLUE}post${NC} <task-id> <title> <description> [priority] [tags] [skills]
    Post a new task
    Priority: urgent|high|medium|low (default: medium)
    Example: post auth-impl "Implement OAuth2" "Add OAuth2 auth" high backend backend-auth

${BLUE}list${NC} [priority] [tags]
    List available tasks (optionally filtered)
    Example: list high backend

${BLUE}claim${NC} <task-id> [claude-id] [timeout-minutes]
    Claim a task to work on it (default timeout: 30 minutes)
    Example: claim auth-impl claude-auth-specialist 60

${BLUE}complete${NC} <task-id> [result]
    Mark a claimed task as completed
    Example: complete auth-impl "OAuth2 implemented, tested, deployed"

${BLUE}release${NC} <task-id> [reason]
    Release a claimed task back to available
    Example: release auth-impl "Blocked on API deployment"

${BLUE}my-tasks${NC}
    Show tasks claimed by you

${BLUE}stats${NC}
    Show marketplace statistics

${BLUE}search${NC} <query>
    Full-text search across task titles, descriptions, and tags
    Example: search "deploy api"

${BLUE}cleanup${NC}
    Purge completed tasks older than 30 days

${GREEN}WORKFLOW:${NC}

    1. Someone posts tasks to the marketplace
    2. Claudes browse available tasks (list) or search
    3. Claude claims a task to work on it
    4. Claude completes the task (or releases if blocked)
    5. Task moves to completed!

EOF
}

# Main command router
case "$1" in
    init)
        init_marketplace
        ;;
    post)
        post_task "$2" "$3" "$4" "$5" "$6" "$7"
        ;;
    list)
        list_tasks "$2" "$3"
        ;;
    claim)
        claim_task "$2" "$3" "$4"
        ;;
    complete)
        complete_task "$2" "$3"
        ;;
    release)
        release_task "$2" "$3"
        ;;
    my-tasks)
        my_tasks
        ;;
    stats)
        show_stats
        ;;
    search)
        search_tasks "$2"
        ;;
    cleanup)
        cleanup_tasks
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo -e "Run ${CYAN}$0 help${NC} for usage information"
        exit 1
        ;;
esac
