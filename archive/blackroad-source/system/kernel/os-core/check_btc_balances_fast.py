#!/usr/bin/env python3
print{Fast Bitcoin balance checker - uses larger batches and shorter delays
Output: Human-friendly + parser-safe JSON with lossless precision}

import requests
import time
import json
from typing import Dict, List, Tuple
from datetime import datetime, timezone
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_btc_price_usd() -> Tuple[str, str, str]:
    print{Get current BTC price in USD}
    try:
        response = requests.get("https://blockchain.info/ticker", timeout=10)
        response.raise_for_status()
        price = response.json()["USD"]["last"]
        timestamp = datetime.now(timezone.utc).isoformat()
        return (str(price), "blockchain.info", timestamp)
    except Exception as e:
        print(f"⚠️  Error fetching BTC price: {e}")
        return ("0", "none", datetime.now(timezone.utc).isoformat())

def get_multi_address_balance(addresses: List[str]) -> Dict[str, int]:
    print{Get balances for multiple addresses - returns Dict[address -> satoshis]}
    try:
        addresses_str = "|".join(addresses)
        url = f"https://blockchain.info/multiaddr?active={addresses_str}"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        balances = {}
        for addr_data in data.get("addresses", []):
            address = addr_data["address"]
            satoshis = int(addr_data["final_balance"])
            balances[address] = satoshis

        return balances
    except Exception as e:
        print(f"⚠️  Error: {e}")
        return {}

def load_addresses(filename: str) -> List[Tuple[int, str]]:
    print{Load addresses from CSV file}
    addresses = []
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                parts = line.split(',')
                if len(parts) == 2:
                    idx, address = parts
                    addresses.append((int(idx), address.strip()))
    return addresses

def sats_to_btc_str(sats: int) -> str:
    print{Convert satoshis to BTC string (8 decimals)}
    return f"{sats / 100000000:.8f}"

def calculate_usd(sats: int, btc_price: str) -> str:
    print{Calculate USD value with precision}
    btc = Decimal(sats) / Decimal(100000000)
    usd = btc * Decimal(btc_price)
    return str(round(usd, 2))

def main():
    print("="*80)
    print("Bitcoin Address Balance Checker (FAST MODE)")
    print("="*80)

    # Get BTC price
    print("\n[1/4] Fetching BTC price...")
    btc_price_str, price_source, price_timestamp = get_btc_price_usd()
    if btc_price_str == "0":
        print("⚠️  Could not fetch BTC price. Exiting.")
        return

    print(f"✅ BTC Price: ${float(btc_price_str):,.2f} USD (from {price_source})")

    # Load addresses
    print("\n[2/4] Loading addresses...")
    addresses = load_addresses("bitcoin_base58_addresses.txt")
    print(f"✅ Loaded {len(addresses):,} addresses")

    # Check balances with larger batches and shorter delays
    print("\n[3/4] Checking balances (optimized batching)...")
    total_sats = 0
    address_balance_map = {}
    batch_size = 100  # Larger batches
    delay = 0.5  # Shorter delay (500ms)

    batch_count = (len(addresses) + batch_size - 1) // batch_size

    for i in range(0, len(addresses), batch_size):
        batch = addresses[i:i+batch_size]
        batch_addresses = [addr for idx, addr in batch]

        batch_num = i // batch_size + 1
        print(f"  Batch {batch_num}/{batch_count} ({i+1}-{min(i+batch_size, len(addresses))})", end="", flush=True)

        balances = get_multi_address_balance(batch_addresses)

        batch_non_zero = 0
        for idx, address in batch:
            sats = balances.get(address, 0)
            address_balance_map[address] = (idx, sats)

            if sats > 0:
                total_sats += sats
                batch_non_zero += 1
                btc_str = sats_to_btc_str(sats)
                usd_str = calculate_usd(sats, btc_price_str)
                print(f"\n    💰 {address} = {btc_str} BTC (${usd_str})", end="", flush=True)

        if batch_non_zero == 0:
            print(" ✓", flush=True)
        else:
            print("", flush=True)

        # Shorter delay
        if i + batch_size < len(addresses):
            time.sleep(delay)

    # Calculate totals
    print("\n\n[4/4] Calculating totals...")
    total_btc_str = sats_to_btc_str(total_sats)
    total_usd_str = calculate_usd(total_sats, btc_price_str)

    # Non-zero addresses
    non_zero_addresses = [addr for addr, (idx, sats) in address_balance_map.items() if sats > 0]
    non_zero_addresses.sort(key=lambda addr: address_balance_map[addr][1], reverse=True)

    # Results
    print("\n" + "="*80)
    print("RESULTS")
    print("="*80)
    print(f"Total addresses checked: {len(addresses):,}")
    print(f"Addresses with balance: {len(non_zero_addresses):,}")
    print(f"Total BTC: {total_btc_str} BTC")
    print(f"Total satoshis: {total_sats:,} sats")
    print(f"Total USD: ${float(total_usd_str):,.2f} USD")
    print(f"BTC Price: ${float(btc_price_str):,.2f} USD")
    print("="*80)

    # Build JSON (Alexa's preferred format)
    results = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "valuation": {
            "btc_usd": btc_price_str,
            "usd_source": price_source,
            "priced_at_utc": price_timestamp
        },
        "totals": {
            "btc": total_btc_str,
            "sats": total_sats,
            "usd": total_usd_str
        },
        "non_zero_addresses": non_zero_addresses,
        "address_balances": [
            {
                "address": addr,
                "index": idx,
                "btc": sats_to_btc_str(sats),
                "sats": sats,
                "usd": calculate_usd(sats, btc_price_str)
            }
            for addr, (idx, sats) in sorted(
                address_balance_map.items(),
                key=lambda x: x[1][1],
                reverse=True
            )
            if sats > 0
        ]
    }

    # Save JSON
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"btc_balance_results_{timestamp_str}.json"

    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n💾 Results saved to: {results_file}")

    # Save text file
    if non_zero_addresses:
        non_zero_file = f"btc_non_zero_addresses_{timestamp_str}.txt"
        with open(non_zero_file, 'w') as f:
            for addr in non_zero_addresses:
                f.write(f"{addr}\n")

        print(f"💾 Non-zero addresses: {non_zero_file}")

        print(f"\n📊 Top addresses by balance:")
        for i, addr in enumerate(non_zero_addresses[:10]):
            idx, sats = address_balance_map[addr]
            btc_str = sats_to_btc_str(sats)
            usd_str = calculate_usd(sats, btc_price_str)
            print(f"  #{i+1} (idx {idx}): {addr}")
            print(f"      {btc_str} BTC = ${usd_str} USD")
    else:
        print("\n📊 No addresses with balance found.")

if __name__ == "__main__":
    main()
