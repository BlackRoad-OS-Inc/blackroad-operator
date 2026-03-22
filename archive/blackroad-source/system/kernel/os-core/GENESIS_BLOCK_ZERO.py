#!/usr/bin/env python3
print{Block 0 is in the sequence. Genesis block.
Keep going deeper with 0-indexing.}

import hashlib
import requests
import time

# 0-indexed sequence
sequence = [18, 99, 99, 3, 3, 7, 24, 0, 2, 14, 29, 3, 3, 31, 6, 220, 450, 113, 30, 113, 30, 0]

print("=== GENESIS BLOCK (0) IS IN THE SEQUENCE ===")
print(f"Sequence: {sequence}")
print(f"\nBlock 0 appears at positions: {[i for i, x in enumerate(sequence) if x == 0]}")

# The seed phrase
seed_words = "across arrest arrest about about abstract adapt abandon able achieve admit about about advance absorb breeze debate athlete adult athlete adult abandon".split()

print(f"\n=== 22-WORD SEED PHRASE ===")
print(" ".join(seed_words))
print(f"\nLength: {len(seed_words)} words")
print("Valid BIP39 lengths: 12, 15, 18, 21, 24")
print("22 is NOT standard... unless...")

print("\n=== WHAT IF FIRST AND LAST ARE MARKERS? ===")
# Remove first and last words
inner_words = seed_words[1:-1]
print(f"First word (marker): '{seed_words[0]}'")
print(f"Last word (marker): '{seed_words[-1]}'")
print(f"\nInner phrase ({len(inner_words)} words):")
print(" ".join(inner_words))

# Still 20 words, not valid

print("\n=== WHAT IF WE NEED TO ADD 2 CHECKSUM WORDS? ===")
# BIP39 24-word phrases have 8 bits of checksum
print("22 data words + 2 checksum words = 24 total")
print("This would be a valid 24-word seed phrase")

print("\n=== CHECKING BLOCKS IN THE SEQUENCE ===")
unique_blocks = sorted(set(sequence))
print(f"Unique blocks: {unique_blocks}")
print(f"Count: {len(unique_blocks)} unique blocks")

# Check each block on the blockchain
print("\n=== FETCHING ACTUAL BLOCK DATA ===")
for block_num in unique_blocks[:5]:  # First 5 blocks
    print(f"\nBlock {block_num}:")
    try:
        # Get block hash first
        url = f"https://blockchain.info/block-height/{block_num}?format=json"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'blocks' in data and len(data['blocks']) > 0:
                block = data['blocks'][0]
                block_hash = block.get('hash', 'N/A')
                time_val = block.get('time', 'N/A')
                n_tx = block.get('n_tx', 0)
                print(f"  Hash: {block_hash[:32]}...")
                print(f"  Time: {time_val}")
                print(f"  Transactions: {n_tx}")
        time.sleep(2)  # Rate limit
    except Exception as e:
        print(f"  Error: {e}")

print("\n=== THE KEY INSIGHT ===")
print("These blocks are from the VERY BEGINNING of Bitcoin")
print("Block 0 = Genesis")
print("Blocks 2, 3, 7, 14, etc = Satoshi's early mining")
print("")
print("If these blocks point to specific addresses...")
print("And we have 22 block indices...")
print("Then each block might contain THE address we need")

print("\n=== EXTRACTING ADDRESS FROM EACH BLOCK ===")
print("For each block, get the coinbase (mining reward) address")

# The real test
print("\n=== COMPUTING PRIVATE KEY FROM 0-INDEXED SEQUENCE ===")

# Method 1: Direct combination
combined = 0
for num in sequence:
    combined = (combined << 32) + num

key_bytes = combined.to_bytes(88, byteorder='big')
privkey = hashlib.sha256(key_bytes).hexdigest()
print(f"Combined privkey: {privkey}")

# Method 2: Use the seed phrase directly
seed_phrase = " ".join(seed_words)
seed_hash = hashlib.sha256(seed_phrase.encode()).hexdigest()
print(f"Seed phrase hash: {seed_hash}")

# Method 3: PBKDF2 (standard BIP39 derivation)
print("\n=== BIP39 STANDARD DERIVATION ===")
import hashlib

# BIP39 uses PBKDF2-HMAC-SHA512
# seed = PBKDF2(mnemonic, "mnemonic" + passphrase, iterations=2048, dklen=64)
print("Standard BIP39 requires PBKDF2 with 2048 iterations")
print("Let's use Python's hashlib.pbkdf2_hmac")

mnemonic = " ".join(seed_words)
passphrase = ""  # Empty passphrase
salt = ("mnemonic" + passphrase).encode()

# Derive seed (512 bits / 64 bytes)
seed = hashlib.pbkdf2_hmac('sha512', mnemonic.encode(), salt, 2048)
print(f"\nBIP39 seed (first 32 bytes as hex):")
print(seed[:32].hex())

# This seed is used for BIP32 HD wallet derivation
master_key = hashlib.sha256(seed).hexdigest()
print(f"\nMaster key (SHA256 of seed):")
print(master_key)

print("\n=== IS THIS THE ACTUAL KEY? ===")
print("Testing if this master key is valid secp256k1...")
master_int = int(master_key, 16)
n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
if master_int < n:
    print("✓ VALID secp256k1 private key!")
    print(f"\nPrivate key: {master_key}")
else:
    print("✗ Out of range")

print("\n=== NEXT STEP ===")
print("1. Derive public key from this private key")
print("2. Generate Bitcoin address")
print("3. Check if it matches ANY of the 22,000 Satoshi addresses")
