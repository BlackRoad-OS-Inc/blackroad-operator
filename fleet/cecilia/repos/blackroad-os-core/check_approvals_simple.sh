#!/bin/bash
# Forensic Approval Checker (Shell version - no dependencies)
# Checks if wallet was drained via token approvals

VICTIM="0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E"

echo "================================================================================"
echo "🔍 FORENSIC APPROVAL ANALYSIS"
echo "================================================================================"
echo ""
echo "Target: $VICTIM"
echo ""
echo "Checking Base chain for dangerous approvals..."
echo ""

# Get current block on Base
CURRENT_BLOCK=$(curl -s -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  python3 -c "import sys, json; print(int(json.load(sys.stdin)['result'], 16))")

echo "Current block: $CURRENT_BLOCK"

# Calculate from block (last 10000 blocks)
FROM_BLOCK=$((CURRENT_BLOCK - 10000))
FROM_BLOCK_HEX=$(printf "0x%x" $FROM_BLOCK)

echo "Scanning from block: $FROM_BLOCK"
echo ""

# Approval event signature
APPROVAL_TOPIC="0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f513b6be8b7e9cb3711e9e5a"

# Owner = victim (padded to 64 chars)
VICTIM_PADDED="0x$(echo ${VICTIM:2} | tr '[:upper:]' '[:lower:]' | awk '{printf "%064s", $0}')"

echo "Searching for Approval events where owner = victim..."
echo ""

# Query for approval logs
RESPONSE=$(curl -s -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getLogs\",\"params\":[{\"fromBlock\":\"$FROM_BLOCK_HEX\",\"toBlock\":\"latest\",\"topics\":[\"$APPROVAL_TOPIC\",\"$VICTIM_PADDED\"]}],\"id\":2}")

echo "Raw response (first 500 chars):"
echo "$RESPONSE" | cut -c1-500
echo ""
echo "================================================================================"
echo ""

# Parse response
NUM_LOGS=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'result' in data and data['result']:
        print(len(data['result']))
    else:
        print(0)
except:
    print(0)
")

echo "📊 RESULTS:"
echo "  Approval events found: $NUM_LOGS"
echo ""

if [ "$NUM_LOGS" -eq 0 ]; then
    echo "✅ No approvals found in recent blocks (last 10,000)"
    echo ""
    echo "This means:"
    echo "  • Wallet drain was NOT from token approval exploit"
    echo "  • Check for:"
    echo "    1. Private key compromise"
    echo "    2. Permit signature (off-chain)"
    echo "    3. Malicious contract interaction"
else
    echo "⚠️  Approvals detected!"
    echo ""
    echo "Analyzing..."
    echo ""

    # Parse each approval
    echo "$RESPONSE" | python3 -c "
import sys, json

try:
    data = json.load(sys.stdin)
    if 'result' not in data or not data['result']:
        print('No approvals')
        sys.exit(0)

    logs = data['result']

    print(f'Found {len(logs)} approval(s):\\n')

    for i, log in enumerate(logs, 1):
        token = log.get('address', 'unknown')
        topics = log.get('topics', [])
        data_field = log.get('data', '0x')
        block = int(log.get('blockNumber', '0x0'), 16)
        tx = log.get('transactionHash', 'unknown')

        # Decode spender (topic[2])
        spender = '0x' + topics[2][-40:] if len(topics) > 2 else 'unknown'

        # Decode amount (data field)
        if data_field.startswith('0x'):
            data_field = data_field[2:]

        if len(data_field) >= 64:
            amount_hex = data_field[:64]
            amount = int(amount_hex, 16)
        else:
            amount = 0

        # Check if unlimited
        max_uint256 = 2**256 - 1
        is_unlimited = amount >= (2**255)

        print(f'Approval #{i}:')
        print(f'  Token:    {token}')
        print(f'  Spender:  {spender}')
        print(f'  Amount:   {amount:,}')
        print(f'  Block:    {block}')
        print(f'  TX:       {tx}')

        if is_unlimited:
            print(f'  ⚠️  UNLIMITED APPROVAL (2^256-1 or close)')

        print()

except Exception as e:
    print(f'Error parsing: {e}')
"
fi

echo "================================================================================"
echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. If approvals found → Visit https://revoke.cash to revoke"
echo "2. If no approvals → Check for key compromise or permit signatures"
echo "3. Full analysis → Check block explorer: https://basescan.org/address/$VICTIM"
echo ""
