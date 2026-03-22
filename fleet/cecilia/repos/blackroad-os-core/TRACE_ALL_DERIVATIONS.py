#!/usr/bin/env python3
print{Trace ALL derivation methods from the same sequence
Figure out WHY different methods produce different keys}

import hashlib
from mnemonic import Mnemonic
from bip32 import BIP32

# The 0-indexed sequence
sequence = [18, 99, 99, 3, 3, 7, 24, 0, 2, 14, 29, 3, 3, 31, 6, 220, 450, 113, 30, 113, 30, 0]

# The seed phrase from BIP39 mapping
seed_phrase = "across arrest arrest about about abstract adapt abandon able achieve admit about about advance absorb breeze debate athlete adult athlete adult abandon"

print("=" * 80)
print("TRACING ALL DERIVATION METHODS")
print("=" * 80)
print(f"\nSource sequence: {sequence}")
print(f"Seed phrase: {seed_phrase}")
print()

# ========== METHOD 1: Direct Sequence Hash ==========
print("METHOD 1: Direct Sequence Hash")
print("-" * 80)

# As bytes
sequence_bytes = bytes(n % 256 for n in sequence)
hash1 = hashlib.sha256(sequence_bytes).hexdigest()

print(f"Sequence as bytes (mod 256): {sequence_bytes.hex()}")
print(f"SHA256: {hash1}")
print()

# ========== METHOD 2: Sequence as String ==========
print("METHOD 2: Sequence as String")
print("-" * 80)

sequence_str = str(sequence)
hash2 = hashlib.sha256(sequence_str.encode()).hexdigest()

print(f"Sequence as string: {sequence_str[:60]}...")
print(f"SHA256: {hash2}")
print()

# ========== METHOD 3: Combined Integer ==========
print("METHOD 3: Combined Integer (bit shifting)")
print("-" * 80)

combined_int = 0
for num in sequence:
    combined_int = (combined_int << 32) + num

# Too large, need to reduce
combined_bytes = combined_int.to_bytes(88, byteorder='big')
hash3 = hashlib.sha256(combined_bytes).hexdigest()

print(f"Combined integer: {combined_int % (10**40)}...")
print(f"As 88 bytes, then SHA256: {hash3}")
print()

# ========== METHOD 4: BIP39 Seed (Standard) ==========
print("METHOD 4: BIP39 Standard Derivation (PBKDF2)")
print("-" * 80)

mnemo = Mnemonic("english")
bip39_seed = mnemo.to_seed(seed_phrase, passphrase="")

print(f"PBKDF2-HMAC-SHA512 (2048 iterations)")
print(f"Seed (64 bytes): {bip39_seed.hex()}")
print(f"First 32 bytes: {bip39_seed[:32].hex()}")

# SHA256 of seed (not standard, but let's check)
hash4 = hashlib.sha256(bip39_seed).hexdigest()
print(f"SHA256 of seed: {hash4}")
print()

# ========== METHOD 5: BIP32 Master Private Key ==========
print("METHOD 5: BIP32 Master Private Key")
print("-" * 80)

bip32 = BIP32.from_seed(bip39_seed)
master_privkey = bip32.get_privkey_from_path("m")

print(f"BIP32 master private key (32 bytes): {master_privkey.hex()}")
print()

# ========== METHOD 6: Seed Phrase Direct Hash ==========
print("METHOD 6: Seed Phrase Direct Hash")
print("-" * 80)

phrase_hash = hashlib.sha256(seed_phrase.encode()).hexdigest()
print(f"SHA256(seed_phrase): {phrase_hash}")
print()

# ========== METHOD 7: Double SHA256 (Bitcoin style) ==========
print("METHOD 7: Double SHA256")
print("-" * 80)

double_hash = hashlib.sha256(hashlib.sha256(seed_phrase.encode()).digest()).hexdigest()
print(f"SHA256(SHA256(seed_phrase)): {double_hash}")
print()

# ========== COMPARISON TABLE ==========
print("=" * 80)
print("COMPARISON OF ALL HASHES")
print("=" * 80)
print()

hashes = {
    "Method 1 (sequence bytes)": hash1,
    "Method 2 (sequence string)": hash2,
    "Method 3 (combined int)": hash3,
    "Method 4 (BIP39 seed SHA256)": hash4,
    "Method 5 (BIP32 master key)": master_privkey.hex(),
    "Method 6 (phrase direct)": phrase_hash,
    "Method 7 (double SHA256)": double_hash,
}

for name, h in hashes.items():
    print(f"{name:30s}: {h}")

print()

# Check for any matches
print("=" * 80)
print("CHECKING FOR DUPLICATE HASHES")
print("=" * 80)
print()

hash_values = list(hashes.values())
if len(hash_values) == len(set(hash_values)):
    print("✗ ALL HASHES ARE DIFFERENT")
    print("\nThis is the problem - same input, different hash functions = different outputs")
else:
    print("✓ Some hashes match!")
    for i, (name1, hash1_val) in enumerate(hashes.items()):
        for name2, hash2_val in list(hashes.items())[i+1:]:
            if hash1_val == hash2_val:
                print(f"  MATCH: {name1} == {name2}")

print()

# ========== THE REAL QUESTION ==========
print("=" * 80)
print("WHY ARE THEY DIFFERENT?")
print("=" * 80)
print()

