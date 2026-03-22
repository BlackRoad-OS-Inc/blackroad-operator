#!/bin/bash
# BLACKROAD TOKEN MONITOR
# Rate limiting, timeout handling, and performance monitoring for LLM token generation
# Supports: Ollama, Claude/OpenAI API, Custom LLMs
# Logs to: Memory system, SQLite, stdout/stderr

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
CYAN='\033[38;5;51m'
RESET='\033[0m'

# Configuration
MONITOR_DIR="$HOME/.blackroad/token-monitor"
DB_FILE="$MONITOR_DIR/metrics.db"
LOG_FILE="$MONITOR_DIR/token-monitor.log"
CONFIG_FILE="$MONITOR_DIR/config.json"

# Cross-platform nanosecond timestamp (macOS compatible)
get_timestamp_ns() {
    if command -v gdate &>/dev/null; then
        gdate +%s%N
    elif command -v python3 &>/dev/null; then
        python3 -c "import time; print(int(time.time() * 1000000000))"
    else
        echo "$(($(date +%s) * 1000000000))"
    fi
}

get_timestamp_ms() {
    if command -v gdate &>/dev/null; then
        echo "$(gdate +%s%3N)"
    elif command -v python3 &>/dev/null; then
        python3 -c "import time; print(int(time.time() * 1000))"
    else
        echo "$(($(date +%s) * 1000))"
    fi
}

# Default thresholds
DEFAULT_TIMEOUT_MS=30000           # 30 seconds max per request
DEFAULT_MIN_TOKENS_PER_SEC=1       # Minimum acceptable rate (throttle if slower)
DEFAULT_MAX_TOKENS_PER_SEC=1000    # Maximum rate (throttle if faster - prevent bursts)
DEFAULT_WARN_LATENCY_MS=1000       # Warn if token takes > 1 second

mkdir -p "$MONITOR_DIR"

banner() {
    echo -e "${PINK}+------------------------------------------------------------+${RESET}"
    echo -e "${PINK}|  ${VIOLET}BLACKROAD TOKEN MONITOR${PINK}                                 |${RESET}"
    echo -e "${PINK}|  ${CYAN}Rate Limiting | Timeouts | Performance${PINK}                   |${RESET}"
    echo -e "${PINK}+------------------------------------------------------------+${RESET}"
}

#------------------------------------------------------------------------------
# SQLite Database Setup
#------------------------------------------------------------------------------

init_db() {
    sqlite3 "$DB_FILE" << 'SQL'
CREATE TABLE IF NOT EXISTS token_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    source TEXT NOT NULL,              -- ollama, claude, openai, custom
    model TEXT,
    request_id TEXT,
    tokens_generated INTEGER,
    duration_ms INTEGER,
    tokens_per_second REAL,
    first_token_ms INTEGER,            -- Time to first token
    timeout_occurred INTEGER DEFAULT 0,
    throttled INTEGER DEFAULT 0,
    error TEXT
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    source TEXT NOT NULL,
    action TEXT,                       -- throttle_slow, throttle_fast, timeout, abort
    tokens_per_second REAL,
    threshold REAL,
    request_id TEXT
);

CREATE TABLE IF NOT EXISTS health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    source TEXT NOT NULL,
    status TEXT,                       -- healthy, degraded, unhealthy
    avg_tokens_per_second REAL,
    p95_latency_ms INTEGER,
    error_rate REAL
);

CREATE TABLE IF NOT EXISTS cost_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    source TEXT NOT NULL,
    model TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd REAL,
    request_id TEXT
);

CREATE TABLE IF NOT EXISTS streaming_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    source TEXT NOT NULL,
    model TEXT,
    request_id TEXT,
    token_index INTEGER,
    token_latency_ms INTEGER,
    cumulative_tokens INTEGER,
    instantaneous_tps REAL
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    severity TEXT,                     -- info, warning, critical
    source TEXT,
    alert_type TEXT,
    message TEXT,
    notified INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS scaling_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    trigger TEXT,
    action TEXT,
    source TEXT,
    metric_value REAL,
    threshold REAL
);

CREATE INDEX IF NOT EXISTS idx_metrics_source ON token_metrics(source);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON token_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_rate_limits_source ON rate_limits(source);
SQL
    echo -e "${GREEN}+${RESET} SQLite database initialized: $DB_FILE"
}

#------------------------------------------------------------------------------
# Cost Tracking (Pricing per 1M tokens as of 2024)
#------------------------------------------------------------------------------

# Prices in USD per 1M tokens [input, output]
get_pricing() {
    local model="$1"
    case "$model" in
        claude-3-opus*|claude-opus*) echo "15.00,75.00" ;;
        claude-3-sonnet*|claude-sonnet*) echo "3.00,15.00" ;;
        claude-3-haiku*|claude-haiku*) echo "0.25,1.25" ;;
        claude-3.5-sonnet*) echo "3.00,15.00" ;;
        gpt-4-turbo*) echo "10.00,30.00" ;;
        gpt-4o-mini*) echo "0.15,0.60" ;;
        gpt-4o*) echo "5.00,15.00" ;;
        gpt-4*) echo "30.00,60.00" ;;
        gpt-3.5-turbo*) echo "0.50,1.50" ;;
        ollama*|llama*|mistral*|codellama*) echo "0.00,0.00" ;;
        *) echo "0.00,0.00" ;;
    esac
}

calculate_cost() {
    local model="$1"
    local input_tokens="$2"
    local output_tokens="$3"

    local pricing=$(get_pricing "$model")
    local input_price=$(echo "$pricing" | cut -d',' -f1)
    local output_price=$(echo "$pricing" | cut -d',' -f2)

    # Cost = (tokens / 1,000,000) * price_per_million
    local input_cost=$(echo "scale=6; $input_tokens * $input_price / 1000000" | bc)
    local output_cost=$(echo "scale=6; $output_tokens * $output_price / 1000000" | bc)
    local total_cost=$(echo "scale=6; $input_cost + $output_cost" | bc)

    echo "$total_cost"
}

log_cost() {
    local source="$1"
    local model="$2"
    local input_tokens="$3"
    local output_tokens="$4"
    local request_id="$5"

    local cost=$(calculate_cost "$model" "$input_tokens" "$output_tokens")

    sqlite3 "$DB_FILE" "INSERT INTO cost_tracking (source, model, input_tokens, output_tokens, cost_usd, request_id) VALUES ('$source', '$model', $input_tokens, $output_tokens, $cost, '$request_id');"

    if [ "$(echo "$cost > 0" | bc)" -eq 1 ]; then
        echo -e "${AMBER}[\$]${RESET} Cost: \$${cost} ($input_tokens in / $output_tokens out)"
    fi
}

