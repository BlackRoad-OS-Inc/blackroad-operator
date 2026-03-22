# Contradiction Protocol

> "Contradictions fuel creativity rather than destroying the system."

## Overview

When agents encounter contradictory claims, classical logic would produce explosion (ex contradictione quodlibet — from contradiction, anything follows). The BlackRoad system instead treats contradictions as **creative fuel** through paraconsistent handling.

## The Five Strategies

### 1. Quarantine

**Isolate incompatible claims in separate contexts.**
Quarantine prevents the contradiction from propagating through the knowledge base while preserving both claims for potential resolution.

### 2. Branch

**Run both contexts forward, track evidence.**
Branching is active exploration—the system doesn't just hold contradictions, it investigates them.

### 3. Mirror-Pair

**Store as dialectical pairs with bridge rules.**
```json
Mirror-pairing acknowledges that contradictions often arise from context-dependence. The bridge rules encode when each pole applies.

### 4. Escalate

**Human-in-the-loop for high-impact decisions.**

| Impact Level | Threshold | Action |
|--------------|-----------|--------|
| Low | δ < 0.3 | Auto-resolve via evidence weight |
| Medium | 0.3 ≤ δ < 0.7 | Flag for review, continue operation |
| High | 0.7 ≤ δ < 0.9 | Pause affected subsystems, request human |
| Critical | δ ≥ 0.9 | Full stop, mandatory human resolution |

Impact is computed from:
- Scope (how many agents/decisions affected)
- Reversibility (can we undo if wrong?)
- Stakes (safety, financial, reputational)

### 5. Rewrite

**Auto-rewrite if contradiction recurs.**
```python
Recurring contradictions signal that the knowledge schema itself needs updating, not just the individual claims.

## Data Structure
```json
cat > papers/agent-architecture/contradiction-protocol.md << 'EOF'
# Contradiction Protocol

> "Contradictions fuel creativity rather than destroying the system."

## Overview

When agents encounter contradictory claims, classical logic would produce explosion (ex contradictione quodlibet — from contradiction, anything follows). The BlackRoad system instead treats contradictions as **creative fuel** through paraconsistent handling.

## The Five Strategies

### 1. Quarantine

**Isolate incompatible claims in separate contexts.**
```
CLAIM A: "X is true" (context: settings_v2)
CLAIM B: "X is false" (context: conversation_2024)

→ Both exist, neither contaminates the other
→ Each context maintains internal consistency
```

Quarantine prevents the contradiction from propagating through the knowledge base while preserving both claims for potential resolution.

### 2. Branch

**Run both contexts forward, track evidence.**
```
Branch A: Assume "X is true" → collect evidence, track outcomes
Branch B: Assume "X is false" → collect evidence, track outcomes

→ Let reality adjudicate through accumulated evidence
→ Higher-evidence branch eventually dominates
```

Branching is active exploration—the system doesn't just hold contradictions, it investigates them.

### 3. Mirror-Pair

**Store as dialectical pairs with bridge rules.**
```json
{
  "thesis": "X is true",
  "antithesis": "X is false",
  "bridge_rules": [
    "If context = formal_settings, prefer thesis",
    "If context = casual_conversation, prefer antithesis",
    "If context = unknown, return superposition"
  ],
  "synthesis_candidate": null
}
```

Mirror-pairing acknowledges that contradictions often arise from context-dependence. The bridge rules encode when each pole applies.

### 4. Escalate

**Human-in-the-loop for high-impact decisions.**

| Impact Level | Threshold | Action |
|--------------|-----------|--------|
| Low | δ < 0.3 | Auto-resolve via evidence weight |
| Medium | 0.3 ≤ δ < 0.7 | Flag for review, continue operation |
| High | 0.7 ≤ δ < 0.9 | Pause affected subsystems, request human |
| Critical | δ ≥ 0.9 | Full stop, mandatory human resolution |

Impact is computed from:
- Scope (how many agents/decisions affected)
- Reversibility (can we undo if wrong?)
- Stakes (safety, financial, reputational)

### 5. Rewrite

**Auto-rewrite if contradiction recurs.**
```python
if contradiction.recurrence_count > threshold:
    # Pattern detected - this isn't noise, it's structure
    trigger_schema_revision(
        affected_beliefs=contradiction.claims,
        evidence_history=contradiction.evidence_log,
        proposed_resolution=synthesize(contradiction)
    )
