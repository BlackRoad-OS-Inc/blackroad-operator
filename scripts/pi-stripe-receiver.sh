#!/usr/bin/env bash
set -euo pipefail

# BlackRoad OS — Pi Stripe Webhook Receiver
# Runs on Raspberry Pi (192.168.4.64) to receive forwarded Stripe events
# from the Cloudflare Worker and route them to local services.
#
# Usage:
#   ./pi-stripe-receiver.sh              # Start receiver on port 8080
#   ./pi-stripe-receiver.sh --port 9090  # Custom port
#
# Deploy to Pi:
#   scp scripts/pi-stripe-receiver.sh pi@192.168.4.64:~/stripe-receiver.sh
#   ssh pi@192.168.4.64 'chmod +x ~/stripe-receiver.sh && ~/stripe-receiver.sh'

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

PORT="${2:-8080}"
DB_FILE="$HOME/.blackroad/stripe-events.db"
LOG_FILE="$HOME/.blackroad/stripe-webhooks.log"

mkdir -p "$(dirname "$DB_FILE")"

# Initialize SQLite
sqlite3 "$DB_FILE" <<'SQL'
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    customer TEXT,
    subscription TEXT,
    amount INTEGER,
    status TEXT,
    payload TEXT,
    received_at INTEGER NOT NULL,
    processed INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
    stripe_id TEXT PRIMARY KEY,
    email TEXT,
    tier TEXT,
    status TEXT DEFAULT 'active',
    subscribed_at INTEGER,
    updated_at INTEGER
);
SQL

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1"; }
err() { echo -e "${RED}[$(date +%H:%M:%S)]${NC} $1"; }

process_event() {
    local payload="$1"
    local event_id event_type

    event_id=$(echo "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
    event_type=$(echo "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('type',''))" 2>/dev/null || echo "")

    if [[ -z "$event_id" ]]; then
        err "Could not parse event ID"
        return 1
    fi

    # Check if already processed
    local existing
    existing=$(sqlite3 "$DB_FILE" "SELECT id FROM events WHERE id='$event_id' LIMIT 1;")
    if [[ -n "$existing" ]]; then
        warn "Event $event_id already processed, skipping"
        return 0
    fi

    log "Processing: $event_type ($event_id)"

    # Extract fields based on event type
    local customer="" subscription="" amount="0" status=""

    case "$event_type" in
        checkout.session.completed)
            customer=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('customer',''))" 2>/dev/null || echo "")
            subscription=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('subscription',''))" 2>/dev/null || echo "")
            status="completed"
            local email tier
            email=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('customer_email','') or d.get('customer_details',{}).get('email',''))" 2>/dev/null || echo "")
            tier=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}).get('metadata',{}); print(d.get('tier',''))" 2>/dev/null || echo "")

            if [[ -n "$customer" ]]; then
                sqlite3 "$DB_FILE" "INSERT OR REPLACE INTO customers (stripe_id, email, tier, status, subscribed_at, updated_at) VALUES ('$customer', '$email', '$tier', 'active', $(date +%s), $(date +%s));"
                log "  Customer $customer ($email) → tier: $tier"
            fi
            ;;
        customer.subscription.updated|customer.subscription.created)
            customer=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('customer',''))" 2>/dev/null || echo "")
            subscription=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('id',''))" 2>/dev/null || echo "")
            status=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('status',''))" 2>/dev/null || echo "")

            if [[ -n "$customer" ]]; then
                sqlite3 "$DB_FILE" "UPDATE customers SET status='$status', updated_at=$(date +%s) WHERE stripe_id='$customer';"
            fi
            log "  Subscription $subscription → $status"
            ;;
        customer.subscription.deleted)
            customer=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('customer',''))" 2>/dev/null || echo "")
            subscription=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('id',''))" 2>/dev/null || echo "")
            status="canceled"

            if [[ -n "$customer" ]]; then
                sqlite3 "$DB_FILE" "UPDATE customers SET status='canceled', updated_at=$(date +%s) WHERE stripe_id='$customer';"
            fi
            log "  Subscription $subscription canceled"
            ;;
        invoice.payment_succeeded)
            customer=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('customer',''))" 2>/dev/null || echo "")
            amount=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('amount_paid',0))" 2>/dev/null || echo "0")
            status="paid"
            log "  Invoice paid: \$$(echo "scale=2; $amount / 100" | bc 2>/dev/null || echo "$amount")"
            ;;
        invoice.payment_failed)
            customer=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('customer',''))" 2>/dev/null || echo "")
            amount=$(echo "$payload" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}).get('object',{}); print(d.get('amount_due',0))" 2>/dev/null || echo "0")
            status="failed"
            err "  Invoice FAILED for $customer — \$$(echo "scale=2; $amount / 100" | bc 2>/dev/null || echo "$amount")"
            ;;
        *)
            status="ignored"
            warn "  Unhandled event type: $event_type"
            ;;
    esac

    # Store event
    sqlite3 "$DB_FILE" "INSERT INTO events (id, type, customer, subscription, amount, status, payload, received_at, processed) VALUES ('$event_id', '$event_type', '$customer', '$subscription', $amount, '$status', '', $(date +%s), 1);"

    # Append to log
    echo "[$(date -Iseconds)] $event_type $event_id customer=$customer status=$status" >> "$LOG_FILE"

    return 0
}

# ─── HTTP server using Python ────────────────────────────────────────────────

start_server() {
    log "Starting Stripe webhook receiver on port $PORT..."
    log "Pi endpoint: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '0.0.0.0'):$PORT/webhooks/stripe"

    python3 -c "
import http.server, json, subprocess, sys

class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhooks/stripe':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())

            # Write payload to temp file and process
            import tempfile, os
            fd, path = tempfile.mkstemp(suffix='.json')
            with os.fdopen(fd, 'w') as f:
                f.write(body)
            os.system(f'\"$0\" --process \"{path}\" && rm -f \"{path}\"'.replace('\$0', sys.argv[1]))
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True, 'service': 'pi-stripe-receiver'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True, 'service': 'pi-stripe-receiver'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        pass  # Suppress default logging

server = http.server.HTTPServer(('0.0.0.0', $PORT), Handler)
print(f'Listening on 0.0.0.0:$PORT', flush=True)
server.serve_forever()
" "$0"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

case "${1:---start}" in
    --process)
        if [[ -f "$2" ]]; then
            process_event "$(cat "$2")"
        fi
        ;;
    --status)
        echo -e "${CYAN}Stripe Event Stats:${NC}"
        sqlite3 "$DB_FILE" "SELECT type, COUNT(*) as count FROM events GROUP BY type ORDER BY count DESC;" | while IFS='|' read -r type count; do
            echo -e "  $type: $count"
        done
        echo ""
        echo -e "${CYAN}Active Customers:${NC}"
        sqlite3 "$DB_FILE" "SELECT stripe_id, email, tier, status FROM customers ORDER BY updated_at DESC LIMIT 10;" | while IFS='|' read -r sid email tier status; do
            echo -e "  $sid  $email  tier=$tier  status=$status"
        done
        ;;
    --start|*)
        start_server
        ;;
esac