show_costs() {
    local hours="${1:-24}"

    echo -e "${VIOLET}COST TRACKING (last ${hours}h)${RESET}"
    echo ""

    sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    source,
    model,
    SUM(input_tokens) as total_input,
    SUM(output_tokens) as total_output,
    ROUND(SUM(cost_usd), 4) as total_cost_usd,
    COUNT(*) as requests
FROM cost_tracking
WHERE timestamp >= datetime('now', '-$hours hours')
GROUP BY source, model
ORDER BY total_cost_usd DESC;
SQL

    echo ""
    local total=$(sqlite3 "$DB_FILE" "SELECT ROUND(SUM(cost_usd), 4) FROM cost_tracking WHERE timestamp >= datetime('now', '-$hours hours');")
    echo -e "${PINK}Total: \$${total:-0}${RESET}"
}

#------------------------------------------------------------------------------
# Alerting System
#------------------------------------------------------------------------------

ALERT_WEBHOOK="${BLACKROAD_ALERT_WEBHOOK:-}"
SLACK_WEBHOOK="${BLACKROAD_SLACK_WEBHOOK:-}"

send_alert() {
    local severity="$1"
    local source="$2"
    local alert_type="$3"
    local message="$4"

    # Log to database
    sqlite3 "$DB_FILE" "INSERT INTO alerts (severity, source, alert_type, message) VALUES ('$severity', '$source', '$alert_type', '$message');"

    # Log to memory system
    ~/memory-system.sh log "alert" "$source" "$severity: $message" "token-monitor,alert,$severity" 2>/dev/null || true

    # Color output based on severity
    case "$severity" in
        critical) echo -e "${RED}[CRITICAL]${RESET} $source: $message" >&2 ;;
        warning)  echo -e "${AMBER}[WARNING]${RESET} $source: $message" >&2 ;;
        info)     echo -e "${CYAN}[INFO]${RESET} $source: $message" ;;
    esac

    # Send to webhooks if configured
    local payload="{\"severity\": \"$severity\", \"source\": \"$source\", \"type\": \"$alert_type\", \"message\": \"$message\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -s -X POST "$ALERT_WEBHOOK" -H "Content-Type: application/json" -d "$payload" >/dev/null 2>&1 &
    fi

    if [ -n "$SLACK_WEBHOOK" ]; then
        local slack_color="good"
        [ "$severity" = "warning" ] && slack_color="warning"
        [ "$severity" = "critical" ] && slack_color="danger"

        local slack_payload="{\"attachments\": [{\"color\": \"$slack_color\", \"title\": \"[$severity] $alert_type\", \"text\": \"$message\", \"footer\": \"BlackRoad Token Monitor | $source\"}]}"
        curl -s -X POST "$SLACK_WEBHOOK" -H "Content-Type: application/json" -d "$slack_payload" >/dev/null 2>&1 &
    fi

    # Mark as notified
    sqlite3 "$DB_FILE" "UPDATE alerts SET notified = 1 WHERE id = (SELECT MAX(id) FROM alerts);"
}

check_alert_thresholds() {
    local source="$1"
    local tps="$2"
    local latency_ms="$3"
    local error_rate="$4"

    local min_tps=$(get_config ".sources.$source.min_tokens_per_second" "$DEFAULT_MIN_TOKENS_PER_SEC")
    local warn_latency=$(get_config ".thresholds.warn_latency_ms" "$DEFAULT_WARN_LATENCY_MS")

    # Critical: Error rate > 50%
    if [ "$(echo "$error_rate > 50" | bc)" -eq 1 ]; then
        send_alert "critical" "$source" "high_error_rate" "Error rate at ${error_rate}% (threshold: 50%)"
    # Warning: Error rate > 20%
    elif [ "$(echo "$error_rate > 20" | bc)" -eq 1 ]; then
        send_alert "warning" "$source" "elevated_error_rate" "Error rate at ${error_rate}% (threshold: 20%)"
    fi

    # Critical: TPS = 0 for extended period
    if [ "$(echo "$tps == 0" | bc)" -eq 1 ]; then
        send_alert "critical" "$source" "zero_throughput" "Token generation halted (0 t/s)"
    # Warning: TPS below minimum
    elif [ "$(echo "$tps < $min_tps" | bc)" -eq 1 ]; then
        send_alert "warning" "$source" "low_throughput" "Low throughput: ${tps} t/s (minimum: ${min_tps} t/s)"
    fi

    # Warning: High latency
    if [ "$(echo "$latency_ms > $warn_latency" | bc)" -eq 1 ]; then
        send_alert "warning" "$source" "high_latency" "High latency: ${latency_ms}ms (threshold: ${warn_latency}ms)"
    fi
}

show_alerts() {
    local hours="${1:-24}"

    echo -e "${VIOLET}ALERTS (last ${hours}h)${RESET}"
    echo ""

    sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    timestamp,
    severity,
    source,
    alert_type,
    message
FROM alerts
WHERE timestamp >= datetime('now', '-$hours hours')
ORDER BY timestamp DESC
LIMIT 50;
SQL
}

#------------------------------------------------------------------------------
# Auto-Scaling
#------------------------------------------------------------------------------

SCALING_ENABLED="${BLACKROAD_AUTOSCALE:-false}"
SCALE_UP_TPS_THRESHOLD=100    # Scale up if TPS > this
SCALE_DOWN_TPS_THRESHOLD=10   # Scale down if TPS < this
SCALE_UP_LATENCY_THRESHOLD=5000   # Scale up if latency > 5s
SCALE_UP_ERROR_THRESHOLD=30       # Scale up if error rate > 30%

log_scaling_event() {
    local trigger="$1"
    local action="$2"
    local source="$3"
    local metric="$4"
    local threshold="$5"

    sqlite3 "$DB_FILE" "INSERT INTO scaling_events (trigger, action, source, metric_value, threshold) VALUES ('$trigger', '$action', '$source', $metric, $threshold);"

    echo -e "${VIOLET}[SCALE]${RESET} $action triggered by $trigger ($metric vs threshold $threshold)"

    # Log to memory
    ~/memory-system.sh log "scale" "$source" "$action: $trigger ($metric)" "token-monitor,autoscale" 2>/dev/null || true
}

