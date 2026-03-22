#!/usr/bin/env python3
"""
EXP-002: Trinary Logic Reasoning
BlackRoad Labs — Epistemic reasoning with 3-valued logic (True=1, Unknown=0, False=-1)
"""

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

TRUTH_VALUES = {1: "TRUE", 0: "UNKNOWN", -1: "FALSE"}


@dataclass
class TruthState:
    claim: str
    value: int  # 1, 0, -1
    confidence: float = 1.0
    source: str = "inference"


@dataclass
class KnowledgeBase:
    states: Dict[str, TruthState] = field(default_factory=dict)
    quarantine: List[str] = field(default_factory=list)
    log: List[str] = field(default_factory=list)

    def assert_true(self, claim: str, confidence: float = 1.0, source: str = "user"):
        self._set(claim, 1, confidence, source)

    def assert_false(self, claim: str, confidence: float = 1.0, source: str = "user"):
        self._set(claim, -1, confidence, source)

    def observe(self, claim: str):
        """Unknown / observed but unverified"""
        self._set(claim, 0, 0.5, "observation")

    def _set(self, claim: str, value: int, confidence: float, source: str):
        existing = self.states.get(claim)
        if existing and existing.value != 0 and existing.value != value:
            # Contradiction detected!
            self.log.append(f"⚠️  CONTRADICTION: '{claim}' was {TRUTH_VALUES[existing.value]}, now asserted {TRUTH_VALUES[value]}")
            self.quarantine.append(claim)
            self.states[claim] = TruthState(claim, 0, 0.0, "quarantined")
        else:
            self.states[claim] = TruthState(claim, value, confidence, source)

    def evaluate(self, claim: str) -> Tuple[int, float]:
        s = self.states.get(claim)
        if not s:
            return 0, 0.0
        return s.value, s.confidence

    def kleene_and(self, a: str, b: str) -> int:
        """Kleene three-valued AND"""
        va, _ = self.evaluate(a)
        vb, _ = self.evaluate(b)
        return min(va, vb)

    def kleene_or(self, a: str, b: str) -> int:
        """Kleene three-valued OR"""
        va, _ = self.evaluate(a)
        vb, _ = self.evaluate(b)
        return max(va, vb)

    def kleene_not(self, claim: str) -> int:
        v, _ = self.evaluate(claim)
        return -v


def run_experiment():
    print("=" * 60)
    print("EXP-002: Trinary Logic Reasoning")
    print("=" * 60)

    kb = KnowledgeBase()

    # Test 1: Basic assertions
    print("\n[Test 1] Basic Assertions")
    kb.assert_true("system.healthy", confidence=0.99)
    kb.assert_false("network.down")
    kb.observe("api.latency.high")

    for claim in ["system.healthy", "network.down", "api.latency.high"]:
        v, c = kb.evaluate(claim)
        print(f"  {claim}: {TRUTH_VALUES[v]} (confidence={c:.2f})")

    # Test 2: Kleene operators
    print("\n[Test 2] Kleene Three-Valued Logic")
    result = kb.kleene_and("system.healthy", "api.latency.high")
    print(f"  system.healthy AND api.latency.high = {TRUTH_VALUES[result]}")  # min(1,0) = 0
    result = kb.kleene_or("system.healthy", "network.down")
    print(f"  system.healthy OR  network.down     = {TRUTH_VALUES[result]}")  # max(1,-1) = 1
    result = kb.kleene_not("network.down")
    print(f"  NOT network.down                    = {TRUTH_VALUES[result]}")  # -(-1) = 1

    # Test 3: Contradiction detection
    print("\n[Test 3] Contradiction Detection")
    kb.assert_true("agent.alice.online")
    kb.assert_false("agent.alice.online")  # Should trigger quarantine
    print(f"  Log: {kb.log[-1]}")
    print(f"  Quarantine: {kb.quarantine}")
    v, c = kb.evaluate("agent.alice.online")
    print(f"  agent.alice.online after contradiction: {TRUTH_VALUES[v]} (conf={c})")

    print("\n✅ EXP-002 complete")
    return len(kb.states), len(kb.quarantine)


if __name__ == "__main__":
    states, quarantined = run_experiment()
    print(f"\nSummary: {states} claims, {quarantined} quarantined")
