# ai-chain — Agent Training Curriculum

**Type:** app | **Languages:** python

## Overview

Distributed multi-node LLM inference with automatic failover. Chains Ollama models across the Raspberry Pi fleet for load-balanced AI at the edge. FastAPI server routing inference across multiple nodes with graceful failover.

## Key Files

- `server.py` — FastAPI server: model routing, node health, failover, load balancing
- `tests/test_server.py` — Integration tests
- `deploy.sh` — Pi fleet deployment script

## Learning Objectives

1. Understand the purpose and architecture of ai-chain
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `server.py` and list all API endpoints
- [ ] Identify which Pi nodes host which models
- [ ] Trace what happens when a node goes offline mid-request

### Level 2: Contributor
- [ ] Add a health check endpoint reporting all node statuses
- [ ] Add a test for the failover path
- [ ] Improve error messages for node timeout scenarios

### Level 3: Builder
- [ ] Add model-aware routing (route to node with requested model)
- [ ] Implement request queuing when all nodes are busy
- [ ] Add latency metrics per node

### Level 4: Architect
- [ ] Design a model placement optimizer across nodes
- [ ] Propose streaming response support across the chain
- [ ] Review for single points of failure