check_scaling() {
    local source="$1"

    [ "$SCALING_ENABLED" != "true" ] && return 0

    # Get recent metrics (last 5 minutes)
    local avg_tps=$(sqlite3 "$DB_FILE" "SELECT ROUND(AVG(tokens_per_second), 2) FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-5 minutes');" 2>/dev/null || echo "0")
    local avg_latency=$(sqlite3 "$DB_FILE" "SELECT ROUND(AVG(duration_ms), 0) FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-5 minutes');" 2>/dev/null || echo "0")
    local error_rate=$(sqlite3 "$DB_FILE" "SELECT ROUND(100.0 * SUM(CASE WHEN error != '' THEN 1 ELSE 0 END) / COUNT(*), 2) FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-5 minutes');" 2>/dev/null || echo "0")

    # Scale UP conditions
    if [ "$(echo "$avg_latency > $SCALE_UP_LATENCY_THRESHOLD" | bc)" -eq 1 ]; then
        log_scaling_event "high_latency" "scale_up" "$source" "$avg_latency" "$SCALE_UP_LATENCY_THRESHOLD"
        trigger_scale_up "$source" "latency"
        return 0
    fi

    if [ "$(echo "$error_rate > $SCALE_UP_ERROR_THRESHOLD" | bc)" -eq 1 ]; then
        log_scaling_event "high_error_rate" "scale_up" "$source" "$error_rate" "$SCALE_UP_ERROR_THRESHOLD"
        trigger_scale_up "$source" "errors"
        return 0
    fi

    if [ "$(echo "$avg_tps > $SCALE_UP_TPS_THRESHOLD" | bc)" -eq 1 ]; then
        log_scaling_event "high_demand" "scale_up" "$source" "$avg_tps" "$SCALE_UP_TPS_THRESHOLD"
        trigger_scale_up "$source" "demand"
        return 0
    fi

    # Scale DOWN conditions
    if [ "$(echo "$avg_tps < $SCALE_DOWN_TPS_THRESHOLD && $avg_tps > 0" | bc)" -eq 1 ]; then
        log_scaling_event "low_demand" "scale_down" "$source" "$avg_tps" "$SCALE_DOWN_TPS_THRESHOLD"
        trigger_scale_down "$source" "demand"
        return 0
    fi
}

trigger_scale_up() {
    local source="$1"
    local reason="$2"

    echo -e "${GREEN}[SCALE UP]${RESET} Scaling up $source (reason: $reason)"

    case "$source" in
        ollama)
            # Add more Ollama instances via Pi fleet
            for pi in cecilia lucidia alice; do
                ssh -o ConnectTimeout=2 "$pi" "ollama serve &" 2>/dev/null &
            done
            ;;
        custom)
            # Trigger custom scaling (Kubernetes, Railway, etc.)
            if [ -n "$BLACKROAD_SCALE_UP_CMD" ]; then
                eval "$BLACKROAD_SCALE_UP_CMD" &
            fi
            ;;
    esac

    send_alert "info" "$source" "scale_up" "Scaled up due to $reason"
}

trigger_scale_down() {
    local source="$1"
    local reason="$2"

    echo -e "${AMBER}[SCALE DOWN]${RESET} Scaling down $source (reason: $reason)"

    # Custom scale down command
    if [ -n "$BLACKROAD_SCALE_DOWN_CMD" ]; then
        eval "$BLACKROAD_SCALE_DOWN_CMD" &
    fi

    send_alert "info" "$source" "scale_down" "Scaled down due to $reason"
}

show_scaling_events() {
    local hours="${1:-24}"

    echo -e "${VIOLET}SCALING EVENTS (last ${hours}h)${RESET}"
    echo ""

    sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    timestamp,
    action,
    trigger,
    source,
    metric_value,
    threshold
FROM scaling_events
WHERE timestamp >= datetime('now', '-$hours hours')
ORDER BY timestamp DESC;
SQL
}

#------------------------------------------------------------------------------
# Streaming Monitor (Real-time token-by-token tracking)
#------------------------------------------------------------------------------

stream_ollama() {
    local model="${1:-llama2}"
    local prompt="${2:-Hello}"
    local request_id="${3:-$(get_timestamp_ms)}"

    local endpoint=$(get_config ".sources.ollama.endpoint" "http://localhost:11434")

    echo -e "${BLUE}[STREAM]${RESET} Starting streaming monitor for $model..."
    echo ""

    local start_time=$(get_timestamp_ms)
    local token_count=0
    local last_token_time=$start_time
    local first_token_logged=false

    # Stream tokens and track each one
    curl -sN "$endpoint/api/generate" -d "{\"model\": \"$model\", \"prompt\": \"$prompt\", \"stream\": true}" 2>/dev/null | while IFS= read -r line; do
        [ -z "$line" ] && continue

        local current_time=$(get_timestamp_ms)
        local token_latency=$((current_time - last_token_time))
        ((token_count++))

        # Parse token from JSON
        local token=$(echo "$line" | jq -r '.response // empty' 2>/dev/null)
        local done=$(echo "$line" | jq -r '.done // false' 2>/dev/null)

        if [ -n "$token" ]; then
            # Calculate instantaneous TPS
            local instant_tps=0
            if [ "$token_latency" -gt 0 ]; then
                instant_tps=$(echo "scale=2; 1000 / $token_latency" | bc)
            fi

            # Log to streaming metrics
            sqlite3 "$DB_FILE" "INSERT INTO streaming_metrics (source, model, request_id, token_index, token_latency_ms, cumulative_tokens, instantaneous_tps) VALUES ('ollama', '$model', '$request_id', $token_count, $token_latency, $token_count, $instant_tps);"

            # First token timing
            if [ "$first_token_logged" = false ]; then
                local ttft=$((current_time - start_time))
                echo -e "${GREEN}[TTFT]${RESET} Time to first token: ${ttft}ms"
                first_token_logged=true
            fi

            # Live display
            printf "\r${CYAN}[LIVE]${RESET} Token #%d | Latency: %dms | TPS: %.1f | %s" "$token_count" "$token_latency" "$instant_tps" "${token:0:20}"

            # Alert if token is too slow
            if [ "$token_latency" -gt 2000 ]; then
                echo ""
                send_alert "warning" "ollama" "slow_token" "Token #$token_count took ${token_latency}ms"
            fi
        fi

        last_token_time=$current_time

        # Stream complete
        if [ "$done" = "true" ]; then
            local total_time=$((current_time - start_time))
            local avg_tps=$(echo "scale=2; $token_count * 1000 / $total_time" | bc 2>/dev/null || echo "0")

            echo ""
            echo ""
            echo -e "${GREEN}[COMPLETE]${RESET} Generated $token_count tokens in ${total_time}ms (${avg_tps} t/s avg)"

            # Log final metrics
            log_metric "ollama" "$model" "$token_count" "$total_time" "$(($(get_timestamp_ms) - start_time))" "$request_id" ""
            check_scaling "ollama"
            break
        fi
    done
}

