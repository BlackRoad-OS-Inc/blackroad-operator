#!/bin/bash
# BlackRoad OS, Inc. — Corporate Autopilot
# Automated compliance monitoring, expense tracking, and corporate health checks
# Runs via cron: 0 8 1 * * (monthly on the 1st at 8am)

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

CORP_DIR="$HOME/blackroad-operator/docs/corporate"
MEMORY_LOG="$HOME/blackroad-operator/scripts/memory/memory-system.sh"
TIL_BROADCAST="$HOME/blackroad-operator/scripts/memory/memory-til-broadcast.sh"
LOG_FILE="$CORP_DIR/autopilot.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M')] $1" >> "$LOG_FILE"; }
alert() { echo -e "  ${RED}${BOLD}⚠️  $1${NC}"; }
ok() { echo -e "  ${GREEN}✓${NC} $1"; }
info() { echo -e "  ${DIM}$1${NC}"; }

echo -e "\n  ${AMBER}${BOLD}◆ CORPORATE AUTOPILOT${NC}  ${DIM}BlackRoad OS, Inc.${NC}"
echo -e "  ${DIM}$(date '+%Y-%m-%d %H:%M')${NC}\n"

# ═══════════════════════════════════════════════════════════
# 1. COMPLIANCE CALENDAR CHECK
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Compliance Calendar${NC}"

MONTH=$(date '+%m')
DAY=$(date '+%d')
YEAR=$(date '+%Y')

# Delaware Franchise Tax (due March 1)
if [[ "$MONTH" == "02" ]]; then
    alert "Delaware Franchise Tax due NEXT MONTH (March 1)"
    alert "Pay at: https://corp.delaware.gov/paytaxes/ | File #: 10405914"
    log "REMINDER: Delaware franchise tax due March 1"
elif [[ "$MONTH" == "03" && "$DAY" -le "01" ]]; then
    alert "Delaware Franchise Tax due TODAY"
    log "URGENT: Delaware franchise tax due today"
elif [[ "$MONTH" == "03" && "$DAY" -gt "01" ]]; then
    alert "Delaware Franchise Tax is OVERDUE"
    log "OVERDUE: Delaware franchise tax"
else
    ok "Delaware Franchise Tax: not due yet (March 1)"
fi

# Federal tax return (April 15 or October 15 if extended)
if [[ "$MONTH" == "04" && "$DAY" -le "15" ]]; then
    alert "Form 1120 (or Form 7004 extension) due April 15"
    log "REMINDER: Federal tax deadline April 15"
elif [[ "$MONTH" == "03" ]]; then
    info "Form 1120/7004: due next month (April 15)"
elif [[ "$MONTH" == "10" && "$DAY" -le "15" ]]; then
    alert "Form 1120 extended deadline: October 15"
    log "REMINDER: Extended federal tax deadline October 15"
else
    ok "Federal tax: no immediate deadline"
fi

# Registered agent renewal (annual, ~$100)
ok "Registered Agent: Legalinc Corporate Services Inc. (renews via Stripe Atlas)"

# Annual board meeting
if [[ "$MONTH" == "12" ]]; then
    alert "Annual board meeting should happen this month (required by bylaws)"
    log "REMINDER: Annual board meeting due December"
else
    ok "Annual board meeting: scheduled for December"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 2. DOMAIN PORTFOLIO HEALTH
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Domain Health${NC}"

DOMAINS=(
    blackroad.io blackroad.me blackroad.company blackroad.network
    blackroad.systems blackroadinc.us blackroadai.com blackroadqi.com
    blackroadquantum.com blackroadquantum.net blackroadquantum.info
    blackroadquantum.shop blackroadquantum.store blackboxprogramming.io
    lucidia.earth lucidia.studio lucidiaqi.com aliceqi.com
    roadchain.io roadcoin.io
)

up=0; down=0
for domain in "${DOMAINS[@]}"; do
    status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 5 "https://$domain" 2>/dev/null || echo "000")
    if [[ "$status" =~ ^[23] ]]; then
        ((up++))
    else
        alert "$domain — HTTP $status"
        ((down++))
    fi
done
ok "Domains: $up/20 responding, $down down"
log "Domain check: $up/20 up, $down/20 down"

echo ""

# ═══════════════════════════════════════════════════════════
# 3. STRIPE REVENUE CHECK
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Revenue Status${NC}"

# Check if Stripe CLI is available
if command -v stripe &>/dev/null; then
    balance=$(stripe balance retrieve 2>/dev/null | grep -o '"available".*' | head -1 || echo "unavailable")
    info "Stripe balance: $balance"
else
    info "Stripe CLI not installed — check dashboard.stripe.com"
fi

# Check RoadPay worker
roadpay_status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 5 "https://pay.blackroad.io" 2>/dev/null || echo "000")
if [[ "$roadpay_status" =~ ^[23] ]]; then
    ok "RoadPay (pay.blackroad.io): responding"
else
    alert "RoadPay (pay.blackroad.io): HTTP $roadpay_status"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 4. INFRASTRUCTURE COST TRACKING
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Monthly Costs (estimated)${NC}"

