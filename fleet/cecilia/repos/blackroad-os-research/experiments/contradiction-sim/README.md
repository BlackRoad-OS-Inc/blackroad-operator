# Contradiction Simulator

This experiment explores how multiple agents might assign trinary values (+1, 0, -1) to propositions and how conflicts could be reconciled. It is intentionally lightweight and text-based.

## Goals

- Surface how disagreement accumulates across agents.
- Prototype conflict scores to flag when orchestrators should escalate.
- Capture resolution choices that can later be journaled via PS-SHA∞.

## How to Use

1. Edit `model.ts` to define propositions and agents with belief vectors.
2. Run the TypeScript model with `ts-node` or by compiling with `tsc` if you have a toolchain available.
3. Inspect the printed conflict scores and suggested resolutions; adjust weights or strategies as desired.

## Notes

- No external dependencies are required beyond the TypeScript standard library.
- This is a sandbox; it is not meant for production decision-making.
