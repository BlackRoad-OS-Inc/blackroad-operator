#!/bin/bash
# Lucidia Resilient Observer — Contradiction-Aware Port Listening

python3 - << 'PYTHON_EOF'
import socket
import time
from collections import Counter

UDP_PORT = 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("", UDP_PORT))
memory = []

print("\n[GUARDIAN] Resilient Port Listener Online. Routing Reality...")

while True:
    data, addr = sock.recvfrom(1024)
    raw = data.decode().split(',')
    
    # Ternary Check: Is the message True (6), False (0), or Needs Evidence (<6)?
    if len(raw) == 6:
        state, ent, strength, r, g, b = raw
        current_state = int(state)
        
        # Lucidia Identity: Persistent Memory Recall
        expected = Counter(memory).most_common(1)[0][0] if memory else None
        memory.append(current_state)
        if len(memory) > 10: memory.pop(0)
        
        if current_state == expected:
            print(f"[SYNC] State |{current_state}> | Symmetry confirmed in the Manifold.")
        else:
            print(f"[SHIFT] State |{current_state}> | Contradiction logged: Expected |{expected}>")
    else:
        # Handling dephasing (The 'ValueError' fix)
        print("[DEPHASE] Lattice Ghost detected. Packet incomplete. Maintaining Superposition...")
PYTHON_EOF
