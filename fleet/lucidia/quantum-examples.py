#!/usr/bin/env python3
"""
BlackRoad OS Quantum Circuit Examples
Using Qiskit for quantum computing demonstrations
"""

def bell_state():
    """Create a Bell state (maximally entangled 2-qubit state)"""
    from qiskit import QuantumCircuit
    from qiskit_aer import Aer
    
    print("🔬 Creating Bell State (|Φ+⟩)")
    print("=" * 50)
    
    # Create 2-qubit circuit
    qc = QuantumCircuit(2, 2)
    
    # Create Bell state: (|00⟩ + |11⟩) / √2
    qc.h(0)        # Hadamard gate on qubit 0
    qc.cx(0, 1)    # CNOT gate: control=0, target=1
    
    # Measure both qubits
    qc.measure([0, 1], [0, 1])
    
    print("Circuit:")
    print(qc)
    print()
    
    # Simulate
    simulator = Aer.get_backend('qasm_simulator')
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts(qc)
    
    print("Results (1000 shots):")
    for outcome, count in sorted(counts.items()):
        bar = '█' * (count // 10)
        print(f"  {outcome}: {count:4d} {bar}")
    
    print("\n✅ Bell state demonstrated entanglement!")
    print("   (Should see ~50% |00⟩ and ~50% |11⟩)\n")
    return counts

def ghz_state():
    """Create a GHZ state (3-qubit entangled state)"""
    from qiskit import QuantumCircuit
    from qiskit_aer import Aer
    
    print("🔬 Creating GHZ State (3-qubit entanglement)")
    print("=" * 50)
    
    # Create 3-qubit circuit
    qc = QuantumCircuit(3, 3)
    
    # Create GHZ state: (|000⟩ + |111⟩) / √2
    qc.h(0)        # Hadamard on qubit 0
    qc.cx(0, 1)    # CNOT: 0 → 1
    qc.cx(0, 2)    # CNOT: 0 → 2
    
    # Measure all qubits
    qc.measure([0, 1, 2], [0, 1, 2])
    
    print("Circuit:")
    print(qc)
    print()
    
    # Simulate
    simulator = Aer.get_backend('qasm_simulator')
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts(qc)
    
    print("Results (1000 shots):")
    for outcome, count in sorted(counts.items()):
        bar = '█' * (count // 10)
        print(f"  {outcome}: {count:4d} {bar}")
    
    print("\n✅ GHZ state created!")
    print("   (Should see ~50% |000⟩ and ~50% |111⟩)\n")
    return counts

def quantum_teleportation():
    """Demonstrate quantum teleportation protocol"""
    from qiskit import QuantumCircuit
    from qiskit_aer import Aer
    
    print("🔬 Quantum Teleportation Protocol")
    print("=" * 50)
    
    # Create circuit with 3 qubits, 3 classical bits
    qc = QuantumCircuit(3, 3)
    
    # Prepare state to teleport (|ψ⟩ = |+⟩)
    qc.h(0)
    qc.barrier()
    
    # Create Bell pair between qubits 1 and 2
    qc.h(1)
    qc.cx(1, 2)
    qc.barrier()
    
    # Alice's operations (entangle qubit 0 with qubit 1)
    qc.cx(0, 1)
    qc.h(0)
    qc.barrier()
    
    # Measure Alice's qubits
    qc.measure([0, 1], [0, 1])
    qc.barrier()
    
    # Bob's corrections (controlled on Alice's measurements)
    qc.x(2).c_if(1, 1)  # Apply X if classical bit 1 is 1
    qc.z(2).c_if(0, 1)  # Apply Z if classical bit 0 is 1
    
    # Measure Bob's qubit
    qc.measure(2, 2)
    
    print("Circuit:")
    print(qc)
    print()
    
    # Simulate
    simulator = Aer.get_backend('qasm_simulator')
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts(qc)
    
    print("Results (1000 shots):")
    for outcome, count in sorted(counts.items())[:5]:
        bar = '█' * (count // 10)
        print(f"  {outcome}: {count:4d} {bar}")
    
    print("\n✅ Quantum teleportation demonstrated!\n")
    return counts

if __name__ == '__main__':
    import socket
    print(f"🌌 BlackRoad Quantum Computing")
    print(f"📍 Running on: {socket.gethostname()}")
    print()
    
    # Run all examples
    bell_state()
    print()
    ghz_state()
    print()
    quantum_teleportation()
    
    print("=" * 50)
    print("✅ All quantum circuits executed successfully!")
    print("=" * 50)
