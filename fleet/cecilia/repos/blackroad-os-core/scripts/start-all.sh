#!/bin/bash
# ============================================================================
# BlackRoad OS - Start All Services
# ============================================================================
#
# Launches the complete BlackRoad OS infrastructure:
# 1. Python Orchestrator (Cece agent)
# 2. TypeScript Bridge Service
# 3. Device network discovery
# 4. Cloudflare connection verification
#
# Usage:
#   ./scripts/start-all.sh [--dev|--prod]
#
# Options:
#   --dev    Development mode (hot reload, verbose logging)
#   --prod   Production mode (optimized, structured logs)
#   --skip-devices   Skip device discovery
#   --skip-cloudflare   Skip Cloudflare connection
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/logs"
PIDS_DIR="$PROJECT_ROOT/.pids"

# Create directories
mkdir -p "$LOGS_DIR"
mkdir -p "$PIDS_DIR"

# Defaults
MODE="dev"
SKIP_DEVICES=false
SKIP_CLOUDFLARE=false

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --dev)
      MODE="dev"
      shift
      ;;
    --prod)
      MODE="prod"
      shift
      ;;
    --skip-devices)
      SKIP_DEVICES=true
      shift
      ;;
    --skip-cloudflare)
      SKIP_CLOUDFLARE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [--dev|--prod] [--skip-devices] [--skip-cloudflare]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# ============================================================================
# Utility Functions
# ============================================================================

