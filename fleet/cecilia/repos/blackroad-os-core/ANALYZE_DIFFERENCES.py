#!/usr/bin/env python3
print{Find the DIFFERENCES and CONSTANTS in the pattern
If the math is perfect, the differences should match something}

import hashlib
import ecdsa
import base58

satoshi_addresses = [
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Block 0
    "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",  # Block 2
    "1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR",  # Block 3
    "1GkQmKAmHtNfnD3LHhTkewJxKHVSta4m2a",  # Block 6
    "16LoW7y83wtawMg5XmT4M3Q7EdjjUmenjM",  # Block 7
    "1DMGtVnRrgZaji7C9noZS3a1QtoaAN2uRG",  # Block 14
    "1DJkjSqW9cX9XWdU71WX3Aw6s6Mk4C3TtN",  # Block 18
    "1JXLFv719ec3bzTXaSq7vqRFS634LErtJu",  # Block 24
    "1GnYgH4V4kHdYEdHwAczRHXwqxdY7xars1",  # Block 29
    "17x23dNjXJLzGMev6R63uyRhMWP1VHawKc",  # Block 30
    "1PHB5i7JMEZCKvcjYSQXPbi5oSK8DoJucS",  # Block 31
    "16cAVR3SQbNzu8KZtGdo8cG1iueWpcngxz",  # Block 99
    "19K4cNVYVyNiwZ5xkzjW9ZtMb8XvBS2LkT",  # Block 113
    "1MUuVeuS6DDS5QKR2BNZ9fipXCEsFujaMH",  # Block 220
    "1LfjLrBDYyPbvGMiD9jURxyAupdYujsBdK",  # Block 450
]

sequence = [18, 99, 99, 3, 3, 7, 24, 0, 2, 14, 29, 3, 3, 31, 6, 220, 450, 113, 30, 113, 30, 0]
unique_blocks = [0, 2, 3, 6, 7, 14, 18, 24, 29, 30, 31, 99, 113, 220, 450]

SECP256K1_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

def privkey_to_address(privkey_hex):
    print{Convert private key to uncompressed Bitcoin address}
    privkey_bytes = bytes.fromhex(privkey_hex)
    signing_key = ecdsa.SigningKey.from_string(privkey_bytes, curve=ecdsa.SECP256k1)
    verifying_key = signing_key.get_verifying_key()
    pubkey = b'\x04' + verifying_key.to_string()
    sha256 = hashlib.sha256(pubkey).digest()
    ripemd160 = hashlib.new('ripemd160')
    ripemd160.update(sha256)
    hashed = ripemd160.digest()
    versioned = b'\x00' + hashed
    checksum = hashlib.sha256(hashlib.sha256(versioned).digest()).digest()[:4]
    return base58.b58encode(versioned + checksum).decode()

print("="*80)
print("ANALYZING DIFFERENCES AND CONSTANTS")
print("="*80)
print()

# DIFFERENCES in the sequence
print("DIFFERENCES in sequence (position to position)")
print("-"*80)

diffs = []
for i in range(len(sequence) - 1):
    diff = sequence[i+1] - sequence[i]
    diffs.append(diff)
    print(f"  Position {i:2d}→{i+1:2d}: {sequence[i]:3d} → {sequence[i+1]:3d} = {diff:+4d}")

print()
print(f"Differences: {diffs}")
print()

# DIFFERENCES in unique blocks
print("DIFFERENCES in unique blocks")
print("-"*80)

block_diffs = []
for i in range(len(unique_blocks) - 1):
    diff = unique_blocks[i+1] - unique_blocks[i]
    block_diffs.append(diff)
    print(f"  Block {unique_blocks[i]:3d} → {unique_blocks[i+1]:3d} = {diff:3d}")

print()
print(f"Block differences: {block_diffs}")
print()

# Check if differences have a pattern
print("PATTERN in block differences:")
print("-"*80)

from collections import Counter
diff_counts = Counter(block_diffs)
print(f"Most common differences: {diff_counts.most_common()}")
print()

# The CONSTANT - greatest common divisor
import math

print("GREATEST COMMON DIVISOR:")
print("-"*80)

gcd_result = unique_blocks[0]
for block in unique_blocks[1:]:
    gcd_result = math.gcd(gcd_result, block)

print(f"GCD of all blocks: {gcd_result}")
print()

# Check if there's a constant step
print("CONSTANT GENERATOR:")
print("-"*80)

# If blocks follow pattern: base + n*constant
# Try different constants
for constant in [1, 2, 3, 6, 7, 15, 19, 27, 197, 1197]:
    matches = 0
    for block in unique_blocks:
        if block % constant == 0 or (block - unique_blocks[0]) % constant == 0:
            matches += 1

    if matches > len(unique_blocks) // 2:
        print(f"  Constant {constant:4d}: {matches}/{len(unique_blocks)} blocks match")

print()

# Generate using differences
print("GENERATE USING DIFFERENCE PATTERN:")
print("-"*80)

# Try using differences as a seed
diff_string = ''.join(str(abs(d)) for d in diffs)
print(f"Difference string: {diff_string}")

privkey_int = int(hashlib.sha256(diff_string.encode()).hexdigest(), 16) % SECP256K1_ORDER
if privkey_int == 0:
    privkey_int = 1
