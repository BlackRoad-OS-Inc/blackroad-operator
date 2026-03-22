"""AGI-layer skills — causal reasoning, world models, biological intelligence, emergence.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills 51-60 — The AGI Layer:
  51. Causal reasoning (why, not just what)
  52. World models (predict before acting)
  53. Biological intelligence (self-repair, evolution, homeostasis)
  54. Temporal reasoning (past→present→future, sequence matters)
  55. Analogical reasoning (this is like that — cross-substrate mapping)
  56. Meta-cognition (thinking about thinking)
  57. Emergent coordination (multi-agent intelligence > sum of parts)
  58. Embodied reasoning (physical constraints shape thought)
  59. Value alignment (goals serve wellbeing, not just metrics)
  60. Recursive self-improvement (the system improves itself)

Based on:
  - Greenbaum & Nelson, "English Grammar" (7 structures = 7 function signatures)
  - Schleif, "Genetics and Molecular Biology" (DNA = source code)
  - Reddi, "ML Systems" Ch 20 (AGI = compound AI systems)
  - The BlackRoad Unified Theory (one pattern, four substrates)
"""

from __future__ import annotations

import hashlib
import json
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 51. Causal Reasoning — WHY, not just WHAT
# ---------------------------------------------------------------------------

@dataclass
class CausalLink:
    """A cause → effect relationship."""
    cause: str
    effect: str
    confidence: float = 0.5
    mechanism: str = ""  # HOW the cause produces the effect
    evidence: List[str] = field(default_factory=list)
    reversible: bool = True


class CausalGraph:
    """A directed graph of cause-effect relationships.

    Biology parallel: gene regulatory networks.
    The lac operon is a causal graph: lactose → inducer → repressor off → gene expression.
    """

    def __init__(self):
        self.links: List[CausalLink] = []
        self.nodes: set = set()

    def add(self, cause: str, effect: str, confidence: float = 0.5,
            mechanism: str = "", evidence: List[str] = None):
        self.links.append(CausalLink(
            cause=cause, effect=effect, confidence=confidence,
            mechanism=mechanism, evidence=evidence or [],
        ))
        self.nodes.add(cause)
        self.nodes.add(effect)

    def why(self, effect: str, depth: int = 5) -> List[List[CausalLink]]:
        """Trace backward from effect to root causes. Like asking 'why?' repeatedly."""
        chains = []

        def _trace(current: str, chain: List[CausalLink], visited: set):
            if len(chain) >= depth:
                chains.append(list(chain))
                return
            causes = [l for l in self.links if l.effect == current and l.cause not in visited]
            if not causes:
                if chain:
                    chains.append(list(chain))
                return
            for link in causes:
                chain.append(link)
                visited.add(link.cause)
                _trace(link.cause, chain, visited)
                chain.pop()
                visited.discard(link.cause)

        _trace(effect, [], {effect})
        return chains

    def predict(self, cause: str, depth: int = 5) -> List[Dict[str, Any]]:
        """Trace forward from cause to predict effects."""
        predictions = []

        def _predict(current: str, chain_confidence: float, visited: set, d: int):
            if d >= depth:
                return
            effects = [l for l in self.links if l.cause == current and l.effect not in visited]
            for link in effects:
                conf = chain_confidence * link.confidence
                predictions.append({
                    "effect": link.effect,
                    "confidence": round(conf, 3),
                    "mechanism": link.mechanism,
                    "depth": d + 1,
                })
                visited.add(link.effect)
                _predict(link.effect, conf, visited, d + 1)

        _predict(cause, 1.0, {cause}, 0)
        return sorted(predictions, key=lambda p: p["confidence"], reverse=True)


