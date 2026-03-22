#!/usr/bin/env python3
print{Decode the sequence: 19 100 100 4 4 8 25 1 3 15 30 4 4 32 7 221 451 114 31 114 31 1}

sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]

print("=== The Sequence ===")
print(sequence)
print(f"Length: {len(sequence)}")

print("\n=== As ASCII (if letters) ===")
# Try interpreting as A=1, B=2, etc.
def num_to_letter(n):
    if 1 <= n <= 26:
        return chr(64 + n)
    return f"({n})"

letters = [num_to_letter(n) for n in sequence]
print("".join(letters))

print("\n=== As direct ASCII codes ===")
ascii_chars = []
for n in sequence:
    if 32 <= n <= 126:
        ascii_chars.append(chr(n))
    else:
        ascii_chars.append(f"[{n}]")
print("".join(ascii_chars))

print("\n=== Mathematical patterns ===")
print(f"Sum: {sum(sequence)}")
print(f"Product (first 10): {sequence[0] * sequence[1] * sequence[2] * sequence[3] * sequence[4]}")

# Check for pairs
print("\n=== Pairs ===")
for i in range(0, len(sequence), 2):
    if i+1 < len(sequence):
        print(f"{sequence[i]}, {sequence[i+1]}")

# Check specific numbers
print("\n=== Special numbers ===")
print(f"19: Prime, Metonic cycle (moon)")
print(f"100: Perfect square (10²)")
print(f"25: Perfect square (5²)")
print(f"221: 13 × 17")
print(f"451: Fahrenheit 451")
print(f"114: 6 × 19")
print(f"31: Prime")

# Binary
print("\n=== As binary ===")
for n in sequence:
    print(f"{n:3d} = {bin(n)}")

# XOR chain
print("\n=== XOR chain ===")
result = sequence[0]
for n in sequence[1:]:
    result ^= n
print(f"XOR of all: {result} = {bin(result)}")

# Differences
print("\n=== Differences ===")
diffs = [sequence[i+1] - sequence[i] for i in range(len(sequence)-1)]
print(diffs)

# Check if it's coordinates
print("\n=== As coordinates (pairs) ===")
coords = [(sequence[i], sequence[i+1]) for i in range(0, len(sequence)-1, 2)]
for i, (x, y) in enumerate(coords):
    print(f"Point {i}: ({x}, {y})")

# Check Bitcoin block numbers
print("\n=== As Bitcoin block numbers ===")
print(f"Block 19: Early Satoshi block")
print(f"Block 451: Early block")

# Hash the sequence
import hashlib
seq_str = "".join(str(n) for n in sequence)
seq_hash = hashlib.sha256(seq_str.encode()).hexdigest()
print(f"\n=== Hash of sequence ===")
print(f"SHA256: {seq_hash}")

# Check mod operations
print("\n=== Modulo checks ===")
print(f"Sum mod 2: {sum(sequence) % 2}")
print(f"Sum mod 3: {sum(sequence) % 3}")
print(f"Sum mod 10: {sum(sequence) % 10}")

# Check if it's a key
print("\n=== As potential key ===")
key_bytes = bytes(n % 256 for n in sequence)
print(f"As bytes: {key_bytes.hex()}")
key_hash = hashlib.sha256(key_bytes).hexdigest()
print(f"SHA256: {key_hash}")
