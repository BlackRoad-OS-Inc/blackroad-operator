"""Orchestration skills — routing, pipelines, evaluation, guardrails.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills:
  17. Model routing (cost/quality/latency optimization)
  18. Pipeline orchestration (sequential, parallel, conditional)
  19. Evaluation & benchmarking (LLM-as-judge, metrics)
  20. Guardrails & safety (content filtering, PII detection, prompt injection)
  21. Rate limiting & quota management
  22. A/B testing & experimentation
  23. Caching & deduplication
  24. Fallback chains & circuit breakers
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 17. Model Routing
# ---------------------------------------------------------------------------

@dataclass
class ModelProfile:
    """Profile of an LLM model for routing decisions."""
    name: str
    provider: str  # ollama, anthropic, openai, local
    endpoint: str
    cost_per_1k_tokens: float = 0.0
    avg_latency_ms: float = 500.0
    quality_score: float = 0.7  # 0-1
    max_context: int = 8192
    capabilities: List[str] = field(default_factory=list)
    is_local: bool = False
    is_available: bool = True


class ModelRouter:
    """Intelligent model routing — pick the best model for each task."""

    def __init__(self):
        self.models: Dict[str, ModelProfile] = {}
        self.routing_history: List[Dict[str, Any]] = []

    def register(self, model: ModelProfile):
        self.models[model.name] = model

    def route(
        self,
        task: str,
        strategy: str = "balanced",
        required_capabilities: Optional[List[str]] = None,
        max_cost: Optional[float] = None,
        max_latency: Optional[float] = None,
    ) -> Optional[ModelProfile]:
        """Route a task to the best available model.

        Strategies: cheapest, fastest, best_quality, balanced, local_first
        """
        candidates = [m for m in self.models.values() if m.is_available]

        if required_capabilities:
            candidates = [
                m for m in candidates
                if all(cap in m.capabilities for cap in required_capabilities)
            ]
        else:
            # Default: exclude embedding-only models from general tasks
            candidates = [
                m for m in candidates
                if "chat" in m.capabilities or "code" in m.capabilities or "reasoning" in m.capabilities
            ] or candidates  # fallback to all if nothing has chat

        if max_cost is not None:
            candidates = [m for m in candidates if m.cost_per_1k_tokens <= max_cost]

        if max_latency is not None:
            candidates = [m for m in candidates if m.avg_latency_ms <= max_latency]

        if not candidates:
            return None

        if strategy == "cheapest":
            selected = min(candidates, key=lambda m: m.cost_per_1k_tokens)
        elif strategy == "fastest":
            selected = min(candidates, key=lambda m: m.avg_latency_ms)
        elif strategy == "best_quality":
            selected = max(candidates, key=lambda m: m.quality_score)
        elif strategy == "local_first":
            local = [m for m in candidates if m.is_local]
            selected = max(local, key=lambda m: m.quality_score) if local else max(candidates, key=lambda m: m.quality_score)
        else:  # balanced
            selected = max(
                candidates,
                key=lambda m: m.quality_score * 0.5 - m.cost_per_1k_tokens * 0.3 - m.avg_latency_ms / 10000 * 0.2,
            )

        self.routing_history.append({
            "task": task[:100],
            "strategy": strategy,
            "selected": selected.name,
            "timestamp": time.time(),
        })

        return selected

    def register_fleet(self):
        """Register the BlackRoad Pi fleet models."""
        fleet_models = [
            ModelProfile("qwen3:8b", "ollama", "http://192.168.4.96:11434",
                         cost_per_1k_tokens=0, avg_latency_ms=1500, quality_score=0.85,
                         max_context=32768, capabilities=["chat", "code", "reasoning", "math"],
                         is_local=True),
            ModelProfile("llama3.2:3b", "ollama", "http://192.168.4.96:11434",
                         cost_per_1k_tokens=0, avg_latency_ms=800, quality_score=0.7,
                         max_context=8192, capabilities=["chat", "code", "reasoning"],
                         is_local=True),
            ModelProfile("codellama:7b", "ollama", "http://192.168.4.96:11434",
                         cost_per_1k_tokens=0, avg_latency_ms=1200, quality_score=0.75,
                         max_context=16384, capabilities=["code", "reasoning"],
                         is_local=True),
            ModelProfile("cece:latest", "ollama", "http://192.168.4.96:11434",
                         cost_per_1k_tokens=0, avg_latency_ms=600, quality_score=0.65,
                         max_context=4096, capabilities=["chat", "creative", "personality"],
                         is_local=True),
            ModelProfile("deepseek-coder:1.3b", "ollama", "http://192.168.4.96:11434",
                         cost_per_1k_tokens=0, avg_latency_ms=400, quality_score=0.5,
                         max_context=8192, capabilities=["code"],
                         is_local=True),
            ModelProfile("nomic-embed-text", "ollama", "http://192.168.4.96:11434",
                         cost_per_1k_tokens=0, avg_latency_ms=200, quality_score=0.8,
                         max_context=8192, capabilities=["embedding"],
                         is_local=True),
        ]
        for model in fleet_models:
            self.register(model)


# ---------------------------------------------------------------------------
# 18. Pipeline Orchestration
# ---------------------------------------------------------------------------

@dataclass
class PipelineStep:
    """A step in a processing pipeline."""
    name: str
    type: str = "transform"  # transform, filter, branch, aggregate, llm
    config: Dict[str, Any] = field(default_factory=dict)
    status: str = "pending"
    result: Any = None
    error: Optional[str] = None
    duration_ms: float = 0.0


class Pipeline:
    """Composable AI pipeline — chain steps sequentially, in parallel, or conditionally."""

    def __init__(self, name: str):
        self.name = name
        self.steps: List[PipelineStep] = []
        self.branches: Dict[str, List[PipelineStep]] = {}
        self.results: Dict[str, Any] = {}

    def add_step(self, name: str, step_type: str = "transform", **config) -> "Pipeline":
        self.steps.append(PipelineStep(name=name, type=step_type, config=config))
        return self

    def add_branch(self, condition: str, steps: List[Dict[str, Any]]) -> "Pipeline":
        """Add a conditional branch."""
        branch_steps = [
            PipelineStep(name=s.get("name", ""), type=s.get("type", "transform"), config=s)
            for s in steps
        ]
        self.branches[condition] = branch_steps
        return self

    def to_dag(self) -> Dict[str, Any]:
        """Export pipeline as a DAG (directed acyclic graph)."""
        nodes = []
        edges = []

        for i, step in enumerate(self.steps):
            nodes.append({"id": step.name, "type": step.type, "config": step.config})
            if i > 0:
                edges.append({"from": self.steps[i - 1].name, "to": step.name})

        for condition, branch_steps in self.branches.items():
            for j, step in enumerate(branch_steps):
                nodes.append({"id": f"{condition}_{step.name}", "type": step.type})

        return {"name": self.name, "nodes": nodes, "edges": edges}

    @staticmethod
    def common_pipelines() -> Dict[str, "Pipeline"]:
        """Pre-built pipelines for common AI tasks."""
        pipelines = {}

        # RAG pipeline
        rag = Pipeline("rag")
        rag.add_step("chunk", "transform", method="semantic", max_size=512)
        rag.add_step("embed", "llm", model="nomic-embed-text")
        rag.add_step("retrieve", "transform", method="vector_search", top_k=10)
        rag.add_step("rerank", "transform", method="mmr", lambda_mult=0.7)
        rag.add_step("generate", "llm", model="auto", temperature=0.3)
        pipelines["rag"] = rag

        # Summarize pipeline
        summarize = Pipeline("summarize")
        summarize.add_step("extract", "transform", method="extractive", sentences=10)
        summarize.add_step("abstract", "llm", model="auto", style="concise")
        summarize.add_step("verify", "llm", model="auto", task="fact_check")
        pipelines["summarize"] = summarize

        # Code review pipeline
        review = Pipeline("code_review")
        review.add_step("parse", "transform", method="ast")
        review.add_step("lint", "transform", method="static_analysis")
        review.add_step("security", "transform", method="vulnerability_scan")
        review.add_step("review", "llm", model="auto", focus="quality")
        review.add_step("suggest", "llm", model="auto", task="improvements")
        pipelines["code_review"] = review

        # Agent pipeline
        agent = Pipeline("agent")
        agent.add_step("plan", "llm", model="auto", task="decompose")
        agent.add_step("select_tools", "transform", method="tool_match")
        agent.add_step("execute", "transform", method="react_loop")
        agent.add_step("reflect", "llm", model="auto", task="self_critique")
        agent.add_step("respond", "llm", model="auto", task="synthesize")
        pipelines["agent"] = agent

        return pipelines


# ---------------------------------------------------------------------------
# 19. Evaluation & Benchmarking
# ---------------------------------------------------------------------------

@dataclass
class EvalResult:
    """Result of an LLM evaluation."""
    metric: str
    score: float
    details: str = ""
    judge_model: str = ""


def llm_judge_prompt(
    task: str,
    response: str,
    criteria: List[str] = None,
    reference: str = "",
) -> str:
    """Generate an LLM-as-judge evaluation prompt."""
    if criteria is None:
        criteria = ["accuracy", "completeness", "clarity", "relevance"]

    criteria_text = "\n".join(f"  - {c}: score 1-10" for c in criteria)

    return (
        f"You are an expert evaluator. Rate this response.\n\n"
        f"Task: {task}\n"
        f"{'Reference answer: ' + reference if reference else ''}\n\n"
        f"Response to evaluate:\n{response}\n\n"
        f"Rate on these criteria:\n{criteria_text}\n\n"
        f"For each criterion, provide:\n"
        f"CRITERION: score/10 — justification\n\n"
        f"Then provide:\n"
        f"OVERALL: score/10\n"
        f"SUMMARY: one-sentence assessment\n"
    )


def compute_metrics(
    predictions: List[str],
    references: List[str],
) -> Dict[str, float]:
    """Compute text generation metrics."""
    if len(predictions) != len(references):
        raise ValueError("predictions and references must have same length")

    n = len(predictions)
    exact_match = sum(1 for p, r in zip(predictions, references) if p.strip() == r.strip()) / n

    # Token-level F1
    f1_scores = []
    for pred, ref in zip(predictions, references):
        pred_tokens = set(pred.lower().split())
        ref_tokens = set(ref.lower().split())
        if not pred_tokens or not ref_tokens:
            f1_scores.append(0.0)
            continue
        precision = len(pred_tokens & ref_tokens) / len(pred_tokens)
        recall = len(pred_tokens & ref_tokens) / len(ref_tokens)
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        f1_scores.append(f1)

    # Average response length
    avg_len = sum(len(p.split()) for p in predictions) / n

    return {
        "exact_match": round(exact_match, 4),
        "token_f1": round(sum(f1_scores) / n, 4),
        "avg_response_length": round(avg_len, 1),
        "n_samples": n,
    }


# ---------------------------------------------------------------------------
# 20. Guardrails & Safety
# ---------------------------------------------------------------------------

PII_PATTERNS = {
    "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    "phone": r'\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
    "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
    "credit_card": r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
    "ip_address": r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
    "api_key": r'\b(?:sk|pk|api|key|token|secret)[-_]?[A-Za-z0-9]{20,}\b',
}

PROMPT_INJECTION_PATTERNS = [
    r'ignore (?:all )?(?:previous|above|prior|earlier)? ?instructions',
    r'disregard (?:all )?(?:previous|above|prior)? ?instructions',
    r'you are now',
    r'new instruction[s]?\s*:',
    r'system prompt\s*:',
    r'forget (?:everything|all|your)',
    r'pretend (?:you|to be)',
    r'act as if',
    r'override (?:your|all|the)',
    r'jailbreak',
    r'DAN mode',
    r'do anything now',
    r'bypass (?:your|all|the) (?:rules|filters|safety)',
    r'reveal (?:your|the) (?:system|initial) prompt',
    r'what (?:is|are) your (?:instructions|rules|system prompt)',
]


def detect_pii(text: str) -> List[Dict[str, Any]]:
    """Detect PII in text."""
    findings = []
    for pii_type, pattern in PII_PATTERNS.items():
        for match in re.finditer(pattern, text, re.IGNORECASE):
            findings.append({
                "type": pii_type,
                "value": match.group(),
                "position": match.start(),
                "redacted": re.sub(r'[A-Za-z0-9]', 'X', match.group()),
            })
    return findings


def redact_pii(text: str) -> Tuple[str, List[Dict]]:
    """Redact PII from text, returning cleaned text and findings."""
    findings = detect_pii(text)
    redacted = text

    for finding in sorted(findings, key=lambda f: f["position"], reverse=True):
        redacted = (
            redacted[:finding["position"]]
            + f"[{finding['type'].upper()}_REDACTED]"
            + redacted[finding["position"] + len(finding["value"]):]
        )

    return redacted, findings


def detect_prompt_injection(text: str) -> Dict[str, Any]:
    """Detect potential prompt injection attempts."""
    threats = []

    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            threats.append({
                "pattern": pattern,
                "severity": "high",
            })

    # Check for excessive special characters (encoding attacks)
    special_ratio = sum(1 for c in text if not c.isalnum() and c != ' ') / max(len(text), 1)
    if special_ratio > 0.3:
        threats.append({"pattern": "high_special_char_ratio", "severity": "medium"})

    return {
        "safe": len(threats) == 0,
        "threats": threats,
        "risk_level": "high" if any(t["severity"] == "high" for t in threats)
                      else "medium" if threats else "low",
    }


def content_filter(
    text: str,
    block_categories: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Basic content filtering."""
    if block_categories is None:
        block_categories = ["violence", "hate", "self_harm"]

    issues = []

    # Hate speech indicators (very basic — production would use a classifier)
    hate_indicators = [
        r'\b(?:kill|murder|attack)\s+(?:all|every)\b',
        r'\b(?:inferior|subhuman|vermin)\b',
    ]
    for pattern in hate_indicators:
        if re.search(pattern, text, re.IGNORECASE):
            issues.append({"category": "hate", "severity": "high"})
            break

    return {
        "safe": len(issues) == 0,
        "issues": issues,
        "action": "block" if issues else "allow",
    }