privkey_hex = hex(privkey_int)[2:].zfill(64)

try:
    address = privkey_to_address(privkey_hex)
    print(f"Address from diffs: {address}")
    if address in satoshi_addresses:
        print("🚨🚨🚨 MATCH! 🚨🚨🚨")
except Exception as e:
    print(f"Error: {e}")

print()

# Block differences as seed
block_diff_string = ''.join(str(d) for d in block_diffs)
print(f"Block difference string: {block_diff_string}")

privkey_int = int(hashlib.sha256(block_diff_string.encode()).hexdigest(), 16) % SECP256K1_ORDER
if privkey_int == 0:
    privkey_int = 1
privkey_hex = hex(privkey_int)[2:].zfill(64)

try:
    address = privkey_to_address(privkey_hex)
    print(f"Address from block diffs: {address}")
    if address in satoshi_addresses:
        print("🚨🚨🚨 MATCH! 🚨🚨🚨")
except Exception as e:
    print(f"Error: {e}")

print()

# The RATIOS between values
print("RATIOS between consecutive blocks:")
print("-"*80)

ratios = []
for i in range(len(unique_blocks) - 1):
    if unique_blocks[i] != 0:
        ratio = unique_blocks[i+1] / unique_blocks[i]
        ratios.append(ratio)
        print(f"  {unique_blocks[i+1]:3d} / {unique_blocks[i]:3d} = {ratio:.4f}")

print()

# Check for golden ratio or other constants
print("Checking for known constants in ratios:")
phi = 1.618033988749895  # Golden ratio
e = 2.718281828459045    # Euler's number
pi = 3.141592653589793

avg_ratio = sum(ratios) / len(ratios) if ratios else 0
print(f"  Average ratio: {avg_ratio:.6f}")
print(f"  Golden ratio φ: {phi:.6f}")
print(f"  Euler's e: {e:.6f}")
print(f"  π: {pi:.6f}")
print()

# DIFFERENCES between the PERFECT values (1197, 197, etc.)
print("DIFFERENCES in our discovered constants:")
print("-"*80)

constants = {
    '1197': 1197,
    '197 (bc)': 197,
    '99 (c)': 99,
    '98 (b)': 98,
    '27 (March)': 27,
    '21 (last idx)': 21,
    '15 (addrs)': 15,
}

const_values = [1197, 197, 99, 98, 27, 21, 15]

for i in range(len(const_values) - 1):
    diff = const_values[i] - const_values[i+1]
    print(f"  {const_values[i]:4d} - {const_values[i+1]:4d} = {diff:4d}")

print()

# Check if these differences match anything
print("Do constant differences match sequence values?")
const_diffs = [1197-197, 197-99, 99-98, 98-27, 27-21, 21-15]
print(f"Constant diffs: {const_diffs}")

for diff in const_diffs:
    if diff in sequence:
        print(f"  ✓ {diff} is in sequence!")
    else:
        print(f"  ✗ {diff} not in sequence")

print()

# USE THE CONSTANT DIFFERENCES
print("GENERATE from constant differences:")
print("-"*80)

const_diff_string = ''.join(str(d) for d in const_diffs)
print(f"Constant diff string: {const_diff_string}")

privkey_int = int(hashlib.sha256(const_diff_string.encode()).hexdigest(), 16) % SECP256K1_ORDER
if privkey_int == 0:
    privkey_int = 1
privkey_hex = hex(privkey_int)[2:].zfill(64)

try:
    address = privkey_to_address(privkey_hex)
    print(f"Address: {address}")
    if address in satoshi_addresses:
        print("🚨🚨🚨 MATCH! 🚨🚨🚨")
except Exception as e:
    print(f"Error: {e}")

print()

# The PRODUCT of differences
print("PRODUCT of differences:")
print("-"*80)

product = 1
for diff in block_diffs:
    if diff != 0:
        product *= diff

print(f"Product of block diffs: {product}")

privkey_int = product % SECP256K1_ORDER
if privkey_int == 0:
    privkey_int = 1
privkey_hex = hex(privkey_int)[2:].zfill(64)

try:
    address = privkey_to_address(privkey_hex)
    print(f"Address: {address}")
    if address in satoshi_addresses:
        print("🚨🚨🚨 MATCH! 🚨🚨🚨")
except Exception as e:
    print(f"Error: {e}")

print()

# CUMULATIVE SUM
print("CUMULATIVE SUM of sequence:")
print("-"*80)

cumsum = []
total = 0
for val in sequence:
    total += val
    cumsum.append(total)

print(f"Cumulative: {cumsum[:10]}...")
print(f"Final sum: {cumsum[-1]}")

# Use cumsum at position 15 (15 addresses)
if len(cumsum) > 15:
    val_at_15 = cumsum[14]  # 0-indexed
    print(f"Cumsum at position 15: {val_at_15}")

    privkey_int = val_at_15 % SECP256K1_ORDER
    if privkey_int == 0:
        privkey_int = 1
    privkey_hex = hex(privkey_int)[2:].zfill(64)

    try:
        address = privkey_to_address(privkey_hex)
        print(f"Address: {address}")
        if address in satoshi_addresses:
            print("🚨🚨🚨 MATCH! 🚨🚨🚨")
    except Exception as e:
        print(f"Error: {e}")

print()