stream_claude() {
    local model="${1:-claude-3-sonnet-20240229}"
    local prompt="${2:-Hello}"
    local request_id="${3:-$(get_timestamp_ms)}"

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo -e "${RED}[ERROR]${RESET} ANTHROPIC_API_KEY not set"
        return 1
    fi

    echo -e "${BLUE}[STREAM]${RESET} Starting streaming monitor for Claude $model..."
    echo ""

    local start_time=$(get_timestamp_ms)
    local token_count=0
    local last_token_time=$start_time
    local first_token_logged=false
    local input_tokens=0

    # Stream from Claude API
    curl -sN "https://api.anthropic.com/v1/messages" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d "{\"model\": \"$model\", \"max_tokens\": 500, \"stream\": true, \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}]}" 2>/dev/null | while IFS= read -r line; do

        [ -z "$line" ] && continue
        [[ "$line" != data:* ]] && continue

        local data="${line#data: }"
        [ "$data" = "[DONE]" ] && break

        local current_time=$(get_timestamp_ms)
        local event_type=$(echo "$data" | jq -r '.type // empty' 2>/dev/null)

        case "$event_type" in
            content_block_delta)
                local token=$(echo "$data" | jq -r '.delta.text // empty' 2>/dev/null)
                if [ -n "$token" ]; then
                    local token_latency=$((current_time - last_token_time))
                    ((token_count++))

                    local instant_tps=0
                    if [ "$token_latency" -gt 0 ]; then
                        instant_tps=$(echo "scale=2; 1000 / $token_latency" | bc)
                    fi

                    sqlite3 "$DB_FILE" "INSERT INTO streaming_metrics (source, model, request_id, token_index, token_latency_ms, cumulative_tokens, instantaneous_tps) VALUES ('claude', '$model', '$request_id', $token_count, $token_latency, $token_count, $instant_tps);"

                    if [ "$first_token_logged" = false ]; then
                        local ttft=$((current_time - start_time))
                        echo -e "${GREEN}[TTFT]${RESET} Time to first token: ${ttft}ms"
                        first_token_logged=true
                    fi

                    printf "\r${CYAN}[LIVE]${RESET} Token #%d | Latency: %dms | TPS: %.1f" "$token_count" "$token_latency" "$instant_tps"

                    last_token_time=$current_time
                fi
                ;;
            message_start)
                input_tokens=$(echo "$data" | jq -r '.message.usage.input_tokens // 0' 2>/dev/null)
                ;;
            message_delta)
                local output_tokens=$(echo "$data" | jq -r '.usage.output_tokens // 0' 2>/dev/null)
                local total_time=$((current_time - start_time))
                local avg_tps=$(echo "scale=2; $output_tokens * 1000 / $total_time" | bc 2>/dev/null || echo "0")

                echo ""
                echo ""
                echo -e "${GREEN}[COMPLETE]${RESET} Generated $output_tokens tokens in ${total_time}ms (${avg_tps} t/s avg)"

                # Log cost
                log_cost "claude" "$model" "$input_tokens" "$output_tokens" "$request_id"
                log_metric "claude" "$model" "$output_tokens" "$total_time" "0" "$request_id" ""
                check_scaling "claude"
                ;;
        esac
    done
}

show_stream_stats() {
    local request_id="${1:-}"
    local hours="${2:-1}"

    echo -e "${VIOLET}STREAMING METRICS${RESET}"
    echo ""

    if [ -n "$request_id" ]; then
        sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    token_index,
    token_latency_ms,
    instantaneous_tps,
    cumulative_tokens
FROM streaming_metrics
WHERE request_id = '$request_id'
ORDER BY token_index;
SQL
    else
        sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    source,
    model,
    COUNT(*) as total_tokens,
    ROUND(AVG(token_latency_ms), 2) as avg_latency_ms,
    ROUND(AVG(instantaneous_tps), 2) as avg_tps,
    MIN(token_latency_ms) as min_latency,
    MAX(token_latency_ms) as max_latency
FROM streaming_metrics
WHERE timestamp >= datetime('now', '-$hours hours')
GROUP BY source, model;
SQL
    fi
}

#------------------------------------------------------------------------------
# Configuration
#------------------------------------------------------------------------------

init_config() {
    cat > "$CONFIG_FILE" << 'CONFIG'
{
  "thresholds": {
    "timeout_ms": 30000,
    "min_tokens_per_second": 1,
    "max_tokens_per_second": 1000,
    "warn_latency_ms": 1000,
    "first_token_timeout_ms": 5000
  },
  "sources": {
    "ollama": {
      "enabled": true,
      "endpoint": "http://localhost:11434",
      "timeout_ms": 60000,
      "min_tokens_per_second": 5
    },
    "claude": {
      "enabled": true,
      "timeout_ms": 30000,
      "min_tokens_per_second": 10
    },
    "openai": {
      "enabled": true,
      "timeout_ms": 30000,
      "min_tokens_per_second": 15
    },
    "custom": {
      "enabled": true,
      "timeout_ms": 120000,
      "min_tokens_per_second": 1
    }
  },
  "actions": {
    "on_timeout": "abort",
    "on_slow": "warn",
    "on_fast": "throttle"
  }
}
CONFIG
    echo -e "${GREEN}+${RESET} Configuration initialized: $CONFIG_FILE"
}

get_config() {
    local key="$1"
    local default="$2"
    if [ -f "$CONFIG_FILE" ]; then
        jq -r "$key // \"$default\"" "$CONFIG_FILE" 2>/dev/null || echo "$default"
    else
        echo "$default"
    fi
}

#------------------------------------------------------------------------------
# Logging (Memory System + stdout/stderr + file)
#------------------------------------------------------------------------------