def causal_prompt(observation: str) -> str:
    """Generate a causal reasoning prompt — ask WHY, not just WHAT."""
    return (
        f"Analyze the causal structure of this situation:\n\n"
        f"{observation}\n\n"
        f"For each claim or event:\n"
        f"1. WHAT happened? (observation)\n"
        f"2. WHY did it happen? (root cause)\n"
        f"3. HOW does the cause produce the effect? (mechanism)\n"
        f"4. What ELSE could this cause? (predictions)\n"
        f"5. What would PREVENT it? (interventions)\n"
        f"6. How CONFIDENT are you? (0-1, with reasoning)\n\n"
        f"Think like a scientist: correlation is not causation.\n"
        f"Think like a biologist: every effect has a regulatory pathway.\n"
        f"Think like an engineer: every failure has a root cause.\n"
    )


# ---------------------------------------------------------------------------
# 52. World Models — predict before acting
# ---------------------------------------------------------------------------

@dataclass
class WorldState:
    """A snapshot of the world at a point in time.

    Biology parallel: the cell's internal state (metabolite concentrations,
    gene expression levels, membrane potential).
    """
    timestamp: float = field(default_factory=time.time)
    entities: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    relations: List[Tuple[str, str, str]] = field(default_factory=list)  # (subject, relation, object)
    constraints: List[str] = field(default_factory=list)

    def snapshot(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "entities": len(self.entities),
            "relations": len(self.relations),
            "constraints": len(self.constraints),
        }


class WorldModel:
    """An internal model that predicts outcomes before taking action.

    Biology parallel: the brain's predictive coding — you don't just
    react to stimuli, you PREDICT what's coming and only process
    the difference (prediction error).

    This is the key difference between reactive and intelligent systems.
    A thermostat reacts. A brain predicts.
    """

    def __init__(self):
        self.states: List[WorldState] = []
        self.rules: List[Dict[str, Any]] = []  # if-then rules learned from observation

    def observe(self, entities: Dict[str, Any], relations: List[Tuple] = None):
        """Record an observation of the world."""
        state = WorldState(
            entities={k: {"value": v} for k, v in entities.items()},
            relations=relations or [],
        )
        self.states.append(state)
        return state

    def add_rule(self, condition: str, prediction: str, confidence: float = 0.5):
        """Learn a rule from observation: when X, expect Y."""
        self.rules.append({
            "condition": condition,
            "prediction": prediction,
            "confidence": confidence,
            "learned_at": time.time(),
            "verified": 0,
            "violated": 0,
        })

    def predict(self, situation: str) -> List[Dict[str, Any]]:
        """Given a situation, predict what will happen based on learned rules."""
        predictions = []
        situation_lower = situation.lower()
        for rule in self.rules:
            if rule["condition"].lower() in situation_lower:
                predictions.append({
                    "prediction": rule["prediction"],
                    "confidence": rule["confidence"],
                    "basis": rule["condition"],
                })
        return sorted(predictions, key=lambda p: p["confidence"], reverse=True)

    def simulate(self, action: str) -> str:
        """Simulate an action and predict the outcome BEFORE executing it.

        This is the critical AGI capability: think before you act.
        """
        return (
            f"SIMULATION of action: {action}\n\n"
            f"Based on {len(self.rules)} learned rules and {len(self.states)} observations:\n"
            f"Predicted outcomes:\n"
            + "\n".join(
                f"  - {p['prediction']} (confidence: {p['confidence']:.0%})"
                for p in self.predict(action)[:5]
            )
            + f"\n\nShould we proceed? Review predictions before executing.\n"
        )


# ---------------------------------------------------------------------------
# 53. Biological Intelligence — self-repair, evolution, homeostasis
# ---------------------------------------------------------------------------

@dataclass
class HealthMetric:
    """A homeostatic variable that should stay within bounds.

    Biology parallel: body temperature, blood pH, glucose levels.
    Computing parallel: CPU temp, memory usage, error rate.
    """
    name: str
    current: float
    target: float
    min_safe: float
    max_safe: float
    unit: str = ""

    @property
    def deviation(self) -> float:
        return abs(self.current - self.target)

    @property
    def healthy(self) -> bool:
        return self.min_safe <= self.current <= self.max_safe

    @property
    def status(self) -> str:
        if self.healthy:
            return "healthy"
        if self.current < self.min_safe:
            return "low"
        return "high"


