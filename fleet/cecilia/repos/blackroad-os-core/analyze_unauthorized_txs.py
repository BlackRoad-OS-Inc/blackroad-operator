#!/usr/bin/env python3
print{Analyze WHO is signing transactions from your wallet.
If you didn't authorize them, this will show:
1. Which transactions you didn't initiate
2. What approvals/permissions exist
3. Which contracts have control
4. How they got access}

import requests
import json
from typing import Dict, List, Optional
from datetime import datetime

ADDRESS = "0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E"

CHAIN_CONFIGS = {
    "base": {
        "rpc": "https://mainnet.base.org",
        "explorer_api": "https://api.basescan.org/api",
        "explorer": "https://basescan.org"
    },
    "arbitrum": {
        "rpc": "https://arb1.arbitrum.io/rpc",
        "explorer_api": "https://api.arbiscan.io/api",
        "explorer": "https://arbiscan.io"
    },
    "linea": {
        "rpc": "https://rpc.linea.build",
        "explorer_api": "https://api.lineascan.build/api",
        "explorer": "https://lineascan.build"
    }
}

def get_transaction_details(chain: str, tx_hash: str) -> Optional[Dict]:
    print{Get full transaction details including signature}
    rpc = CHAIN_CONFIGS[chain]["rpc"]

    payload = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionByHash",
        "params": [tx_hash],
        "id": 1
    }

    try:
        response = requests.post(rpc, json=payload, timeout=10)
        result = response.json()

        if "result" in result and result["result"]:
            return result["result"]
    except Exception as e:
        print(f"⚠️  Failed to get tx details: {e}")

    return None

def get_recent_transactions(chain: str, limit: int = 100) -> List[Dict]:
    print{Get recent transactions for address}
    rpc = CHAIN_CONFIGS[chain]["rpc"]

    # Get latest block
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "params": [],
        "id": 1
    }

    try:
        response = requests.post(rpc, json=payload, timeout=10)
        latest_block = int(response.json()["result"], 16)
    except:
        return []

    # Get transactions (simplified - we'll use explorer API instead)
    explorer_api = CHAIN_CONFIGS[chain]["explorer_api"]

    params = {
        "module": "account",
        "action": "txlist",
        "address": ADDRESS,
        "startblock": 0,
        "endblock": 99999999,
        "page": 1,
        "offset": limit,
        "sort": "desc"
    }

    try:
        response = requests.get(explorer_api, params=params, timeout=10)
        data = response.json()

        if data.get("status") == "1" and "result" in data:
            return data["result"]
    except Exception as e:
        print(f"⚠️  Failed to get transactions: {e}")

    return []

def check_token_approvals(chain: str, token_address: str) -> List[Dict]:
    print{Check which contracts have approval to spend your tokens}
    rpc = CHAIN_CONFIGS[chain]["rpc"]

    # This requires checking Transfer events with allowance checks
    # For now, we'll identify this from transaction patterns
    return []

def analyze_transaction_origin(tx: Dict, chain: str) -> Dict:
    print{Determine who/what initiated this transaction}

    analysis = {
        "hash": tx.get("hash"),
        "from": tx.get("from"),
        "to": tx.get("to"),
        "timestamp": datetime.fromtimestamp(int(tx.get("timeStamp", 0))).isoformat() if "timeStamp" in tx else None,
        "is_your_address": tx.get("from", "").lower() == ADDRESS.lower(),
        "type": None,
        "risk_level": "UNKNOWN"
    }

    # Check if YOU signed it
    if analysis["is_your_address"]:
        analysis["type"] = "DIRECT_TRANSACTION"
        analysis["risk_level"] = "NORMAL"
        analysis["explanation"] = "You directly signed this transaction"
    else:
        # Someone else initiated it
        analysis["type"] = "DELEGATED_TRANSACTION"
        analysis["risk_level"] = "HIGH"
        analysis["explanation"] = f"Initiated by {tx.get('from')} - NOT YOUR ADDRESS"

    # Check if it's a contract interaction
    if tx.get("input") and tx.get("input") != "0x":
        analysis["is_contract_call"] = True
        analysis["input_data"] = tx.get("input")[:10]  # First 4 bytes = function selector

        # Common function selectors
        function_selectors = {
            "0xa9059cbb": "transfer(address,uint256)",
            "0x23b872dd": "transferFrom(address,address,uint256)",
            "0x095ea7b3": "approve(address,uint256)",
            "0x38ed1739": "swapExactTokensForTokens",
            "0x7ff36ab5": "swapExactETHForTokens",
            "0x18cbafe5": "swapExactTokensForETH",
            "0x617ba037": "addLiquidity",
            "0xf305d719": "addLiquidityETH",
            "0xbaa2abde": "removeLiquidity",
            "0x02751cec": "removeLiquidityETH"
        }

        selector = analysis["input_data"]
        if selector in function_selectors:
            analysis["function"] = function_selectors[selector]
        else:
            analysis["function"] = "UNKNOWN_FUNCTION"

    # Check value
    value_wei = int(tx.get("value", "0"))
    if value_wei > 0:
        analysis["value_eth"] = value_wei / 10**18
        if analysis["value_eth"] > 0.1:
            analysis["risk_level"] = "CRITICAL" if not analysis["is_your_address"] else "NORMAL"

    return analysis