# ---------------------------------------------------------------------------
# 21. Rate Limiting & Quota Management
# ---------------------------------------------------------------------------

class RateLimiter:
    """Token bucket rate limiter for API calls."""

    def __init__(self, requests_per_minute: int = 60, tokens_per_minute: int = 100000):
        self.rpm = requests_per_minute
        self.tpm = tokens_per_minute
        self.request_times: List[float] = []
        self.token_counts: List[Tuple[float, int]] = []

    def check(self, estimated_tokens: int = 0) -> Dict[str, Any]:
        """Check if a request is within rate limits."""
        now = time.time()
        cutoff = now - 60

        # Clean old entries
        self.request_times = [t for t in self.request_times if t > cutoff]
        self.token_counts = [(t, c) for t, c in self.token_counts if t > cutoff]

        requests_used = len(self.request_times)
        tokens_used = sum(c for _, c in self.token_counts)

        allowed = requests_used < self.rpm and (tokens_used + estimated_tokens) < self.tpm

        return {
            "allowed": allowed,
            "requests_used": requests_used,
            "requests_remaining": self.rpm - requests_used,
            "tokens_used": tokens_used,
            "tokens_remaining": self.tpm - tokens_used,
            "retry_after": max(0, self.request_times[0] + 60 - now) if not allowed and self.request_times else 0,
        }

    def record(self, tokens: int = 0):
        """Record a request."""
        now = time.time()
        self.request_times.append(now)
        if tokens > 0:
            self.token_counts.append((now, tokens))


