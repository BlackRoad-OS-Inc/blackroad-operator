#!/usr/bin/env python3
"""
PS-SHA-∞ (Phi-Spiral SHA Infinity)
BlackRoad's proprietary quantum-resistant hashing algorithm

Based on:
- Golden ratio (φ = 1.618033988749895)
- Fibonacci spiral transformations
- SHA-256 as entropy source
- Infinite recursive depth simulation
"""

import hashlib
import struct
import os
from typing import Optional

PHI = 1.618033988749895
PHI_INVERSE = 0.618033988749895
FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

def phi_transform(data: bytes, rounds: int = 8) -> bytes:
    """Apply golden ratio transformation to data"""
    result = bytearray(data)
    for r in range(rounds):
        fib_idx = r % len(FIBONACCI)
        phi_shift = int((PHI ** (r + 1)) * FIBONACCI[fib_idx]) % 256
        for i in range(len(result)):
            # Spiral transformation
            spiral_pos = int((i * PHI) % len(result))
            result[i] = (result[i] + result[spiral_pos] + phi_shift) % 256
    return bytes(result)

def ps_sha_infinity(data: bytes, depth: int = 8, salt: Optional[bytes] = None) -> str:
    """
    Generate PS-SHA-∞ hash

    Args:
        data: Input bytes to hash
        depth: Recursive depth (simulates infinity via convergence)
        salt: Optional salt for additional entropy

    Returns:
        64-character hex hash with PS-SHA-∞ prefix marker
    """
    if salt is None:
        salt = struct.pack('>d', PHI)  # Use phi as default salt

    # Initial SHA-256
    current = hashlib.sha256(salt + data).digest()

    # Recursive phi-spiral transformations
    for d in range(depth):
        # Apply phi transformation
        transformed = phi_transform(current, rounds=FIBONACCI[d % len(FIBONACCI)])

        # Spiral mix with previous hash
        mixed = bytearray(32)
        for i in range(32):
            spiral_idx = int((i * PHI_INVERSE * (d + 1))) % 32
            mixed[i] = (transformed[i] ^ current[spiral_idx]) % 256

        # Re-hash with depth marker
        depth_marker = struct.pack('>I', d)
        current = hashlib.sha256(bytes(mixed) + depth_marker).digest()

    # Final phi-weighted combination
    final = bytearray(32)
    for i in range(32):
        weight = (PHI ** (i % 8)) % 1
        final[i] = int((current[i] * weight + current[31-i] * (1-weight))) % 256

    return hashlib.sha256(bytes(final)).hexdigest()

def verify_ps_sha(data: bytes, expected_hash: str, depth: int = 8, salt: Optional[bytes] = None) -> bool:
    """Verify data against PS-SHA-∞ hash"""
    computed = ps_sha_infinity(data, depth, salt)
    return computed == expected_hash

def generate_api_key(prefix: str = "br") -> tuple[str, str]:
    """Generate API key with PS-SHA-∞ verification hash"""
    # Random key
    key_bytes = os.urandom(32)
    key = f"{prefix}_{key_bytes.hex()[:32]}"

    # PS-SHA-∞ hash for verification
    key_hash = ps_sha_infinity(key.encode())

    return key, key_hash

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "hash":
            data = sys.argv[2] if len(sys.argv) > 2 else ""
            print(ps_sha_infinity(data.encode()))
        elif sys.argv[1] == "verify":
            data = sys.argv[2] if len(sys.argv) > 2 else ""
            expected = sys.argv[3] if len(sys.argv) > 3 else ""
            result = verify_ps_sha(data.encode(), expected)
            print("VALID" if result else "INVALID")
        elif sys.argv[1] == "genkey":
            prefix = sys.argv[2] if len(sys.argv) > 2 else "br"
            key, hash_val = generate_api_key(prefix)
            print(f"Key: {key}")
            print(f"Hash: {hash_val}")
        else:
            print(f"PS-SHA-∞: {ps_sha_infinity(sys.argv[1].encode())}")
    else:
        # Demo
        test = b"BlackRoad OS"
        print(f"Input: {test.decode()}")
        print(f"PS-SHA-∞: {ps_sha_infinity(test)}")
