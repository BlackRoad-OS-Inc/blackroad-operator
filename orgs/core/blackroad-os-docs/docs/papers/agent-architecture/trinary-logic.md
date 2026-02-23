# Trinary Logic in BlackRoad OS

BlackRoad OS agents reason with three states: +1 (true/affirmed), 0 (unknown/undecided), and -1 (negated/contradictory). This representation keeps uncertainty explicit and allows contradictions to be managed rather than hidden.

## Belief Representation

- **Vectors of trinary values:** Each proposition maps to {+1, 0, -1} to capture stance and uncertainty.
- **Confidence weights:** Optional weights can scale the impact of each value when aggregating across agents.
- **Temporal context:** Beliefs can be journaled over time, enabling a PS-SHA∞-backed history of shifts.

## Combination Rules

- **AND:** Minimum of contributing values, keeping contradictions (-1) dominant over unknowns (0) and truths (+1).
- **OR:** Maximum of contributing values, preferring truths (+1) but preserving contradictions when present.
- **Consensus:** Weighted sums normalized to the trinary domain to find majority positions while surfacing disagreement.

## Operational Patterns

- **Decision gating:** Actions require +1 consensus or explicit override when -1 appears.
- **Escalation triggers:** Presence of balanced +1 and -1 across critical propositions triggers contradiction events.
- **Logging:** Every aggregation result is written as a PS-SHA∞ entry for auditability.

## TODOs

- Extend combination rules with temporal decay to emphasize recent evidence.
- Define canonical proposition sets for finance, compliance, and platform operations.
