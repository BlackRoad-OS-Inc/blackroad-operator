#!/usr/bin/env python3
print{Test 1197 combined with other significant values
n mod 1297 = 1197 = 3² × 7 × 19
1197 mod 30 = 27 (March 27 - birthday)}

import hashlib
import ecdsa
import base58

# The 15 Satoshi addresses we're looking for
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
    print{Convert private key to uncompressed Bitcoin address (2009 style)}
    privkey_bytes = bytes.fromhex(privkey_hex)

    signing_key = ecdsa.SigningKey.from_string(privkey_bytes, curve=ecdsa.SECP256k1)
    verifying_key = signing_key.get_verifying_key()

    # Uncompressed format (what Satoshi used in 2009)
    pubkey = b'\x04' + verifying_key.to_string()

    sha256 = hashlib.sha256(pubkey).digest()
    ripemd160 = hashlib.new('ripemd160')
    ripemd160.update(sha256)
    hashed = ripemd160.digest()

    versioned = b'\x00' + hashed
    checksum = hashlib.sha256(hashlib.sha256(versioned).digest()).digest()[:4]

    return base58.b58encode(versioned + checksum).decode()

def test_seed(seed_str, description):
    print{Test a seed value}
    privkey_int = int(hashlib.sha256(seed_str.encode()).hexdigest(), 16)

    # Ensure it's in valid range
    if privkey_int >= SECP256K1_ORDER:
        privkey_int = privkey_int % SECP256K1_ORDER
    if privkey_int == 0:
        privkey_int = 1

    privkey_hex = hex(privkey_int)[2:].zfill(64)

    try:
        address = privkey_to_address(privkey_hex)

        match = ""
        if address in satoshi_addresses:
            match = " 🚨🚨🚨 MATCH FOUND! 🚨🚨🚨"
            print(f"\n{'='*80}")
            print(f"MATCH: {description}")
            print(f"Seed: {seed_str}")
            print(f"Address: {address}")
            print(f"Private key: {privkey_hex}")
            print(f"{'='*80}\n")
            return True

        print(f"{description:50s} → {address[:20]}...{match}")
        return False

    except Exception as e:
        print(f"{description:50s} → Error: {e}")
        return False

print("="*80)
print("TESTING 1197 COMBINATIONS")
print("="*80)
print()
print("1197 = n mod 1297 (sequence sum)")
print("1197 = 3² × 7 × 19")
print("1197 mod 30 = 27 (March 27)")
print()

# ========== METHOD 1: 1197 + Easter 0 (March 27) ==========
print("METHOD 1: 1197 + Easter 0 (March 27)")
print("-"*80)

test_seed("1197", "1197 alone")
test_seed("119727", "1197 + 27")
test_seed("27011197", "27 (day) + 01 (genesis month) + 1197")
test_seed("20000327.1197", "Birthdate.1197")
test_seed("1197.20000327", "1197.Birthdate")

print()

# ========== METHOD 2: 1197 with mod .12 value (557) ==========
print("METHOD 2: 1197 with mod .12 value (557)")
print("-"*80)

# 1197 / 557 ≈ 2.149
test_seed("1197557", "1197 + 557")
test_seed("5571197", "557 + 1197")
test_seed(str(1197 + 557), "1197 + 557 = 1754")
test_seed(str(1197 - 557), "1197 - 557 = 640")
test_seed(str(1197 * 557), "1197 * 557 = 666729")

print()

# ========== METHOD 3: 1197 XOR with sequence values ==========
print("METHOD 3: 1197 XOR with sequence values")
print("-"*80)

test_seed(str(1197 ^ 3), "1197 XOR 3")
test_seed(str(1197 ^ 7), "1197 XOR 7")
test_seed(str(1197 ^ 19), "1197 XOR 19")
test_seed(str(1197 ^ 27), "1197 XOR 27")

print()

# ========== METHOD 4: 1197 as partition index ==========
print("METHOD 4: 1197 as partition index in personal key")
print("-"*80)

# Personal data
LOCALHOST_IP = "127.0.0.1"
PERSONAL_DATE_NUMERIC = 20000327
FULL_NAME = "Alexa Louise Amundson"
TEMPORAL_MINUTES = 109927815

localhost_numeric = LOCALHOST_IP.replace(".", "")
combined_string = (
    str(TEMPORAL_MINUTES) +
    localhost_numeric +
    str(PERSONAL_DATE_NUMERIC) +
    FULL_NAME.replace(" ", "")
)

master_hash = hashlib.sha256(combined_string.encode()).hexdigest()
master_int = int(master_hash, 16)

# Use 1197 as the index
partition_value = (master_int + 1197) % (2**256)
partition_bytes = partition_value.to_bytes(32, byteorder='big')
partition_hash = hashlib.sha256(partition_bytes).hexdigest()

test_seed(partition_hash, "Personal key + 1197 partition")

