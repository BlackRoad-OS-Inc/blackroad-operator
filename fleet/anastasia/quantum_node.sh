#!/bin/bash
# QUANTUM NODE LISTENER (Raspberry Pi 5)

python3 - << 'PYTHON_EOF'
import socket

UDP_PORT = 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("", UDP_PORT))

print("[NODE] Awaiting Quantum Collapse from Master...")

while True:
    data, addr = sock.recvfrom(1024)
    rgb = data.decode()
    print(f"[NODE] Synchronized! Current Reality: RGB({rgb})")
    # Here you would trigger: np[i] = (r, g, b)
PYTHON_EOF
