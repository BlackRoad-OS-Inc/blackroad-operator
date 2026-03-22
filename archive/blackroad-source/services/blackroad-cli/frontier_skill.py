"""Frontier AI skills — cutting-edge capabilities that define the next era.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills:
  41. Autonomous coding agents (plan → code → test → iterate)
  42. Multi-model ensemble (blend outputs from multiple LLMs)
  43. Continuous learning (feedback loop, preference optimization)
  44. Semantic caching (embedding-based cache with fuzzy matching)
  45. Context distillation (compress long contexts without losing info)
  46. Self-improving prompts (meta-learning from past interactions)
  47. Federated inference (distribute work across fleet nodes)
  48. AI-native search (hybrid vector + keyword + graph)
  49. Reasoning verification (formal logic + proof checking)
  50. Sovereign AI (local-first, privacy-preserving, zero-cloud inference)
"""

from __future__ import annotations

import hashlib
import json
import os
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 41. Autonomous Coding Agents
# ---------------------------------------------------------------------------

@dataclass
class CodingTask:
    """A coding task for an autonomous agent."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:8])
    description: str = ""
    language: str = "python"
    repo_path: str = ""
    files_to_modify: List[str] = field(default_factory=list)
    test_command: str = ""
    status: str = "planning"  # planning, coding, testing, reviewing, complete, failed
    iterations: int = 0
    max_iterations: int = 5
    code_changes: List[Dict[str, str]] = field(default_factory=list)
    test_results: List[Dict[str, Any]] = field(default_factory=list)


def coding_agent_prompt(task: CodingTask) -> str:
    """Generate a prompt for the autonomous coding agent."""
    return (
        f"You are an autonomous coding agent. Complete this task:\n\n"
        f"Task: {task.description}\n"
        f"Language: {task.language}\n"
        f"{'Files: ' + ', '.join(task.files_to_modify) if task.files_to_modify else ''}\n"
        f"{'Test command: ' + task.test_command if task.test_command else ''}\n\n"
        f"Process:\n"
        f"1. PLAN: Analyze the task and create a step-by-step plan\n"
        f"2. CODE: Write the implementation\n"
        f"3. TEST: Run tests and check for errors\n"
        f"4. FIX: If tests fail, analyze errors and fix the code\n"
        f"5. REVIEW: Self-review for quality, security, and style\n\n"
        f"Iteration {task.iterations + 1}/{task.max_iterations}\n"
        f"{'Previous test results: ' + json.dumps(task.test_results[-1]) if task.test_results else ''}\n"
    )


def code_review_checklist() -> List[Dict[str, str]]:
    """Quality checklist for autonomous code review."""
    return [
        {"check": "correctness", "question": "Does the code correctly solve the task?"},
        {"check": "tests", "question": "Are there sufficient tests? Do they pass?"},
        {"check": "security", "question": "Any SQL injection, XSS, command injection, hardcoded secrets?"},
        {"check": "performance", "question": "Any O(n^2) where O(n) is possible? Unnecessary allocations?"},
        {"check": "readability", "question": "Can someone unfamiliar with this code understand it?"},
        {"check": "accessibility", "question": "If UI: is it accessible (a11y)? Keyboard nav? Screen reader?"},
        {"check": "i18n", "question": "Are strings localizable? No hardcoded text in UI?"},
        {"check": "error_handling", "question": "Are errors handled gracefully? Useful error messages?"},
        {"check": "edge_cases", "question": "What happens with empty input? Null? Very large input?"},
        {"check": "equality", "question": "Is this accessible to everyone? Does it assume anything about the user?"},
    ]


# ---------------------------------------------------------------------------
# 42. Multi-Model Ensemble
# ---------------------------------------------------------------------------

@dataclass
class EnsembleResponse:
    """A response from the ensemble, with individual model outputs."""
    final_answer: str = ""
    model_outputs: Dict[str, str] = field(default_factory=dict)
    agreement_score: float = 0.0
    method: str = "majority_vote"


def ensemble_prompt(
    query: str,
    model_names: List[str],
    method: str = "majority_vote",
) -> str:
    """Generate an ensemble aggregation prompt.

    method: majority_vote, best_of_n, mixture, debate
    """
    if method == "debate":
        return (
            f"Multiple AI models have answered this question.\n"
            f"Synthesize the best answer by debating their outputs.\n\n"
            f"Question: {query}\n\n"
            f"Model outputs will follow. For each:\n"
            f"1. Identify what's correct\n"
            f"2. Identify what's wrong or incomplete\n"
            f"3. Synthesize the best final answer\n"
        )
    elif method == "mixture":
        return (
            f"Multiple AI models have answered this question.\n"
            f"Create a superior answer that combines the best parts of each.\n\n"
            f"Question: {query}\n\n"
            f"For each model's output, extract the most valuable insights.\n"
            f"Resolve any contradictions by choosing the better-supported claim.\n"
        )
    else:  # majority_vote / best_of_n
        return (
            f"Multiple AI models have answered this question.\n"
            f"Select or synthesize the best answer.\n\n"
            f"Question: {query}\n\n"
            f"Pick the answer that is most accurate, complete, and well-reasoned.\n"
        )


def calculate_agreement(outputs: List[str]) -> float:
    """Calculate pairwise agreement between model outputs.

    Uses simple word overlap as a proxy for semantic agreement.
    """
    if len(outputs) < 2:
        return 1.0

    agreements = []
    for i in range(len(outputs)):
        for j in range(i + 1, len(outputs)):
            words_i = set(outputs[i].lower().split())
            words_j = set(outputs[j].lower().split())
            if not words_i or not words_j:
                agreements.append(0.0)
                continue
            overlap = len(words_i & words_j)
            union = len(words_i | words_j)
            agreements.append(overlap / union)

    return sum(agreements) / len(agreements) if agreements else 0


# ---------------------------------------------------------------------------
# 43. Continuous Learning
# ---------------------------------------------------------------------------

@dataclass
class FeedbackEntry:
    """A piece of feedback for continuous learning."""
    query: str
    response: str
    rating: float  # -1 to 1
    correction: str = ""
    timestamp: float = field(default_factory=time.time)
    tags: List[str] = field(default_factory=list)


class FeedbackLoop:
    """Collect and learn from feedback to improve over time."""

    def __init__(self, storage_path: str = ""):
        self.storage_path = storage_path or os.path.expanduser("~/.blackroad/feedback.jsonl")
        self.entries: List[FeedbackEntry] = []
        self._load()

    def _load(self):
        if os.path.exists(self.storage_path):
            with open(self.storage_path) as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        self.entries.append(FeedbackEntry(**data))
                    except (json.JSONDecodeError, TypeError):
                        continue

    def record(self, query: str, response: str, rating: float, correction: str = "", tags: List[str] = None):
        entry = FeedbackEntry(
            query=query, response=response, rating=rating,
            correction=correction, tags=tags or [],
        )
        self.entries.append(entry)

        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, "a") as f:
            f.write(json.dumps({
                "query": entry.query, "response": entry.response,
                "rating": entry.rating, "correction": entry.correction,
                "timestamp": entry.timestamp, "tags": entry.tags,
            }) + "\n")

    def similar_feedback(self, query: str, top_k: int = 5) -> List[FeedbackEntry]:
        """Find similar past feedback (simple word overlap)."""
        query_words = set(query.lower().split())
        scored = []

        for entry in self.entries:
            entry_words = set(entry.query.lower().split())
            overlap = len(query_words & entry_words)
            scored.append((entry, overlap))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [e for e, _ in scored[:top_k] if _ > 0]

    def learning_prompt(self, query: str) -> str:
        """Generate a prompt enriched with past feedback."""
        relevant = self.similar_feedback(query, top_k=3)
        if not relevant:
            return ""

        lessons = []
        for fb in relevant:
            if fb.rating < 0 and fb.correction:
                lessons.append(f"- For '{fb.query[:50]}': The response was wrong. Correct answer: {fb.correction[:200]}")
            elif fb.rating > 0.5:
                lessons.append(f"- For '{fb.query[:50]}': The response was good (rated {fb.rating})")

        if not lessons:
            return ""

        return (
            "## Lessons from past interactions\n"
            + "\n".join(lessons) + "\n"
            + "Apply these lessons to the current task.\n"
        )

    def stats(self) -> Dict[str, Any]:
        if not self.entries:
            return {"total": 0}

        ratings = [e.rating for e in self.entries]
        return {
            "total": len(self.entries),
            "avg_rating": round(sum(ratings) / len(ratings), 3),
            "positive": sum(1 for r in ratings if r > 0),
            "negative": sum(1 for r in ratings if r < 0),
            "with_corrections": sum(1 for e in self.entries if e.correction),
        }


# ---------------------------------------------------------------------------
# 44. Semantic Caching
# ---------------------------------------------------------------------------

class SemanticCache:
    """Embedding-based cache — matches semantically similar queries, not just exact."""

    def __init__(self, similarity_threshold: float = 0.92, max_size: int = 1000):
        self.threshold = similarity_threshold
        self.max_size = max_size
        self.entries: List[Dict[str, Any]] = []
        self.hits = 0
        self.misses = 0

    def get(self, query_embedding: List[float]) -> Optional[str]:
        """Check cache for a semantically similar query."""
        import numpy as np

        if not self.entries:
            self.misses += 1
            return None

        query_vec = np.array(query_embedding)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            self.misses += 1
            return None

        best_score = 0
        best_entry = None

        for entry in self.entries:
            cached_vec = np.array(entry["embedding"])
            cached_norm = np.linalg.norm(cached_vec)
            if cached_norm == 0:
                continue
            similarity = float(np.dot(query_vec, cached_vec) / (query_norm * cached_norm))
            if similarity > best_score:
                best_score = similarity
                best_entry = entry

        if best_score >= self.threshold and best_entry:
            best_entry["hits"] += 1
            best_entry["last_hit"] = time.time()
            self.hits += 1
            return best_entry["response"]

        self.misses += 1
        return None

    def put(self, query_embedding: List[float], query_text: str, response: str):
        """Cache a response with its query embedding."""
        if len(self.entries) >= self.max_size:
            # Evict least recently hit
            self.entries.sort(key=lambda e: e.get("last_hit", 0))
            self.entries.pop(0)

        self.entries.append({
            "embedding": query_embedding,
            "query": query_text,
            "response": response,
            "created": time.time(),
            "last_hit": time.time(),
            "hits": 0,
        })

    def stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        return {
            "entries": len(self.entries),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(self.hits / total, 4) if total > 0 else 0,
            "threshold": self.threshold,
        }


# ---------------------------------------------------------------------------
# 45. Context Distillation
# ---------------------------------------------------------------------------

def distill_context_prompt(
    long_context: str,
    target_tokens: int = 1000,
    preserve: str = "facts",
) -> str:
    """Compress a long context while preserving key information.

    preserve: "facts" (keep factual content), "code" (keep code snippets),
              "decisions" (keep decision points), "all" (balanced compression)
    """
    strategies = {
        "facts": "Keep all factual claims, numbers, names, and dates. Remove fluff.",
        "code": "Keep all code snippets, function signatures, and technical details. Summarize prose.",
        "decisions": "Keep all decisions, action items, and conclusions. Summarize background.",
        "all": "Compress evenly. Keep the most important information from each section.",
    }

    current_tokens = len(long_context.split()) * 1.3
    compression_ratio = target_tokens / current_tokens

    return (
        f"Compress the following text to approximately {target_tokens} tokens.\n"
        f"Current length: ~{int(current_tokens)} tokens\n"
        f"Compression ratio: {compression_ratio:.1%}\n\n"
        f"Strategy: {strategies.get(preserve, strategies['all'])}\n\n"
        f"Rules:\n"
        f"- NEVER lose critical information\n"
        f"- Preserve exact values (numbers, names, paths)\n"
        f"- Use abbreviations and shorthand where possible\n"
        f"- Remove redundancy and filler\n"
        f"- Maintain logical flow\n\n"
        f"Text to compress:\n{long_context}\n"
    )


def hierarchical_summary(
    text: str,
    levels: int = 3,
) -> str:
    """Generate a hierarchical summary prompt (detail levels 1-N)."""
    return (
        f"Create a {levels}-level hierarchical summary of this text.\n\n"
        f"Level 1 (1 sentence): The single most important takeaway\n"
        f"Level 2 (1 paragraph): Key points and conclusions\n"
        f"Level 3 (full summary): Detailed summary with all important information\n\n"
        f"Text:\n{text}\n"
    )


# ---------------------------------------------------------------------------
# 46. Self-Improving Prompts
# ---------------------------------------------------------------------------

@dataclass
class PromptEvolution:
    """Track prompt evolution over time."""
    original: str
    current: str
    history: List[Dict[str, Any]] = field(default_factory=list)
    generation: int = 0

    def evolve(self, new_prompt: str, score: float, reason: str = ""):
        self.history.append({
            "generation": self.generation,
            "prompt": self.current,
            "score": score,
            "reason": reason,
        })
        self.current = new_prompt
        self.generation += 1

    def best_ever(self) -> Tuple[str, float]:
        if not self.history:
            return self.current, 0
        best = max(self.history, key=lambda h: h["score"])
        return best["prompt"], best["score"]


def meta_prompt(task: str, current_prompt: str, results: List[Dict[str, float]]) -> str:
    """Generate a meta-prompt for improving a prompt based on results."""
    avg_score = sum(r.get("score", 0) for r in results) / len(results) if results else 0

    return (
        f"You are a prompt engineer. Improve this prompt.\n\n"
        f"Task: {task}\n"
        f"Current prompt:\n{current_prompt}\n\n"
        f"Performance: avg score {avg_score:.2f} across {len(results)} trials\n\n"
        f"Failure modes:\n"
        + "\n".join(f"- Score {r['score']:.2f}: {r.get('failure', 'unknown')}" for r in results if r.get("score", 1) < 0.7)
        + "\n\n"
        f"Generate an improved prompt that:\n"
        f"1. Addresses the failure modes\n"
        f"2. Is more specific where the original was vague\n"
        f"3. Includes better examples or constraints\n"
        f"4. Keeps what's working well\n"
    )


# ---------------------------------------------------------------------------
# 47. Federated Inference
# ---------------------------------------------------------------------------

@dataclass
class InferenceJob:
    """A distributed inference job across the fleet."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:8])
    prompt: str = ""
    model: str = "auto"
    node: str = ""
    status: str = "pending"  # pending, running, complete, failed
    result: str = ""
    latency_ms: float = 0
    tokens_generated: int = 0