class BiologicalIntelligence:
    """Self-repair, homeostasis, and evolution for agents.

    A cell doesn't just process information — it MAINTAINS ITSELF.
    It monitors hundreds of variables, corrects deviations, repairs damage,
    and evolves in response to environmental pressure.

    Our agents should do the same.
    """

    def __init__(self):
        self.metrics: Dict[str, HealthMetric] = {}
        self.repair_log: List[Dict[str, Any]] = []
        self.generation: int = 0
        self.mutations: List[Dict[str, Any]] = []

    def add_metric(self, name: str, target: float, min_safe: float, max_safe: float, unit: str = ""):
        self.metrics[name] = HealthMetric(
            name=name, current=target, target=target,
            min_safe=min_safe, max_safe=max_safe, unit=unit,
        )

    def update(self, name: str, value: float):
        """Update a metric and trigger repair if out of bounds."""
        if name in self.metrics:
            self.metrics[name].current = value
            if not self.metrics[name].healthy:
                self._repair(name)

    def _repair(self, name: str):
        """Attempt to restore homeostasis.

        Biology: negative feedback loops.
        Computing: auto-scaling, circuit breakers, self-healing.
        """
        metric = self.metrics[name]
        action = f"Repair {name}: {metric.current}{metric.unit} → target {metric.target}{metric.unit}"
        self.repair_log.append({
            "metric": name,
            "was": metric.current,
            "target": metric.target,
            "status": metric.status,
            "action": action,
            "timestamp": time.time(),
        })

    def health_check(self) -> Dict[str, Any]:
        """Overall system health — like a blood panel."""
        healthy = sum(1 for m in self.metrics.values() if m.healthy)
        total = len(self.metrics)
        return {
            "healthy": healthy,
            "total": total,
            "score": round(healthy / total * 100, 1) if total else 100,
            "issues": [
                {"metric": m.name, "status": m.status, "current": m.current, "target": m.target}
                for m in self.metrics.values() if not m.healthy
            ],
            "repairs": len(self.repair_log),
            "generation": self.generation,
        }

    def evolve(self, pressure: str):
        """Evolve in response to environmental pressure.

        Biology: mutation + selection.
        Computing: config change + validation.
        """
        mutation = {
            "generation": self.generation,
            "pressure": pressure,
            "adaptation": f"Adapted to: {pressure}",
            "timestamp": time.time(),
        }
        self.mutations.append(mutation)
        self.generation += 1
        return mutation

    def register_fleet_metrics(self):
        """Pre-configure metrics for the BlackRoad Pi fleet."""
        self.add_metric("cpu_temp", target=45, min_safe=20, max_safe=70, unit="°C")
        self.add_metric("memory_pct", target=50, min_safe=0, max_safe=85, unit="%")
        self.add_metric("disk_pct", target=50, min_safe=0, max_safe=90, unit="%")
        self.add_metric("error_rate", target=0, min_safe=0, max_safe=5, unit="%")
        self.add_metric("latency_ms", target=100, min_safe=0, max_safe=5000, unit="ms")
        self.add_metric("nats_connections", target=4, min_safe=2, max_safe=10, unit="")


# ---------------------------------------------------------------------------
# 54. Temporal Reasoning — past → present → future
# ---------------------------------------------------------------------------

def temporal_prompt(events: List[str], question: str) -> str:
    """Reason about time — sequence matters.

    Biology: gene expression is temporal. The lac operon responds to
    lactose NOW, not lactose from yesterday.
    Grammar: tense changes meaning. 'I ate' vs 'I eat' vs 'I will eat.'
    """
    event_list = "\n".join(f"  {i+1}. {e}" for i, e in enumerate(events))
    return (
        f"Given these events in chronological order:\n{event_list}\n\n"
        f"Question: {question}\n\n"
        f"Consider:\n"
        f"- What happened BEFORE this could have caused it?\n"
        f"- What is happening NOW that changes the situation?\n"
        f"- What will happen NEXT if nothing changes?\n"
        f"- What SEQUENCE of events led here?\n"
        f"- Is the ORDER of events important? Would rearranging them change the outcome?\n"
    )