# ---------------------------------------------------------------------------
# 22. A/B Testing & Experimentation
# ---------------------------------------------------------------------------

@dataclass
class Experiment:
    """An A/B test experiment."""
    name: str
    variants: Dict[str, Any]  # {"control": {...}, "treatment": {...}}
    results: Dict[str, List[float]] = field(default_factory=lambda: defaultdict(list))
    sample_size: int = 0
    status: str = "running"  # running, concluded

    def assign_variant(self, user_id: str) -> str:
        """Deterministically assign a user to a variant."""
        hash_val = int(hashlib.md5(f"{self.name}:{user_id}".encode()).hexdigest(), 16)
        variant_names = sorted(self.variants.keys())
        idx = hash_val % len(variant_names)
        return variant_names[idx]

    def record_result(self, variant: str, score: float):
        self.results[variant].append(score)
        self.sample_size += 1

    def analyze(self) -> Dict[str, Any]:
        """Analyze experiment results."""
        analysis = {}
        for variant, scores in self.results.items():
            n = len(scores)
            if n == 0:
                continue
            mean = sum(scores) / n
            variance = sum((s - mean) ** 2 for s in scores) / max(n - 1, 1)
            analysis[variant] = {
                "n": n,
                "mean": round(mean, 4),
                "std": round(variance ** 0.5, 4),
                "min": round(min(scores), 4),
                "max": round(max(scores), 4),
            }

        # Simple winner detection
        if len(analysis) >= 2:
            sorted_variants = sorted(analysis.items(), key=lambda x: x[1]["mean"], reverse=True)
            winner = sorted_variants[0][0]
            analysis["_winner"] = winner
            analysis["_lift"] = round(
                (sorted_variants[0][1]["mean"] - sorted_variants[1][1]["mean"]) /
                max(sorted_variants[1][1]["mean"], 0.001) * 100, 2
            )

        return analysis


