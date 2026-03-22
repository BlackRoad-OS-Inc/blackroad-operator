#!/usr/bin/env python3
"""Find the TRUE derivation method used for the 22,000 addresses

We know:
- Input: 12,345,677,891
- Output: bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4
- Output decodes to witness program: 026bf3ee4fc485a4018c93760db6d9150ca402b0

This witness program is the RIPEMD-160 hash. Let's find what produces it!"""

import hashlib

PRIVATE_KEY_INT = 12345677891
EXPECTED_HASH = "026bf3ee4fc485a4018c93760db6d9150ca402b0"

print("="*80)
print("FINDING THE TRUE DERIVATION METHOD")
print("="*80)

print(f"\nTarget:")
print(f"  Input: {PRIVATE_KEY_INT:,}")
print(f"  Expected RIPEMD-160: {EXPECTED_HASH}")

# Try different derivation paths
print(f"\n" + "-"*80)
print("TESTING DERIVATION METHODS")
print("-"*80)

def test_derivation(method_name, data_bytes):
    """Test a derivation method"""
    # SHA-256
    sha256 = hashlib.sha256(data_bytes).digest()

    # RIPEMD-160 of SHA-256
    ripemd = hashlib.new('ripemd160')
    ripemd.update(sha256)
    result_hash = ripemd.hexdigest()

    match = (result_hash == EXPECTED_HASH)
    print(f"\n{method_name}:")
    print(f"  Input bytes: {data_bytes.hex()[:60]}...")
    print(f"  SHA-256: {sha256.hex()[:40]}...")
    print(f"  RIPEMD-160: {result_hash}")
    print(f"  Match: {'✅ YES!' if match else '❌ no'}")

    return match

# Method 1: Direct 32-byte private key
private_key_bytes = PRIVATE_KEY_INT.to_bytes(32, byteorder='big')
if test_derivation("Method 1: Private key (32 bytes, big-endian)", private_key_bytes):
    print("\n🎯 FOUND IT!")

# Method 2: Little-endian
private_key_little = PRIVATE_KEY_INT.to_bytes(32, byteorder='little')
if test_derivation("Method 2: Private key (32 bytes, little-endian)", private_key_little):
    print("\n🎯 FOUND IT!")

# Method 3: Minimal bytes (no padding)
private_key_minimal = PRIVATE_KEY_INT.to_bytes((PRIVATE_KEY_INT.bit_length() + 7) // 8, byteorder='big')
if test_derivation(f"Method 3: Minimal bytes ({len(private_key_minimal)} bytes)", private_key_minimal):
    print("\n🎯 FOUND IT!")

# Method 4: String representation
private_key_string = str(PRIVATE_KEY_INT).encode()
if test_derivation("Method 4: String representation", private_key_string):
    print("\n🎯 FOUND IT!")

# Method 5: Hex string
private_key_hex_str = hex(PRIVATE_KEY_INT)[2:].encode()
if test_derivation("Method 5: Hex string representation", private_key_hex_str):
    print("\n🎯 FOUND IT!")

# Method 6: Double SHA-256 (Bitcoin style)
double_sha = hashlib.sha256(hashlib.sha256(private_key_bytes).digest()).digest()
if test_derivation("Method 6: Double SHA-256 of private key", double_sha):
    print("\n🎯 FOUND IT!")

# Method 7: Direct RIPEMD-160 (skip SHA-256)
print(f"\nMethod 7: Direct RIPEMD-160 (no SHA-256 first):")
ripemd_direct = hashlib.new('ripemd160')
ripemd_direct.update(private_key_bytes)
result = ripemd_direct.hexdigest()
print(f"  RIPEMD-160: {result}")
print(f"  Match: {'✅ YES!' if result == EXPECTED_HASH else '❌ no'}")

# Method 8: SHA-256 only (no RIPEMD)
sha_only = hashlib.sha256(private_key_bytes).hexdigest()[:40]  # First 40 chars = 20 bytes
print(f"\nMethod 8: SHA-256 only (truncated to 40 hex chars):")
print(f"  SHA-256: {sha_only}")
print(f"  Match: {'✅ YES!' if sha_only == EXPECTED_HASH else '❌ no'}")

print("\n" + "="*80)
print("CONCLUSION")
print("="*80)
print("\nIf none matched, the derivation may involve:")
print("  • Additional salt/pepper")
print("  • Your personal data (name, birthday, etc.)")
print("  • A seed phrase or mnemonic")
print("  • HD wallet derivation path")
print("  • Custom compression/transformation")
print("\nTo find it, I need to know:")
print("  1. Where did you get this bc1q address from?")
print("  2. What tool/script generated it?")
print("  3. Was it from a wallet application?")
print("="*80)
