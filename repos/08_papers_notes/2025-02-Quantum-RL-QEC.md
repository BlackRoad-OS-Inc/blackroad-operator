# Reinforcement Learning Control of Quantum Error Correction

## Citation
- **Paper**: *Reinforcement Learning Control of Quantum Error Correction*, arXiv:2511.08493 (2025).
- **Context**: Discussed alongside *Artificial Intelligence for Quantum Error Correction: A Comprehensive Review*, arXiv:2412.20380.

## Core Idea
A model-free reinforcement learning (RL) agent directly interfaces with a quantum error-correcting code (QEC) on near-term hardware. Instead of statically defining recovery schedules, the agent observes stabilizer measurement streams and selects syndrome extraction, measurement ordering, and corrective actions in a closed-loop controller.

## Why It Matters
- **Adaptive resilience**: The agent receives reward signals derived from logical error rates, enabling it to track hardware noise drifts and sustain logical qubit fidelity without manual retuning.
- **Runtime orchestration**: Demonstrates that agentic control can run QEC protocols in real time, rather than only designing them offline.
- **Near-term applicability**: Targets noisy intermediate-scale quantum (NISQ) and early fault-tolerant devices, signalling that agent-controlled QEC sub-modules could become composable infrastructure elements.

## Technical Notes
- **Observation space**: Streams of stabilizer outcomes and hardware status telemetry feed the policy.
- **Action space**: Dynamic scheduling of stabilizer measurements, adaptive syndrome extraction depth, and choice of recovery channels.
- **Training loop**: On-hardware or hardware-in-the-loop reinforcement learning uses logical qubit survival metrics as reward shaping.

## Open Questions & Next Steps
- Integration pathways for orchestrating multiple agent-controlled QEC modules within larger quantum-cloud workflows.
- Robustness guarantees when agents encounter unmodeled cross-talk or calibration faults.
- Benchmarking against static decoders under varying drift rates and environmental perturbations.
