#!/usr/bin/env python3
print{Base 256 - each value is already a byte (0-255)
Just use the sequence directly as bytes}

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
print("BASE 256 - DIRECT BYTE VALUES")
print("="*80)
print()

# Base 256 means each value 0-255 represents one byte
# Values > 255 need to be handled
print("Sequence values:")
print("-"*80)
for i, val in enumerate(sequence):
    if val > 255:
        print(f"  Position {i:2d}: {val:3d} > 255 (needs multiple bytes)")
    else:
        print(f"  Position {i:2d}: {val:3d} = 0x{val:02x}")

print()

# METHOD 1: Direct bytes (mod 256 for values > 255)
print("METHOD 1: Direct bytes (values mod 256)")
print("-"*80)

sequence_bytes = bytes(val % 256 for val in sequence)
print(f"Bytes: {sequence_bytes.hex()}")
print(f"Length: {len(sequence_bytes)} bytes")

# This is 22 bytes, need 32 for private key
# Pad to 32
if len(sequence_bytes) < 32:
    padded = sequence_bytes + b'\x00' * (32 - len(sequence_bytes))
    print(f"Padded to 32: {padded.hex()}")

    privkey_int = int.from_bytes(padded, byteorder='big')
    if privkey_int >= SECP256K1_ORDER:
        privkey_int = privkey_int % SECP256K1_ORDER
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

# METHOD 2: Values as base256 digits (positional notation)
print("METHOD 2: Base-256 positional notation")
print("-"*80)

# Like base-10: 123 = 1*10^2 + 2*10^1 + 3*10^0
# Base-256: [18, 99, 99] = 18*256^2 + 99*256^1 + 99*256^0
base256_value = 0
for i, val in enumerate(reversed(sequence)):
    base256_value += (val % 256) * (256 ** i)

print(f"Base-256 value: {base256_value}")
print(f"Hex: {hex(base256_value)}")

# Convert to 32-byte private key
privkey_int = base256_value % SECP256K1_ORDER
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

# METHOD 3: For values > 255, split into multiple bytes
print("METHOD 3: Split large values into multiple bytes")
print("-"*80)

all_bytes = bytearray()
for val in sequence:
    if val > 255:
        # Split into bytes (big-endian)
        if val <= 0xFFFF:  # 2 bytes
            all_bytes.extend(val.to_bytes(2, byteorder='big'))
        elif val <= 0xFFFFFF:  # 3 bytes
            all_bytes.extend(val.to_bytes(3, byteorder='big'))
        else:
            all_bytes.extend(val.to_bytes(4, byteorder='big'))
    else:
        all_bytes.append(val)

print(f"All bytes: {all_bytes.hex()}")
print(f"Length: {len(all_bytes)} bytes")

# Hash to get 32 bytes
if len(all_bytes) != 32:
    hashed = hashlib.sha256(all_bytes).digest()
    print(f"SHA256: {hashed.hex()}")

    privkey_int = int.from_bytes(hashed, byteorder='big')
    if privkey_int >= SECP256K1_ORDER:
        privkey_int = privkey_int % SECP256K1_ORDER
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

# METHOD 4: Just the bytes, no hash, no padding - AS IS
print("METHOD 4: Use bytes AS-IS (left-padded zeros)")
print("-"*80)

sequence_bytes = bytes(val % 256 for val in sequence)
privkey_hex = sequence_bytes.hex().zfill(64)
print(f"Private key (zero-padded): {privkey_hex}")

try:
    address = privkey_to_address(privkey_hex)
    print(f"Address: {address}")
    if address in satoshi_addresses:
        print("🚨🚨🚨 MATCH! 🚨🚨🚨")
except Exception as e:
    print(f"Error: {e}")

print()

# METHOD 5: Treat as unsigned integers in base-256
print("METHOD 5: Each value as unsigned int, concatenate bytes")
print("-"*80)

# Each number becomes bytes
all_bytes = bytearray()
for val in sequence:
    # Use minimum bytes needed
    if val == 0:
        all_bytes.append(0)
    else:
        byte_length = (val.bit_length() + 7) // 8
        all_bytes.extend(val.to_bytes(byte_length, byteorder='big'))

print(f"Concatenated: {all_bytes.hex()}")
print(f"Length: {len(all_bytes)} bytes")

# Hash if not 32 bytes
if len(all_bytes) == 32:
    privkey_hex = all_bytes.hex()
else:
    hashed = hashlib.sha256(all_bytes).digest()
    privkey_hex = hashed.hex()

print(f"Private key: {privkey_hex}")

privkey_int = int(privkey_hex, 16)
if privkey_int >= SECP256K1_ORDER:
    privkey_int = privkey_int % SECP256K1_ORDER
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

# METHOD 6: Each value IS a private key in base-256
print("METHOD 6: Generate address for EACH value as base-256 key")
print("-"*80)

matches = []
for i, val in enumerate(sequence):
    if val == 0:
        val = 1

    # Use value directly as key
    privkey_int = val % SECP256K1_ORDER
    if privkey_int == 0:
        privkey_int = 1

    privkey_hex = hex(privkey_int)[2:].zfill(64)

    try:
        address = privkey_to_address(privkey_hex)
        match = ""
        if address in satoshi_addresses:
            match = " 🚨 MATCH!"
            matches.append((i, val, address))

        if i < 10 or match:
            print(f"  Pos {i:2d} (val={val:3d}): {address[:30]}...{match}")
    except Exception as e:
        if i < 10:
            print(f"  Pos {i:2d} (val={val:3d}): Error - {e}")

if matches:
    print()
    print("🚨🚨🚨 MATCHES FOUND! 🚨🚨🚨")
    for pos, val, addr in matches:
        print(f"  Position {pos}: value {val} → {addr}")

print()