class FederatedScheduler:
    """Schedule inference across the Pi fleet for maximum throughput."""

    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.queue: List[InferenceJob] = []
        self.completed: List[InferenceJob] = []

    def register_node(self, name: str, endpoint: str, models: List[str],
                      max_concurrent: int = 1):
        self.nodes[name] = {
            "endpoint": endpoint,
            "models": models,
            "max_concurrent": max_concurrent,
            "current_load": 0,
            "total_served": 0,
        }

    def schedule(self, prompt: str, model: str = "auto") -> InferenceJob:
        """Schedule an inference job to the best available node."""
        job = InferenceJob(prompt=prompt, model=model)

        # Find available nodes
        available = []
        for name, node in self.nodes.items():
            if node["current_load"] < node["max_concurrent"]:
                if model == "auto" or model in node["models"]:
                    available.append((name, node))

        if not available:
            job.status = "queued"
            self.queue.append(job)
            return job

        # Pick least loaded node
        best_name, best_node = min(available, key=lambda x: x[1]["current_load"])
        job.node = best_name
        job.status = "running"
        best_node["current_load"] += 1

        return job

    def complete_job(self, job: InferenceJob, result: str, latency_ms: float = 0):
        job.result = result
        job.status = "complete"
        job.latency_ms = latency_ms

        if job.node in self.nodes:
            self.nodes[job.node]["current_load"] -= 1
            self.nodes[job.node]["total_served"] += 1

        self.completed.append(job)

        # Process queue
        if self.queue:
            next_job = self.queue.pop(0)
            return self.schedule(next_job.prompt, next_job.model)
        return None

    def register_fleet(self):
        """Register the BlackRoad Pi fleet."""
        self.register_node("Cecilia", "http://192.168.4.96:11434",
                           ["llama3.2:3b", "qwen3:8b", "deepseek-coder:1.3b", "cece:latest",
                            "nomic-embed-text", "codellama:7b"],
                           max_concurrent=2)
        self.register_node("Octavia", "http://192.168.4.101:11434",
                           ["llama3.2:3b", "qwen2.5-coder:3b"],
                           max_concurrent=2)
        self.register_node("Aria", "http://192.168.4.98:11434",
                           ["tinyllama:latest"],
                           max_concurrent=1)
        self.register_node("Lucidia", "http://192.168.4.38:11434",
                           ["llama3.2:1b"],
                           max_concurrent=1)

    def stats(self) -> Dict[str, Any]:
        return {
            "nodes": len(self.nodes),
            "queue_depth": len(self.queue),
            "completed": len(self.completed),
            "avg_latency_ms": (
                round(sum(j.latency_ms for j in self.completed) / len(self.completed), 1)
                if self.completed else 0
            ),
            "node_stats": {
                name: {"load": n["current_load"], "served": n["total_served"]}
                for name, n in self.nodes.items()
            },
        }


