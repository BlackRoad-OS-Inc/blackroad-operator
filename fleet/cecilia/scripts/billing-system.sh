#!/bin/bash
# [BILLING] System - Usage and billing tracking for BlackRoad
# Usage: ~/billing-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

BILLING_DB="$HOME/.blackroad/billing.db"

init_billing() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$BILLING_DB" <<EOF
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    price_cents INTEGER DEFAULT 0,
    interval TEXT DEFAULT 'monthly',
    features TEXT,
    limits TEXT,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_period_start TEXT,
    current_period_end TEXT,
    cancelled_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id TEXT NOT NULL,
    metric TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit_price_cents INTEGER DEFAULT 0,
    period TEXT,
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    subscription_id TEXT,
    amount_cents INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    period_start TEXT,
    period_end TEXT,
    due_date TEXT,
    paid_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    customer_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    method TEXT,
    processed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO plans (id, name, price_cents, features) VALUES
    ('free', 'Free', 0, 'basic'),
    ('pro', 'Pro', 2900, 'advanced'),
    ('enterprise', 'Enterprise', 9900, 'unlimited');
EOF
    echo -e "${GREEN}[BILLING]${RESET} System initialized"
}

# Create plan
plan() {
    local id="$1"
    local name="$2"
    local price="$3"
    local interval="${4:-monthly}"

    sqlite3 "$BILLING_DB" "INSERT OR REPLACE INTO plans (id, name, price_cents, interval) VALUES ('$id', '$name', $price, '$interval');"
    echo -e "${GREEN}[BILLING]${RESET} Plan created: $name (\$$(echo "scale=2; $price/100" | bc)/$interval)"
}

# List plans
plans() {
    echo -e "${AMBER}[BILLING]${RESET} Plans"
    echo ""
    sqlite3 -column -header "$BILLING_DB" "SELECT id, name, price_cents/100.0 as price, interval, active FROM plans ORDER BY price_cents;"
}

# Subscribe
subscribe() {
    local customer_id="$1"
    local plan_id="$2"

    local sub_id="sub-$(openssl rand -hex 8)"
    local period_end=$(date -v+1m +%Y-%m-%d 2>/dev/null || date -d '+1 month' +%Y-%m-%d)

    sqlite3 "$BILLING_DB" "INSERT INTO subscriptions (id, customer_id, plan_id, current_period_start, current_period_end) VALUES ('$sub_id', '$customer_id', '$plan_id', date('now'), '$period_end');"

    echo -e "${GREEN}[BILLING]${RESET} Subscribed: $customer_id to $plan_id ($sub_id)"
    echo "$sub_id"
}

# List subscriptions
subscriptions() {
    local filter="${1:-}"
    echo -e "${AMBER}[BILLING]${RESET} Subscriptions"
    echo ""
    if [[ -n "$filter" ]]; then
        sqlite3 -column -header "$BILLING_DB" "SELECT s.id, s.customer_id, p.name as plan, s.status, s.current_period_end FROM subscriptions s JOIN plans p ON s.plan_id=p.id WHERE s.customer_id='$filter' OR s.status='$filter' ORDER BY s.created_at DESC;"
    else
        sqlite3 -column -header "$BILLING_DB" "SELECT s.id, s.customer_id, p.name as plan, s.status, s.current_period_end FROM subscriptions s JOIN plans p ON s.plan_id=p.id ORDER BY s.created_at DESC LIMIT 30;"
    fi
}

# Cancel subscription
cancel() {
    local sub_id="$1"

    sqlite3 "$BILLING_DB" "UPDATE subscriptions SET status='cancelled', cancelled_at=datetime('now') WHERE id='$sub_id';"
    echo -e "${YELLOW}[BILLING]${RESET} Cancelled: $sub_id"
}

# Record usage
usage() {
    local sub_id="$1"
    local metric="$2"
    local quantity="$3"
    local unit_price="${4:-0}"
    local period="${5:-$(date +%Y-%m)}"

    sqlite3 "$BILLING_DB" "INSERT INTO usage_records (subscription_id, metric, quantity, unit_price_cents, period) VALUES ('$sub_id', '$metric', $quantity, $unit_price, '$period');"
    echo -e "${GREEN}[BILLING]${RESET} Usage: $metric = $quantity"
}

# Get usage
get_usage() {
    local sub_id="$1"
    local period="${2:-$(date +%Y-%m)}"

    echo -e "${AMBER}[BILLING]${RESET} Usage for $period"
    echo ""
    sqlite3 -column -header "$BILLING_DB" "SELECT metric, SUM(quantity) as total, SUM(quantity * unit_price_cents)/100.0 as cost FROM usage_records WHERE subscription_id='$sub_id' AND period='$period' GROUP BY metric;"
}

# Create invoice
invoice() {
    local customer_id="$1"
    local amount="$2"
    local sub_id="${3:-}"

    local inv_id="inv-$(openssl rand -hex 8)"
    local due_date=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d '+30 days' +%Y-%m-%d)

    sqlite3 "$BILLING_DB" "INSERT INTO invoices (id, customer_id, subscription_id, amount_cents, due_date) VALUES ('$inv_id', '$customer_id', '$sub_id', $amount, '$due_date');"

    echo -e "${GREEN}[BILLING]${RESET} Invoice: $inv_id (\$$(echo "scale=2; $amount/100" | bc))"
    echo "$inv_id"
}

