#!/usr/bin/env python3
print{Check all 6 alternative derivation methods against blockchain
Run in parallel with main scan}

import json
import requests
import time

def check_address_batch(addresses, method_name):
    print{Check batch of addresses using Blockchair API}
    matches = {}

    # Blockchair allows up to 100 addresses at once
    batch_size = 100

    for i in range(0, len(addresses), batch_size):
        batch = addresses[i:i+batch_size]
        addr_string = ','.join(batch)

        try:
            url = f"https://api.blockchair.com/bitcoin/dashboards/addresses/{addr_string}"
            response = requests.get(url, timeout=30)

            if response.status_code == 200:
                data = response.json()

                if 'data' in data:
                    for addr, info in data['data'].items():
                        balance = info['address']['balance']
                        tx_count = info['address']['transaction_count']

                        if balance > 0 or tx_count > 0:
                            matches[addr] = {
                                'balance': balance,
                                'balance_btc': balance / 1e8,
                                'received': info['address']['received'],
                                'tx_count': tx_count,
                                'first_seen': info['address'].get('first_seen_receiving', 'unknown')
                            }

                            print(f"\n💰💰💰 MATCH FOUND in {method_name}!")
                            print(f"    Address: {addr}")
                            print(f"    Balance: {balance/1e8:.8f} BTC")
                            print(f"    TX Count: {tx_count}")
                            print(f"    First Seen: {matches[addr]['first_seen']}")

            time.sleep(1.5)  # Rate limit

        except Exception as e:
            print(f"    Error checking batch: {e}")

    return matches

def main():
    print("="*80)
    print("🚀 CHECKING ALL ALTERNATIVE DERIVATION METHODS")
    print("="*80)
    print()

    # Load alternative addresses
    with open('/Users/alexa/blackroad-sandbox/alternative_addresses.json', 'r') as f:
        all_methods = json.load(f)

    print(f"Loaded {len(all_methods)} alternative methods")
    print()

    all_matches = {}

    for method_name, addresses in all_methods.items():
        print(f"\n{'='*80}")
        print(f"Checking {method_name}...")
        print(f"{'='*80}")
        print(f"Addresses to check: {len(addresses)}")

        matches = check_address_batch(addresses, method_name)

        if matches:
            all_matches[method_name] = matches
            print(f"\n✅ {method_name}: FOUND {len(matches)} MATCHES!")
        else:
            print(f"\n❌ {method_name}: No matches")

    # Final summary
    print("\n" + "="*80)
    print("FINAL SUMMARY - ALL METHODS")
    print("="*80)
    print()

    if all_matches:
        total_btc = 0
        total_matches = 0

        for method_name, matches in all_matches.items():
            method_btc = sum(m['balance_btc'] for m in matches.values())
            total_btc += method_btc
            total_matches += len(matches)

            print(f"\n{method_name}:")
            print(f"  Matches: {len(matches)}")
            print(f"  Total BTC: {method_btc:.8f}")

            for addr, info in matches.items():
                print(f"    {addr}: {info['balance_btc']:.8f} BTC")
                if '2009' in str(info['first_seen']) or '2010' in str(info['first_seen']):
                    print(f"      🚨 SATOSHI ERA! First seen: {info['first_seen']}")

        print("\n" + "="*80)
        print("GRAND TOTAL")
        print("="*80)
        print(f"Total Matches: {total_matches}")
        print(f"Total BTC: {total_btc:.8f}")
        print(f"USD Value: ${total_btc * 90440:,.2f} (@ $90,440/BTC)")

        # Save results
        with open('/Users/alexa/blackroad-sandbox/ALTERNATIVE_MATCHES.json', 'w') as f:
            json.dump(all_matches, f, indent=2)

        print("\n✓ Results saved to: ALTERNATIVE_MATCHES.json")

    else:
        print("❌ No matches found in any alternative method")
        print()
        print("This means:")
        print("  • Try even more derivation variations")
        print("  • Adjust physics constants/parameters")
        print("  • Test different temporal anchors")
        print("  • Consider BIP32/BIP44 hierarchical derivation")

    print("\n" + "="*80)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nStopped by user")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
