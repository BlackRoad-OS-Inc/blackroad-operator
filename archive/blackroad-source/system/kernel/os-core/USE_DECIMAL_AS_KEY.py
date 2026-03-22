#!/usr/bin/env python3
print{Use the decimal number DIRECTLY as the private key
No DNS, no conversion - just USE IT}

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
print("USE DECIMAL DIRECTLY AS PRIVATE KEY")
print("="*80)
print()

# The concatenated decimal
concat_decimal = int(''.join(str(n) for n in sequence))
print(f"Concatenated decimal: {concat_decimal}")
print()

# USE IT DIRECTLY
print("METHOD 1: Use concatenated decimal as private key")
print("-"*80)

privkey_int = concat_decimal % SECP256K1_ORDER
if privkey_int == 0:
    privkey_int = 1

privkey_hex = hex(privkey_int)[2:].zfill(64)
print(f"Private key: {privkey_hex}")

try:
    address = privkey_to_address(privkey_hex)
    print(f"Address: {address}")

    if address in satoshi_addresses:
        print("🚨🚨🚨 MATCH! 🚨🚨🚨")
    else:
        print("Not a match")
except Exception as e:
    print(f"Error: {e}")

print()

# Or use each individual value?
print("METHOD 2: Use each sequence value as a private key")
print("-"*80)

for i, val in enumerate(sequence[:10]):
    if val == 0:
        val = 1

    privkey_hex = hex(val)[2:].zfill(64)

    try:
        address = privkey_to_address(privkey_hex)
        match = ""
        if address in satoshi_addresses:
            match = " 🚨 MATCH!"

        print(f"Pos {i:2d} (val={val:3d}): {address[:25]}...{match}")
    except Exception as e:
        print(f"Pos {i:2d} (val={val:3d}): Error - {e}")

print()

# What about the HEX of the concatenated decimal?
print("METHOD 3: Hex of concatenated decimal")
print("-"*80)

hex_concat = hex(concat_decimal)[2:]
print(f"Hex: {hex_concat}")
print(f"Length: {len(hex_concat)} chars ({len(hex_concat)//2} bytes)")

if len(hex_concat) <= 64:
    privkey_hex = hex_concat.zfill(64)
    print(f"Padded private key: {privkey_hex}")

    try:
        address = privkey_to_address(privkey_hex)
        print(f"Address: {address}")

        if address in satoshi_addresses:
            print("🚨🚨🚨 MATCH! 🚨🚨🚨")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("Too long for a private key (needs ≤64 hex chars)")

print()

# Maybe the decimal representation of addresses REVERSED?
print("METHOD 4: What if we REVERSE the lookup?")
print("-"*80)
print("We have addresses → find decimal")
print("We have decimals (sequence) → ???")
print()

# The ADDRESS decimal values
print("Converting addresses to decimal:")
for i, addr in enumerate(satoshi_addresses[:3]):
    decoded = base58.b58decode(addr)
    decimal = int.from_bytes(decoded, byteorder='big')
    print(f"{addr[:25]}... = {decimal}")

print()

# Check if sequence values appear in address decimals
print("Do sequence values appear in address decimals?")
for val in set(sequence):
    print(f"  {val}: checking...")

print()