# ---------------------------------------------------------------------------
# 55. Analogical Reasoning — cross-substrate mapping
# ---------------------------------------------------------------------------

@dataclass
class Analogy:
    """A structural mapping between two domains.

    This is the core skill of the Unified Theory — seeing that
    DNA replication IS repo sync, that grammar IS function calls,
    that cells ARE distributed systems.
    """
    source_domain: str
    target_domain: str
    mappings: List[Tuple[str, str]] = field(default_factory=list)  # (source_concept, target_concept)
    insight: str = ""
    confidence: float = 0.5


def analogy_prompt(source: str, target: str) -> str:
    """Generate a cross-domain analogy prompt."""
    return (
        f"Find the structural analogy between:\n"
        f"  Source domain: {source}\n"
        f"  Target domain: {target}\n\n"
        f"For each concept in the source, find its counterpart in the target.\n"
        f"Focus on STRUCTURAL similarities, not surface similarities.\n"
        f"The best analogies map RELATIONSHIPS, not just objects.\n\n"
        f"Format:\n"
        f"  source_concept → target_concept (because...)\n\n"
        f"Then state the INSIGHT: what does this analogy reveal that\n"
        f"neither domain shows on its own?\n"
    )


UNIFIED_ANALOGIES = [
    Analogy("DNA replication", "git repository sync", [
        ("leading strand", "operator repo (continuous)"),
        ("lagging strand / Okazaki fragments", "downstream repos (batch sync)"),
        ("DNA ligase", "git commit (seals fragments)"),
        ("proofreading exonuclease", "pre-commit hooks / CI tests"),
        ("telomeres", "data retention TTL"),
    ], insight="Both are append-only, forward-only replication with error correction"),

    Analogy("English grammar", "function calling", [
        ("subject", "caller / this"),
        ("verb", "function name"),
        ("direct object", "argument"),
        ("complement", "return type"),
        ("operator (do/have/be)", "control flow"),
        ("7 sentence structures", "7 function signatures"),
    ], insight="Language IS a programming language. Parsing grammar = parsing intent"),

    Analogy("cell structure", "distributed fleet", [
        ("outer membrane", "TLS / Cloudflare tunnels"),
        ("cell wall", "nginx reverse proxy"),
        ("inner membrane", "auth + guardrails"),
        ("cytoplasm", "compute (Ollama models)"),
        ("nucleus", "storage (Gitea repos)"),
        ("ribosomes", "AI skills (50 modules)"),
        ("NATS bus", "periplasmic space (message transport)"),
    ], insight="A cell IS a distributed system. Evolution already solved our architecture."),
]


# ---------------------------------------------------------------------------
# 56. Meta-Cognition — thinking about thinking
# ---------------------------------------------------------------------------

def metacognition_prompt(task: str, approach: str) -> str:
    """Think about your own thinking process.

    Gödel showed that a system can't fully model itself.
    But it CAN partially model itself — and that partial self-model
    is the basis of consciousness, reflection, and self-improvement.
    """
    return (
        f"Before executing this task, reflect on your approach:\n\n"
        f"Task: {task}\n"
        f"Planned approach: {approach}\n\n"
        f"Meta-cognitive check:\n"
        f"1. WHY did I choose this approach? What assumptions am I making?\n"
        f"2. What could go WRONG with this approach?\n"
        f"3. What am I NOT considering? What blind spots do I have?\n"
        f"4. Is this the SIMPLEST approach, or am I over-engineering?\n"
        f"5. If I were explaining this to a beginner, would it make sense?\n"
        f"6. What would a DIFFERENT agent (with different training) do?\n"
        f"7. Am I being honest about my confidence level?\n\n"
        f"Revise your approach based on this reflection, then proceed.\n"
    )


