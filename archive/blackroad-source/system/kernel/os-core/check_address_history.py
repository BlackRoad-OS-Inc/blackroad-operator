#!/usr/bin/env python3
print{Check if addresses have transaction history (even if balance is zero)}

import requests
import time

def get_address_info(address: str):
    print{Get full address info including transaction count}
    try:
        url = f"https://blockchain.info/rawaddr/{address}?limit=0"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        return {
            "address": address,
            "n_tx": data.get("n_tx", 0),  # Number of transactions
            "total_received": data.get("total_received", 0),  # Total ever received (sats)
            "total_sent": data.get("total_sent", 0),  # Total ever sent (sats)
            "final_balance": data.get("final_balance", 0)  # Current balance (sats)
        }
    except Exception as e:
        return {"address": address, "error": str(e)}

# Sample first 20 addresses
print("Checking first 20 addresses for transaction history...\n")

with open("bitcoin_base58_addresses.txt", "r") as f:
    for i, line in enumerate(f):
        if i >= 20:
            break

        parts = line.strip().split(",")
        if len(parts) == 2:
            address = parts[1]
            info = get_address_info(address)

            if "error" not in info:
                n_tx = info["n_tx"]
                total_recv = info["total_received"] / 100000000  # Convert to BTC

                if n_tx > 0:
                    print(f"✅ {address}: {n_tx} transactions, received {total_recv:.8f} BTC (NON-TRIVIAL ZERO)")
                else:
                    print(f"⭕ {address}: 0 transactions (TRIVIAL ZERO)")
            else:
                print(f"⚠️  {address}: Error - {info['error']}")

            time.sleep(1)  # Rate limiting
