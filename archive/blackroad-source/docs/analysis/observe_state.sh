#!/bin/bash

# This Bash script wraps the Python math so you can run it directly.
# It simulates the 'Quantum State' using Quaternions.

python3 - << 'PYTHON_EOF'
import math
import random
import time

def observe_quaternion_state():
    # 4D Quaternion variables representing the 'Hidden' state
    w = random.uniform(-1, 1)
    x = random.uniform(-1, 1)
    y = random.uniform(-1, 1)
    z = random.uniform(-1, 1)
    
    # Normalizing to the 4D Unit Sphere (The Math of a Qubit/Qutrit)
    mag = math.sqrt(w**2 + x**2 + y**2 + z**2)
    if mag == 0: mag = 1
    w, x, y, z = w/mag, x/mag, y/mag, z/mag
    
    # The 'Collapse' into 3D RGB space for human observation
    r = int((x + 1) * 127.5)
    g = int((y + 1) * 127.5)
    b = int((z + 1) * 127.5)
    
    return (r, g, b), (w, x, y, z)

print("\n[SYSTEM] Initializing Superposition...")
time.sleep(0.8)
print("[SYSTEM] Calculating 4D Rotations (Quaternions)...")
time.sleep(0.8)

# THE MOMENT OF OBSERVATION
# This is where the code 'tells' the observer the result.
color, quat = observe_quaternion_state()

print("\n*** QUANTUM COLLAPSE OBSERVED ***")
print(f"Physical Interface State (Color): RGB{color}")
print(f"Mathematical Underlying State (4D): {quat}")
print("*********************************\n")
PYTHON_EOF
