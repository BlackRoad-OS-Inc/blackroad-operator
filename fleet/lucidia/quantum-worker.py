#!/usr/bin/env python3
"""
BlackRoad Quantum Worker Node
Connects to Octavia (master) for distributed quantum computing
"""
import socket
import sys
from datetime import datetime

def test_quantum_stack():
    """Test if quantum packages are available"""
    try:
        import qiskit
        import pennylane
        import numpy
        return True, {
            'qiskit': qiskit.__version__,
            'pennylane': pennylane.__version__,
            'numpy': numpy.__version__
        }
    except ImportError as e:
        return False, str(e)

def worker_status():
    """Report worker node status"""
    hostname = socket.gethostname()
    timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    
    print("━" * 50)
    print(f"🌌 BlackRoad Quantum Worker")
    print("━" * 50)
    print(f"Node:      {hostname}")
    print(f"Timestamp: {timestamp}")
    print()
    
    # Test quantum stack
    available, info = test_quantum_stack()
    
    if available:
        print("✅ QUANTUM STACK READY")
        print()
        print("Installed packages:")
        for pkg, version in info.items():
            print(f"  • {pkg}: {version}")
        print()
        print("Status: READY FOR QUANTUM JOBS")
    else:
        print("⚠️  QUANTUM STACK NOT AVAILABLE")
        print(f"Error: {info}")
        print()
        print("Status: NEEDS INSTALLATION")
    
    print("━" * 50)
    return available

if __name__ == '__main__':
    available = worker_status()
    sys.exit(0 if available else 1)
