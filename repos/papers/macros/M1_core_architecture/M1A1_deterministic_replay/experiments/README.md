# M1A1 Deterministic Replay Experiment

This scaffold runs the Phase 1 deterministic replay test harness for the paper "Deterministic Replay for Agent Swarms via Hash-Chained Journals." Run it with:

```bash
python deterministic_replay_experiment.py
```

Journals are written to `./journals/` beside the script. A run is considered successful when the replay reconstruction matches the live run (hash chain verifies and counters align).
Placeholder for experiments.
