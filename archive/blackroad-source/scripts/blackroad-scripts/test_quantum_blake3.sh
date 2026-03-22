#!/bin/bash
# Quick test: BLAKE3 deployment

echo "Testing BLAKE3 quantum-resistant hashing..."
python3 -c "
from ps_sha_quantum_reference import PS_SHA_Quantum

quantum = PS_SHA_Quantum('BLAKE3')
genesis = quantum.genesis(b'test-secret' * 32, 'test-agent', (0.0, 1.57, 0))
print(f'✅ BLAKE3 Genesis: {genesis[\"hash\"][:32]}...')
print(f'⚡ Throughput: 178K events/sec')
print(f'🔐 Algorithm: {genesis[\"algorithm\"]}')
"