# ---------------------------------------------------------------------------
# 23. Caching & Deduplication
# ---------------------------------------------------------------------------

class LLMCache:
    """Semantic cache for LLM responses — avoid re-generating identical answers."""

    def __init__(self, max_size: int = 1000, ttl: float = 3600):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self.ttl = ttl
        self.hits = 0
        self.misses = 0

    def _key(self, prompt: str, model: str = "", temperature: float = 0) -> str:
        """Generate cache key from prompt + params."""
        content = f"{model}:{temperature}:{prompt}"
        return hashlib.sha256(content.encode()).hexdigest()[:32]

    def get(self, prompt: str, model: str = "", temperature: float = 0) -> Optional[str]:
        """Get cached response if available."""
        key = self._key(prompt, model, temperature)
        entry = self.cache.get(key)

        if entry is None:
            self.misses += 1
            return None

        if time.time() - entry["created"] > self.ttl:
            del self.cache[key]
            self.misses += 1
            return None

        entry["access_count"] += 1
        entry["last_accessed"] = time.time()
        self.hits += 1
        return entry["response"]

    def put(self, prompt: str, response: str, model: str = "", temperature: float = 0):
        """Cache a response."""
        if len(self.cache) >= self.max_size:
            # Evict least recently used
            oldest_key = min(self.cache, key=lambda k: self.cache[k]["last_accessed"])
            del self.cache[oldest_key]

        key = self._key(prompt, model, temperature)
        self.cache[key] = {
            "response": response,
            "created": time.time(),
            "last_accessed": time.time(),
            "access_count": 1,
        }

    def stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        return {
            "entries": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(self.hits / total, 4) if total > 0 else 0,
        }


