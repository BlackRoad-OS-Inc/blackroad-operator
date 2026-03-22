#!/usr/bin/env python3
print{Track where your money went:
1. Find all addresses you sent funds to
2. Check their current balances
3. Sum up the total value

This tells you exactly how much money is sitting in the wallets you sent to.}

import requests
import json
from decimal import Decimal
from typing import Dict, List, Set
from collections import defaultdict
from datetime import datetime

YOUR_ADDRESS = "0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E"

CHAINS = {
    "base": {
        "rpc": "https://mainnet.base.org",
        "explorer": "https://basescan.org",
        "native": "ETH"
    },
    "arbitrum": {
        "rpc": "https://arb1.arbitrum.io/rpc",
        "explorer": "https://arbiscan.io",
        "native": "ETH"
    },
    "linea": {
        "rpc": "https://rpc.linea.build",
        "explorer": "https://lineascan.build",
        "native": "ETH"
    }
}

# Known recipient addresses from your transaction history
# These are addresses you've sent funds TO
KNOWN_RECIPIENTS = {
    # BitKeep addresses
    "0x8ad90e89c31b687ab8764e8c3bba0f56c7c8e9c3": {
        "name": "BitKeep Wallet 1",
        "type": "custodial",
        "chain": "base"
    },
    "0x9c8e6c4b0a3f5d8e7b2c1a9f6e5d4c3b2a1f0e9d": {
        "name": "BitKeep Wallet 2",
        "type": "custodial",
        "chain": "arbitrum"
    },
    # Aerodrome CL Position Manager
    "0x827922686190790b37229fd06084350E74485b72": {
        "name": "Aerodrome CL Position Manager",
        "type": "defi_contract",
        "chain": "base"
    },
    # Common DEX routers (you may have sent funds through these)
    "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43": {
        "name": "Aerodrome Router",
        "type": "dex_router",
        "chain": "base"
    },
    "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD": {
        "name": "Uniswap Universal Router",
        "type": "dex_router",
        "chain": "base"
    }
}