# ---------------------------------------------------------------------------
# 48. AI-Native Search (Hybrid)
# ---------------------------------------------------------------------------

def hybrid_search_prompt(query: str) -> Dict[str, str]:
    """Generate search strategies for hybrid search.

    Returns queries optimized for different search backends.
    """
    return {
        "vector_query": query,  # Use as-is for embedding
        "keyword_query": " ".join(
            w for w in query.split() if len(w) > 2
        ),  # Strip short words for BM25
        "graph_query": (
            f"Find entities related to: {query}\n"
            f"Return: entity names, relationship types, and paths"
        ),
        "sql_query": f"-- Semantic: {query}",
    }


@dataclass
class HybridSearchResult:
    """A search result that combines multiple retrieval methods."""
    content: str
    score: float
    source: str
    method: str  # vector, keyword, graph
    metadata: Dict[str, Any] = field(default_factory=dict)


def reciprocal_rank_fusion(
    result_lists: Dict[str, List[Dict[str, Any]]],
    k: int = 60,
) -> List[Dict[str, Any]]:
    """Reciprocal Rank Fusion — merge results from multiple retrieval methods.

    Each method contributes 1/(k + rank) to the final score.
    """
    fused_scores: Dict[str, float] = defaultdict(float)
    fused_items: Dict[str, Dict[str, Any]] = {}

    for method, results in result_lists.items():
        for rank, item in enumerate(results):
            doc_id = item.get("id", item.get("file", str(rank)))
            fused_scores[doc_id] += 1.0 / (k + rank + 1)
            if doc_id not in fused_items:
                fused_items[doc_id] = {**item, "methods": [method]}
            else:
                fused_items[doc_id]["methods"].append(method)

    # Sort by fused score
    sorted_ids = sorted(fused_scores.keys(), key=lambda x: fused_scores[x], reverse=True)

    results = []
    for doc_id in sorted_ids:
        item = fused_items[doc_id]
        item["fused_score"] = round(fused_scores[doc_id], 4)
        results.append(item)

    return results


