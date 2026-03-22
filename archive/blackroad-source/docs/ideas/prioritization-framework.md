# Prioritization Framework

Use this scoring model to evaluate ideas, especially those proposed autonomously by agents.

## Scoring Matrix
- Impact (1–5)
- Effort (1–5)
- Regulated Risk (1–5) — higher risk lowers priority unless mandatory
- Cross-System Reach (1–5)
- Agent Autonomy Gain (1–5)
- Strategic Alignment (1–5)

## Priority Score
```
Priority Score = (Impact × Strategic Alignment × Autonomy Gain) – Effort – Regulated Risk
```

- Escalation rule: any idea touching financial compliance automatically sets `Regulated Risk = 5`.
- Agent self-proposed ideas must be vetted against this rubric before advancing.
- Cecilia override: Cecilia may elevate or demote an idea after explicitly noting the rationale in the registry entry.

## Application Steps
1. Draft an Idea or Concept Card.
2. Score each dimension with notes.
3. Apply override if needed, recording the reason.
4. Advance only if Priority Score clears your operating threshold (default ≥ 8) or Cecilia override applies.