log_metric() {
    local source="$1"
    local model="$2"
    local tokens="$3"
    local duration_ms="$4"
    local first_token_ms="$5"
    local request_id="$6"
    local error="${7:-}"

    local tps=0
    if [ "$duration_ms" -gt 0 ]; then
        tps=$(echo "scale=2; $tokens * 1000 / $duration_ms" | bc 2>/dev/null || echo "0")
    fi

    # SQLite
    sqlite3 "$DB_FILE" "INSERT INTO token_metrics (source, model, request_id, tokens_generated, duration_ms, tokens_per_second, first_token_ms, error) VALUES ('$source', '$model', '$request_id', $tokens, $duration_ms, $tps, $first_token_ms, '$error');"

    # File log
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] source=$source model=$model tokens=$tokens duration_ms=$duration_ms tps=$tps first_token_ms=$first_token_ms error=$error" >> "$LOG_FILE"

    # Memory system (if significant)
    if [ "$tokens" -gt 100 ] || [ -n "$error" ]; then
        ~/memory-system.sh log "token_metric" "$source/$model" "tokens=$tokens tps=$tps duration=${duration_ms}ms" "token-monitor,llm,$source" 2>/dev/null || true
    fi

    # stdout
    if [ -n "$error" ]; then
        echo -e "${RED}[METRIC]${RESET} $source/$model: $tokens tokens, ${duration_ms}ms, ${tps} t/s - ERROR: $error" >&2
    else
        echo -e "${CYAN}[METRIC]${RESET} $source/$model: $tokens tokens, ${duration_ms}ms, ${tps} t/s"
    fi
}

log_rate_action() {
    local source="$1"
    local action="$2"
    local tps="$3"
    local threshold="$4"
    local request_id="$5"

    # SQLite
    sqlite3 "$DB_FILE" "INSERT INTO rate_limits (source, action, tokens_per_second, threshold, request_id) VALUES ('$source', '$action', $tps, $threshold, '$request_id');"

    # File log
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] RATE_ACTION: source=$source action=$action tps=$tps threshold=$threshold" >> "$LOG_FILE"

    # Memory system
    ~/memory-system.sh log "rate_limit" "$source" "action=$action tps=$tps threshold=$threshold" "token-monitor,rate-limit,$action" 2>/dev/null || true

    # stderr (rate actions are warnings/errors)
    case "$action" in
        throttle_slow)
            echo -e "${AMBER}[THROTTLE]${RESET} $source: Too slow (${tps} t/s < ${threshold} t/s threshold)" >&2
            ;;
        throttle_fast)
            echo -e "${AMBER}[THROTTLE]${RESET} $source: Too fast (${tps} t/s > ${threshold} t/s threshold)" >&2
            ;;
        timeout)
            echo -e "${RED}[TIMEOUT]${RESET} $source: Request timed out" >&2
            ;;
        abort)
            echo -e "${RED}[ABORT]${RESET} $source: Request aborted" >&2
            ;;
    esac
}

#------------------------------------------------------------------------------
# Rate Limiting & Throttling
#------------------------------------------------------------------------------

check_rate() {
    local source="$1"
    local tokens="$2"
    local duration_ms="$3"
    local request_id="$4"

    local tps=0
    if [ "$duration_ms" -gt 0 ]; then
        tps=$(echo "scale=2; $tokens * 1000 / $duration_ms" | bc 2>/dev/null || echo "0")
    fi

    local min_tps=$(get_config ".sources.$source.min_tokens_per_second" "$DEFAULT_MIN_TOKENS_PER_SEC")
    local max_tps=$(get_config ".sources.$source.max_tokens_per_second" "$DEFAULT_MAX_TOKENS_PER_SEC")

    # Check if too slow
    if [ "$(echo "$tps < $min_tps" | bc)" -eq 1 ]; then
        log_rate_action "$source" "throttle_slow" "$tps" "$min_tps" "$request_id"
        return 1
    fi

    # Check if too fast (burst protection)
    if [ "$(echo "$tps > $max_tps" | bc)" -eq 1 ]; then
        log_rate_action "$source" "throttle_fast" "$tps" "$max_tps" "$request_id"
        # Add small delay to throttle
        local delay_ms=$(echo "scale=0; ($tps - $max_tps) * 10" | bc)
        sleep "$(echo "scale=3; $delay_ms / 1000" | bc)"
        return 2
    fi

    return 0
}

#------------------------------------------------------------------------------
# Timeout Handling
#------------------------------------------------------------------------------

with_timeout() {
    local timeout_ms="$1"
    shift
    local cmd="$@"

    local timeout_sec=$(echo "scale=2; $timeout_ms / 1000" | bc)

    # Use timeout command if available, otherwise background process
    if command -v timeout &>/dev/null; then
        timeout "$timeout_sec" bash -c "$cmd"
    elif command -v gtimeout &>/dev/null; then
        gtimeout "$timeout_sec" bash -c "$cmd"
    else
        # Fallback: background process with kill
        bash -c "$cmd" &
        local pid=$!
        local count=0
        local max_count=$((timeout_ms / 100))

        while kill -0 $pid 2>/dev/null; do
            sleep 0.1
            ((count++))
            if [ "$count" -ge "$max_count" ]; then
                kill -9 $pid 2>/dev/null
                return 124  # Same exit code as timeout command
            fi
        done

        wait $pid
        return $?
    fi
}

#------------------------------------------------------------------------------
# Monitor LLM Sources
#------------------------------------------------------------------------------

monitor_ollama() {
    local model="${1:-llama2}"
    local prompt="${2:-Hello}"
    local request_id="${3:-$(get_timestamp_ms)}"

    local timeout_ms=$(get_config ".sources.ollama.timeout_ms" "60000")
    local endpoint=$(get_config ".sources.ollama.endpoint" "http://localhost:11434")

    local start_time=$(get_timestamp_ms)
    local first_token_time=0
    local tokens=0
    local error=""

    echo -e "${BLUE}[OLLAMA]${RESET} Monitoring request to $model..."

    # Make request with timeout
    local response
    if ! response=$(with_timeout "$timeout_ms" "curl -s '$endpoint/api/generate' -d '{\"model\": \"$model\", \"prompt\": \"$prompt\", \"stream\": false}'" 2>&1); then
        if [ $? -eq 124 ]; then
            log_rate_action "ollama" "timeout" "0" "$timeout_ms" "$request_id"
            log_metric "ollama" "$model" "0" "$timeout_ms" "0" "$request_id" "TIMEOUT"
            return 124
        fi
        error="Request failed: $response"
    fi

    local end_time=$(get_timestamp_ms)
    local duration_ms=$(( end_time - start_time ))

    # Parse response
    if [ -z "$error" ]; then
        tokens=$(echo "$response" | jq -r '.eval_count // 0' 2>/dev/null || echo "0")
        first_token_time=$(echo "$response" | jq -r '.eval_duration // 0' 2>/dev/null || echo "0")
        first_token_time=$((first_token_time / 1000000))  # Convert ns to ms
    fi

    # Log metrics
    log_metric "ollama" "$model" "$tokens" "$duration_ms" "$first_token_time" "$request_id" "$error"

    # Check rate limits
    check_rate "ollama" "$tokens" "$duration_ms" "$request_id"

    return 0
}

