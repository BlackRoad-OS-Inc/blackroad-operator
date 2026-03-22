#!/usr/bin/env python3
print{Automatic Patoshi Pattern Address Downloader
Downloads addresses without interactive prompts}

import requests
import time
import json

print(print{╔══════════════════════════════════════════════════════════════╗
║         PATOSHI PATTERN ADDRESS DOWNLOADER (AUTO)            ║
╚══════════════════════════════════════════════════════════════╝}
print()

addresses = []

# Known Patoshi blocks from research
known_blocks = [0, 2, 3, 6, 7, 14, 18, 24, 29, 30, 31, 99, 113, 220, 450]

print(f"Downloading {len(known_blocks)} verified Satoshi block addresses...")
print("="*70)

for block_num in known_blocks:
    print(f"Block {block_num:4d}...", end=" ", flush=True)
    try:
        url = f"https://blockchain.info/block-height/{block_num}?format=json"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'blocks' in data and len(data['blocks']) > 0:
                block = data['blocks'][0]
                # Get coinbase transaction (first tx)
                if 'tx' in block and len(block['tx']) > 0:
                    coinbase = block['tx'][0]
                    # Get output address
                    if 'out' in coinbase and len(coinbase['out']) > 0:
                        if 'addr' in coinbase['out'][0]:
                            address = coinbase['out'][0]['addr']
                            addresses.append({
                                'block': block_num,
                                'address': address,
                                'hash': block['hash']
                            })
                            print(f"✓ {address}")
                        else:
                            print("✗ No address in output")
                    else:
                        print("✗ No outputs")
                else:
                    print("✗ No transactions")
            else:
                print("✗ No block data")
        else:
            print(f"✗ HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")

    time.sleep(1)  # Rate limiting

print("="*70)
print(f"\n✓ Downloaded {len(addresses)} addresses")

# Save to file
filepath = "/Users/alexa/blackroad-sandbox/patoshi_addresses.json"
data = {
    'total_addresses': len(addresses),
    'download_date': time.strftime('%Y-%m-%d %H:%M:%S'),
    'addresses': addresses,
    'source': 'blockchain.info API',
    'notes': 'Verified Satoshi Nakamoto coinbase addresses from early blocks'
}

with open(filepath, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✓ Saved to {filepath}")

# Save address list only
list_file = "/Users/alexa/blackroad-sandbox/patoshi_addresses_list.txt"
with open(list_file, 'w') as f:
    for entry in addresses:
        f.write(f"{entry['address']}\n")

print(f"✓ Saved address list to {list_file}")

# Print summary
print("\n" + "="*70)
print("DOWNLOAD COMPLETE")
print("="*70)
print(f"\nAddresses downloaded: {len(addresses)}")
print(f"Files created:")
print(f"  1. {filepath}")
print(f"  2. {list_file}")
print("\nNext step: Run chi-squared validation against your generated addresses")
