#!/bin/bash
# Autonomous Auth & Domains Services Manager
# Manages lifecycle, health checks, and auto-recovery

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

AUTH_DIR="$HOME/services/auth"
DOMAINS_DIR="$HOME/services/domains"
PID_DIR="$HOME/.blackroad/pids"
LOG_DIR="$HOME/.blackroad/logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

start_service() {
    local name=$1
    local dir=$2
    local port=$3
    local pid_file="$PID_DIR/${name}.pid"
    local log_file="$LOG_DIR/${name}.log"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${RESET} ${name} already running (PID: ${pid})"
            return 0
        fi
    fi
    
    echo -e "${BLUE}→${RESET} Starting ${name}..."
    cd "$dir"
    nohup npm run dev > "$log_file" 2>&1 &
    local pid=$!
    echo "$pid" > "$pid_file"
    
    # Wait for service to be ready
    sleep 3
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${RESET} ${name} started (PID: ${pid}, Port: ${port})"
        return 0
    else
        echo -e "${AMBER}✗${RESET} ${name} failed to start"
        return 1
    fi
}

stop_service() {
    local name=$1
    local pid_file="$PID_DIR/${name}.pid"
    
    if [ ! -f "$pid_file" ]; then
        echo -e "${AMBER}✗${RESET} ${name} not running"
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${BLUE}→${RESET} Stopping ${name} (PID: ${pid})..."
        kill "$pid"
        sleep 2
        if ps -p "$pid" > /dev/null 2>&1; then
            kill -9 "$pid" 2>/dev/null || true
        fi
        rm "$pid_file"
        echo -e "${GREEN}✓${RESET} ${name} stopped"
    else
        rm "$pid_file"
        echo -e "${AMBER}✗${RESET} ${name} was not running"
    fi
}

status_service() {
    local name=$1
    local port=$2
    local pid_file="$PID_DIR/${name}.pid"
    
    if [ ! -f "$pid_file" ]; then
        echo -e "${AMBER}●${RESET} ${name}: not running"
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null 2>&1; then
        # Check if responding
        if curl -s -f "http://localhost:${port}/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}●${RESET} ${name}: running (PID: ${pid}, Port: ${port}) ${GREEN}[healthy]${RESET}"
            return 0
        else
            echo -e "${AMBER}●${RESET} ${name}: running (PID: ${pid}, Port: ${port}) ${AMBER}[unhealthy]${RESET}"
            return 2
        fi
    else
        rm "$pid_file"
        echo -e "${AMBER}●${RESET} ${name}: not running (stale PID)"
        return 1
    fi
}

health_check() {
    local name=$1
    local port=$2
    local pid_file="$PID_DIR/${name}.pid"
    
    # Check if process exists
    if [ ! -f "$pid_file" ]; then
        return 1
    fi
    
    local pid=$(cat "$pid_file")
    if ! ps -p "$pid" > /dev/null 2>&1; then
        return 1
    fi
    
    # Check if responding
    if ! curl -s -f "http://localhost:${port}/api/health" > /dev/null 2>&1; then
        return 2
    fi
    
    return 0
}

auto_restart() {
    local name=$1
    local dir=$2
    local port=$3
    
    health_check "$name" "$port"
    local status=$?
    
    if [ $status -eq 1 ]; then
        echo -e "${AMBER}⚠${RESET}  ${name} is down, restarting..."
        start_service "$name" "$dir" "$port"
    elif [ $status -eq 2 ]; then
        echo -e "${AMBER}⚠${RESET}  ${name} is unhealthy, restarting..."
        stop_service "$name"
        sleep 2
        start_service "$name" "$dir" "$port"
    fi
}

watch_services() {
    echo -e "${PINK}🤖 Autonomous service monitor started${RESET}"
    echo "Watching auth (3004) and domains (3005)..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        auto_restart "auth" "$AUTH_DIR" "3004"
        auto_restart "domains" "$DOMAINS_DIR" "3005"
        sleep 30
    done
}

case "${1:-start}" in
    start)
        echo -e "${PINK}🚀 Starting autonomous services...${RESET}\n"
        start_service "auth" "$AUTH_DIR" "3004"
        start_service "domains" "$DOMAINS_DIR" "3005"
        echo -e "\n${GREEN}✓${RESET} All services started"
        echo -e "Run '${BLUE}$0 watch${RESET}' to enable auto-recovery"
        ;;
    
    stop)
        echo -e "${PINK}🛑 Stopping services...${RESET}\n"
        stop_service "auth"
        stop_service "domains"
        echo -e "\n${GREEN}✓${RESET} All services stopped"
        ;;
    
    restart)
        echo -e "${PINK}🔄 Restarting services...${RESET}\n"
        stop_service "auth"
        stop_service "domains"
        sleep 2
        start_service "auth" "$AUTH_DIR" "3004"
        start_service "domains" "$DOMAINS_DIR" "3005"
        echo -e "\n${GREEN}✓${RESET} All services restarted"
        ;;
    
    status)
        echo -e "${PINK}📊 Service Status${RESET}\n"
        status_service "auth" "3004"
        status_service "domains" "3005"
        ;;
    
    watch)
        watch_services
        ;;
    
    logs)
        if [ -n "$2" ]; then
            tail -f "$LOG_DIR/${2}.log"
        else
            echo "Usage: $0 logs [auth|domains]"
            exit 1
        fi
        ;;
    
    *)
        echo "BlackRoad Autonomous Services Manager"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|watch|logs}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  watch    - Monitor and auto-restart on failure"
        echo "  logs     - Tail service logs (auth|domains)"
        exit 1
        ;;
esac
