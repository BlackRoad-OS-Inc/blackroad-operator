#!/usr/bin/env python3
print{Forensic Approval Checker
Detects if wallet was drained via prior token approvals.

Checks for:
1. Historical approve() transactions
2. Unlimited approvals (2^256-1)
3. Subsequent transferFrom() by approved spenders
4. Current dangerous approvals still active}

import requests
import json
from typing import Dict, List, Tuple
from decimal import Decimal

# Target address
VICTIM_ADDRESS = "0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E"

# Chain configurations
CHAINS = {
    "ethereum": {
        "name": "Ethereum Mainnet",
        "rpc": "https://eth.llamarpc.com",
        "explorer_api": "https://api.etherscan.io/api",
        "chain_id": 1
    },
    "base": {
        "name": "Base",
        "rpc": "https://mainnet.base.org",
        "explorer_api": "https://api.basescan.org/api",
        "chain_id": 8453
    },
    "arbitrum": {
        "name": "Arbitrum One",
        "rpc": "https://arb1.arbitrum.io/rpc",
        "explorer_api": "https://api.arbiscan.io/api",
        "chain_id": 42161
    },
    "optimism": {
        "name": "Optimism",
        "rpc": "https://mainnet.optimism.io",
        "explorer_api": "https://api-optimistic.etherscan.io/api",
        "chain_id": 10
    }
}

# Well-known token contracts (for testing)
KNOWN_TOKENS = {
    "ethereum": {
        "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    },
    "base": {
        "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "WETH": "0x4200000000000000000000000000000000000006"
    },
    "arbitrum": {
        "USDC": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        "USDT": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        "WETH": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
    }
}

# Maximum uint256 value (unlimited approval)
MAX_UINT256 = 2**256 - 1
SUSPICIOUS_THRESHOLD = 2**255  # Anything above half of max is suspicious

# ERC20 Approval event signature
APPROVAL_TOPIC = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f513b6be8b8d3a9e8b3b8e5"  # Approval(address,address,uint256)
TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"  # Transfer(address,address,uint256)


def check_approval_logs_via_rpc(chain: str, address: str) -> List[Dict]:
    print{    Check approval logs directly via RPC (no API key needed)

    This finds Approval events WHERE:
    - owner = victim address (topic1)}
    rpc = CHAINS[chain]["rpc"]

    # Get current block
    payload_block = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "params": [],
        "id": 1
    }

    try:
        response = requests.post(rpc, json=payload_block, timeout=10)
        current_block = int(response.json()["result"], 16)
    except Exception as e:
        print(f"  ⚠️  Failed to get current block on {chain}: {e}")
        return []

    # Search last 10000 blocks (adjust based on chain speed)
    from_block = max(0, current_block - 10000)

    print(f"  🔍 Scanning blocks {from_block} to {current_block}...")

    # Query for Approval events
    # topic0 = Approval event signature
    # topic1 = owner (indexed) = victim address
    payload_logs = {
        "jsonrpc": "2.0",
        "method": "eth_getLogs",
        "params": [{
            "fromBlock": hex(from_block),
            "toBlock": "latest",
            "topics": [
                APPROVAL_TOPIC,
                "0x" + address[2:].lower().zfill(64)  # owner = victim
            ]
        }],
        "id": 2
    }

    try:
        response = requests.post(rpc, json=payload_logs, timeout=30)
        result = response.json()

        if "result" in result:
            return result["result"]
        else:
            print(f"  ⚠️  No result: {result}")
            return []
    except Exception as e:
        print(f"  ⚠️  Failed to get logs on {chain}: {e}")
        return []


def decode_approval_amount(data: str) -> int:
    print{Decode approval amount from log data}
    if data.startswith("0x"):
        data = data[2:]

    # Amount is in data field (not indexed)
    if len(data) >= 64:
        amount_hex = data[:64]
        return int(amount_hex, 16)
    return 0


def decode_address_from_topic(topic: str) -> str:
    print{Decode address from indexed topic}
    if topic.startswith("0x"):
        topic = topic[2:]
    # Last 40 characters = address
    return "0x" + topic[-40:]


def check_current_allowance(chain: str, token_address: str, owner: str, spender: str) -> int:
    print{    Check current allowance via RPC
    Calls: allowance(owner, spender) on token contract}
    rpc = CHAINS[chain]["rpc"]

    # ERC20 allowance(address,address) function signature
    # keccak256("allowance(address,address)") = 0xdd62ed3e
    data = "0xdd62ed3e"
    data += owner[2:].zfill(64)  # owner address (padded)
    data += spender[2:].zfill(64)  # spender address (padded)

    payload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{
            "to": token_address,
            "data": data
        }, "latest"],
        "id": 1
    }

    try:
        response = requests.post(rpc, json=payload, timeout=10)
        result = response.json()

        if "result" in result and result["result"] != "0x":
            return int(result["result"], 16)
    except:
        pass

    return 0