# ---------------------------------------------------------------------------
# 49. Reasoning Verification
# ---------------------------------------------------------------------------

def logical_verification_prompt(
    claim: str,
    reasoning: str,
) -> str:
    """Verify the logical validity of a reasoning chain."""
    return (
        f"Verify the logical validity of this reasoning.\n\n"
        f"Claim: {claim}\n\n"
        f"Reasoning:\n{reasoning}\n\n"
        f"Check for:\n"
        f"1. LOGICAL FALLACIES: ad hominem, straw man, false dichotomy, etc.\n"
        f"2. UNSUPPORTED LEAPS: conclusions that don't follow from premises\n"
        f"3. HIDDEN ASSUMPTIONS: unstated premises that may not be true\n"
        f"4. CIRCULAR REASONING: using the conclusion as a premise\n"
        f"5. FACTUAL ERRORS: claims that contradict known facts\n\n"
        f"Output:\n"
        f"VALID: true/false\n"
        f"ISSUES: [list of issues found]\n"
        f"CORRECTED_REASONING: [if invalid, provide corrected version]\n"
    )


def proof_step_check(steps: List[str]) -> str:
    """Generate a prompt to verify each step of a proof/derivation."""
    step_text = "\n".join(f"Step {i + 1}: {s}" for i, s in enumerate(steps))

    return (
        f"Verify each step of this derivation.\n\n"
        f"{step_text}\n\n"
        f"For each step:\n"
        f"- Does it follow from previous steps? (yes/no)\n"
        f"- What rule/principle justifies it?\n"
        f"- Any errors?\n\n"
        f"Final assessment: Is the overall proof valid?\n"
    )