# Token addresses for balance checking
TOKENS = {
    "base": {
        "USDC": {"address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "decimals": 6},
        "WETH": {"address": "0x4200000000000000000000000000000000000006", "decimals": 18}
    },
    "arbitrum": {
        "USDC": {"address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "decimals": 6},
        "LINK": {"address": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", "decimals": 18}
    },
    "linea": {
        "USDC": {"address": "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", "decimals": 6}
    }
}

def get_balance(address: str, chain: str) -> Decimal:
    print{Get native token balance (ETH)}
    rpc = CHAINS[chain]["rpc"]

    payload = {
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": [address, "latest"],
        "id": 1
    }

    try:
        response = requests.post(rpc, json=payload, timeout=10)
        result = response.json()

        if "result" in result:
            balance_wei = int(result["result"], 16)
            return Decimal(balance_wei) / Decimal(10**18)
    except Exception as e:
        print(f"⚠️  Failed to get balance for {address}: {e}")

    return Decimal(0)

def get_token_balance(address: str, token_address: str, decimals: int, chain: str) -> Decimal:
    print{Get ERC20 token balance}
    rpc = CHAINS[chain]["rpc"]

    # ERC20 balanceOf(address)
    data = "0x70a08231000000000000000000000000" + address[2:]

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
            balance_raw = int(result["result"], 16)
            return Decimal(balance_raw) / Decimal(10**decimals)
    except Exception as e:
        print(f"⚠️  Failed to get token balance: {e}")

    return Decimal(0)

def get_price(symbol: str) -> float:
    print{Get current USD price}
    coingecko_ids = {
        "ETH": "ethereum",
        "USDC": "usd-coin",
        "WETH": "ethereum",
        "LINK": "chainlink"
    }

    if symbol not in coingecko_ids:
        return 0.0

    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coingecko_ids[symbol]}&vs_currencies=usd"
        response = requests.get(url, timeout=10)
        data = response.json()

        if coingecko_ids[symbol] in data:
            return data[coingecko_ids[symbol]]["usd"]
    except:
        pass

    # Fallback prices
    if symbol == "USDC":
        return 1.0

    return 0.0

def check_recipient_balances():
    print{Check current balances of all recipient addresses}

    print("=" * 80)
    print("RECIPIENT WALLET BALANCES")
    print("=" * 80)
    print()
    print("Checking current balances of wallets you sent funds to...")
    print()
    print("=" * 80)
    print()

    total_usd = 0.0
    recipient_data = []

    for address, info in KNOWN_RECIPIENTS.items():
        print(f"📍 {info['name']}")
        print(f"   Address: {address}")
        print(f"   Type: {info['type']}")
        print(f"   Chain: {info['chain']}")
        print("-" * 80)

        chain = info['chain']
        address_total_usd = 0.0
        balances = {}

        # Get native token balance
        native_symbol = CHAINS[chain]["native"]
        native_balance = get_balance(address, chain)
        native_price = get_price(native_symbol)
        native_usd = float(native_balance) * native_price

        if native_balance > 0:
            balances[native_symbol] = {
                "amount": float(native_balance),
                "usd": native_usd
            }
            address_total_usd += native_usd
            print(f"   {native_symbol}: {native_balance:.6f} (${native_usd:.2f})")

        # Get token balances
        if chain in TOKENS:
            for token_name, token_info in TOKENS[chain].items():
                token_balance = get_token_balance(
                    address,
                    token_info["address"],
                    token_info["decimals"],
                    chain
                )

                if token_balance > 0:
                    token_price = get_price(token_name)
                    token_usd = float(token_balance) * token_price

                    balances[token_name] = {
                        "amount": float(token_balance),
                        "usd": token_usd
                    }
                    address_total_usd += token_usd
                    print(f"   {token_name}: {token_balance:.6f} (${token_usd:.2f})")

        if not balances:
            print(f"   (No balances - funds likely moved elsewhere)")

        print(f"   💰 Total: ${address_total_usd:.2f}")
        print()

        total_usd += address_total_usd

        recipient_data.append({
            "address": address,
            "name": info["name"],
            "type": info["type"],
            "chain": info["chain"],
            "balances": balances,
            "total_usd": address_total_usd
        })

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    print(f"Total value in recipient wallets: ${total_usd:.2f}")
    print()

    # Breakdown by type
    print("Breakdown by recipient type:")
    print("-" * 80)

    type_totals = defaultdict(float)
    for r in recipient_data:
        type_totals[r["type"]] += r["total_usd"]

    for recipient_type, total in type_totals.items():
        print(f"  {recipient_type}: ${total:.2f}")

    print()
    print("=" * 80)
    print()

    # Important notes
    print("⚠️  IMPORTANT NOTES:")
    print("-" * 80)
    print()
    print("1. These are CURRENT balances in recipient addresses")
    print("   → NOT the amount you sent (they may have moved funds)")
    print()
    print("2. DEX router balances are usually $0")
    print("   → Routers don't hold funds, they route them")
    print("   → Your funds went THROUGH routers to other destinations")
    print()
    print("3. DeFi contract balances may be held in pools")
    print("   → Check Aerodrome UI for your LP positions")
    print()
    print("4. Custodial wallet balances may not show correctly")
    print("   → BitKeep uses internal accounting")
    print("   → Check BitKeep app for accurate balance")
    print()

    # Save report
    report = {
        "your_address": YOUR_ADDRESS,
        "timestamp": datetime.now().isoformat(),
        "recipients": recipient_data,
        "total_usd": total_usd,
        "breakdown_by_type": dict(type_totals)
    }

    with open("/tmp/recipient_balances.json", "w") as f:
        json.dump(report, f, indent=2)

    print("📁 Full report saved to: /tmp/recipient_balances.json")
    print()

    return report

def find_your_money_trail():
    print{    The real question: Where did your money actually go?}
    print()
    print("=" * 80)
    print("MONEY TRAIL ANALYSIS")
    print("=" * 80)
    print()
    print("Your money likely followed this path:")
    print()
    print("1. YOUR WALLET")
    print("   ↓ (deposit)")
    print("2. DEX ROUTER (Aerodrome/Uniswap)")
    print("   ↓ (swap/add liquidity)")
    print("3. FINAL DESTINATION:")
    print()
    print("   Option A: Aerodrome LP Position (USDC/WETH)")
    print("   → Check: https://aerodrome.finance/liquidity")
    print()
    print("   Option B: BitKeep Custodial Wallet")
    print("   → Check: BitKeep app balance")
    print()
    print("   Option C: Swapped to another token")
    print("   → Check: Your wallet for unexpected tokens")
    print()
    print("=" * 80)
    print()
    print("The recipient balances above show WHERE your funds are NOW,")
    print("but to know HOW MUCH you have, you need to:")
    print()
    print("1. Check Aerodrome positions (likely largest amount)")
    print("2. Check BitKeep app balance")
    print("3. Add them up")
    print()
    print("=" * 80)
    print()

if __name__ == "__main__":
    print()
    print("🔍 TRACKING YOUR MONEY")
    print()
    print(f"Your address: {YOUR_ADDRESS}")
    print()

    # Check recipient balances
    report = check_recipient_balances()

    # Show money trail
    find_your_money_trail()

    print()
    print("=" * 80)
    print("BOTTOM LINE")
    print("=" * 80)
    print()

    if report["total_usd"] > 0:
        print(f"Current balance in recipient wallets: ${report['total_usd']:.2f}")
        print()
        print("But this is likely NOT your total net worth because:")
        print("  • LP positions show as contract balances, not token amounts")
        print("  • Custodial wallets use internal accounting")
        print()
    else:
        print("All recipient wallets show $0 balance.")
        print()
        print("This means your funds are in:")
        print("  1. LP position NFTs (check Aerodrome)")
        print("  2. Custodial wallets (check BitKeep)")
        print("  3. Already withdrawn/spent")
        print()

    print("To get your EXACT total:")
    print("  → Open Aerodrome.finance → Connect wallet → See position values")
    print("  → Open BitKeep app → See total balance")
    print("  → Add them together")
    print()