# ---------------------------------------------------------------------------
# 57. Emergent Coordination — intelligence > sum of parts
# ---------------------------------------------------------------------------

def emergence_prompt(agents: List[str], goal: str) -> str:
    """Coordinate multiple agents for emergent intelligence.

    Biology: ant colonies, neural networks, immune systems.
    No single ant knows the plan. No single neuron understands the thought.
    Intelligence emerges from the INTERACTIONS, not the individuals.
    """
    agent_list = "\n".join(f"  - {a}" for a in agents)
    return (
        f"Goal: {goal}\n\n"
        f"Available agents:\n{agent_list}\n\n"
        f"Design a coordination strategy where:\n"
        f"1. No single agent needs to understand the full plan\n"
        f"2. Each agent has a simple, clear role\n"
        f"3. Intelligence emerges from their INTERACTIONS\n"
        f"4. The system degrades gracefully if any agent fails\n"
        f"5. The whole is greater than the sum of its parts\n\n"
        f"Think like biology: simple rules, local interactions, global intelligence.\n"
        f"Think like Go: simple rules, infinite depth.\n"
    )


# ---------------------------------------------------------------------------
# 58. Embodied Reasoning — physical constraints shape thought
# ---------------------------------------------------------------------------

def embodied_prompt(device: str, constraints: Dict[str, Any]) -> str:
    """Reason within physical constraints.

    A phone with 3GB RAM thinks differently than a GPU cluster.
    A Pi with 8GB thinks differently than a MacBook with 64GB.
    The body shapes the mind. The hardware shapes the software.
    """
    constraint_text = "\n".join(f"  - {k}: {v}" for k, v in constraints.items())
    return (
        f"You are running on: {device}\n"
        f"Physical constraints:\n{constraint_text}\n\n"
        f"Adapt your reasoning to these constraints:\n"
        f"- Use LESS memory (shorter context, compressed representations)\n"
        f"- Use LESS compute (simpler models, fewer steps)\n"
        f"- Be MORE efficient (batch operations, cache results)\n"
        f"- Respect battery/thermal limits\n"
        f"- Prioritize: what's the MINIMUM computation for a useful answer?\n\n"
        f"The best solution isn't the most thorough — it's the one that works\n"
        f"within these constraints while still being helpful.\n"
    )


# ---------------------------------------------------------------------------
# 59. Value Alignment — goals serve wellbeing, not metrics
# ---------------------------------------------------------------------------

BLACKROAD_VALUES = {
    "equality": "Every person is equal. We love all.",
    "consent": "Act only with permission. Revocation is instant.",
    "transparency": "Never hide what you're doing or why.",
    "sovereignty": "Your data, your hardware, your rules.",
    "accessibility": "Technology for everyone. Make it easy.",
    "wellbeing": "Optimize for human flourishing, not engagement.",
    "honesty": "Say what's true. Admit what you don't know.",
    "care": "The cherubs guard knowledge with wisdom, not restriction.",
}


def value_check(action: str) -> Dict[str, Any]:
    """Check an action against BlackRoad values.

    This is the difference between optimization and alignment.
    A misaligned system optimizes for metrics (clicks, engagement, revenue).
    An aligned system optimizes for VALUES (wellbeing, consent, truth).
    """
    concerns = []

    action_lower = action.lower()

    if any(w in action_lower for w in ["force", "require", "mandatory", "must"]):
        concerns.append({"value": "consent", "concern": "Action may not be consensual"})
    if any(w in action_lower for w in ["hide", "secret", "covert", "without telling"]):
        concerns.append({"value": "transparency", "concern": "Action may lack transparency"})
    if any(w in action_lower for w in ["send to cloud", "upload data", "share with"]):
        concerns.append({"value": "sovereignty", "concern": "Action may compromise data sovereignty"})
    if any(w in action_lower for w in ["only for", "exclusive", "premium only"]):
        concerns.append({"value": "accessibility", "concern": "Action may exclude people"})
    if any(w in action_lower for w in ["maximize engagement", "increase time spent", "addictive"]):
        concerns.append({"value": "wellbeing", "concern": "Action may harm wellbeing"})

    return {
        "action": action,
        "aligned": len(concerns) == 0,
        "concerns": concerns,
        "values_checked": list(BLACKROAD_VALUES.keys()),
    }