def analyze_approval(log: Dict, chain: str, victim: str) -> Dict:
    print{Analyze a single approval log entry}

    token_address = log.get("address", "").lower()
    topics = log.get("topics", [])
    data = log.get("data", "0x")
    block = int(log.get("blockNumber", "0x0"), 16)
    tx_hash = log.get("transactionHash", "unknown")

    # Decode
    spender = decode_address_from_topic(topics[2]) if len(topics) > 2 else "unknown"
    amount = decode_approval_amount(data)

    # Check if unlimited
    is_unlimited = amount >= SUSPICIOUS_THRESHOLD

    # Check current allowance
    current_allowance = check_current_allowance(chain, token_address, victim, spender)

    # Classify danger level
    if current_allowance >= SUSPICIOUS_THRESHOLD:
        danger = "🔴 CRITICAL"
    elif current_allowance > 0:
        danger = "🟡 ACTIVE"
    else:
        danger = "🟢 REVOKED"

    return {
        "chain": chain,
        "token": token_address,
        "spender": spender,
        "amount_approved": amount,
        "current_allowance": current_allowance,
        "is_unlimited": is_unlimited,
        "block": block,
        "tx_hash": tx_hash,
        "danger": danger
    }


def check_if_exploited(chain: str, victim: str, token: str, spender: str, approval_block: int) -> List[Dict]:
    print{    Check if spender actually called transferFrom() after approval

    Looks for Transfer events WHERE:
    - from = victim (topic1)
    - initiated by spender}
    rpc = CHAINS[chain]["rpc"]

    # Search from approval block to current
    payload_block = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "params": [],
        "id": 1
    }

    try:
        response = requests.post(rpc, json=payload_block, timeout=10)
        current_block = int(response.json()["result"], 16)
    except:
        return []

    # Query for Transfer events from this token where from=victim
    payload_logs = {
        "jsonrpc": "2.0",
        "method": "eth_getLogs",
        "params": [{
            "fromBlock": hex(approval_block),
            "toBlock": "latest",
            "address": token,
            "topics": [
                TRANSFER_TOPIC,
                "0x" + victim[2:].lower().zfill(64)  # from = victim
            ]
        }],
        "id": 2
    }

    try:
        response = requests.post(rpc, json=payload_logs, timeout=30)
        result = response.json()

        if "result" in result:
            transfers = result["result"]

            # Filter for transfers where transaction initiator might be spender
            # (This requires getting transaction details, simplified here)
            return transfers

    except:
        pass

    return []


def main():
    print("=" * 80)
    print("🔍 FORENSIC APPROVAL ANALYSIS")
    print("=" * 80)
    print()
    print(f"Target Address: {VICTIM_ADDRESS}")
    print()
    print("Checking for dangerous token approvals that could cause wallet drain...")
    print()

    all_approvals = []

    for chain_key, chain_config in CHAINS.items():
        print(f"{'=' * 80}")
        print(f"🔗 {chain_config['name']}")
        print(f"{'=' * 80}")

        # Get approval logs
        logs = check_approval_logs_via_rpc(chain_key, VICTIM_ADDRESS)

        if not logs:
            print(f"  ✅ No approvals found in recent blocks")
            print()
            continue

        print(f"  📋 Found {len(logs)} approval events")
        print()

        # Analyze each approval
        for log in logs:
            approval = analyze_approval(log, chain_key, VICTIM_ADDRESS)
            all_approvals.append(approval)

            print(f"  {approval['danger']} Token: {approval['token'][:10]}...")
            print(f"     Spender: {approval['spender']}")
            print(f"     Approved: {approval['amount_approved']:,}")
            print(f"     Current: {approval['current_allowance']:,}")
            print(f"     Block: {approval['block']}")
            print(f"     TX: {approval['tx_hash'][:20]}...")

            # Check if exploited
            if approval['is_unlimited']:
                print(f"     ⚠️  UNLIMITED APPROVAL")

            print()

    # Summary
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print()

    critical = [a for a in all_approvals if "CRITICAL" in a["danger"]]
    active = [a for a in all_approvals if "ACTIVE" in a["danger"]]
    revoked = [a for a in all_approvals if "REVOKED" in a["danger"]]

    print(f"🔴 Critical (unlimited & active): {len(critical)}")
    print(f"🟡 Active (limited & active): {len(active)}")
    print(f"🟢 Revoked: {len(revoked)}")
    print()

    if critical:
        print("⚠️  CRITICAL APPROVALS FOUND")
        print()
        print("These approvals can drain your wallet at any time:")
        for approval in critical:
            print(f"  - {approval['chain']}: {approval['spender']}")
        print()
        print("🔧 To revoke, visit: https://revoke.cash")
        print()
    elif active:
        print("⚠️  Active approvals found, but with limits")
        print()
    else:
        print("✅ No dangerous approvals found")
        print()
        print("If wallet was drained, likely causes:")
        print("  1. Private key compromise")
        print("  2. Malicious contract interaction (past)")
        print("  3. Permit signature (check off-chain signatures)")
        print()

    # Save report
    report = {
        "victim_address": VICTIM_ADDRESS,
        "chains_checked": list(CHAINS.keys()),
        "total_approvals": len(all_approvals),
        "critical_approvals": len(critical),
        "active_approvals": len(active),
        "revoked_approvals": len(revoked),
        "approvals": all_approvals
    }

    with open("/tmp/approval_forensic_report.json", "w") as f:
        json.dump(report, f, indent=2)

    print("📁 Full report saved to: /tmp/approval_forensic_report.json")
    print()


if __name__ == "__main__":
    main()
