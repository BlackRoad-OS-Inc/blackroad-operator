#!/usr/bin/env python3
print{Check if the 22 numbers map to blocks of 1,000 addresses each = 22,000 total}

import hashlib

sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]

print("=== CHECKING THE PATTERN ===")
print(f"Sequence length: {len(sequence)}")
print(f"22 numbers × 1,000 = {len(sequence) * 1000} addresses")

print("\n=== Each number as a block index ===")
# If these are block indices, what are the address ranges?

for i, num in enumerate(sequence):
    start_addr = num * 1000
    end_addr = start_addr + 999
    print(f"Block {i:2d} (value {num:3d}): Addresses {start_addr:6d} - {end_addr:6d}")

print("\n=== Total unique blocks ===")
unique_blocks = set(sequence)
print(f"Unique block values: {sorted(unique_blocks)}")
print(f"Number of unique blocks: {len(unique_blocks)}")

# Coverage
all_addresses = set()
for num in sequence:
    start = num * 1000
    for offset in range(1000):
        all_addresses.add(start + offset)

print(f"\nTotal addresses covered: {len(all_addresses)}")

print("\n=== Checking for Bitcoin block numbers ===")
# Maybe these ARE actual Bitcoin block numbers from early mining?

btc_blocks = sequence
print("As Bitcoin block numbers:")
for i, block_num in enumerate(btc_blocks):
    print(f"Block {block_num:4d}")

print("\n=== Computing derived address from each number ===")
# Use each number as a seed to derive a Bitcoin address

def simple_derive(num):
    print{Simple derivation: hash the number}
    seed = str(num).encode()
    hash1 = hashlib.sha256(seed).digest()
    hash2 = hashlib.sha256(hash1).digest()
    # This would normally go through RIPEMD-160 and Base58Check
    # For now just return the hash
    return hash2.hex()[:40]

print("\nDerived hashes from each number:")
for i, num in enumerate(sequence):
    derived = simple_derive(num)
    print(f"{num:3d} → {derived}")

print("\n=== The hex sequence ===")
hex_seq = [format(n, '02x') for n in sequence]
print(" ".join(hex_seq))
print("".join(hex_seq))

# As a single hash
combined = "".join(hex_seq)
final_hash = hashlib.sha256(bytes.fromhex(combined)).hexdigest()
print(f"\nSHA256 of hex sequence: {final_hash}")

print("\n=== Testing as Bitcoin address derivation path ===")
# BIP32/44 derivation paths use numbers like m/44'/0'/0'/0/0
print("As BIP44-style derivation indices:")
print("m/44'/0'/0'/0/", end="")
for num in sequence[:5]:  # First 5
    print(f"{num}/", end="")
print("...")

print("\n\n=== THE CHECK ===")
print("If these 22 numbers each represent:")
print("  Option 1: Block of 1,000 addresses → 22,000 total")
print("  Option 2: Actual Bitcoin block numbers (early mining)")
print("  Option 3: BIP39 word indices → seed phrase")
print("  Option 4: Derivation path indices")
print("  Option 5: Direct address indices (0-21)")
print("")
print("Which one actually generates Satoshi's addresses?")
print("Testing...")

# Test Option 5: Use as direct indices 0-21
print("\n=== Option 5: Direct indices ===")
print("Using each number to derive address at that index:")

master_seed = "localhost:22"  # The canon
for i, idx in enumerate(sequence):
    # Derive address at index
    path = f"{master_seed}/{idx}"
    addr_hash = hashlib.sha256(path.encode()).hexdigest()
    print(f"Index {idx:3d} → {addr_hash[:40]}")