# List invoices
invoices() {
    local customer="${1:-}"
    echo -e "${AMBER}[BILLING]${RESET} Invoices"
    echo ""
    if [[ -n "$customer" ]]; then
        sqlite3 -column -header "$BILLING_DB" "SELECT id, amount_cents/100.0 as amount, status, due_date, created_at FROM invoices WHERE customer_id='$customer' ORDER BY created_at DESC;"
    else
        sqlite3 -column -header "$BILLING_DB" "SELECT id, customer_id, amount_cents/100.0 as amount, status, due_date FROM invoices ORDER BY created_at DESC LIMIT 30;"
    fi
}

# Pay invoice
pay() {
    local inv_id="$1"
    local method="${2:-card}"

    local row=$(sqlite3 "$BILLING_DB" "SELECT customer_id, amount_cents FROM invoices WHERE id='$inv_id';")
    IFS='|' read -r customer_id amount <<< "$row"

    local pay_id="pay-$(openssl rand -hex 8)"

    sqlite3 "$BILLING_DB" "INSERT INTO payments (id, invoice_id, customer_id, amount_cents, status, method, processed_at) VALUES ('$pay_id', '$inv_id', '$customer_id', $amount, 'succeeded', '$method', datetime('now'));"
    sqlite3 "$BILLING_DB" "UPDATE invoices SET status='paid', paid_at=datetime('now') WHERE id='$inv_id';"

    echo -e "${GREEN}[BILLING]${RESET} Paid: $inv_id (\$$(echo "scale=2; $amount/100" | bc))"
}

# List payments
payments() {
    local customer="${1:-}"
    echo -e "${AMBER}[BILLING]${RESET} Payments"
    echo ""
    if [[ -n "$customer" ]]; then
        sqlite3 -column -header "$BILLING_DB" "SELECT id, amount_cents/100.0 as amount, status, method, processed_at FROM payments WHERE customer_id='$customer' ORDER BY created_at DESC;"
    else
        sqlite3 -column -header "$BILLING_DB" "SELECT id, customer_id, amount_cents/100.0 as amount, status, processed_at FROM payments ORDER BY created_at DESC LIMIT 30;"
    fi
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}       ${AMBER}[BILLING] System Stats${RESET}       ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local plans=$(sqlite3 "$BILLING_DB" "SELECT COUNT(*) FROM plans WHERE active=1;")
    local subs=$(sqlite3 "$BILLING_DB" "SELECT COUNT(*) FROM subscriptions WHERE status='active';")
    local invoices=$(sqlite3 "$BILLING_DB" "SELECT COUNT(*) FROM invoices;")
    local paid=$(sqlite3 "$BILLING_DB" "SELECT COUNT(*) FROM invoices WHERE status='paid';")
    local revenue=$(sqlite3 "$BILLING_DB" "SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE status='succeeded';")

    echo -e "  ${GREEN}Active Plans:${RESET}   $plans"
    echo -e "  ${GREEN}Subscriptions:${RESET}  $subs"
    echo -e "  ${GREEN}Invoices:${RESET}       $invoices"
    echo -e "  ${GREEN}Paid:${RESET}           $paid"
    echo -e "  ${GREEN}Total Revenue:${RESET}  \$$(echo "scale=2; $revenue/100" | bc)"
    echo ""
    echo -e "${BLUE}By Plan:${RESET}"
    sqlite3 -column "$BILLING_DB" "SELECT p.name, COUNT(s.id) as subscribers FROM plans p LEFT JOIN subscriptions s ON p.id=s.plan_id AND s.status='active' GROUP BY p.id ORDER BY subscribers DESC;"
}

show_help() {
    echo -e "${PINK}[BILLING]${RESET} - BlackRoad Billing System"
    echo ""
    echo "Usage: ~/billing-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                              Initialize system"
    echo "  plan <id> <name> <price_cents>    Create plan"
    echo "  plans                             List plans"
    echo "  subscribe <customer> <plan>       Create subscription"
    echo "  subscriptions [filter]            List subscriptions"
    echo "  cancel <sub_id>                   Cancel subscription"
    echo "  usage <sub> <metric> <qty>        Record usage"
    echo "  get-usage <sub_id> [period]       Get usage"
    echo "  invoice <customer> <amount>       Create invoice"
    echo "  invoices [customer]               List invoices"
    echo "  pay <invoice_id> [method]         Pay invoice"
    echo "  payments [customer]               List payments"
    echo "  stats                             Show statistics"
}

case "${1:-help}" in
    init)          init_billing ;;
    plan)          plan "$2" "$3" "$4" "$5" ;;
    plans)         plans ;;
    subscribe)     subscribe "$2" "$3" ;;
    subscriptions) subscriptions "$2" ;;
    cancel)        cancel "$2" ;;
    usage)         usage "$2" "$3" "$4" "$5" "$6" ;;
    get-usage)     get_usage "$2" "$3" ;;
    invoice)       invoice "$2" "$3" "$4" ;;
    invoices)      invoices "$2" ;;
    pay)           pay "$2" "$3" ;;
    payments)      payments "$2" ;;
    stats)         stats ;;
    help|*)        show_help ;;
esac
