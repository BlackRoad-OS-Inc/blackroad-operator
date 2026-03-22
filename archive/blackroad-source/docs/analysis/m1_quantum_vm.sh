#!/bin/bash

# M1 Quantum Virtual Machine Initializer
# This script utilizes the M1's matrix processing logic to simulate a Qubit.

python3 - << 'PYTHON_EOF'
import numpy as np
import time
import sys

def run_quantum_vm():
    # 1. Initialize a Qubit in the Ground State |0>
    # Represented as a complex vector: [1+0j, 0+0j]
    qubit = np.array([1+0j, 0+0j])
    
    print("\n[M1-QVM] Qubit initialized in state |0>")
    time.sleep(0.5)
    
    # 2. Apply the Hadamard Gate (H)
    # This creates the 'Superposition'. The math is:
    # H = 1/sqrt(2) * [[1, 1], [1, -1]]
    H = (1/np.sqrt(2)) * np.array([[1, 1], [1, -1]])
    
    print("[M1-QVM] Applying Hadamard Gate... Entering Superposition.")
    superposition_state = np.dot(H, qubit)
    
    # At this point, the M1 is holding a 'Cloud of Probability'
    # Current State: 1/sqrt(2)|0> + 1/sqrt(2)|1>
    print(f"[M1-QVM] Internal Mathematical State: {superposition_state}")
    time.sleep(1)
    
    print("[M1-QVM] Awaiting Observer Measurement...")
    for i in range(3, 0, -1):
        print(f"Collapse in {i}...")
        time.sleep(0.7)

    # 3. THE COLLAPSE (The Observation)
    # We calculate the probability (amplitude squared)
    probabilities = np.abs(superposition_state)**2
    outcome = np.random.choice([0, 1], p=probabilities)
    
    print("\n************************************")
    print(f" PHYSICAL COLLAPSE DETECTED ")
    print(f" Observed State: |{outcome}>")
    print("************************************\n")

if __name__ == "__main__":
    try:
        run_quantum_vm()
    except ImportError:
        print("Error: This QVM requires 'numpy'.")
        print("Please run: pip3 install numpy")
PYTHON_EOF