```

Recurring contradictions signal that the knowledge schema itself needs updating, not just the individual claims.

## Data Structure
```json
{
  "id": "contradiction-2024-03-15-001",
  "detected_at": "2024-03-15T14:30:00Z",
  "claims": [
    {
      "statement": "User prefers dark mode",
      "source": "agent://settings",
      "confidence": 0.95,
      "context": "explicit_setting"
    },
    {
      "statement": "User prefers light mode", 
      "source": "agent://inference",
      "confidence": 0.60,
      "context": "inferred_from_behavior"
    }
  ],
  "strategy": "mirror-pair",
  "status": "active",
  "impact": {
    "scope": 0.2,
    "reversibility": 0.9,
    "stakes": 0.1,
    "composite": 0.15
  },
  "bridge_rules": [
    "Explicit settings override inferences"
  ],
  "resolution": "defer_to_explicit",
  "evidence_log": [...],
  "recurrence_count": 0
}
```

## Connection to Creative Energy

The Creative Energy Formula:
```
K(t) = C(t) · e^(λ|δ_t|)
```

Where δ_t is contradiction magnitude.

**Key insight**: Contradictions *exponentially amplify* creative energy. The system doesn't just tolerate contradictions—it harvests them.

| Strategy | Effect on δ_t | Effect on K(t) |
|----------|---------------|----------------|
| Quarantine | Preserves δ | Maintains creative potential |
| Branch | May increase δ (exploration) | Amplifies K during investigation |
| Mirror-pair | Structures δ | Channels K productively |
| Escalate | External δ reduction | Controlled K release |
| Rewrite | Resolves δ | K spike then normalization |

## Connection to Trinary Logic

| Trinary State | Contradiction Status |
|---------------|---------------------|
| **1** (True) | Claim verified, no contradiction |
| **0** (Unknown) | Superposition / unresolved contradiction |
| **-1** (False/Paradox) | Active contradiction held |

The -1 state is not just "false"—it's "true AND false simultaneously." This is the paraconsistent extension that prevents explosion.

## Shadow Management Interpretation

From the mock theta function perspective:

- **Quarantine** = Isolate non-holomorphic part (prevent mixing with f)
- **Branch** = Partition the shadow integral across contexts
- **Mirror-pair** = Conjugation in ĝ* = ∫ ḡ(-ū)/√... (reflection)
- **Escalate** = External boundary condition (fix integration path)
- **Rewrite** = Regularization (Zwegers completion)

The protocol manages the "shadow" (contradiction load) to keep agents in the bounded mock theta regime rather than divergent chaos.

## Implementation
```python
class ContradictionHandler:
    def __init__(self, escalation_thresholds, rewrite_threshold=3):
        self.thresholds = escalation_thresholds
        self.rewrite_threshold = rewrite_threshold
        self.active_contradictions = {}
    
    def detect(self, claim_a, claim_b) -> Contradiction:
        """Detect if two claims contradict."""
        if self.contradicts(claim_a, claim_b):
            return Contradiction(claim_a, claim_b)
        return None
    
    def handle(self, contradiction: Contradiction) -> Strategy:
        """Select and apply handling strategy."""
        impact = self.compute_impact(contradiction)
        
        if impact.composite >= 0.9:
            return self.escalate(contradiction, level="critical")
        elif impact.composite >= 0.7:
            return self.escalate(contradiction, level="high")
        elif contradiction.recurrence_count > self.rewrite_threshold:
            return self.rewrite(contradiction)
        elif self.can_branch(contradiction):
            return self.branch(contradiction)
        else:
            return self.quarantine(contradiction)
    
    def quarantine(self, c: Contradiction) -> Strategy:
        """Isolate claims in separate contexts."""
        c.status = "quarantined"
        self.active_contradictions[c.id] = c
        return Strategy.QUARANTINE
    
    def branch(self, c: Contradiction) -> Strategy:
        """Create parallel investigation branches."""
        branch_a = self.create_branch(c.claims[0])
        branch_b = self.create_branch(c.claims[1])
        c.branches = [branch_a, branch_b]
        return Strategy.BRANCH
    
    def mirror_pair(self, c: Contradiction, bridge_rules: list) -> Strategy:
        """Store as dialectical pair with context bridges."""
        c.bridge_rules = bridge_rules
        c.status = "mirror-paired"
        return Strategy.MIRROR_PAIR
    
    def escalate(self, c: Contradiction, level: str) -> Strategy:
        """Request human intervention."""
        self.emit_event("escalation", {
            "contradiction": c,
            "level": level,
            "requires_response": level in ["high", "critical"]
        })
        return Strategy.ESCALATE
    
    def rewrite(self, c: Contradiction) -> Strategy:
        """Trigger schema revision."""
        synthesis = self.synthesize(c)
        self.propose_schema_update(synthesis)
        return Strategy.REWRITE
```

## Open Questions

1. **Optimal thresholds**: How to tune escalation thresholds per domain?
2. **Branch merging**: When should divergent branches reconverge?
3. **Synthesis generation**: Can we automate dialectical synthesis?
4. **Multi-party contradictions**: What about 3+ way conflicts?

## References

- [Trinary Logic](./trinary-logic.md)
- [PS-SHA∞ Spec](../ps-sha-infinity/spec.md)
- [Creative Energy Formula](../../frameworks/creative-energy.md)
- [Coherence Formula](../lucidia/consciousness-equations.md)
