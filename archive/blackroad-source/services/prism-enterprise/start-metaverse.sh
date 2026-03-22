#!/usr/bin/env bash
# Start BlackRoad Earth Metaverse API Server

set -e

echo "=================================================="
echo "  🌍 Starting BlackRoad Earth Metaverse"
echo "=================================================="
echo ""

# Set environment variables
export NODE_ENV=${NODE_ENV:-production}
export METAVERSE_API_PORT=${METAVERSE_API_PORT:-8080}
export METAVERSE_WS_PORT=${METAVERSE_WS_PORT:-8081}
export JWT_SECRET=${JWT_SECRET:-blackroad-prism-console-secret}
export AUTO_SPAWN_AGENTS=${AUTO_SPAWN_AGENTS:-false}
export LOG_LEVEL=${LOG_LEVEL:-info}

echo "Configuration:"
echo "  API Port: $METAVERSE_API_PORT"
echo "  WebSocket Port: $METAVERSE_WS_PORT"
echo "  Environment: $NODE_ENV"
echo "  Auto-spawn agents: $AUTO_SPAWN_AGENTS"
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory not found. Running npm run build..."
    npm run build
fi

# Create PID file directory
PID_FILE="/tmp/blackroad-metaverse.pid"
LOG_FILE="/tmp/blackroad-metaverse.log"

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "⚠️  Metaverse is already running (PID: $OLD_PID)"
        echo "   Stopping old instance..."
        kill "$OLD_PID" 2>/dev/null || true
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

echo "🚀 Starting Metaverse API Server..."
echo "   Logs: $LOG_FILE"
echo ""

# Start the server in background
nohup node dist/agent-world-api.js > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Save PID
echo "$SERVER_PID" > "$PID_FILE"

# Wait a moment and check if it's still running
sleep 2

if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo "✅ Metaverse API Server started successfully!"
    echo "   PID: $SERVER_PID"
    echo ""
    echo "Endpoints:"
    echo "   REST API:  http://localhost:$METAVERSE_API_PORT"
    echo "   WebSocket: ws://localhost:$METAVERSE_WS_PORT"
    echo ""
    echo "Health Check:"
    echo "   curl http://localhost:$METAVERSE_API_PORT/health"
    echo ""
    echo "To stop: kill $SERVER_PID"
    echo ""
    echo "Tailing logs (Ctrl+C to exit)..."
    sleep 1
    tail -f "$LOG_FILE"
else
    echo "❌ Failed to start Metaverse API Server"
    echo "   Check logs: $LOG_FILE"
    cat "$LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
