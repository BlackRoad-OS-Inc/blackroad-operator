#!/usr/bin/env python3
print{Compare the computed hashes against known Satoshi addresses}

import hashlib
import requests
import time

# All the hashes we computed
computed_hashes = {
    "Combined key": "b296a6b65f97e3d8c72e9c5c2915cc56eba8cc8e8fc31b54f409501d7f35a9f0",
    "XOR key": "4c15f47afe7f817fd559e12ddbc276f4930c5822f2049088d6f6605bec7cea56",
    "Product key": "9b196c5a401203e9c144c795872ea5eea57c9a1b34ffd427c4c14c124a915d6d",
    "Sum key": "560229669058290cfa539ba7fb4bbe33e3773745e91dab75a02306f0e19b32ef",
    "Byte key": "82d8a73f2085f282ac026c41b17521f74f96adc41b2cb845a0f68213b665af29",
    "Distance pattern": "b281eb8f0d53a270283f9cc6ddb53a023d890a086efc894263b3f874abbe930c"
}

# Known Satoshi addresses
satoshi_addresses = [
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Genesis
    "12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX",  # Block 1
    "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",  # Hal Finney
]

print("=== COMPUTED HASHES ===")
for name, hash_val in computed_hashes.items():
    print(f"{name:20s}: {hash_val}")

print("\n=== CHECKING AGAINST SATOSHI ADDRESSES ===")

# Hash each Satoshi address and compare
for addr in satoshi_addresses:
    addr_hash = hashlib.sha256(addr.encode()).hexdigest()
    print(f"\n{addr}")
    print(f"  Hash: {addr_hash}")

    # Check if it matches any computed hash
    for name, comp_hash in computed_hashes.items():
        if addr_hash == comp_hash:
            print(f"  ✓ MATCH: {name}")
        elif addr_hash[:16] == comp_hash[:16]:  # Partial match
            print(f"  ~ Partial match (first 16): {name}")

# Also try double SHA256 (Bitcoin uses this)
print("\n=== DOUBLE SHA256 CHECKS ===")
for name, hash_val in computed_hashes.items():
    double = hashlib.sha256(bytes.fromhex(hash_val)).hexdigest()
    print(f"{name}: {double}")

# Check if any address hash appears in the sequence
sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]

print("\n=== REVERSE CHECK: Do addresses encode to our sequence? ===")
for addr in satoshi_addresses:
    # Try various encodings
    addr_bytes = addr.encode()

    # Get numeric values
    nums = list(addr_bytes)
    print(f"\n{addr}")
    print(f"  First 22 bytes as numbers: {nums[:22]}")

    # Check if it matches our sequence
    if nums[:22] == sequence:
        print(f"  ✓✓✓ EXACT MATCH!!! ✓✓✓")

# Check blockchain for these hashes as transaction IDs
print("\n=== BLOCKCHAIN SEARCH ===")
print("Checking if any hash appears as a Bitcoin transaction...")

for name, hash_val in list(computed_hashes.items())[:3]:  # Check first 3
    print(f"\nChecking {name}: {hash_val[:16]}...")
    try:
        url = f"https://blockchain.info/rawtx/{hash_val}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"  ✓ FOUND AS TRANSACTION!")
            print(f"  Data: {response.text[:200]}")
        else:
            print(f"  Not found (status {response.status_code})")
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(1)

print("\n=== THE REAL TEST ===")
print("Can we use any of these hashes to derive a Bitcoin private key?")
print("Trying ECDSA key generation...")

try:
    # Try to use as a private key (needs ecdsa library)
    for name, hash_val in list(computed_hashes.items())[:1]:
        key_int = int(hash_val, 16)
        print(f"\n{name} as private key integer:")
        print(f"  {key_int}")
        print(f"  Hex: {hex(key_int)}")

        # Check if it's in valid range for secp256k1
        n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
        if key_int < n:
            print(f"  ✓ Valid secp256k1 private key")
        else:
            print(f"  ✗ Out of range for secp256k1")
except Exception as e:
    print(f"Error: {e}")

print("\n=== CONCLUSION ===")
print("If none of these match, the sequence is either:")
print("1. An index/pointer to something else")
print("2. Requires additional transformation we haven't tried")
print("3. Not directly related to Bitcoin keys")
print("4. A red herring / confirmation bias pattern")
