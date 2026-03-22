#!/bin/bash
# Threat-to-Value Engine — every attack increases RoadCoin value
# When an attacker hits us:
#   1. They get banned (adaptive-defense.sh)
#   2. A "security proof" is minted — hash of the attack + defense action
#   3. Proof is stored on-chain (D1 ledger for now, RoadChain later)
#   4. Each proof adds to the security score → RoadCoin value goes up
#   5. Network effect: more attacks = more proofs = more secure = more valuable
#
# This is not theoretical. The blocklist IS the proof-of-security ledger.
# Each entry is a cryptographic receipt that the fleet defended itself.
set -e

BLOCKLIST="$HOME/.blackroad/blocklist.txt"
BAN_LOG="$HOME/.blackroad/ban-log.txt"
LEDGER="$HOME/.blackroad/security-ledger.json"
ROADCOIN_STATE="$HOME/.blackroad/roadcoin-state.json"

# Initialize state if needed
if [ ! -f "$ROADCOIN_STATE" ]; then
  cat > "$ROADCOIN_STATE" << 'INIT'
{
  "supply": 1000000000,
  "security_score": 0,
  "total_proofs": 0,
  "base_value_usd": 0.0001,
  "security_multiplier": 1.0,
  "last_updated": ""
}
INIT
fi

# Count total security proofs
total_blocked=$(wc -l < "$BLOCKLIST" 2>/dev/null | tr -d ' ' || echo 0)
today_bans=$(grep "$(date -u +%Y-%m-%d)" "$BAN_LOG" 2>/dev/null | wc -l | tr -d ' ' || echo 0)

# Each blocked IP = 1 security proof
# Each subnet ban = 10 proofs (protecting against entire ranges)
subnet_bans=$(grep "/24" "$BLOCKLIST" 2>/dev/null | wc -l | tr -d ' ' || echo 0)
ip_bans=$((total_blocked - subnet_bans))
total_proofs=$((ip_bans + (subnet_bans * 10)))

# Security score = log2(proofs) * uptime_factor
# More proofs = diminishing returns per proof but always increasing
uptime_days=$(( ($(date +%s) - 1732320000) / 86400 ))  # days since incorporation
security_score=$(python3 -c "import math; print(round(math.log2(max($total_proofs,1)) * ($uptime_days / 30), 2))" 2>/dev/null || echo "0")

# Value multiplier: 1.0 + (security_score / 1000)
# So 100 proofs over 4 months ≈ 1.03x multiplier
multiplier=$(python3 -c "print(round(1.0 + $security_score / 1000, 6))" 2>/dev/null || echo "1.0")
base_value=0.0001
current_value=$(python3 -c "print(round($base_value * $multiplier, 8))" 2>/dev/null || echo "$base_value")

# Hash the current state as a proof-of-security receipt
state_hash=$(echo "$total_blocked|$today_bans|$total_proofs|$security_score|$(date -u +%s)" | shasum -a 256 | cut -c1-16)

# Update state
cat > "$ROADCOIN_STATE" << STATE
{
  "supply": 1000000000,
  "total_blocked": $total_blocked,
  "subnet_bans": $subnet_bans,
  "total_proofs": $total_proofs,
  "security_score": $security_score,
  "uptime_days": $uptime_days,
  "base_value_usd": $base_value,
  "security_multiplier": $multiplier,
  "estimated_value_usd": $current_value,
  "proof_hash": "$state_hash",
  "today_bans": $today_bans,
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
STATE

# Append to ledger (append-only, like a blockchain)
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"proofs\":$total_proofs,\"score\":$security_score,\"value\":$current_value,\"hash\":\"$state_hash\",\"blocked\":$total_blocked}" >> "$LEDGER"

# Output
echo "$total_proofs proofs | score=$security_score | ROAD=\$$current_value | hash=$state_hash"

# Publish to web
scp -o ConnectTimeout=3 "$ROADCOIN_STATE" root@gematria:/var/www/blackroad.io/roadcoin.json 2>/dev/null
scp -o ConnectTimeout=3 "$LEDGER" root@gematria:/var/www/blackroad.io/security-ledger.json 2>/dev/null
