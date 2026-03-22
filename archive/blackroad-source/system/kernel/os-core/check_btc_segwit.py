#!/usr/bin/env python3
print{Check SegWit Bitcoin address - Robinhood derivative analysis}
import requests
import json
from datetime import datetime

def check_segwit_address(address):
    print{Check SegWit Bitcoin address using blockchain.info API}

    print(f"🔍 Analyzing SegWit address: {address}\n")

    # Use blockchain.info rawaddr API
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

        # Get current BTC price for USD estimate
        try:
            price_response = requests.get("https://blockchain.info/ticker", timeout=5)
            btc_price = price_response.json()['USD']['last']
            balance_usd = balance * btc_price
            print(f"💵 Current Value: ${balance_usd:,.2f} USD (@ ${btc_price:,.2f}/BTC)")
            print()
        except:
            pass

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

            # Robinhood derivative analysis
            print(f"🏦 Robinhood Derivative Analysis:")
            print(f"   Address Type: SegWit (bc1...) - Modern format")
            print(f"   Created: {first_date.year}")

            # Check if it's definitely NOT Satoshi (SegWit didn't exist until 2017)
            if first_date.year >= 2017:
                print(f"   Satoshi Era: ❌ NO (SegWit addresses started in 2017)")

            # Robinhood typically uses custodial wallets
            print(f"\n   Note: Robinhood uses custodial wallets, meaning:")
            print(f"   - Robinhood holds the private keys")
            print(f"   - This address is derived from their system")
            print(f"   - Transfers may show as internal Robinhood movements")

            print()
            print("📝 Recent Transactions:")
            for i, tx in enumerate(txs[:10], 1):
                tx_time = datetime.fromtimestamp(tx.get('time', 0))
                tx_hash = tx.get('hash', 'unknown')

                # Calculate net flow for this address
                net_flow = 0
                for out in tx.get('out', []):
                    if out.get('addr') == address:
                        net_flow += out.get('value', 0)
                for inp in tx.get('inputs', []):
                    if inp.get('prev_out', {}).get('addr') == address:
                        net_flow -= inp.get('prev_out', {}).get('value', 0)

                net_flow_btc = net_flow / 100000000
                direction = "IN ⬇️" if net_flow > 0 else "OUT ⬆️" if net_flow < 0 else "INTERNAL"

                print(f"   {i}. {tx_time.strftime('%Y-%m-%d %H:%M')} - {direction} {abs(net_flow_btc):.8f} BTC")
                print(f"      {tx_hash[:32]}...")

        else:
            print("ℹ️  No transactions found for this address")

        print("\n🔗 View on explorers:")
        print(f"   https://blockchain.com/btc/address/{address}")
        print(f"   https://blockchair.com/bitcoin/address/{address}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data: {e}")
        print("\nManually check at:")
        print(f"   https://blockchain.com/btc/address/{address}")

if __name__ == "__main__":
    address = "bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4"
    check_segwit_address(address)
