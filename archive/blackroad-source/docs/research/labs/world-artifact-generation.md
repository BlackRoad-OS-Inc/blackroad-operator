# World Artifact Generation at Scale: Observations from the BlackRoad Pi Fleet

**BlackRoad Labs Research Note**  
**Date:** 2026

## Abstract

We report observations from running generative AI agents on Raspberry Pi 4B hardware for autonomous world artifact creation. Our fleet of two Pi nodes (aria64 and alice) generates 40–60 world artifacts per day using quantized LLMs (qwen2.5:3b) with 60-second generation cycles.

## Setup

| Node | Model | CPU | RAM | Role |
|------|-------|-----|-----|------|
| aria64 | qwen2.5:3b | RPi4 4-core | 4GB | Primary |
| alice | relay→aria64 | RPi4 4-core | 4GB | Secondary |

## Findings

### Generation Rate
- Cycle interval: 60s
- Git push interval: 90s  
- Effective rate: ~1 artifact/min per node
- Daily total: 50–80 artifacts

### Type Distribution
Empirical entropy ≈ 1.56 bits (near maximum for 3-way distribution), suggesting diverse, unbiased generation.

### Slug Word Patterns
Most common slug words reflect theme diversity: forest, ocean, city, ancient, quantum, neon, desert, arctic.

### Resource Usage
- CPU: ~8–15% average during generation
- RAM: 1.8GB peak (model loaded)
- Disk: ~100KB/artifact (markdown)

## Conclusions

Edge hardware is sufficient for autonomous world artifact generation at human-readable quality. The bottleneck is I/O (git push) rather than inference.

## Future Work
- Multi-model ensemble generation
- Cross-node artifact synthesis
- Real-time streaming to frontend