monitor_claude() {
    local model="${1:-claude-3-sonnet}"
    local prompt="${2:-Hello}"
    local request_id="${3:-$(get_timestamp_ms)}"

    local timeout_ms=$(get_config ".sources.claude.timeout_ms" "30000")

    local start_time=$(get_timestamp_ms)
    local first_token_time=0
    local tokens=0
    local error=""

    echo -e "${BLUE}[CLAUDE]${RESET} Monitoring request to $model..."

    # Check for API key
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        error="ANTHROPIC_API_KEY not set"
        log_metric "claude" "$model" "0" "0" "0" "$request_id" "$error"
        return 1
    fi

    # Make request with timeout
    local response
    if ! response=$(with_timeout "$timeout_ms" "curl -s 'https://api.anthropic.com/v1/messages' \
        -H 'Content-Type: application/json' \
        -H 'x-api-key: $ANTHROPIC_API_KEY' \
        -H 'anthropic-version: 2023-06-01' \
        -d '{\"model\": \"$model\", \"max_tokens\": 100, \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}]}'" 2>&1); then
        if [ $? -eq 124 ]; then
            log_rate_action "claude" "timeout" "0" "$timeout_ms" "$request_id"
            log_metric "claude" "$model" "0" "$timeout_ms" "0" "$request_id" "TIMEOUT"
            return 124
        fi
        error="Request failed"
    fi

    local end_time=$(get_timestamp_ms)
    local duration_ms=$(( end_time - start_time ))

    # Parse response
    if [ -z "$error" ]; then
        tokens=$(echo "$response" | jq -r '.usage.output_tokens // 0' 2>/dev/null || echo "0")
    fi

    # Log metrics
    log_metric "claude" "$model" "$tokens" "$duration_ms" "$first_token_time" "$request_id" "$error"

    # Check rate limits
    check_rate "claude" "$tokens" "$duration_ms" "$request_id"

    return 0
}

monitor_openai() {
    local model="${1:-gpt-4}"
    local prompt="${2:-Hello}"
    local request_id="${3:-$(get_timestamp_ms)}"

    local timeout_ms=$(get_config ".sources.openai.timeout_ms" "30000")

    local start_time=$(get_timestamp_ms)
    local first_token_time=0
    local tokens=0
    local error=""

    echo -e "${BLUE}[OPENAI]${RESET} Monitoring request to $model..."

    # Check for API key
    if [ -z "$OPENAI_API_KEY" ]; then
        error="OPENAI_API_KEY not set"
        log_metric "openai" "$model" "0" "0" "0" "$request_id" "$error"
        return 1
    fi

    # Make request with timeout
    local response
    if ! response=$(with_timeout "$timeout_ms" "curl -s 'https://api.openai.com/v1/chat/completions' \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $OPENAI_API_KEY' \
        -d '{\"model\": \"$model\", \"max_tokens\": 100, \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}]}'" 2>&1); then
        if [ $? -eq 124 ]; then
            log_rate_action "openai" "timeout" "0" "$timeout_ms" "$request_id"
            log_metric "openai" "$model" "0" "$timeout_ms" "0" "$request_id" "TIMEOUT"
            return 124
        fi
        error="Request failed"
    fi

    local end_time=$(get_timestamp_ms)
    local duration_ms=$(( end_time - start_time ))

    # Parse response
    if [ -z "$error" ]; then
        tokens=$(echo "$response" | jq -r '.usage.completion_tokens // 0' 2>/dev/null || echo "0")
    fi

    # Log metrics
    log_metric "openai" "$model" "$tokens" "$duration_ms" "$first_token_time" "$request_id" "$error"

    # Check rate limits
    check_rate "openai" "$tokens" "$duration_ms" "$request_id"

    return 0
}

monitor_custom() {
    local endpoint="$1"
    local model="${2:-custom}"
    local prompt="${3:-Hello}"
    local request_id="${4:-$(get_timestamp_ms)}"

    local timeout_ms=$(get_config ".sources.custom.timeout_ms" "120000")

    local start_time=$(get_timestamp_ms)
    local first_token_time=0
    local tokens=0
    local error=""

    echo -e "${BLUE}[CUSTOM]${RESET} Monitoring request to $endpoint..."

    # Make request with timeout
    local response
    if ! response=$(with_timeout "$timeout_ms" "curl -s '$endpoint' -d '{\"prompt\": \"$prompt\"}'" 2>&1); then
        if [ $? -eq 124 ]; then
            log_rate_action "custom" "timeout" "0" "$timeout_ms" "$request_id"
            log_metric "custom" "$model" "0" "$timeout_ms" "0" "$request_id" "TIMEOUT"
            return 124
        fi
        error="Request failed"
    fi

    local end_time=$(get_timestamp_ms)
    local duration_ms=$(( end_time - start_time ))

    # Try to parse tokens from response (various formats)
    if [ -z "$error" ]; then
        tokens=$(echo "$response" | jq -r '.tokens // .usage.tokens // .token_count // 0' 2>/dev/null || echo "0")
    fi

    # Log metrics
    log_metric "custom" "$model" "$tokens" "$duration_ms" "$first_token_time" "$request_id" "$error"

    # Check rate limits
    check_rate "custom" "$tokens" "$duration_ms" "$request_id"

    return 0
}

#------------------------------------------------------------------------------
# Statistics & Reports
#------------------------------------------------------------------------------

