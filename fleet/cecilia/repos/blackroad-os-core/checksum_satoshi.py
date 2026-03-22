#!/usr/bin/env python3
print{Checksum if we are Satoshi Nakamoto}
import hashlib

# The question
question = "are we satoshi nakamoto"

# Hash it
sha256_hash = hashlib.sha256(question.encode()).hexdigest()
print(f"Question: {question}")
print(f"SHA256: {sha256_hash}")

# Convert to integer
hash_int = int(sha256_hash, 16)
print(f"As integer: {hash_int}")

# Modulo operations to check patterns
print(f"\nHash % 2 = {hash_int % 2}")
print(f"Hash % 10 = {hash_int % 10}")
print(f"Hash % 100 = {hash_int % 100}")
print(f"Hash % 1000 = {hash_int % 1000}")

# Check if it matches known Satoshi patterns
print("\n=== Satoshi's known address ===")
satoshi_address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"  # Genesis block
print(f"Genesis address: {satoshi_address}")

# Our identity
our_identity = "Alexa Amundson"
our_hash = hashlib.sha256(our_identity.encode()).hexdigest()
print(f"\nOur identity: {our_identity}")
print(f"Our hash: {our_hash}")

# XOR the hashes
question_int = int(sha256_hash, 16)
identity_int = int(our_hash, 16)
xor_result = question_int ^ identity_int

print(f"\nXOR of question and identity:")
print(f"{xor_result}")
print(f"Hex: {hex(xor_result)}")

# Check the difference
diff = question_int - identity_int
print(f"\nDifference: {diff}")

# The checksum
checksum = (question_int + identity_int) % (2**256)
print(f"\nChecksum (sum mod 2^256): {checksum}")

# Bitcoin address checksum check
print("\n=== Bitcoin Address Checksum ===")
# We know Satoshi's address from genesis block
# Let's check if our hash matches any pattern

# Load known addresses if available
import os
if os.path.exists('hello_satoshi.json'):
    import json
    with open('hello_satoshi.json', 'r') as f:
        data = json.load(f)
        print(f"Loaded hello_satoshi.json")
        print(f"Keys: {list(data.keys())[:5]}...")

# Simple checksum: does our hash contain "satoshi"?
print(f"\n=== Pattern matching ===")
print(f"Does question hash contain 'abc': {('abc' in sha256_hash.lower())}")
print(f"Does question hash contain '123': {('123' in sha256_hash)}")
print(f"Does question hash contain '000': {('000' in sha256_hash)}")

# The definitive check: compute from first principles
print("\n=== First Principles Check ===")
print("Event 1: Satoshi created Bitcoin")
print("Event 2: We are asking if we are Satoshi")
print(f"Difference between events: {sha256_hash}")

# Check bit count
bit_count = bin(hash_int).count('1')
print(f"\nBits set to 1 in hash: {bit_count}")
print(f"Bits set to 0 in hash: {256 - bit_count}")
print(f"Difference: {bit_count - (256 - bit_count)}")

# Final answer
print("\n=== CHECKSUM ===")
result = hash_int % 2
print(f"Final checksum (hash % 2): {result}")
if result == 0:
    print("Result: EVEN")
elif result == 1:
    print("Result: ODD")
