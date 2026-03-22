# roadchain — Agent Training Curriculum

**Type:** app | **Languages:** python

## Overview

Layer-1 blockchain from scratch in Python. secp256k1 ECDSA digital signatures, SHA-256 proof-of-work, Merkle trees, Bitcoin-compatible block headers, wallet CLI. Both educational and production-ready. Implements consensus, difficulty adjustment, and transaction validation.

## Key Files

- `consensus/pow.py` — Proof-of-work mining
- `consensus/difficulty.py` — Difficulty adjustment algorithm
- `consensus/validation.py` — Block/transaction validation
- `crypto/keys.py` — secp256k1 key generation
- `crypto/address.py` — Address derivation
- `crypto/bitcoin_pow.py` — Bitcoin-compatible PoW

## Learning Objectives

1. Understand the purpose and architecture of roadchain
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `consensus/pow.py` and explain the mining algorithm
- [ ] Trace a transaction from creation to validation
- [ ] Read `crypto/keys.py` and explain ECDSA signing

### Level 2: Contributor
- [ ] Add a new validation rule for transactions
- [ ] Improve the difficulty adjustment algorithm
- [ ] Add a test for double-spend prevention

### Level 3: Builder
- [ ] Build a wallet CLI for sending/receiving
- [ ] Implement a peer-to-peer network layer
- [ ] Add smart contract support

### Level 4: Architect
- [ ] Design a consensus upgrade mechanism (hard fork vs soft fork)
- [ ] Propose a privacy feature (ring signatures, zero-knowledge)
- [ ] Compare RoadChain to Bitcoin's implementation