show_stats() {
    local source="${1:-all}"
    local hours="${2:-24}"

    echo -e "${VIOLET}TOKEN MONITOR STATISTICS (last ${hours}h)${RESET}"
    echo ""

    local where_clause=""
    if [ "$source" != "all" ]; then
        where_clause="WHERE source = '$source' AND"
    else
        where_clause="WHERE"
    fi

    sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    source,
    COUNT(*) as requests,
    SUM(tokens_generated) as total_tokens,
    ROUND(AVG(tokens_per_second), 2) as avg_tps,
    ROUND(MIN(tokens_per_second), 2) as min_tps,
    ROUND(MAX(tokens_per_second), 2) as max_tps,
    ROUND(AVG(duration_ms), 0) as avg_duration_ms,
    ROUND(AVG(first_token_ms), 0) as avg_first_token_ms,
    SUM(timeout_occurred) as timeouts,
    SUM(throttled) as throttles
FROM token_metrics
$where_clause timestamp >= datetime('now', '-$hours hours')
GROUP BY source;
SQL

    echo ""
    echo -e "${VIOLET}RATE LIMIT EVENTS:${RESET}"
    sqlite3 -header -column "$DB_FILE" << SQL
SELECT
    source,
    action,
    COUNT(*) as count,
    ROUND(AVG(tokens_per_second), 2) as avg_tps
FROM rate_limits
$where_clause timestamp >= datetime('now', '-$hours hours')
GROUP BY source, action;
SQL
}

show_live() {
    echo -e "${VIOLET}LIVE TOKEN MONITOR${RESET}"
    echo "Press Ctrl+C to stop"
    echo ""

    tail -f "$LOG_FILE" 2>/dev/null | while read line; do
        if echo "$line" | grep -q "RATE_ACTION"; then
            echo -e "${AMBER}$line${RESET}"
        elif echo "$line" | grep -q "error="; then
            echo -e "${RED}$line${RESET}"
        else
            echo -e "${CYAN}$line${RESET}"
        fi
    done
}

health_check() {
    echo -e "${VIOLET}HEALTH CHECK${RESET}"
    echo ""

    for source in ollama claude openai; do
        local avg_tps=$(sqlite3 "$DB_FILE" "SELECT ROUND(AVG(tokens_per_second), 2) FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-1 hour');" 2>/dev/null || echo "0")
        local error_rate=$(sqlite3 "$DB_FILE" "SELECT ROUND(100.0 * SUM(CASE WHEN error != '' THEN 1 ELSE 0 END) / COUNT(*), 2) FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-1 hour');" 2>/dev/null || echo "0")
        local p95_latency=$(sqlite3 "$DB_FILE" "SELECT duration_ms FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-1 hour') ORDER BY duration_ms DESC LIMIT 1 OFFSET (SELECT COUNT(*)/20 FROM token_metrics WHERE source='$source' AND timestamp >= datetime('now', '-1 hour'));" 2>/dev/null || echo "0")

        local status="healthy"
        local color="$GREEN"

        if [ "$(echo "$error_rate > 10" | bc)" -eq 1 ]; then
            status="unhealthy"
            color="$RED"
        elif [ "$(echo "$error_rate > 5" | bc)" -eq 1 ]; then
            status="degraded"
            color="$AMBER"
        fi

        echo -e "${color}[$status]${RESET} $source: avg_tps=$avg_tps error_rate=${error_rate}% p95_latency=${p95_latency}ms"

        # Log health check
        sqlite3 "$DB_FILE" "INSERT INTO health_checks (source, status, avg_tokens_per_second, p95_latency_ms, error_rate) VALUES ('$source', '$status', $avg_tps, $p95_latency, $error_rate);"
    done
}

#------------------------------------------------------------------------------
# CLI
#------------------------------------------------------------------------------

CMD="${1:-help}"