info "Cloudflare: Free plan (Workers, Pages, D1, KV, R2 all free tier)"
info "Domains (~20): ~$15-20/month amortized"
info "DigitalOcean (2 droplets): ~$24/month"
info "GitHub Enterprise: check billing"
info "Stripe Atlas registered agent: $100/year ($8.33/mo)"
info "Electricity (5 Pis): ~$5/month"
info "Internet: existing connection"
echo -e "  ${AMBER}Estimated total: ~$55-60/month${NC}"
log "Monthly cost estimate: ~$55-60"

echo ""

# ═══════════════════════════════════════════════════════════
# 5. EXPENSE TRACKING FOR TAX DEDUCTIONS
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Expense Categories (for Form 1120)${NC}"

EXPENSE_FILE="$CORP_DIR/expenses-$(date '+%Y').csv"
if [[ ! -f "$EXPENSE_FILE" ]]; then
    echo "date,category,description,amount,receipt" > "$EXPENSE_FILE"
    echo "2025-11-17,Formation,Stripe Atlas - C Corp formation,500.00,stripe-atlas-receipt" >> "$EXPENSE_FILE"
    echo "2025-11-17,Legal,Delaware state filing fee,0.00,included-in-atlas" >> "$EXPENSE_FILE"
    info "Created expense tracker: $EXPENSE_FILE"
    info "Add expenses: echo 'date,category,description,amount,receipt' >> $EXPENSE_FILE"
else
    expense_count=$(tail -n +2 "$EXPENSE_FILE" | wc -l | tr -d ' ')
    total=$(tail -n +2 "$EXPENSE_FILE" | awk -F, '{sum+=$4} END {printf "%.2f", sum}')
    ok "Expense tracker: $expense_count entries, \$$total total"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 6. DOCUMENT COMPLETENESS CHECK
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Formation Documents${NC}"

FORMATION_DIR="$CORP_DIR/formation"
required_docs=(
    "Approved Certificate of Incorporation"
    "Bylaws"
    "CP 575 Letter"
    "Common Stock Certificate"
    "Section 83(b)"
    "RSPA"
    "Form of Employee CIIAA"
    "Indemnification Agreement"
    "SS-4"
)

found=0; missing=0
for doc in "${required_docs[@]}"; do
    if ls "$FORMATION_DIR"/*"$doc"* &>/dev/null 2>&1; then
        ((found++))
    else
        alert "Missing: $doc"
        ((missing++))
    fi
done
ok "Formation docs: $found/9 critical documents present"

echo ""

# ═══════════════════════════════════════════════════════════
# 7. CORPORATE RECORDS BOARD MINUTES
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Board Minutes${NC}"

MINUTES_DIR="$CORP_DIR/board-minutes"
mkdir -p "$MINUTES_DIR"

minutes_count=$(ls "$MINUTES_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
if [[ "$minutes_count" -eq 0 ]]; then
    info "No board minutes recorded yet"
    info "Required: at least 1 annual meeting per bylaws"
    # Create template
    if [[ ! -f "$MINUTES_DIR/TEMPLATE.md" ]]; then
        cat > "$MINUTES_DIR/TEMPLATE.md" << 'TEMPLATE'
# Board of Directors Meeting Minutes
## BlackRoad OS, Inc.

**Date:** [DATE]
**Time:** [TIME]
**Location:** Remote (video conference)
**Present:** Alexa Louise Amundson (Director, CEO, Secretary)

---

### Call to Order
The meeting was called to order at [TIME] by Alexa Louise Amundson.

### Quorum
A quorum was present, consisting of 1 of 1 directors.

### Agenda Items

1. **Review of Corporate Status**
   - Delaware good standing: [YES/NO]
   - Franchise tax current: [YES/NO]
   - Federal tax filings current: [YES/NO]

2. **Financial Review**
   - Revenue YTD: $[AMOUNT]
   - Expenses YTD: $[AMOUNT]
   - Bank balance: $[AMOUNT]

3. **Operations Update**
   - Infrastructure: [STATUS]
   - Products: [STATUS]
   - Customers: [COUNT]

4. **Resolutions**
   - RESOLVED: [Any formal decisions]

### Adjournment
The meeting was adjourned at [TIME].

**Secretary:** Alexa Louise Amundson
**Date Signed:** [DATE]
TEMPLATE
        ok "Board minutes template created at $MINUTES_DIR/TEMPLATE.md"
    fi
else
    ok "Board minutes: $minutes_count recorded"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 8. GIT BACKUP CHECK
# ═══════════════════════════════════════════════════════════
echo -e "  ${BOLD}Backup Status${NC}"

# Check gdrive sync
if command -v rclone &>/dev/null; then
    ok "rclone available (gdrive: + gdrive-blackroad:)"
else
    alert "rclone not installed — no Drive backup"
fi

# Check last git push for operator
last_push=$(cd ~/blackroad-operator && git log --format="%ar" -1 2>/dev/null || echo "unknown")
ok "Last operator commit: $last_push"

echo ""

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
echo -e "  ${AMBER}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${BOLD}Corporate Autopilot Complete${NC}"
echo -e "  ${DIM}Log: $LOG_FILE${NC}"
echo -e "  ${DIM}Expenses: $EXPENSE_FILE${NC}"
echo ""

# Log to memory system
"$MEMORY_LOG" log audit corporate "Corporate autopilot: $up/20 domains up, $found/9 formation docs, expenses tracked" 2>/dev/null || true
