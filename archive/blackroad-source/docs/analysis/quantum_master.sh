#!/bin/bash
# QUANTUM MASTER BROADCASTER (M1 Mac)

python3 - << 'PYTHON_EOF'
import numpy as np
import socket
import time

# Network Setup: Broadcast to your local subnet
UDP_IP = "255.255.255.255"
UDP_PORT = 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

def observe_and_broadcast():
    # Generate the 1024-state Tensor
    re = np.random.randn(1024).astype(np.float32)
    im = np.random.randn(1024).astype(np.float32)
    state = (re + 1j*im) / np.linalg.norm(re + 1j*im)
    
    # Map to RGB
    r = int(np.abs(state[0]) * 1000) % 256
    g = int(np.abs(state[1]) * 1000) % 256
    b = int(np.abs(state[2]) * 1000) % 256
    message = f"{r},{g},{b}"
    
    print(f"[MASTER] Observed Collapse: RGB({message})")
    sock.sendto(message.encode(), (UDP_IP, UDP_PORT))
    print("[MASTER] State broadcast to all Nodes.")

if __name__ == "__main__":
    while True:
        observe_and_broadcast()
        time.sleep(2) # New collapse every 2 seconds
PYTHON_EOF
