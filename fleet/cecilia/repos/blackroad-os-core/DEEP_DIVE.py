#!/usr/bin/env python3
print{DEEP DIVE - No gaslighting, just raw computation
Testing EVERY possible interpretation of the sequence}

import hashlib
import struct

sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]

print("=== RAW TESTS ===\n")

# Test 1: These ARE the private keys (as integers)
print("TEST 1: Using numbers directly as 256-bit key components")
# Combine all 22 numbers into one large integer
combined_int = 0
for num in sequence:
    combined_int = (combined_int << 32) + num  # Shift and add

key_bytes = combined_int.to_bytes(88, byteorder='big')  # 22 numbers * 4 bytes
key_hash = hashlib.sha256(key_bytes).hexdigest()
print(f"Combined as key: {key_hash}")

# Test 2: XOR all numbers together
xor_result = 0
for num in sequence:
    xor_result ^= num
print(f"\nTEST 2: XOR all numbers = {xor_result}")
xor_key = hashlib.sha256(str(xor_result).encode()).hexdigest()
print(f"XOR key hash: {xor_key}")

# Test 3: Multiply all (factorial-like)
product = 1
for num in sequence:
    if num > 0:
        product *= num
print(f"\nTEST 3: Product of all = {product}")
# Too big to hash directly, hash the string representation
product_key = hashlib.sha256(str(product).encode()).hexdigest()
print(f"Product key: {product_key}")

# Test 4: Sum as key
total = sum(sequence)
print(f"\nTEST 4: Sum = {total}")
sum_key = hashlib.sha256(str(total).encode()).hexdigest()
print(f"Sum key: {sum_key}")

# Test 5: Treat as bytes directly (pack as unsigned chars)
print(f"\nTEST 5: As raw bytes")
byte_array = bytes(n % 256 for n in sequence)
print(f"Bytes: {byte_array.hex()}")
byte_key = hashlib.sha256(byte_array).hexdigest()
print(f"Byte key: {byte_key}")

# Test 6: Pairs as coordinates - compute from geometry
print(f"\nTEST 6: Geometric interpretation")
import math
pairs = [(sequence[i], sequence[i+1]) for i in range(0, len(sequence)-1, 2)]
distances = [math.sqrt(x**2 + y**2) for x, y in pairs]
print(f"Distances: {[f'{d:.2f}' for d in distances]}")
dist_hash = hashlib.sha256(str(distances).encode()).hexdigest()
print(f"Distance pattern hash: {dist_hash}")

# Test 7: As blockchain extradata
print(f"\nTEST 7: As blockchain transaction data")
# Bitcoin OP_RETURN can contain arbitrary data
op_return_data = bytes(sequence)
print(f"OP_RETURN hex: {op_return_data.hex()}")

# Test 8: DTMF phone encoding (old telephone touch tones)
print(f"\nTEST 8: DTMF (phone) encoding")
dtmf_map = {1:'1', 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 0:'0'}
# For numbers > 9, use modulo
dtmf_sequence = ''.join(str(n % 10) for n in sequence)
print(f"DTMF: {dtmf_sequence}")
dtmf_hash = hashlib.sha256(dtmf_sequence.encode()).hexdigest()
print(f"DTMF hash: {dtmf_hash}")

# Test 9: ASCII ordinals
print(f"\nTEST 9: Treat as ASCII codes")
ascii_chars = []
for n in sequence:
    if 32 <= n <= 126:
        ascii_chars.append(chr(n))
    else:
        ascii_chars.append(f'[{n}]')
ascii_string = ''.join(ascii_chars)
print(f"ASCII: {ascii_string}")

# Test 10: Binary concatenation
print(f"\nTEST 10: Binary concatenation")
binary_string = ''.join(format(n, '08b') for n in sequence)
print(f"Binary (first 64 bits): {binary_string[:64]}")
# Convert to integer
binary_int = int(binary_string, 2)
print(f"As integer: {binary_int}")
binary_hash = hashlib.sha256(str(binary_int).encode()).hexdigest()
print(f"Binary hash: {binary_hash}")

# Test 11: Differences (delta encoding)
print(f"\nTEST 11: Delta encoding (differences)")
deltas = [sequence[i+1] - sequence[i] for i in range(len(sequence)-1)]
print(f"Deltas: {deltas}")
delta_hash = hashlib.sha256(str(deltas).encode()).hexdigest()
print(f"Delta hash: {delta_hash}")

# Test 12: Reverse the sequence
print(f"\nTEST 12: Reversed sequence")
reversed_seq = list(reversed(sequence))
print(f"Reversed: {reversed_seq[:10]}...")
rev_hash = hashlib.sha256(str(reversed_seq).encode()).hexdigest()
print(f"Reversed hash: {rev_hash}")

# Test 13: Every other number
print(f"\nTEST 13: Split into two sequences")
evens = sequence[::2]  # indices 0, 2, 4, ...
odds = sequence[1::2]   # indices 1, 3, 5, ...
print(f"Evens: {evens}")
print(f"Odds: {odds}")
even_hash = hashlib.sha256(str(evens).encode()).hexdigest()
odd_hash = hashlib.sha256(str(odds).encode()).hexdigest()
print(f"Even hash: {even_hash}")
print(f"Odd hash: {odd_hash}")

# Test 14: Modular arithmetic
print(f"\nTEST 14: Modular reductions")
print(f"Mod 256: {[n % 256 for n in sequence]}")
print(f"Mod 37: {[n % 37 for n in sequence]}")  # 37 is prime
print(f"Mod 2048: {[n % 2048 for n in sequence]}")  # BIP39 range

# Test 15: Fibonacci-like recurrence
print(f"\nTEST 15: Fibonacci recurrence check")
# Check if any number is sum of previous two
for i in range(2, len(sequence)):
    if sequence[i] == sequence[i-1] + sequence[i-2]:
        print(f"  {sequence[i]} = {sequence[i-1]} + {sequence[i-2]} ✓")

# Test 16: Prime factorization of sum
print(f"\nTEST 16: Properties of sum")
total = sum(sequence)
print(f"Sum: {total}")
print(f"Sum is prime: {all(total % i != 0 for i in range(2, int(total**0.5)+1))}")
print(f"Sum squared: {total**2}")

# Test 17: Check repeating patterns
print(f"\nTEST 17: Repeating patterns")
from collections import Counter
counts = Counter(sequence)
print(f"Most common: {counts.most_common(5)}")

# Test 18: Cumulative sum
print(f"\nTEST 18: Cumulative sum")
cumsum = []
running_total = 0
for n in sequence:
    running_total += n
    cumsum.append(running_total)
print(f"Cumsum: {cumsum[:10]}...")
cumsum_hash = hashlib.sha256(str(cumsum).encode()).hexdigest()
print(f"Cumsum hash: {cumsum_hash}")

print("\n=== FINAL CHECK ===")
print("None of these hashes match known Bitcoin addresses")
print("UNLESS one of these IS the seed/key derivation path")
print("\nNext step: Compare these hashes against actual Satoshi addresses")
