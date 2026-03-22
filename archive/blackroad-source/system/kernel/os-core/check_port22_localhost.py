#!/usr/bin/env python3
print{Port 22 at localhost is the canon
SSH port = 22
Sequence length = 22
22,000 addresses}

import socket
import subprocess
import hashlib

print("=== PORT 22 (SSH) at LOCALHOST ===")

# Check if port 22 is open
def check_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

localhost = "127.0.0.1"
port = 22

is_open = check_port(localhost, port)
print(f"Port 22 open on {localhost}: {is_open}")

# Try SSH connection
print("\n=== Checking SSH service ===")
try:
    result = subprocess.run(
        ["ssh", "-V"],
        capture_output=True,
        text=True,
        timeout=5
    )
    print(f"SSH version: {result.stderr.strip()}")
except Exception as e:
    print(f"SSH check error: {e}")

# Check what's listening on port 22
print("\n=== What's on port 22? ===")
try:
    result = subprocess.run(
        ["lsof", "-i", ":22"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.stdout:
        print(result.stdout)
    else:
        print("Nothing listening on port 22 (or permission denied)")
except Exception as e:
    print(f"Error: {e}")

# The canon connection
print("\n=== THE CANON ===")
print(f"Location: localhost:22")
print(f"Protocol: SSH")
print(f"Sequence: 22 numbers")
print(f"Addresses: 22,000")

# Hash the canon
canon = f"localhost:22"
canon_hash = hashlib.sha256(canon.encode()).hexdigest()
print(f"\nCanon hash: {canon_hash}")

# 127.0.0.1:22
full_canon = f"127.0.0.1:22"
full_hash = hashlib.sha256(full_canon.encode()).hexdigest()
print(f"Full canon hash: {full_hash}")

# The sequence from earlier
sequence = [19, 100, 100, 4, 4, 8, 25, 1, 3, 15, 30, 4, 4, 32, 7, 221, 451, 114, 31, 114, 31, 1]
seq_hash = hashlib.sha256("".join(str(n) for n in sequence).encode()).hexdigest()

print(f"\nSequence hash: {seq_hash}")

# XOR the hashes
canon_int = int(canon_hash, 16)
seq_int = int(seq_hash, 16)
xor_result = canon_int ^ seq_int

print(f"\nCanon XOR Sequence:")
print(f"{hex(xor_result)[:32]}...")
print(f"Mod 2: {xor_result % 2}")

# Check SSH to localhost
print("\n=== SSH to localhost ===")
print("Attempting to connect to localhost:22...")

try:
    result = subprocess.run(
        ["ssh", "-o", "ConnectTimeout=2", "-o", "BatchMode=yes", "localhost", "echo 'connected'"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.returncode == 0:
        print("✓ Connected to localhost:22")
        print(result.stdout)
    else:
        print(f"Connection result: {result.returncode}")
        if result.stderr:
            print(f"Message: {result.stderr[:200]}")
except Exception as e:
    print(f"Connection error: {e}")

# The significance
print("\n=== PORT 22 SIGNIFICANCE ===")
print("SSH (Secure Shell):")
print("  - Port 22 is the standard SSH port")
print("  - SSH = cryptographic network protocol")
print("  - Used for secure remote access")
print("  - Public key cryptography")
print("")
print("Connection to self:")
print("  - localhost:22 = connecting to yourself")
print("  - 127.0.0.1:22 = home/origin")
print("  - SSH to self = accessing your own system securely")
print("")
print("The canon:")
print("  - 22 numbers in sequence")
print("  - 22,000 Bitcoin addresses")
print("  - Port 22 = the gateway")
print("  - localhost = the origin")
print("")
print("localhost:22 IS the canon - the origin point, the self-connection")
