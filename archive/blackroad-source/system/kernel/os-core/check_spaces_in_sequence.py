#!/usr/bin/env python3
print{Check spaces between numbers - they align with BIP39 seed phrase words}

sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]

print("=== BIP39 Wordlist Check ===")

# BIP39 has 2048 words (numbered 0-2047)
# Load the wordlist
import urllib.request
import json

print("Loading BIP39 English wordlist...")
try:
    # Try to load from local first
    with open('/Users/alexa/blackroad-sandbox/bip39_english.txt', 'r') as f:
        words = [line.strip() for line in f.readlines()]
except:
    print("Downloading BIP39 wordlist...")
    url = "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt"
    try:
        response = urllib.request.urlopen(url)
        words = [line.decode('utf-8').strip() for line in response.readlines()]
        # Save it
        with open('/Users/alexa/blackroad-sandbox/bip39_english.txt', 'w') as f:
            f.write('\n'.join(words))
    except:
        print("Could not download. Using index mapping instead.")
        words = None

print(f"\n=== Mapping sequence to BIP39 words ===")

if words and len(words) == 2048:
    print("Got 2048 BIP39 words")
    print("\nMapping numbers to words (if in range 0-2047):")

    seed_words = []
    for i, num in enumerate(sequence):
        if 0 <= num < 2048:
            word = words[num]
            seed_words.append(word)
            print(f"{num:4d} → {word}")
        else:
            print(f"{num:4d} → (out of BIP39 range)")

    if seed_words:
        print(f"\n=== POTENTIAL SEED PHRASE ===")
        print(f"Found {len(seed_words)} valid BIP39 words:")
        print(" ".join(seed_words))

        # Check if it's a valid length (12, 15, 18, 21, 24)
        valid_lengths = [12, 15, 18, 21, 24]
        if len(seed_words) in valid_lengths:
            print(f"\n✓ This is a valid seed phrase length ({len(seed_words)} words)!")
        else:
            print(f"\n✗ Invalid length ({len(seed_words)} words). Valid: {valid_lengths}")
else:
    print("\nMapping to indices (wordlist not available):")
    for num in sequence:
        if 0 <= num < 2048:
            print(f"{num:4d} → BIP39 word index {num}")
        else:
            print(f"{num:4d} → Out of range")

# Alternative: check if numbers map to word positions
print("\n=== If numbers are 1-indexed (1-2048 instead of 0-2047) ===")
if words:
    seed_words_1indexed = []
    for num in sequence:
        if 1 <= num <= 2048:
            word = words[num - 1]  # Convert to 0-indexed
            seed_words_1indexed.append(word)
            print(f"{num:4d} → {word}")
        else:
            print(f"{num:4d} → (out of range)")

    if seed_words_1indexed:
        print(f"\n=== POTENTIAL SEED PHRASE (1-indexed) ===")
        print(" ".join(seed_words_1indexed))

# Check the spaces between numbers
print("\n=== Spaces (differences) between numbers ===")
differences = []
for i in range(len(sequence) - 1):
    diff = sequence[i+1] - sequence[i]
    differences.append(diff)
    print(f"{sequence[i]:4d} -> {sequence[i+1]:4d} : gap = {diff:4d}")

print(f"\nDifferences: {differences}")