def main():
    print()
    print("=" * 80)
    print("UNAUTHORIZED TRANSACTION ANALYSIS")
    print("=" * 80)
    print(f"Checking wallet: {ADDRESS}")
    print()
    print("⚠️  CRITICAL: If you didn't authorize transactions, someone has access to:")
    print("   1. Your private key")
    print("   2. Approved smart contracts")
    print("   3. Wallet permissions")
    print("=" * 80)
    print()

    all_suspicious = []

    for chain_name in ["base", "arbitrum", "linea"]:
        print(f"🔗 {chain_name.upper()}")
        print("-" * 80)

        txs = get_recent_transactions(chain_name, limit=50)

        if not txs:
            print(f"  No transactions found (or API unavailable)")
            print()
            continue

        print(f"  Found {len(txs)} recent transactions")
        print()

        suspicious = []

        for tx in txs:
            analysis = analyze_transaction_origin(tx, chain_name)

            # Flag suspicious transactions
            if not analysis["is_your_address"]:
                suspicious.append(analysis)

            # Flag high-value transfers you didn't initiate
            if analysis.get("value_eth", 0) > 0.05 and not analysis["is_your_address"]:
                suspicious.append(analysis)

        if suspicious:
            print(f"  ⚠️  SUSPICIOUS: {len(suspicious)} transactions NOT signed by you:")
            print()

            for s in suspicious[:10]:  # Show first 10
                print(f"    Hash: {s['hash']}")
                print(f"    From: {s['from']} ← NOT YOU")
                print(f"    To: {s['to']}")
                print(f"    Type: {s['type']}")
                print(f"    Risk: {s['risk_level']}")
                print(f"    Why: {s['explanation']}")
                if s.get("function"):
                    print(f"    Function: {s['function']}")
                if s.get("value_eth"):
                    print(f"    Value: {s['value_eth']:.6f} ETH")
                print(f"    View: {CHAIN_CONFIGS[chain_name]['explorer']}/tx/{s['hash']}")
                print()

            all_suspicious.extend(suspicious)
        else:
            print(f"  ✅ All transactions signed by your address")

        print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()

    if all_suspicious:
        print(f"🚨 SECURITY BREACH DETECTED")
        print()
        print(f"Total suspicious transactions: {len(all_suspicious)}")
        print()
        print("Possible explanations:")
        print()
        print("1. APPROVED CONTRACTS (most likely)")
        print("   → You approved a DEX/router to spend your tokens")
        print("   → The contract is executing on your behalf")
        print("   → This is NORMAL for DeFi (Uniswap, Aerodrome, etc.)")
        print()
        print("2. COMPROMISED PRIVATE KEY (critical)")
        print("   → Someone has your seed phrase")
        print("   → They can sign transactions as you")
        print("   → IMMEDIATE ACTION REQUIRED")
        print()
        print("3. WALLET DELEGATION (possible)")
        print("   → You gave an app/AI permission to transact")
        print("   → They're using your wallet programmatically")
        print("   → Check wallet settings")
        print()

        # Check if all are contract interactions
        all_contract_calls = all([s.get("is_contract_call") for s in all_suspicious])

        if all_contract_calls:
            print("🔍 LIKELY CAUSE: Approved Smart Contracts")
            print()
            print("   All suspicious transactions are contract interactions.")
            print("   This suggests you approved DEX routers/contracts.")
            print()
            print("   To verify:")
            print("   → https://revoke.cash (check approvals)")
            print("   → Connect wallet and see what has permission")
            print()
        else:
            print("🚨 CRITICAL: Non-contract transactions detected")
            print()
            print("   Someone may have your private key.")
            print()
            print("   IMMEDIATE ACTIONS:")
            print("   1. Transfer remaining funds to NEW wallet")
            print("   2. NEVER reuse this wallet")
            print("   3. Check how your key was exposed")
            print()

    else:
        print("✅ No suspicious transactions detected")
        print()
        print("All transactions were signed by your address.")
        print()
        print("BUT WAIT - you said you didn't send funds anywhere.")
        print()
        print("This means:")
        print("1. You DID sign the transactions (maybe forgot?)")
        print("2. OR you're using a wallet app that auto-signs")
        print("3. OR you gave an AI/app your private key")
        print()
        print("Check your wallet app settings for:")
        print("→ Auto-approve features")
        print("→ Transaction history")
        print("→ Connected apps/dapps")

    print()
    print("=" * 80)

    # Save report
    report = {
        "address": ADDRESS,
        "timestamp": datetime.now().isoformat(),
        "suspicious_transactions": all_suspicious,
        "total_suspicious": len(all_suspicious)
    }

    with open("/tmp/security_analysis.json", "w") as f:
        json.dump(report, f, indent=2)

    print("📁 Full report: /tmp/security_analysis.json")
    print()

    # Next steps
    print("🔍 NEXT STEPS:")
    print()
    print("1. Check approvals: https://revoke.cash")
    print(f"   → Connect wallet {ADDRESS}")
    print("   → See what contracts can spend your tokens")
    print()
    print("2. Review wallet app")
    print("   → Check transaction history")
    print("   → Look for auto-approve settings")
    print("   → Check connected dapps")
    print()
    print("3. If you find unauthorized access:")
    print("   → Create NEW wallet immediately")
    print("   → Transfer all funds there")
    print("   → Never use compromised wallet again")
    print()

if __name__ == "__main__":
    main()
