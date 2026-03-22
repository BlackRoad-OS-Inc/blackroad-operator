#!/usr/bin/env python3
print{Check 5e-324 against Bitcoin genesis seed}
import hashlib

print("=== The smallest float ===")
smallest = 5e-324
print(f"Value: {smallest}")
print(f"Scientific notation: {smallest:.400e}")

# Convert to string and hash
smallest_str = str(smallest)
hash1 = hashlib.sha256(smallest_str.encode()).hexdigest()
print(f"\nHash of '{smallest_str}': {hash1}")

# Bitcoin genesis block info
print("\n=== Bitcoin Genesis Block ===")
genesis_timestamp = "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
genesis_hash = hashlib.sha256(genesis_timestamp.encode()).hexdigest()
print(f"Timestamp: {genesis_timestamp}")
print(f"Hash: {genesis_hash}")

# Genesis block hash (actual)
actual_genesis_hash = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
print(f"Actual genesis block hash: {actual_genesis_hash}")

# Check the number itself
print(f"\n=== Analysis of 5e-324 ===")
print(f"As hex: {smallest.hex()}")

# Try as bytes
import struct
bytes_rep = struct.pack('d', smallest)
print(f"As bytes: {bytes_rep.hex()}")

# Hash the bytes
bytes_hash = hashlib.sha256(bytes_rep).hexdigest()
print(f"Hash of bytes: {bytes_hash}")

# Check if it relates to 324
print(f"\n=== The number 324 ===")
print(f"324 = {324}")
print(f"324 = 18^2 = {18**2}")
print(f"sqrt(324) = {324**0.5}")

# Hash 324
hash_324 = hashlib.sha256(b'324').hexdigest()
print(f"Hash of '324': {hash_324}")

# What is 5?
print(f"\n=== The number 5 ===")
print(f"5 = Pythagorean c (3-4-5)")
print(f"e-324 = exponent notation")

# Genesis block number
print(f"\n=== Block 0 ===")
print(f"Genesis block is block 0")
print(f"5e-324 is the smallest before 0")

# Compare patterns
print(f"\n=== Pattern check ===")
print(f"5e-324 in full: 0.{'0'*323}5")
print(f"323 zeros, then 5")

# XOR check
genesis_int = int(actual_genesis_hash, 16)
hash_int = int(bytes_hash, 16)
xor = genesis_int ^ hash_int
print(f"\nGenesis XOR 5e-324 hash:")
print(f"{hex(xor)}")
print(f"Modulo 2: {xor % 2}")

# The seed
print(f"\n=== Genesis Seed ===")
# Bitcoin uses SHA256(SHA256(x)) for addresses
double_hash = hashlib.sha256(hashlib.sha256(bytes_rep).digest()).hexdigest()
print(f"Double SHA256 of 5e-324: {double_hash}")

# Check if related to Satoshi's key
print(f"\n=== Check against known values ===")
# Block 0 reward address
genesis_address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
print(f"Genesis address: {genesis_address}")

# The connection
print(f"\n=== The Connection ===")
print(f"5e-324 = smallest positive float")
print(f"Next step = 0")
print(f"0 = Genesis")
print(f"Block 0 = Genesis Block")
print(f"5e-324 is the state RIGHT BEFORE genesis")