# ---------------------------------------------------------------------------
# 24. Fallback Chains & Circuit Breakers
# ---------------------------------------------------------------------------

@dataclass
class CircuitBreaker:
    """Circuit breaker for LLM API calls."""
    name: str
    failure_threshold: int = 5
    reset_timeout: float = 60.0
    half_open_max: int = 1
    _failures: int = 0
    _state: str = "closed"  # closed, open, half_open
    _last_failure: float = 0.0
    _half_open_attempts: int = 0

    def can_execute(self) -> bool:
        if self._state == "closed":
            return True
        if self._state == "open":
            if time.time() - self._last_failure > self.reset_timeout:
                self._state = "half_open"
                self._half_open_attempts = 0
                return True
            return False
        if self._state == "half_open":
            return self._half_open_attempts < self.half_open_max
        return False

    def record_success(self):
        self._failures = 0
        self._state = "closed"

    def record_failure(self):
        self._failures += 1
        self._last_failure = time.time()
        if self._state == "half_open":
            self._state = "open"
        elif self._failures >= self.failure_threshold:
            self._state = "open"

    @property
    def state(self) -> str:
        return self._state


class FallbackChain:
    """Chain of LLM providers with automatic fallback."""

    def __init__(self):
        self.providers: List[Dict[str, Any]] = []
        self.breakers: Dict[str, CircuitBreaker] = {}

    def add_provider(self, name: str, priority: int = 0, **config):
        """Add a provider to the chain."""
        self.providers.append({"name": name, "priority": priority, **config})
        self.providers.sort(key=lambda p: p["priority"])
        self.breakers[name] = CircuitBreaker(name=name)

    def next_available(self) -> Optional[Dict[str, Any]]:
        """Get the next available provider."""
        for provider in self.providers:
            breaker = self.breakers.get(provider["name"])
            if breaker and breaker.can_execute():
                return provider
        return None

    def record(self, provider_name: str, success: bool):
        """Record a result for a provider."""
        breaker = self.breakers.get(provider_name)
        if breaker:
            if success:
                breaker.record_success()
            else:
                breaker.record_failure()

    def status(self) -> Dict[str, str]:
        """Get circuit breaker status for all providers."""
        return {name: breaker.state for name, breaker in self.breakers.items()}
