#!/usr/bin/env python3
print{Use BASE64 encoding instead of base58}

import base64
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
print("USING BASE64 INSTEAD OF BASE58")
print("="*80)
print()

# METHOD 1: Encode sequence as base64
print("METHOD 1: Sequence bytes → base64")
print("-"*80)

sequence_bytes = bytes(n % 256 for n in sequence)
b64_encoded = base64.b64encode(sequence_bytes).decode()

print(f"Sequence bytes: {sequence_bytes.hex()}")
print(f"Base64: {b64_encoded}")
print()

# Use base64 as seed
privkey_int = int(hashlib.sha256(b64_encoded.encode()).hexdigest(), 16) % SECP256K1_ORDER
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

# METHOD 2: Decode addresses as base64 instead of base58
print("METHOD 2: What if addresses are base64, not base58?")
print("-"*80)

for addr in satoshi_addresses[:3]:
    try:
        # Try to decode as base64
        decoded = base64.b64decode(addr)
        print(f"{addr[:25]}... → {decoded.hex()}")
    except Exception as e:
        print(f"{addr[:25]}... → Not valid base64")

print()

# METHOD 3: Encode personal data as base64
print("METHOD 3: Personal data → base64")
print("-"*80)

LOCALHOST_IP = "127.0.0.1"
PERSONAL_DATE_NUMERIC = 20000327
FULL_NAME = "Alexa Louise Amundson"
TEMPORAL_MINUTES = 109927815

combined_string = (
    str(TEMPORAL_MINUTES) +
    LOCALHOST_IP.replace(".", "") +
    str(PERSONAL_DATE_NUMERIC) +
    FULL_NAME.replace(" ", "")
)

b64_personal = base64.b64encode(combined_string.encode()).decode()
print(f"Personal data base64: {b64_personal[:50]}...")
print()

# Use as key
privkey_int = int(hashlib.sha256(b64_personal.encode()).hexdigest(), 16) % SECP256K1_ORDER
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

# METHOD 4: Base64 encode the 1197 value
print("METHOD 4: Encode 1197 as base64")
print("-"*80)

b64_1197 = base64.b64encode(b"1197").decode()
print(f"'1197' → base64: {b64_1197}")

privkey_int = int(hashlib.sha256(b64_1197.encode()).hexdigest(), 16) % SECP256K1_ORDER
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

# METHOD 5: Base64 standard alphabet check
print("METHOD 5: Base64 alphabet analysis")
print("-"*80)

# Standard base64 alphabet
b64_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
print(f"Base64 alphabet: {b64_alphabet}")
print()

# Check if sequence maps to base64 indices
print("Sequence values as base64 indices:")
for i, val in enumerate(sequence[:10]):
    if val < len(b64_alphabet):
        char = b64_alphabet[val]
        print(f"  {val:3d} → '{char}'")
    else:
        print(f"  {val:3d} → (out of range)")

print()

# Construct string from base64 alphabet
b64_string = ''.join(b64_alphabet[val % 64] for val in sequence)
print(f"String from sequence: {b64_string}")
print()

# Decode this as base64?
try:
    # Pad to multiple of 4
    padded = b64_string + '=' * ((4 - len(b64_string) % 4) % 4)
    decoded = base64.b64decode(padded)
    print(f"Decoded: {decoded.hex()}")

    # Use as private key
    if len(decoded) == 32:
        privkey_hex = decoded.hex()
        address = privkey_to_address(privkey_hex)
        print(f"Address: {address}")
        if address in satoshi_addresses:
            print("🚨🚨🚨 MATCH! 🚨🚨🚨")
    else:
        print(f"Decoded length: {len(decoded)} bytes (need 32)")

except Exception as e:
    print(f"Decode error: {e}")

print()

# METHOD 6: URL-safe base64
print("METHOD 6: URL-safe base64")
print("-"*80)

sequence_bytes = bytes(n % 256 for n in sequence)
b64url = base64.urlsafe_b64encode(sequence_bytes).decode()
print(f"URL-safe base64: {b64url}")

privkey_int = int(hashlib.sha256(b64url.encode()).hexdigest(), 16) % SECP256K1_ORDER
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

print("="*80)
print("SUMMARY")
print("="*80)
print("Tested base64 encoding in multiple ways:")
print("  • Sequence bytes → base64")
print("  • Personal data → base64")
print("  • 1197 → base64")
print("  • Sequence as base64 alphabet indices")
print("  • URL-safe base64")
print()
