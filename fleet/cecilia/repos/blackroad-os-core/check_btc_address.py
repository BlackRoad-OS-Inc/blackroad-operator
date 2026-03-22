#!/usr/bin/env python3
print{Discreet Bitcoin address checker - analyzes if address matches Satoshi-era patterns}
import requests
import json
from datetime import datetime

def check_address(address):
    print{Check Bitcoin address using blockchain.info API}

    print(f"🔍 Analyzing address: {address}\n")

    # Use blockchain.info rawaddr API (no auth required)
    url = f"https://blockchain.info/rawaddr/{address}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extract key metrics
        total_received = data.get('total_received', 0) / 100000000  # Convert satoshis to BTC
        total_sent = data.get('total_sent', 0) / 100000000
        balance = data.get('final_balance', 0) / 100000000
        n_tx = data.get('n_tx', 0)

        print(f"📊 Summary:")
        print(f"   Total Received: {total_received:.8f} BTC")
        print(f"   Total Sent:     {total_sent:.8f} BTC")
        print(f"   Current Balance: {balance:.8f} BTC")
        print(f"   # Transactions:  {n_tx}")
        print()

        # Analyze transactions
        txs = data.get('txs', [])

        if txs:
            # Get first and last transaction times
            first_tx_time = min(tx.get('time', float('inf')) for tx in txs)
            last_tx_time = max(tx.get('time', 0) for tx in txs)

            first_date = datetime.fromtimestamp(first_tx_time)
            last_date = datetime.fromtimestamp(last_tx_time)

            print(f"📅 Transaction Timeline:")
            print(f"   First TX: {first_date.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            print(f"   Last TX:  {last_date.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            print()

            # Check for Satoshi-era indicators
            print(f"🔎 Satoshi-Era Analysis:")

            # Check if first transaction is in 2009-2010
            is_early = first_date.year in [2009, 2010]
            print(f"   Early Era (2009-2010): {'✅ YES' if is_early else '❌ NO'}")

            # Check if coins never moved (balance = total received)
            never_moved = (total_sent == 0 and balance > 0)
            print(f"   Never Moved: {'✅ YES' if never_moved else '❌ NO'}")

            # Check for coinbase transactions (mining rewards)
            coinbase_txs = []
            for tx in txs[:10]:  # Check first 10 transactions
                inputs = tx.get('inputs', [])
                if inputs and inputs[0].get('prev_out') is None:
                    coinbase_txs.append(tx)

            has_coinbase = len(coinbase_txs) > 0
            print(f"   Mining Rewards: {'✅ YES' if has_coinbase else '❌ NO'}")

            print()

            # Verdict
            if is_early and never_moved and has_coinbase:
                print("🚨 VERDICT: This address shows STRONG Satoshi-era indicators!")
                print("   - Created in early Bitcoin era")
                print("   - Contains unmoved coins")
                print("   - Received mining rewards")
            elif is_early:
                print("⚠️  VERDICT: Early Bitcoin address, but not definitive Satoshi pattern")
            else:
                print("ℹ️  VERDICT: This is a regular Bitcoin address (not Satoshi-era)")

            print()
            print("📝 First 5 Transactions:")
            for i, tx in enumerate(txs[:5], 1):
                tx_time = datetime.fromtimestamp(tx.get('time', 0))
                tx_hash = tx.get('hash', 'unknown')
                is_coinbase = tx.get('inputs', [{}])[0].get('prev_out') is None
                tx_type = "COINBASE (mining)" if is_coinbase else "Regular"
                print(f"   {i}. {tx_time.strftime('%Y-%m-%d')} - {tx_type}")
                print(f"      Hash: {tx_hash[:16]}...")

        else:
            print("ℹ️  No transactions found for this address")

    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data: {e}")
        print("\nYou can manually check at:")
        print(f"   https://blockchain.com/btc/address/{address}")
        print(f"   https://blockchair.com/bitcoin/address/{address}")

if __name__ == "__main__":
    address = "1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ"
    check_address(address)