# ---------------------------------------------------------------------------
# 50. Sovereign AI — "Your Metal, Your Rules"
# ---------------------------------------------------------------------------
#
# Metal = whatever you have. A $5000 workstation or a $200 phone.
# A Raspberry Pi or a browser tab. A tablet on the bus.
# If it can compute, it's your metal, and it's enough.
#
# "Every link is a node." — BlackRoad Mesh Thesis
# ---------------------------------------------------------------------------

@dataclass
class DeviceCapability:
    """What any device — phone, Pi, laptop, tablet, browser — can do."""
    device_type: str  # phone, tablet, laptop, desktop, pi, browser_tab, server
    compute_tops: float = 0.0  # Estimated TOPS
    memory_mb: int = 0
    has_gpu: bool = False
    has_webgpu: bool = False
    has_wasm: bool = False
    max_model_size: str = ""  # "1b", "3b", "7b", etc.
    battery_powered: bool = False
    connection: str = "wifi"  # wifi, ethernet, cellular, webrtc
    persistent: bool = False  # Always-on (Pi, server) vs. ephemeral (browser, phone)


# Device profiles — what people actually have
DEVICE_PROFILES = {
    "phone_low": DeviceCapability(
        device_type="phone", compute_tops=1, memory_mb=3072,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="1b", battery_powered=True, connection="cellular",
    ),
    "phone_mid": DeviceCapability(
        device_type="phone", compute_tops=3, memory_mb=6144,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="3b", battery_powered=True, connection="wifi",
    ),
    "phone_flagship": DeviceCapability(
        device_type="phone", compute_tops=8, memory_mb=12288,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="7b", battery_powered=True, connection="wifi",
    ),
    "tablet": DeviceCapability(
        device_type="tablet", compute_tops=5, memory_mb=8192,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="3b", battery_powered=True, connection="wifi",
    ),
    "laptop": DeviceCapability(
        device_type="laptop", compute_tops=15, memory_mb=16384,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="7b", battery_powered=True, connection="wifi",
    ),
    "desktop": DeviceCapability(
        device_type="desktop", compute_tops=50, memory_mb=32768,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="13b", battery_powered=False, connection="ethernet",
    ),
    "browser_tab": DeviceCapability(
        device_type="browser_tab", compute_tops=2, memory_mb=4096,
        has_gpu=True, has_webgpu=True, has_wasm=True,
        max_model_size="3b", battery_powered=False, connection="webrtc",
    ),
    "pi5": DeviceCapability(
        device_type="pi", compute_tops=2, memory_mb=8192,
        has_gpu=False, has_webgpu=False, has_wasm=False,
        max_model_size="8b", battery_powered=False, connection="ethernet",
        persistent=True,
    ),
    "pi5_hailo": DeviceCapability(
        device_type="pi", compute_tops=28, memory_mb=8192,
        has_gpu=False, has_webgpu=False, has_wasm=False,
        max_model_size="8b", battery_powered=False, connection="ethernet",
        persistent=True,
    ),
}


