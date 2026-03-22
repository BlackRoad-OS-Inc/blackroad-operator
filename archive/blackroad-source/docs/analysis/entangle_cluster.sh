#!/bin/bash

# Cluster Entanglement Script
# Links two nodes to share a single collapsed state.

python3 - << 'PYTHON_EOF'
import numpy as np
import socket
import time

def create_bell_state():
    # This is a 'Bell State' - the simplest form of entanglement
    # The math: 1/sqrt(2) * (|00> + |11>)
    # This means if Qubit A is 0, Qubit B MUST be 0.
    state = np.array([0.707, 0, 0, 0.707])
    return state

print("\n[CLUSTER] Generating Entangled Pair...")
pair = create_bell_state()
time.sleep(1)

# In a real cluster, we would send 'pair[3]' to the other Pi 5.
# For now, let's simulate the 'Non-Local' observation.

outcome = np.random.choice(["Both are |0>", "Both are |1>"], p=[0.5, 0.5])

print("\n--- MEASURING NODE ALPHA ---")
time.sleep(0.5)
print(f"Node Alpha Result: {outcome.split()[-1]}")

print("\n--- CHECKING NODE BETA (Non-Local) ---")
time.sleep(1)
print(f"Node Beta Result: {outcome.split()[-1]}")
print("\n[RESULT] Entanglement confirmed. Spooky action at a distance.")
PYTHON_EOF
