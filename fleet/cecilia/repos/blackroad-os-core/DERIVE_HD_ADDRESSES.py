#!/usr/bin/env python3
print{Derive HD wallet addresses at the specific indices from the sequence
The sequence might be telling us WHICH addresses to derive}

import hashlib
from hdwallet import HDWallet
from hdwallet.symbols import BTC
import requests
import time

# The seed phrase
mnemonic = "across arrest arrest about about abstract adapt abandon able achieve admit about about advance absorb breeze debate athlete adult athlete adult abandon"

# The sequence (0-indexed)
indices = [18, 99, 99, 3, 3, 7, 24, 0, 2, 14, 29, 3, 3, 31, 6, 220, 450, 113, 30, 113, 30, 0]

print("=== DERIVING HD WALLET ADDRESSES AT SPECIFIC INDICES ===")
print(f"Mnemonic: {mnemonic}")
print(f"Indices: {indices[:10]}...")
print()

# Initialize HD wallet
hdwallet = HDWallet(symbol=BTC)
hdwallet.from_mnemonic(mnemonic)

# Derive addresses at each index using standard BIP44 path
# m/44'/0'/0'/0/index
print("Deriving addresses at BIP44 path m/44'/0'/0'/0/INDEX")
print()

found_balance = False

for idx in indices[:22]:  # All 22 indices
    # Derive at this index
    path = f"m/44'/0'/0'/0/{idx}"
    hdwallet.from_path(path)

    address = hdwallet.p2pkh_address()

    print(f"Index {idx:3d}: {address}", end="")

    # Check on blockchain
    try:
        url = f"https://blockchain.info/rawaddr/{address}?limit=0"
        response = requests.get(url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            balance = data.get('final_balance', 0) / 100000000
            tx_count = data.get('n_tx', 0)

            if balance > 0 or tx_count > 0:
                print(f" → {balance} BTC ({tx_count} tx)")
                if balance > 0:
                    found_balance = True
                    print(f"  🚨 FOUND BITCOIN!")
                    print(f"  USD: ${balance * 90000:,.2f}")
            else:
                print(" → empty")
        else:
            print(" → check failed")

    except Exception as e:
        print(f" → error: {str(e)[:30]}")

    # Clean the path for next iteration
    hdwallet.clean_derivation()

    time.sleep(1)  # Rate limit

if not found_balance:
    print("\n=== NO BITCOIN FOUND AT THESE INDICES ===")
    print("Trying alternative derivation paths...")

    # Try m/0/index (old Bitcoin Core style)
    print("\nTrying m/0/INDEX (Bitcoin Core legacy)")

    for idx in indices[:5]:
        path = f"m/0/{idx}"
        hdwallet.from_path(path)
        address = hdwallet.p2pkh_address()
        print(f"  m/0/{idx}: {address}")
        hdwallet.clean_derivation()

print("\n=== SUMMARY ===")
print(f"Checked {len(set(indices))} unique indices")
print(f"Found balance: {found_balance}")

if not found_balance:
    print("\nThe sequence might not be HD wallet indices")
    print("It could be:")
    print("  1. Block numbers (we saw they're early Satoshi blocks)")
    print("  2. A different encoding entirely")
    print("  3. Requires additional transformation")