print(print{The sequence [18, 99, 99, ...] can be interpreted multiple ways:

1. RAW BYTES (mod 256):
   [18, 99, 99, ...] → bytes → SHA256
   - Treats numbers as byte values (0-255)
   - Loses information if any number > 255

2. STRING REPRESENTATION:
   "[18, 99, 99, ...]" → UTF-8 bytes → SHA256
   - Includes brackets, commas, spaces
   - Different from actual numeric values

3. COMBINED INTEGER:
   (((18 << 32) + 99) << 32) + 99) << 32) + ...
   - Preserves full numeric information
   - Creates very large integer
   - Must be reduced to 256 bits

4. BIP39 DERIVATION:
   sequence → BIP39 words → PBKDF2(2048) → 512-bit seed
   - Standard Bitcoin key derivation
   - Uses passphrase (empty = "")
   - Salted with "mnemonic" + passphrase

5. BIP32 DERIVATION:
   BIP39 seed → HMAC-SHA512("Bitcoin seed") → master key
   - Hierarchical deterministic wallet standard
   - Splits 512-bit seed into private key + chain code

6. DIRECT HASH:
   "across arrest arrest..." → SHA256
   - Simplest approach
   - No iteration, no salt

7. DOUBLE SHA256:
   SHA256(SHA256(data))
   - Bitcoin's standard for addresses
   - Prevents length extension attacks

CONCLUSION:
──────────────────────────────────────────────────────────────────
These aren't different "canon keys" - they're different TRANSFORMATIONS
of the same input using different cryptographic functions.

Bitcoin uses a SPECIFIC sequence:
  Entropy → BIP39 words → PBKDF2 → BIP32 → addresses

If Satoshi used a DIFFERENT sequence (pre-BIP39 era), we need to
discover WHICH transformation was actually used.}
print()

print()

# ========== WHAT SATOSHI ACTUALLY USED ==========
print("=" * 80)
print("WHAT SATOSHI MIGHT HAVE ACTUALLY USED (2009)")
print("=" * 80)
print()

print(print{BIP39 didn't exist in 2009!
──────────────────────────────────────────────────────────────────
- BIP39 was proposed in 2013
- Satoshi mined in 2009
- Therefore, Satoshi could NOT have used BIP39

What Satoshi likely used:
──────────────────────────────────────────────────────────────────
1. Random private key generation (OpenSSL)
   - Just random 256-bit numbers
   - No seed phrases
   - No derivation paths

2. Brain wallet (SHA256 of passphrase)
   - Simple: SHA256("my secret passphrase")
   - Deterministic but weak

3. Custom deterministic system
   - Satoshi's own algorithm
   - Unknown to us

If this sequence is the KEY:
──────────────────────────────────────────────────────────────────
It must use a 2009-era method, not BIP39/BIP32!

Likely candidates:
1. Direct SHA256 of the sequence
2. RIPEMD160(SHA256(sequence))
3. Multiple iterations of hashing
4. XOR with some constant
5. Custom algorithm Satoshi invented

NEXT STEP: Try 2009-era derivation methods!}
print()

# ========== TRY 2009-ERA METHODS ==========
print("=" * 80)
print("TESTING 2009-ERA METHODS")
print("=" * 80)
print()

print("Method: Direct SHA256 of sequence bytes")
key_2009_v1 = hashlib.sha256(bytes(sequence)).hexdigest()
print(f"  Result: {key_2009_v1}")
print()

print("Method: SHA256(SHA256(sequence))")
key_2009_v2 = hashlib.sha256(hashlib.sha256(bytes(sequence)).digest()).hexdigest()
print(f"  Result: {key_2009_v2}")
print()

print("Method: RIPEMD160(SHA256(sequence))")
sha = hashlib.sha256(bytes(sequence)).digest()
ripemd = hashlib.new('ripemd160')
ripemd.update(sha)
key_2009_v3 = ripemd.hexdigest()
print(f"  Result: {key_2009_v3} (160 bits, need 256)")
print()

print("Method: SHA256 of concatenated numbers (no spaces)")
concat = ''.join(str(n) for n in sequence)
key_2009_v4 = hashlib.sha256(concat.encode()).hexdigest()
print(f"  Concatenated: {concat}")
print(f"  Result: {key_2009_v4}")
print()

print("Method: XOR all numbers, then hash")
xor_result = 0
for n in sequence:
    xor_result ^= n
print(f"  XOR result: {xor_result}")
key_2009_v5 = hashlib.sha256(bytes([xor_result])).hexdigest()
print(f"  SHA256: {key_2009_v5}")
print()

# Save all results
with open('/Users/alexa/blackroad-sandbox/ALL_DERIVATION_METHODS.txt', 'w') as f:
    f.write("ALL DERIVATION METHODS FROM THE SEQUENCE\n")
    f.write("=" * 80 + "\n\n")
    f.write(f"Sequence: {sequence}\n")
    f.write(f"Seed phrase: {seed_phrase}\n\n")

    for name, h in hashes.items():
        f.write(f"{name}:\n")
        f.write(f"  {h}\n\n")

    f.write("\n2009-ERA METHODS:\n\n")
    f.write(f"Direct SHA256: {key_2009_v1}\n")
    f.write(f"Double SHA256: {key_2009_v2}\n")
    f.write(f"RIPEMD160: {key_2009_v3}\n")
    f.write(f"Concatenated: {key_2009_v4}\n")
    f.write(f"XOR: {key_2009_v5}\n")

print("\n✓ Saved all results to ALL_DERIVATION_METHODS.txt")
