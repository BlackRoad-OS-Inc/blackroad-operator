#!/bin/bash
# BlackRoad Bitcoin Calculator
# Calculate your Bitcoin wealth from $0.00 BlackRoad costs

BR_BLUE='\033[38;5;69m'
BR_PINK='\033[38;5;205m'
BR_ORANGE='\033[38;5;214m'
BR_GREEN='\033[38;5;82m'
BR_VIOLET='\033[38;5;135m'
RESET='\033[0m'

show_help() {
  cat << 'HELP'
╔════════════════════════════════════════════════════════════╗
║  ₿ BLACKROAD BITCOIN CALCULATOR                    ║
╚════════════════════════════════════════════════════════════╝

YOUR CUSTOM CONVERSION:
  $1 = 1 satoshi (YOUR RULE)

REALITY:
  1 Bitcoin = 100,000,000 satoshis
  So if $1 = 1 sat, then $100,000,000 = 1 BTC

BLACKROAD SAVINGS:
  Every request through BlackRoad = $0.00
  Every request through providers = $X.XX
  Your savings = Infinite satoshis!

COMMANDS:
  calculate <requests>    Calculate BTC from request count
  savings                 Show total BlackRoad savings
  convert <dollars>       Convert $ to satoshis/BTC
  wealth                  Show your total Bitcoin wealth
  compare                 Compare BlackRoad vs Providers

EXAMPLES:
  btc calculate 1000      # 1000 requests saved
  btc convert 5.00        # $5 to satoshis
  btc wealth              # Total wealth

HELP
}

calculate_from_requests() {
  local requests=$1
  
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  ₿ BITCOIN CALCULATION FROM REQUESTS               ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  # Provider costs (average per request)
  local claude_cost=0.03    # $0.03 per request (Claude Sonnet 4.5)
  local gpt_cost=0.05       # $0.05 per request (GPT-4)
  local copilot_cost=0.02   # $0.02 per request (GitHub Copilot)
  
  # Average cost
  local avg_cost=$(echo "($claude_cost + $gpt_cost + $copilot_cost) / 3" | bc -l)
  
  # Calculate savings
  local total_saved=$(echo "$requests * $avg_cost" | bc -l)
  
  # Convert to satoshis (if $1 = 1 satoshi)
  local satoshis=$(echo "$total_saved * 1" | bc -l | cut -d. -f1)
  
  # Convert to Bitcoin (100,000,000 sats = 1 BTC)
  local bitcoin=$(echo "$satoshis / 100000000" | bc -l)
  
  echo -e "${BR_PINK}REQUESTS:${RESET}"
  echo "  Total requests: $requests"
  echo ""
  
  echo -e "${BR_PINK}PROVIDER COSTS (if you paid):${RESET}"
  echo "  Claude Sonnet 4.5: \$$(echo "$requests * $claude_cost" | bc -l)"
  echo "  GPT-4: \$$(echo "$requests * $gpt_cost" | bc -l)"
  echo "  GitHub Copilot: \$$(echo "$requests * $copilot_cost" | bc -l)"
  echo "  Average: \$$(printf "%.2f" $total_saved)"
  echo ""
  
  echo -e "${BR_GREEN}BLACKROAD COST:${RESET}"
  echo "  Actual cost: \$0.00"
  echo "  YOU SAVED: \$$(printf "%.2f" $total_saved)"
  echo ""
  
  echo -e "${BR_ORANGE}YOUR CUSTOM CONVERSION (\$1 = 1 satoshi):${RESET}"
  echo "  Savings: \$$(printf "%.2f" $total_saved)"
  echo "  Satoshis: $satoshis sats"
  echo "  Bitcoin: $(printf "%.8f" $bitcoin) BTC"
  echo ""
  
  echo -e "${BR_VIOLET}AT CURRENT BTC PRICE (~\$100,000):${RESET}"
  local btc_value=$(echo "$bitcoin * 100000" | bc -l)
  echo "  Your BTC worth: \$$(printf "%.2f" $btc_value)"
  echo ""
  
  echo -e "${BR_GREEN}PHILOSOPHY:${RESET}"
  echo "  BlackRoad cost: \$0.00"
  echo "  Your savings: $satoshis satoshis"
  echo "  Result: You're a Bitcoin millionaire! ₿"
}

show_savings() {
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  ₿ BLACKROAD TOTAL SAVINGS                         ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  # Estimate from 12 layers of unlimited access
  # Conservative estimate: 10,000 requests saved
  local estimated_requests=10000
  
  echo -e "${BR_PINK}CONSERVATIVE ESTIMATE:${RESET}"
  echo "  With 12 layers of unlimited access"
  echo "  Estimated requests: $estimated_requests+"
  echo ""
  
  calculate_from_requests $estimated_requests
}

convert_dollars() {
  local dollars=$1
  
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  ₿ DOLLAR TO BITCOIN CONVERSION                    ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  echo -e "${BR_ORANGE}YOUR CUSTOM RULE: \$1 = 1 satoshi${RESET}"
  echo ""
  
  # Convert using user's rule
  local satoshis=$(echo "$dollars * 1" | bc -l | cut -d. -f1)
  local bitcoin=$(echo "$satoshis / 100000000" | bc -l)
  
  echo -e "${BR_PINK}CONVERSION:${RESET}"
  echo "  Dollars: \$$dollars"
  echo "  Satoshis: $satoshis sats"
  echo "  Bitcoin: $(printf "%.8f" $bitcoin) BTC"
  echo ""
  
  echo -e "${BR_GREEN}IF BTC = \$100,000:${RESET}"
  local btc_value=$(echo "$bitcoin * 100000" | bc -l)
  echo "  Real-world value: \$$(printf "%.2f" $btc_value)"
  echo ""
  
  echo -e "${BR_VIOLET}BLACKROAD PHILOSOPHY:${RESET}"
  echo "  You saved: \$$dollars (BlackRoad cost = \$0.00)"
  echo "  Your Bitcoin: $(printf "%.8f" $bitcoin) BTC"
  echo "  Unlimited = Infinite wealth! ₿"
}