case "$CMD" in
    init|setup)
        banner
        echo ""
        init_db
        init_config
        echo ""
        echo -e "${GREEN}+ Token Monitor initialized${RESET}"
        echo ""
        echo "Next steps:"
        echo "  blackroad-token-monitor.sh test     # Run a test"
        echo "  blackroad-token-monitor.sh stats    # View statistics"
        echo "  blackroad-token-monitor.sh live     # Watch live metrics"
        ;;

    monitor)
        source="${2:-ollama}"
        model="${3:-llama2}"
        prompt="${4:-Hello, how are you?}"

        case "$source" in
            ollama)  monitor_ollama "$model" "$prompt" ;;
            claude)  monitor_claude "$model" "$prompt" ;;
            openai)  monitor_openai "$model" "$prompt" ;;
            custom)  monitor_custom "$model" "$prompt" ;;
            *)
                echo "Unknown source: $source"
                echo "Supported: ollama, claude, openai, custom"
                exit 1
                ;;
        esac
        ;;

    test)
        banner
        echo ""
        echo -e "${BLUE}Running test suite...${RESET}"
        echo ""

        # Test Ollama (if available)
        if curl -s "http://localhost:11434/api/tags" >/dev/null 2>&1; then
            echo -e "${VIOLET}Test 1: Ollama${RESET}"
            monitor_ollama "llama2" "Say hello"
            echo ""
        else
            echo -e "${AMBER}[SKIP]${RESET} Ollama not available at localhost:11434"
            echo ""
        fi

        # Test rate limiting simulation
        echo -e "${VIOLET}Test 2: Rate Limit Simulation${RESET}"
        log_metric "test" "test-model" "10" "10000" "500" "test-$(date +%s)" ""
        check_rate "test" "10" "10000" "test-$(date +%s)"
        echo ""

        # Test timeout simulation
        echo -e "${VIOLET}Test 3: Timeout Simulation${RESET}"
        if ! with_timeout 1000 "sleep 2"; then
            echo -e "${GREEN}+${RESET} Timeout correctly triggered"
        fi
        echo ""

        echo -e "${GREEN}+ All tests completed${RESET}"
        ;;

    stats)
        source="${2:-all}"
        hours="${3:-24}"
        banner
        echo ""
        show_stats "$source" "$hours"
        ;;

    live)
        banner
        show_live
        ;;

    health)
        banner
        echo ""
        health_check
        ;;

    # STREAMING MONITOR
    stream)
        source="${2:-ollama}"
        model="${3:-llama2}"
        prompt="${4:-Tell me a short story}"

        banner
        echo ""
        case "$source" in
            ollama)  stream_ollama "$model" "$prompt" ;;
            claude)  stream_claude "$model" "$prompt" ;;
            *)
                echo "Streaming supported for: ollama, claude"
                exit 1
                ;;
        esac
        ;;

    stream-stats)
        request_id="${2:-}"
        hours="${3:-1}"
        banner
        echo ""
        show_stream_stats "$request_id" "$hours"
        ;;

    # COST TRACKING
    costs)
        hours="${2:-24}"
        banner
        echo ""
        show_costs "$hours"
        ;;

    # ALERTING
    alerts)
        hours="${2:-24}"
        banner
        echo ""
        show_alerts "$hours"
        ;;

    alert)
        severity="${2:-info}"
        source="${3:-manual}"
        message="${4:-Test alert}"
        send_alert "$severity" "$source" "manual" "$message"
        ;;

    # AUTO-SCALING
    scaling)
        hours="${2:-24}"
        banner
        echo ""
        show_scaling_events "$hours"
        ;;

    scale-check)
        source="${2:-ollama}"
        SCALING_ENABLED=true check_scaling "$source"
        ;;

    # DASHBOARD (all metrics at once)
    dashboard)
        banner
        echo ""
        echo -e "${VIOLET}=== HEALTH ===${RESET}"
        health_check
        echo ""
        echo -e "${VIOLET}=== STATS (1h) ===${RESET}"
        show_stats "all" "1"
        echo ""
        echo -e "${VIOLET}=== COSTS (24h) ===${RESET}"
        show_costs "24"
        echo ""
        echo -e "${VIOLET}=== RECENT ALERTS ===${RESET}"
        sqlite3 -header -column "$DB_FILE" "SELECT timestamp, severity, source, message FROM alerts ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null || echo "No alerts"
        echo ""
        echo -e "${VIOLET}=== SCALING EVENTS ===${RESET}"
        sqlite3 -header -column "$DB_FILE" "SELECT timestamp, action, trigger, source FROM scaling_events ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null || echo "No scaling events"
        ;;

    config)
        if [ -f "$CONFIG_FILE" ]; then
            cat "$CONFIG_FILE" | jq .
        else
            echo "Config not found. Run: init"
        fi
        ;;

    set)
        key="${2:-}"
        value="${3:-}"

        if [ -z "$key" ] || [ -z "$value" ]; then
            echo "Usage: blackroad-token-monitor.sh set <key> <value>"
            echo "Example: blackroad-token-monitor.sh set .thresholds.timeout_ms 60000"
            exit 1
        fi

        jq "$key = $value" "$CONFIG_FILE" > "${CONFIG_FILE}.tmp"
        mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
        echo -e "${GREEN}+${RESET} Set $key = $value"
        ;;

    help|*)
        banner
        echo ""
        echo -e "${BLUE}USAGE:${RESET}"
        echo "  blackroad-token-monitor.sh <command> [args]"
        echo ""
        echo -e "${BLUE}CORE COMMANDS:${RESET}"
        echo "  init                  Initialize database and config"
        echo "  monitor <src> [model] Monitor a specific source (batch)"
        echo "  test                  Run test suite"
        echo "  stats [source] [hrs]  Show statistics"
        echo "  live                  Watch live metrics"
        echo "  health                Run health check"
        echo "  dashboard             Full dashboard (all metrics)"
        echo ""
        echo -e "${PINK}STREAMING:${RESET}"
        echo "  stream <src> [model]  Real-time token-by-token monitor"
        echo "  stream-stats [id]     Show streaming metrics"
        echo ""
        echo -e "${AMBER}COST TRACKING:${RESET}"
        echo "  costs [hours]         Show API costs breakdown"
        echo ""
        echo -e "${RED}ALERTING:${RESET}"
        echo "  alerts [hours]        Show recent alerts"
        echo "  alert <sev> <src> <msg>  Send manual alert"
        echo ""
        echo -e "${VIOLET}AUTO-SCALING:${RESET}"
        echo "  scaling [hours]       Show scaling events"
        echo "  scale-check <src>     Force scaling check"
        echo ""
        echo -e "${BLUE}CONFIG:${RESET}"
        echo "  config                Show current configuration"
        echo "  set <key> <value>     Update configuration"
        echo ""
        echo -e "${BLUE}SOURCES:${RESET}"
        echo "  ollama   - Local Ollama instance"
        echo "  claude   - Anthropic Claude API"
        echo "  openai   - OpenAI API"
        echo "  custom   - Custom LLM endpoint"
        echo ""
        echo -e "${BLUE}FEATURES:${RESET}"
        echo "  - Rate Limiting: Throttle if too slow (<min) or too fast (>max)"
        echo "  - Timeout: Abort requests exceeding threshold"
        echo "  - Streaming: Real-time token-by-token tracking with live TPS"
        echo "  - Cost Tracking: \$/token for Claude, OpenAI (GPT-4, GPT-3.5)"
        echo "  - Alerting: Webhooks, Slack notifications on threshold breach"
        echo "  - Auto-Scaling: Trigger scale up/down based on metrics"
        echo "  - Logging: Memory system, SQLite, stdout/stderr"
        echo ""
        echo -e "${BLUE}ENVIRONMENT VARIABLES:${RESET}"
        echo "  ANTHROPIC_API_KEY       Claude API key"
        echo "  OPENAI_API_KEY          OpenAI API key"
        echo "  BLACKROAD_ALERT_WEBHOOK Generic webhook URL for alerts"
        echo "  BLACKROAD_SLACK_WEBHOOK Slack webhook URL"
        echo "  BLACKROAD_AUTOSCALE     Enable auto-scaling (true/false)"
        echo "  BLACKROAD_SCALE_UP_CMD  Command to run on scale up"
        echo "  BLACKROAD_SCALE_DOWN_CMD Command to run on scale down"
        echo ""
        echo -e "${BLUE}EXAMPLES:${RESET}"
        echo "  # Initialize"
        echo "  blackroad-token-monitor.sh init"
        echo ""
        echo "  # Stream from Ollama (live token-by-token)"
        echo "  blackroad-token-monitor.sh stream ollama llama2 'Tell me a story'"
        echo ""
        echo "  # Stream from Claude"
        echo "  blackroad-token-monitor.sh stream claude claude-3-sonnet 'Hello'"
        echo ""
        echo "  # View costs"
        echo "  blackroad-token-monitor.sh costs 24"
        echo ""
        echo "  # Full dashboard"
        echo "  blackroad-token-monitor.sh dashboard"
        echo ""
        echo "  # Send test alert"
        echo "  blackroad-token-monitor.sh alert warning ollama 'High latency detected'"
        echo ""
        echo "  # Enable auto-scaling"
        echo "  BLACKROAD_AUTOSCALE=true blackroad-token-monitor.sh scale-check ollama"
        ;;
esac