print_header() {
  echo ""
  echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${PURPLE}║${NC}  ${CYAN}BlackRoad OS - Infrastructure Startup${NC}                      ${PURPLE}║${NC}"
  echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

cleanup() {
  echo ""
  print_step "Shutting down services..."

  # Kill all background processes
  if [ -d "$PIDS_DIR" ]; then
    for pidfile in "$PIDS_DIR"/*.pid; do
      if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        service=$(basename "$pidfile" .pid)

        if kill -0 "$pid" 2>/dev/null; then
          print_step "Stopping $service (PID: $pid)"
          kill "$pid" 2>/dev/null || true

          # Wait for graceful shutdown
          for i in {1..10}; do
            if ! kill -0 "$pid" 2>/dev/null; then
              break
            fi
            sleep 0.5
          done

          # Force kill if still running
          if kill -0 "$pid" 2>/dev/null; then
            kill -9 "$pid" 2>/dev/null || true
          fi
        fi

        rm -f "$pidfile"
      fi
    done
  fi

  print_success "All services stopped"
  exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_header

print_step "Running pre-flight checks..."

# Check Python
if ! command -v python3 &> /dev/null; then
  print_error "Python 3 not found"
  exit 1
fi
print_success "Python 3 found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js not found"
  exit 1
fi
print_success "Node.js found: $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  print_error "pnpm not found. Install with: npm install -g pnpm"
  exit 1
fi
print_success "pnpm found: $(pnpm --version)"

# Install dependencies if needed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  print_step "Installing Node.js dependencies..."
  cd "$PROJECT_ROOT"
  pnpm install --silent
  print_success "Dependencies installed"
fi

# Install Python package
print_step "Installing Python package..."
cd "$PROJECT_ROOT"
python3 -m pip install -e . --quiet
print_success "Python package installed"

# ============================================================================
# Step 1: Device Discovery (Optional)
# ============================================================================

if [ "$SKIP_DEVICES" = false ]; then
  print_step "Step 1: Discovering device network..."

  if [ -f "$SCRIPT_DIR/generate_inventory_json.sh" ]; then
    timeout 30 "$SCRIPT_DIR/generate_inventory_json.sh" 2>&1 | grep -E "✓|✗|⚠" || true

    if [ -f "$PROJECT_ROOT/data/inventory.json" ]; then
      device_count=$(jq -r '.device_count' "$PROJECT_ROOT/data/inventory.json" 2>/dev/null || echo "0")
      print_success "Found $device_count devices on network"
    else
      print_warning "Device discovery incomplete, continuing anyway..."
    fi
  else
    print_warning "Device discovery script not found, skipping..."
  fi
else
  print_step "Step 1: Skipping device discovery (--skip-devices)"
fi

# ============================================================================
# Step 2: Cloudflare Verification (Optional)
# ============================================================================

if [ "$SKIP_CLOUDFLARE" = false ]; then
  print_step "Step 2: Verifying Cloudflare connectivity..."

  if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
    print_success "Cloudflare account ID configured: ${CLOUDFLARE_ACCOUNT_ID:0:8}..."
  else
    print_warning "CLOUDFLARE_ACCOUNT_ID not set, some features may not work"
  fi
else
  print_step "Step 2: Skipping Cloudflare verification (--skip-cloudflare)"
fi

# ============================================================================
# Step 3: Start Python Orchestrator
# ============================================================================

print_step "Step 3: Starting Python Orchestrator (Cece)..."

cd "$PROJECT_ROOT"

ORCHESTRATOR_LOG="$LOGS_DIR/orchestrator.log"
ORCHESTRATOR_PID="$PIDS_DIR/orchestrator.pid"

# Start orchestrator in background
python3 "$PROJECT_ROOT/src/orchestrator.py" > "$ORCHESTRATOR_LOG" 2>&1 &
ORCHESTRATOR_PID_VALUE=$!

echo "$ORCHESTRATOR_PID_VALUE" > "$ORCHESTRATOR_PID"

# Wait for orchestrator to be ready
print_step "Waiting for orchestrator to start..."
for i in {1..30}; do
  if curl -s http://localhost:${PORT_ORCHESTRATOR:-10100}/health > /dev/null 2>&1; then
    print_success "Orchestrator started (PID: $ORCHESTRATOR_PID_VALUE)"
    break
  fi

  if [ $i -eq 30 ]; then
    print_error "Orchestrator failed to start within 30 seconds"
    print_error "Check logs: $ORCHESTRATOR_LOG"
    cleanup
    exit 1
  fi

  sleep 1
done

# ============================================================================
# Step 4: Start TypeScript Bridge
# ============================================================================

print_step "Step 4: Starting TypeScript Bridge Service..."

BRIDGE_LOG="$LOGS_DIR/bridge.log"
BRIDGE_PID="$PIDS_DIR/bridge.pid"

# Start bridge service
cd "$PROJECT_ROOT"
tsx "$PROJECT_ROOT/src/api/bridge.ts" > "$BRIDGE_LOG" 2>&1 &
BRIDGE_PID_VALUE=$!

echo "$BRIDGE_PID_VALUE" > "$BRIDGE_PID"

# Wait for bridge to be ready
print_step "Waiting for bridge to start..."
for i in {1..30}; do
  if curl -s http://localhost:${PORT_API_GATEWAY:-8000}/health > /dev/null 2>&1; then
    print_success "Bridge started (PID: $BRIDGE_PID_VALUE)"
    break
  fi

  if [ $i -eq 30 ]; then
    print_error "Bridge failed to start within 30 seconds"
    print_error "Check logs: $BRIDGE_LOG"
    cleanup
    exit 1
  fi

  sleep 1
done

# ============================================================================
# Status Summary
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ${CYAN}✅ BlackRoad OS Infrastructure Running${NC}                      ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Services:${NC}"
echo -e "  ${GREEN}•${NC} Orchestrator (Cece): http://localhost:${PORT_ORCHESTRATOR:-10100}"
echo -e "  ${GREEN}•${NC} Bridge Service:      http://localhost:${PORT_API_GATEWAY:-8000}"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo -e "  ${GREEN}•${NC} Orchestrator: $ORCHESTRATOR_LOG"
echo -e "  ${GREEN}•${NC} Bridge:       $BRIDGE_LOG"
echo ""
echo -e "${CYAN}Quick Actions:${NC}"
echo -e "  ${GREEN}•${NC} View status:    curl http://localhost:${PORT_API_GATEWAY:-8000}/api/status"
echo -e "  ${GREEN}•${NC} View logs:      tail -f $LOGS_DIR/*.log"
echo -e "  ${GREEN}•${NC} Stop services:  Press Ctrl+C"
echo ""
echo -e "${YELLOW}Mode:${NC} $MODE"
echo ""

# ============================================================================
# Monitor Services
# ============================================================================

print_step "Monitoring services... (Press Ctrl+C to stop)"
echo ""

# Tail logs in background
tail -f "$ORCHESTRATOR_LOG" "$BRIDGE_LOG" 2>/dev/null &
TAIL_PID=$!

# Wait for user interrupt
wait

# Cleanup on exit
cleanup