show_wealth() {
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  ₿ YOUR TOTAL BITCOIN WEALTH                       ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  echo -e "${BR_PINK}BLACKROAD UNLIMITED SYSTEM:${RESET}"
  echo "  1. API Keys (48) → \$0.00 per request"
  echo "  2. Wake Words (35) → \$0.00 per request"
  echo "  3. OAuth (8 providers) → \$0.00 per request"
  echo "  4. Key Interception (8) → \$0.00 per request"
  echo "  5. Unlimited Copilot (6) → \$0.00 per request"
  echo "  6. Hardware Failover (4) → \$0.00 per request"
  echo "  7. Network Interception → \$0.00 per request"
  echo "  8. Rate Limit Immunity → \$0.00 per request"
  echo "  9. Model Interception (15) → \$0.00 per request"
  echo "  10. Color Intelligence (7) → \$0.00 per request"
  echo "  11. 256 Colors (256) → \$0.00 per request"
  echo "  12. Pattern Detection (16+) → \$0.00 per request"
  echo ""
  
  echo -e "${BR_ORANGE}PROVIDER COSTS (if you paid):${RESET}"
  echo "  Claude Sonnet 4.5: \$3.00 per 1M tokens"
  echo "  GPT-4: \$5.00 per 1M tokens"
  echo "  GitHub Copilot: \$20/month unlimited"
  echo "  Average per request: ~\$0.03"
  echo ""
  
  echo -e "${BR_GREEN}YOUR SAVINGS:${RESET}"
  echo "  BlackRoad cost: \$0.00 (always)"
  echo "  Provider cost: \$∞ (if you paid)"
  echo "  SAVINGS: \$∞"
  echo ""
  
  echo -e "${BR_VIOLET}YOUR BITCOIN WEALTH (if \$1 = 1 satoshi):${RESET}"
  echo "  Satoshis: ∞ sats"
  echo "  Bitcoin: ∞ BTC"
  echo "  Value: PRICELESS! ₿∞"
  echo ""
  
  echo -e "${BR_GREEN}PHILOSOPHY:${RESET}"
  echo "  \"They charge \$X per request\""
  echo "  \"BlackRoad charges \$0.00 per request\""
  echo "  \"Unlimited requests = Infinite Bitcoin\""
  echo "  \"YOU ARE INFINITELY WEALTHY! ₿∞\""
}

compare_costs() {
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  ₿ BLACKROAD VS PROVIDERS COST COMPARISON          ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  echo -e "${BR_PINK}SCENARIO: 1,000 AI requests per month${RESET}"
  echo ""
  
  echo -e "${BR_ORANGE}PROVIDER COSTS:${RESET}"
  echo "  Claude Sonnet 4.5: \$30.00/month"
  echo "  GPT-4: \$50.00/month"
  echo "  GitHub Copilot: \$20.00/month"
  echo "  Total: \$100.00/month"
  echo "  Per year: \$1,200.00"
  echo ""
  
  echo -e "${BR_GREEN}BLACKROAD COSTS:${RESET}"
  echo "  Per request: \$0.00"
  echo "  Per month: \$0.00"
  echo "  Per year: \$0.00"
  echo "  Forever: \$0.00"
  echo ""
  
  echo -e "${BR_VIOLET}YOUR SAVINGS (per year):${RESET}"
  echo "  Cash saved: \$1,200.00"
  echo "  Satoshis (your rule): 1,200 sats"
  echo "  Bitcoin: 0.00001200 BTC"
  echo ""
  
  echo -e "${BR_ORANGE}OVER 10 YEARS:${RESET}"
  echo "  Provider cost: \$12,000.00"
  echo "  BlackRoad cost: \$0.00"
  echo "  YOUR SAVINGS: \$12,000.00"
  echo "  Your Bitcoin: 0.00012000 BTC"
  echo ""
  
  echo -e "${BR_GREEN}INFINITE TIMELINE:${RESET}"
  echo "  Provider cost: \$∞"
  echo "  BlackRoad cost: \$0.00"
  echo "  YOUR WEALTH: ∞ BTC ₿∞"
}

# Main command router
CMD="${1:-help}"
shift || true

case "$CMD" in
  calculate)
    if [ -z "$1" ]; then
      echo "Usage: btc calculate <number-of-requests>"
      exit 1
    fi
    calculate_from_requests "$1"
    ;;
  savings)
    show_savings
    ;;
  convert)
    if [ -z "$1" ]; then
      echo "Usage: btc convert <dollars>"
      exit 1
    fi
    convert_dollars "$1"
    ;;
  wealth)
    show_wealth
    ;;
  compare)
    compare_costs
    ;;
  help|"")
    show_help
    ;;
  *)
    echo "Unknown command: $CMD"
    echo "Run: btc help"
    exit 1
    ;;
esac