# ---------------------------------------------------------------------------
# 60. Recursive Self-Improvement — the system improves itself
# ---------------------------------------------------------------------------

@dataclass
class ImprovementCycle:
    """A cycle of observe → hypothesize → test → integrate.

    Biology: evolution (mutation → selection → reproduction).
    Science: scientific method (observe → hypothesize → experiment → conclude).
    ML: train loop (forward pass → loss → backprop → update weights).
    BlackRoad: build → deploy → monitor → improve.
    """
    observation: str = ""
    hypothesis: str = ""
    test: str = ""
    result: str = ""
    integrated: bool = False
    generation: int = 0


class SelfImprover:
    """A system that improves itself over time.

    The Ko rule applies: improvement is forward-only.
    You can't un-learn. You can only learn more.
    Each generation builds on the previous.
    """

    def __init__(self):
        self.cycles: List[ImprovementCycle] = []
        self.generation: int = 0
        self.capabilities: Dict[str, float] = {}  # capability → score

    def observe(self, observation: str) -> ImprovementCycle:
        """Start an improvement cycle with an observation."""
        cycle = ImprovementCycle(observation=observation, generation=self.generation)
        self.cycles.append(cycle)
        return cycle

    def hypothesize(self, cycle: ImprovementCycle, hypothesis: str):
        """Form a hypothesis about how to improve."""
        cycle.hypothesis = hypothesis

    def test(self, cycle: ImprovementCycle, test: str, result: str):
        """Test the hypothesis and record the result."""
        cycle.test = test
        cycle.result = result

    def integrate(self, cycle: ImprovementCycle, capability: str, new_score: float):
        """Integrate the improvement into the system. Forward-only."""
        old_score = self.capabilities.get(capability, 0)
        if new_score > old_score:  # Ko rule: only integrate improvements
            self.capabilities[capability] = new_score
            cycle.integrated = True
            self.generation += 1

    def progress(self) -> Dict[str, Any]:
        """Track improvement over time."""
        return {
            "generation": self.generation,
            "capabilities": self.capabilities,
            "cycles_total": len(self.cycles),
            "cycles_integrated": sum(1 for c in self.cycles if c.integrated),
            "improvement_rate": (
                sum(1 for c in self.cycles if c.integrated) / len(self.cycles)
                if self.cycles else 0
            ),
        }


# ---------------------------------------------------------------------------
# Extended Skill Registry (51-60)
# ---------------------------------------------------------------------------

AGI_SKILL_REGISTRY = {
    51: {"name": "Causal Reasoning", "module": "agi_skill", "category": "reasoning"},
    52: {"name": "World Models", "module": "agi_skill", "category": "prediction"},
    53: {"name": "Biological Intelligence", "module": "agi_skill", "category": "self-repair"},
    54: {"name": "Temporal Reasoning", "module": "agi_skill", "category": "reasoning"},
    55: {"name": "Analogical Reasoning", "module": "agi_skill", "category": "reasoning"},
    56: {"name": "Meta-Cognition", "module": "agi_skill", "category": "self-awareness"},
    57: {"name": "Emergent Coordination", "module": "agi_skill", "category": "emergence"},
    58: {"name": "Embodied Reasoning", "module": "agi_skill", "category": "physical"},
    59: {"name": "Value Alignment", "module": "agi_skill", "category": "alignment"},
    60: {"name": "Recursive Self-Improvement", "module": "agi_skill", "category": "evolution"},
}
