#!/bin/bash
# Raspberry Pi Qutrit Node with Audio/Haptic Feedback

python3 - << 'PYTHON_EOF'
import socket
import os
import subprocess

UDP_PORT = 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("", UDP_PORT))

print("\n[AUDIO-NODE] Entangled. Speakers ready for physical collapse...")

while True:
    data, addr = sock.recvfrom(1024)
    state_id, r, g, b, label = data.decode().split(',')
    
    print(f"\n[SHIFT] ENERGY LEVEL: {state_id}")
    
    # Triggering Audio via System Beep or Sine Wave
    # State 0: Subtle pulse (40Hz)
    # State 1: Noticeable hum (220Hz)
    # State 2: High Energy Peak (880Hz + WARNING)
    
    freq = 40 if state_id == "0" else (220 if state_id == "1" else 880)
    duration = 0.1 if state_id != "2" else 0.5
    
    # This command generates a beep directly to your audio output
    os.system(f"speaker-test -t sine -f {freq} -l 1 > /dev/null 2>&1 & sleep {duration} && kill $!")

    if state_id == "2":
        print(" -> PHYSICAL PEAK: Vibrating Bone Conduction Speaker.")
PYTHON_EOF
