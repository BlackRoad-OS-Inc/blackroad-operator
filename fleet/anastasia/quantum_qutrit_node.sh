#!/bin/bash
# Raspberry Pi Qutrit Node

python3 - << 'PYTHON_EOF'
import socket

UDP_PORT = 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("", UDP_PORT))

print("\n[NODE] Synchronized to Qutrit Field. Awaiting Energy Shift...")

while True:
    data, addr = sock.recvfrom(1024)
    state_id, r, g, b, label = data.decode().split(',')
    
    print(f"\n[SHIFT] GLOBAL ENERGY LEVEL: {state_id} ({label})")
    print(f" -> Visualization: RGB({r}, {g}, {b})")
    
    if state_id == "2":
        print(" -> WARNING: High energy state detected. Physical entanglement peaking.")
PYTHON_EOF