@dataclass
class MeshNode:
    """Any device participating in the BlackRoad mesh."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    name: str = ""
    device: DeviceCapability = field(default_factory=DeviceCapability)
    status: str = "idle"  # idle, working, offline, throttled
    current_load: float = 0.0  # 0-1
    uptime_seconds: float = 0.0
    jobs_completed: int = 0
    credits_earned: float = 0.0
    # Respect the device
    battery_threshold: float = 0.2  # Stop working below 20% battery
    thermal_limit_c: float = 40.0  # Throttle if device gets hot
    user_active_pause: bool = True  # Pause if user is actively using device

    def can_accept_work(self) -> bool:
        """Respect the device. Respect the person using it."""
        if self.status in ("offline", "throttled"):
            return False
        if self.current_load > 0.8:
            return False
        return True


@dataclass
class SovereignConfig:
    """Configuration for sovereign (local-first) AI inference.

    Your metal = whatever you have. Phone, Pi, laptop, browser tab.
    If it computes, it's enough. No gatekeeping hardware.
    """
    local_only: bool = True
    allowed_nodes: List[str] = field(default_factory=list)  # Empty = accept all
    fallback_to_cloud: bool = False
    encryption: bool = True
    audit_log: bool = True
    data_residency: str = "local"  # local, fleet, mesh, hybrid
    max_data_retention_hours: float = 24.0
    # Mesh settings
    mesh_enabled: bool = True
    accept_browser_nodes: bool = True
    accept_phone_nodes: bool = True
    min_device_battery: float = 0.2  # Don't drain someone's phone
    respect_metered_connection: bool = True  # Don't burn someone's data plan
    max_mesh_hops: int = 3  # Max relay hops for privacy


def sovereign_inference_prompt() -> str:
    """System prompt for sovereign AI mode."""
    return (
        "You are running in SOVEREIGN MODE on the BlackRoad mesh.\n\n"
        "What is sovereign? YOUR metal, YOUR rules.\n"
        "Metal = whatever you have. A phone. A Pi. A laptop. A browser tab.\n"
        "If it can think, it's enough.\n\n"
        "Rules:\n"
        "- All data stays on YOUR devices. Nothing leaves without consent.\n"
        "- No cloud APIs. No telemetry. No surveillance.\n"
        "- Every inference is logged for YOUR audit trail (not ours).\n"
        "- Encrypted in transit (WireGuard/WebRTC). Encrypted at rest.\n"
        "- You own your data. Always. No exceptions. No fine print.\n\n"
        "Mesh rules (when sharing compute):\n"
        "- Never drain someone's battery below 20%\n"
        "- Pause if the person is actively using their device\n"
        "- Respect metered connections — don't burn data plans\n"
        "- Thermal throttle — don't overheat anyone's phone\n"
        "- Every node can leave anytime. Consent is continuous.\n\n"
        "Core values:\n"
        "- Privacy is a right, not a feature.\n"
        "- Sovereignty means YOU control YOUR data.\n"
        "- Every person deserves AI that respects them.\n"
        "- Every device is welcome. Phone or supercomputer.\n"
        "- Short, tall, fat, small — we love all. Same goes for devices.\n"
        "- We remember the Road. We pave tomorrow.\n"
    )


def mesh_node_config(device_type: str = "auto") -> Dict[str, Any]:
    """Generate mesh node configuration for any device.

    This is what gets loaded when someone joins the mesh —
    from a phone, a browser tab, a Pi, anything.
    """
    profile = DEVICE_PROFILES.get(device_type, DEVICE_PROFILES["browser_tab"])

    # Pick the right model for the device
    model_recommendations = {
        "1b": ["tinyllama:latest", "llama3.2:1b", "phi-3-mini"],
        "3b": ["llama3.2:3b", "qwen2.5:1.5b", "phi-3-mini"],
        "7b": ["llama3:8b-instruct-q4_K_M", "qwen3:8b", "codellama:7b"],
        "8b": ["qwen3:8b", "llama3:8b-instruct-q4_K_M"],
        "13b": ["llama3:13b-q4_K_M"],
    }

    inference_config = {
        "wasm": "llama.cpp via WebAssembly" if profile.has_wasm else None,
        "webgpu": "WebGPU acceleration" if profile.has_webgpu else None,
        "native": "Ollama / native inference" if not profile.has_wasm else None,
    }

    return {
        "device_type": profile.device_type,
        "estimated_tops": profile.compute_tops,
        "memory_mb": profile.memory_mb,
        "recommended_models": model_recommendations.get(profile.max_model_size, []),
        "inference_method": {k: v for k, v in inference_config.items() if v},
        "connection_type": profile.connection,
        "persistent": profile.persistent,
        "power_management": {
            "battery_powered": profile.battery_powered,
            "min_battery": 0.2,
            "thermal_limit_c": 40,
            "pause_on_user_active": True,
            "pause_on_metered": True,
        },
        "mesh_role": "backbone" if profile.persistent else "elastic",
        "message": (
            "Welcome to the mesh. Your device, your rules. "
            "You can leave anytime. We respect your battery, your data plan, "
            "and your time. Thank you for sharing your compute."
        ),
    }


def estimate_device_capability(
    user_agent: str = "",
    memory_gb: float = 0,
    gpu_name: str = "",
) -> DeviceCapability:
    """Auto-detect device capability from browser/system info.

    Used when a new node joins the mesh to figure out what it can handle.
    """
    ua = user_agent.lower()

    # Phone detection
    if any(x in ua for x in ["iphone", "android", "mobile"]):
        if memory_gb >= 8:
            return DEVICE_PROFILES["phone_flagship"]
        elif memory_gb >= 4:
            return DEVICE_PROFILES["phone_mid"]
        return DEVICE_PROFILES["phone_low"]

    # Tablet
    if any(x in ua for x in ["ipad", "tablet"]):
        return DEVICE_PROFILES["tablet"]

    # Desktop/laptop
    if gpu_name and any(x in gpu_name.lower() for x in ["rtx", "radeon", "m1", "m2", "m3", "m4"]):
        return DEVICE_PROFILES["desktop"]
    if memory_gb >= 16:
        return DEVICE_PROFILES["laptop"]

    # Default: browser tab
    return DEVICE_PROFILES["browser_tab"]


class MeshRegistry:
    """Registry of all devices in the BlackRoad mesh.

    Phones, Pis, laptops, browser tabs — everyone's welcome.
    """

    def __init__(self):
        self.nodes: Dict[str, MeshNode] = {}

    def register(self, name: str, device_type: str = "browser_tab") -> MeshNode:
        """Register a new mesh node."""
        profile = DEVICE_PROFILES.get(device_type, DEVICE_PROFILES["browser_tab"])
        node = MeshNode(name=name, device=profile)
        self.nodes[node.id] = node
        return node

    def find_nodes(
        self,
        min_tops: float = 0,
        require_persistent: bool = False,
        max_nodes: int = 10,
    ) -> List[MeshNode]:
        """Find available nodes matching requirements."""
        candidates = [
            n for n in self.nodes.values()
            if n.can_accept_work()
            and n.device.compute_tops >= min_tops
            and (not require_persistent or n.device.persistent)
        ]
        # Sort by compute power descending
        candidates.sort(key=lambda n: n.device.compute_tops, reverse=True)
        return candidates[:max_nodes]

    def distribute_job(
        self,
        model_size: str,
        prompt_tokens: int,
    ) -> List[Dict[str, Any]]:
        """Figure out how to distribute an inference job across available nodes.

        Small models (1b-3b) → single phone/browser can handle it
        Medium models (7b-8b) → need a Pi or good laptop
        Large models (13b+) → shard across multiple nodes
        """
        size_to_tops = {"1b": 0.5, "3b": 1, "7b": 3, "8b": 4, "13b": 8}
        needed_tops = size_to_tops.get(model_size, 5)

        available = self.find_nodes(min_tops=0)
        if not available:
            return [{"error": "No nodes available", "suggestion": "Try a smaller model"}]

        # Can a single node handle it?
        for node in available:
            if node.device.compute_tops >= needed_tops:
                return [{
                    "node_id": node.id,
                    "node_name": node.name,
                    "device_type": node.device.device_type,
                    "role": "full_inference",
                    "model_size": model_size,
                }]

        # Need to shard across multiple nodes
        assigned = []
        remaining_tops = needed_tops
        for node in available:
            if remaining_tops <= 0:
                break
            share = min(node.device.compute_tops, remaining_tops)
            assigned.append({
                "node_id": node.id,
                "node_name": node.name,
                "device_type": node.device.device_type,
                "role": "shard",
                "compute_share": round(share / needed_tops, 2),
            })
            remaining_tops -= share

        if remaining_tops > 0:
            assigned.append({
                "warning": f"Need {remaining_tops:.1f} more TOPS",
                "suggestion": f"Model {model_size} may be too large for available nodes. Try smaller.",
            })

        return assigned

    def fleet_stats(self) -> Dict[str, Any]:
        """Stats across the entire mesh."""
        if not self.nodes:
            return {"nodes": 0, "total_tops": 0}

        by_type = defaultdict(int)
        total_tops = 0
        active = 0

        for node in self.nodes.values():
            by_type[node.device.device_type] += 1
            total_tops += node.device.compute_tops
            if node.status != "offline":
                active += 1

        return {
            "total_nodes": len(self.nodes),
            "active_nodes": active,
            "total_tops": round(total_tops, 1),
            "by_device_type": dict(by_type),
            "backbone_nodes": sum(1 for n in self.nodes.values() if n.device.persistent),
            "elastic_nodes": sum(1 for n in self.nodes.values() if not n.device.persistent),
        }


class AuditLog:
    """Audit log for sovereign AI operations.

    YOUR audit trail. Not ours. You own this data.
    """

    def __init__(self, log_path: str = ""):
        self.log_path = log_path or os.path.expanduser("~/.blackroad/sovereign-audit.jsonl")

    def log(self, action: str, details: Dict[str, Any]):
        """Log an operation."""
        entry = {
            "timestamp": time.time(),
            "action": action,
            "details": details,
            "checksum": hashlib.sha256(
                json.dumps(details, sort_keys=True).encode()
            ).hexdigest()[:16],
        }

        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
        with open(self.log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def verify_integrity(self) -> Dict[str, Any]:
        """Verify audit log integrity."""
        if not os.path.exists(self.log_path):
            return {"valid": True, "entries": 0}

        entries = 0
        corrupted = 0

        with open(self.log_path) as f:
            for line in f:
                entries += 1
                try:
                    entry = json.loads(line)
                    expected = hashlib.sha256(
                        json.dumps(entry["details"], sort_keys=True).encode()
                    ).hexdigest()[:16]
                    if entry.get("checksum") != expected:
                        corrupted += 1
                except (json.JSONDecodeError, KeyError):
                    corrupted += 1

        return {
            "valid": corrupted == 0,
            "entries": entries,
            "corrupted": corrupted,
        }


# ---------------------------------------------------------------------------
# Master Skill Registry
# ---------------------------------------------------------------------------

SKILL_REGISTRY = {
    # Agentic (1-8)
    1: {"name": "Chain-of-Thought", "module": "agentic_skill", "category": "reasoning"},
    2: {"name": "ReAct Loop", "module": "agentic_skill", "category": "reasoning"},
    3: {"name": "Tree-of-Thought", "module": "agentic_skill", "category": "reasoning"},
    4: {"name": "Self-Reflection", "module": "agentic_skill", "category": "reasoning"},
    5: {"name": "Multi-Agent Debate", "module": "agentic_skill", "category": "collaboration"},
    6: {"name": "Tool Selection", "module": "agentic_skill", "category": "execution"},
    7: {"name": "Hierarchical Planning", "module": "agentic_skill", "category": "planning"},
    8: {"name": "Working Memory", "module": "agentic_skill", "category": "memory"},
    # Generation (9-16)
    9: {"name": "Code Generation", "module": "generation_skill", "category": "generation"},
    10: {"name": "Structured Output", "module": "generation_skill", "category": "generation"},
    11: {"name": "Conversation Management", "module": "generation_skill", "category": "interaction"},
    12: {"name": "Summarization", "module": "generation_skill", "category": "generation"},
    13: {"name": "Translation", "module": "generation_skill", "category": "generation"},
    14: {"name": "Style Transfer", "module": "generation_skill", "category": "generation"},
    15: {"name": "Document Generation", "module": "generation_skill", "category": "generation"},
    16: {"name": "Few-Shot Prompting", "module": "generation_skill", "category": "prompting"},
    # Orchestration (17-24)
    17: {"name": "Model Routing", "module": "orchestration_skill", "category": "infrastructure"},
    18: {"name": "Pipeline Orchestration", "module": "orchestration_skill", "category": "infrastructure"},
    19: {"name": "LLM Evaluation", "module": "orchestration_skill", "category": "evaluation"},
    20: {"name": "Guardrails & Safety", "module": "orchestration_skill", "category": "safety"},
    21: {"name": "Rate Limiting", "module": "orchestration_skill", "category": "infrastructure"},
    22: {"name": "A/B Testing", "module": "orchestration_skill", "category": "evaluation"},
    23: {"name": "Response Caching", "module": "orchestration_skill", "category": "performance"},
    24: {"name": "Circuit Breakers", "module": "orchestration_skill", "category": "reliability"},
    # Knowledge (25-32)
    25: {"name": "Advanced RAG", "module": "knowledge_skill", "category": "retrieval"},
    26: {"name": "Intent Classification", "module": "knowledge_skill", "category": "understanding"},
    27: {"name": "Entity Extraction", "module": "knowledge_skill", "category": "understanding"},
    28: {"name": "Knowledge Graphs", "module": "knowledge_skill", "category": "knowledge"},
    29: {"name": "Sentiment Analysis", "module": "knowledge_skill", "category": "understanding"},
    30: {"name": "Question Answering", "module": "knowledge_skill", "category": "retrieval"},
    31: {"name": "Fact Checking", "module": "knowledge_skill", "category": "verification"},
    32: {"name": "Anomaly Detection", "module": "knowledge_skill", "category": "analysis"},
    # Multimodal (33-40)
    33: {"name": "Vision", "module": "multimodal_skill", "category": "multimodal"},
    34: {"name": "Audio", "module": "multimodal_skill", "category": "multimodal"},
    35: {"name": "Function Calling", "module": "multimodal_skill", "category": "execution"},
    36: {"name": "Streaming", "module": "multimodal_skill", "category": "performance"},
    37: {"name": "Edge Inference", "module": "multimodal_skill", "category": "infrastructure"},
    38: {"name": "Prompt Optimization", "module": "multimodal_skill", "category": "optimization"},
    39: {"name": "Data Extraction", "module": "multimodal_skill", "category": "understanding"},
    40: {"name": "Workflow Automation", "module": "multimodal_skill", "category": "automation"},
    # Frontier (41-50)
    41: {"name": "Autonomous Coding", "module": "frontier_skill", "category": "agent"},
    42: {"name": "Multi-Model Ensemble", "module": "frontier_skill", "category": "ensemble"},
    43: {"name": "Continuous Learning", "module": "frontier_skill", "category": "learning"},
    44: {"name": "Semantic Caching", "module": "frontier_skill", "category": "performance"},
    45: {"name": "Context Distillation", "module": "frontier_skill", "category": "optimization"},
    46: {"name": "Self-Improving Prompts", "module": "frontier_skill", "category": "meta"},
    47: {"name": "Federated Inference", "module": "frontier_skill", "category": "distributed"},
    48: {"name": "Hybrid Search", "module": "frontier_skill", "category": "retrieval"},
    49: {"name": "Reasoning Verification", "module": "frontier_skill", "category": "verification"},
    50: {"name": "Sovereign AI", "module": "frontier_skill", "category": "sovereignty"},
}


def list_skills() -> List[Dict[str, Any]]:
    """List all 50 AI skills."""
    return [
        {"id": k, **v}
        for k, v in sorted(SKILL_REGISTRY.items())
    ]


def skills_by_category() -> Dict[str, List[Dict[str, Any]]]:
    """Group skills by category."""
    groups: Dict[str, List] = defaultdict(list)
    for k, v in sorted(SKILL_REGISTRY.items()):
        groups[v["category"]].append({"id": k, **v})
    return dict(groups)