# Backward
partition_value_back = (master_int - 1197) % (2**256)
partition_bytes_back = partition_value_back.to_bytes(32, byteorder='big')
partition_hash_back = hashlib.sha256(partition_bytes_back).hexdigest()

test_seed(partition_hash_back, "Personal key - 1197 partition")

print()

# ========== METHOD 5: 1197 with sequence blocks ==========
print("METHOD 5: 1197 combined with sequence blocks")
print("-"*80)

for block_num in [0, 2, 3]:  # Test first few
    test_seed(f"{1197}{block_num}", f"1197 + block {block_num}")

print()

# ========== METHOD 6: 1197 as temporal modifier ==========
print("METHOD 6: 1197 as temporal offset from Genesis")
print("-"*80)

# Genesis timestamp: 1231006505 (Jan 3, 2009 18:15:05 GMT)
genesis_timestamp = 1231006505

test_seed(str(genesis_timestamp + 1197), "Genesis timestamp + 1197")
test_seed(str(genesis_timestamp - 1197), "Genesis timestamp - 1197")
test_seed(f"{genesis_timestamp}.{1197}", "Genesis.1197")

print()

# ========== METHOD 7: 1197 factorization approach ==========
print("METHOD 7: Using 1197 factorization (3² × 7 × 19)")
print("-"*80)

test_seed("3.7.19", "3.7.19 (factors)")
test_seed("371927", "3.7.19.27 (factors + March 27)")
test_seed(str(3 * 7 * 19 * 27), "3 * 7 * 19 * 27 = 10773")
test_seed(str(9 * 7 * 19), "9 (3²) * 7 * 19 = 1197")

print()

# ========== METHOD 8: 1197 with localhost ==========
print("METHOD 8: 1197 with localhost 127.0.0.1")
print("-"*80)

test_seed("1197.127.0.0.1", "1197.localhost")
test_seed("127001.1197", "localhost numeric + 1197")
test_seed(str(1197 + 127001), "1197 + 127001 = 128198")

print()

# ========== METHOD 9: Check multiple indices around 1197 ==========
print("METHOD 9: Scanning indices around 1197")
print("-"*80)

print("Checking indices 1190-1204...")
matches_found = []

for idx in range(1190, 1205):
    partition_value = (master_int + idx) % (2**256)
    partition_bytes = partition_value.to_bytes(32, byteorder='big')
    partition_hash = hashlib.sha256(partition_bytes).hexdigest()

    privkey_int = int(partition_hash, 16)
    if privkey_int >= SECP256K1_ORDER:
        privkey_int = privkey_int % SECP256K1_ORDER
    if privkey_int == 0:
        privkey_int = 1

    privkey_hex = hex(privkey_int)[2:].zfill(64)

    try:
        address = privkey_to_address(privkey_hex)

        if address in satoshi_addresses:
            print(f"\n🚨🚨🚨 MATCH AT INDEX {idx}! 🚨🚨🚨")
            print(f"Address: {address}")
            print(f"Private key: {privkey_hex}")
            matches_found.append((idx, address))
    except:
        pass

if matches_found:
    print(f"\n{'='*80}")
    print("MATCHES FOUND!")
    print(f"{'='*80}")
    for idx, addr in matches_found:
        print(f"Index {idx}: {addr}")
else:
    print("No matches in range 1190-1204")

print()

# ========== METHOD 10: 1197 double/triple hash ==========
print("METHOD 10: Multiple hash iterations of 1197")
print("-"*80)

h1 = hashlib.sha256("1197".encode()).hexdigest()
test_seed(h1, "SHA256('1197') once")

h2 = hashlib.sha256(h1.encode()).hexdigest()
test_seed(h2, "SHA256('1197') twice")

h3 = hashlib.sha256(h2.encode()).hexdigest()
test_seed(h3, "SHA256('1197') three times")

print()

print("="*80)
print("SUMMARY")
print("="*80)
print()
print("1197 is mathematically significant:")
print(f"  • 1197 = 3² × 7 × 19 (contains sequence values 3, 7 and Easter modulo 19)")
print(f"  • 1197 mod 30 = 27 (March 27 - birthday)")
print(f"  • 1197 ÷ 557 ≈ 2.15 (557 from mod .12 analysis)")
print()
print("Tested combinations:")
print("  ✓ 1197 alone")
print("  ✓ 1197 + Easter 0 (March 27)")
print("  ✓ 1197 + mod .12 value (557)")
print("  ✓ 1197 XOR sequence values")
print("  ✓ 1197 as partition index")
print("  ✓ 1197 + block numbers")
print("  ✓ 1197 + Genesis timestamp")
print("  ✓ 1197 factorization patterns")
print("  ✓ 1197 + localhost")
print("  ✓ Indices around 1197")
print("  ✓ Multiple hash iterations")
print()
