"""Agentic AI skills — autonomous reasoning, planning, and tool use.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills:
  1. Chain-of-Thought (CoT) reasoning with verification
  2. ReAct (Reason + Act) loop
  3. Tree-of-Thought branching exploration
  4. Reflection & self-correction
  5. Multi-agent debate & consensus
  6. Autonomous tool selection & execution
  7. Goal decomposition & planning (HTP)
  8. Memory-augmented reasoning (working + long-term)
"""

from __future__ import annotations

import hashlib
import json
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 1. Chain-of-Thought (CoT)
# ---------------------------------------------------------------------------

@dataclass
class ThoughtStep:
    """A single step in a chain of thought."""
    step: int
    reasoning: str
    conclusion: str
    confidence: float = 1.0
    evidence: List[str] = field(default_factory=list)


def chain_of_thought(
    question: str,
    context: str = "",
    max_steps: int = 10,
) -> Dict[str, Any]:
    """Structure a chain-of-thought reasoning template.

    Returns a CoT scaffold that an LLM fills in step by step.
    """
    return {
        "method": "chain_of_thought",
        "prompt": (
            f"Think through this step by step.\n\n"
            f"Question: {question}\n"
            f"{'Context: ' + context if context else ''}\n\n"
            f"For each step:\n"
            f"1. State your reasoning clearly\n"
            f"2. Cite specific evidence\n"
            f"3. Rate your confidence (0-1)\n"
            f"4. Draw a conclusion before moving to the next step\n\n"
            f"Maximum {max_steps} steps. Stop when you reach a final answer.\n"
            f"Format each step as:\n"
            f"STEP N:\n"
            f"REASONING: ...\n"
            f"EVIDENCE: ...\n"
            f"CONFIDENCE: 0.X\n"
            f"CONCLUSION: ...\n"
        ),
        "max_steps": max_steps,
        "verification": (
            "Now verify your final answer:\n"
            "1. Check each step for logical errors\n"
            "2. Look for assumptions you didn't validate\n"
            "3. Consider alternative explanations\n"
            "4. State your final confidence level\n"
        ),
    }


def verify_chain(steps: List[ThoughtStep]) -> Dict[str, Any]:
    """Verify a chain of thought for logical consistency."""
    issues = []

    for i, step in enumerate(steps):
        if step.confidence < 0.3:
            issues.append(f"Step {step.step}: Low confidence ({step.confidence})")
        if not step.evidence:
            issues.append(f"Step {step.step}: No evidence cited")
        if i > 0 and step.confidence > steps[i - 1].confidence + 0.5:
            issues.append(f"Step {step.step}: Suspicious confidence jump")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "avg_confidence": sum(s.confidence for s in steps) / len(steps) if steps else 0,
    }


# ---------------------------------------------------------------------------
# 2. ReAct (Reason + Act)
# ---------------------------------------------------------------------------

@dataclass
class ReActStep:
    """A single Reason-Act-Observe cycle."""
    thought: str
    action: str
    action_input: Any
    observation: str = ""
    timestamp: float = field(default_factory=time.time)


@dataclass
class ReActLoop:
    """A full ReAct reasoning loop."""
    goal: str
    steps: List[ReActStep] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    max_iterations: int = 15
    status: str = "running"
    final_answer: str = ""

    def add_step(self, thought: str, action: str, action_input: Any) -> ReActStep:
        step = ReActStep(thought=thought, action=action, action_input=action_input)
        self.steps.append(step)
        return step

    def observe(self, observation: str):
        if self.steps:
            self.steps[-1].observation = observation

    def finish(self, answer: str):
        self.status = "complete"
        self.final_answer = answer

    def should_stop(self) -> bool:
        return len(self.steps) >= self.max_iterations or self.status == "complete"


def react_prompt(goal: str, tools: List[Dict[str, str]]) -> str:
    """Generate a ReAct prompt with available tools.

    tools: [{"name": "search", "description": "Search the web", "usage": "search(query)"}]
    """
    tool_descriptions = "\n".join(
        f"  - {t['name']}: {t['description']} | Usage: {t['usage']}"
        for t in tools
    )

    return (
        f"You have access to these tools:\n{tool_descriptions}\n\n"
        f"Goal: {goal}\n\n"
        f"Use this exact format for each step:\n"
        f"THOUGHT: Analyze what you know and what you need to do next\n"
        f"ACTION: tool_name\n"
        f"ACTION_INPUT: the input to the tool\n"
        f"OBSERVATION: (filled in by the system)\n\n"
        f"When you have the final answer:\n"
        f"THOUGHT: I now have enough information\n"
        f"FINAL_ANSWER: your answer here\n"
    )


# ---------------------------------------------------------------------------
# 3. Tree-of-Thought
# ---------------------------------------------------------------------------

@dataclass
class ThoughtNode:
    """A node in a tree of thoughts."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:8])
    content: str = ""
    parent_id: Optional[str] = None
    children: List[str] = field(default_factory=list)
    score: float = 0.0
    depth: int = 0
    pruned: bool = False


class ThoughtTree:
    """Tree-of-Thought exploration for complex reasoning."""

    def __init__(self, question: str, breadth: int = 3, max_depth: int = 4):
        self.question = question
        self.breadth = breadth
        self.max_depth = max_depth
        self.nodes: Dict[str, ThoughtNode] = {}
        root = ThoughtNode(content=question, depth=0)
        self.nodes[root.id] = root
        self.root_id = root.id

    def expand(self, node_id: str, thoughts: List[str]) -> List[str]:
        """Expand a node with multiple thought branches."""
        parent = self.nodes[node_id]
        new_ids = []

        for thought in thoughts[:self.breadth]:
            child = ThoughtNode(
                content=thought,
                parent_id=node_id,
                depth=parent.depth + 1,
            )
            self.nodes[child.id] = child
            parent.children.append(child.id)
            new_ids.append(child.id)

        return new_ids

    def score_node(self, node_id: str, score: float):
        """Score a thought node (0-1)."""
        self.nodes[node_id].score = score

    def prune(self, keep_top_n: int = 2):
        """Prune low-scoring branches at each depth level."""
        by_depth: Dict[int, List[ThoughtNode]] = {}
        for node in self.nodes.values():
            by_depth.setdefault(node.depth, []).append(node)

        for depth, nodes in by_depth.items():
            if depth == 0:
                continue
            sorted_nodes = sorted(nodes, key=lambda n: n.score, reverse=True)
            for node in sorted_nodes[keep_top_n:]:
                node.pruned = True

    def best_path(self) -> List[ThoughtNode]:
        """Get the highest-scoring path from root to leaf."""
        leaves = [n for n in self.nodes.values() if not n.children and not n.pruned]
        if not leaves:
            return []

        best_leaf = max(leaves, key=lambda n: n.score)
        path = []
        current = best_leaf

        while current:
            path.append(current)
            current = self.nodes.get(current.parent_id) if current.parent_id else None

        return list(reversed(path))

    def to_prompt(self) -> str:
        """Generate a Tree-of-Thought exploration prompt."""
        return (
            f"Problem: {self.question}\n\n"
            f"Explore {self.breadth} different approaches at each step.\n"
            f"For each approach, evaluate:\n"
            f"  1. Is this logically sound? (score 0-1)\n"
            f"  2. Does this make progress toward the answer?\n"
            f"  3. Are there any dead ends?\n\n"
            f"Prune weak branches and go deeper on strong ones.\n"
            f"Maximum depth: {self.max_depth} levels.\n"
        )


# ---------------------------------------------------------------------------
# 4. Reflection & Self-Correction
# ---------------------------------------------------------------------------

def reflection_prompt(
    task: str,
    attempt: str,
    feedback: str = "",
) -> str:
    """Generate a self-reflection prompt for improving an answer."""
    return (
        f"Task: {task}\n\n"
        f"Your previous attempt:\n{attempt}\n\n"
        f"{'Feedback: ' + feedback if feedback else ''}\n\n"
        f"Reflect on your attempt:\n"
        f"1. What did you get right?\n"
        f"2. What mistakes or gaps exist?\n"
        f"3. What would you do differently?\n"
        f"4. Generate an improved version.\n\n"
        f"Be specific about each change and why it's better.\n"
    )


@dataclass
class ReflectionCycle:
    """Track iterative reflection cycles."""
    task: str
    attempts: List[Dict[str, Any]] = field(default_factory=list)
    max_cycles: int = 3

    def add_attempt(self, response: str, score: float, critique: str = ""):
        self.attempts.append({
            "response": response,
            "score": score,
            "critique": critique,
            "cycle": len(self.attempts) + 1,
        })

    def should_continue(self) -> bool:
        if len(self.attempts) >= self.max_cycles:
            return False
        if self.attempts and self.attempts[-1]["score"] > 0.9:
            return False
        return True

    def improvement_trend(self) -> List[float]:
        return [a["score"] for a in self.attempts]


# ---------------------------------------------------------------------------
# 5. Multi-Agent Debate & Consensus
# ---------------------------------------------------------------------------

@dataclass
class DebateAgent:
    """An agent participating in a debate."""
    name: str
    role: str
    position: str = ""
    arguments: List[str] = field(default_factory=list)
    confidence: float = 0.5


@dataclass
class Debate:
    """Multi-agent debate for reaching consensus on complex questions."""
    question: str
    agents: List[DebateAgent] = field(default_factory=list)
    rounds: List[Dict[str, Any]] = field(default_factory=list)
    consensus: Optional[str] = None
    consensus_confidence: float = 0.0

    def add_agent(self, name: str, role: str) -> DebateAgent:
        agent = DebateAgent(name=name, role=role)
        self.agents.append(agent)
        return agent

    def debate_round(self, statements: Dict[str, str]):
        """Record a debate round. statements = {agent_name: statement}"""
        self.rounds.append({
            "round": len(self.rounds) + 1,
            "statements": statements,
            "timestamp": time.time(),
        })

    def reach_consensus(self, answer: str, confidence: float):
        self.consensus = answer
        self.consensus_confidence = confidence


def debate_prompt(
    question: str,
    roles: List[Dict[str, str]],
    num_rounds: int = 3,
) -> str:
    """Generate a multi-agent debate prompt.

    roles: [{"name": "Advocate", "perspective": "argues for"}, ...]
    """
    role_desc = "\n".join(
        f"  - {r['name']}: {r['perspective']}"
        for r in roles
    )

    return (
        f"Question: {question}\n\n"
        f"This will be a {num_rounds}-round debate between:\n{role_desc}\n\n"
        f"Each round:\n"
        f"1. Each agent states their position with evidence\n"
        f"2. Agents respond to each other's arguments\n"
        f"3. Agents update their confidence levels\n\n"
        f"After {num_rounds} rounds, synthesize the strongest arguments\n"
        f"into a consensus answer with a confidence score.\n"
    )


# ---------------------------------------------------------------------------
# 6. Tool Selection & Execution
# ---------------------------------------------------------------------------

@dataclass
class Tool:
    """A tool available to an agent."""
    name: str
    description: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    required_params: List[str] = field(default_factory=list)
    category: str = "general"
    cost: float = 0.0  # Estimated cost/latency


class ToolRegistry:
    """Registry of available tools with intelligent selection."""

    def __init__(self):
        self.tools: Dict[str, Tool] = {}
        self.usage_history: List[Dict[str, Any]] = []

    def register(self, tool: Tool):
        self.tools[tool.name] = tool

    def select_tools(
        self,
        task_description: str,
        max_tools: int = 5,
        category: Optional[str] = None,
    ) -> List[Tool]:
        """Select relevant tools for a task based on description matching."""
        candidates = list(self.tools.values())
        if category:
            candidates = [t for t in candidates if t.category == category]

        scored = []
        task_words = set(task_description.lower().split())

        for tool in candidates:
            desc_words = set(tool.description.lower().split())
            overlap = len(task_words & desc_words)
            name_bonus = 2 if tool.name.lower() in task_description.lower() else 0
            scored.append((tool, overlap + name_bonus))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [t for t, _ in scored[:max_tools]]

    def log_usage(self, tool_name: str, success: bool, latency: float = 0):
        self.usage_history.append({
            "tool": tool_name,
            "success": success,
            "latency": latency,
            "timestamp": time.time(),
        })

    def tool_prompt(self) -> str:
        """Generate a tool description prompt for LLMs."""
        lines = ["Available tools:\n"]
        for tool in self.tools.values():
            params = ", ".join(
                f"{k}: {v}" for k, v in tool.parameters.items()
            )
            lines.append(f"  {tool.name}({params})")
            lines.append(f"    {tool.description}")
            if tool.required_params:
                lines.append(f"    Required: {', '.join(tool.required_params)}")
            lines.append("")
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# 7. Hierarchical Task Planning (HTP)
# ---------------------------------------------------------------------------

@dataclass
class TaskNode:
    """A task in a hierarchical plan."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:8])
    description: str = ""
    parent_id: Optional[str] = None
    subtasks: List[str] = field(default_factory=list)
    status: str = "pending"  # pending, in_progress, complete, failed, blocked
    dependencies: List[str] = field(default_factory=list)
    assigned_to: str = ""
    priority: int = 0  # 0=highest
    estimated_effort: str = ""
    result: str = ""


class HierarchicalPlanner:
    """Hierarchical Task Planning — decompose goals into executable steps."""

    def __init__(self, goal: str):
        self.goal = goal
        self.tasks: Dict[str, TaskNode] = {}
        root = TaskNode(description=goal, priority=0)
        self.tasks[root.id] = root
        self.root_id = root.id

    def decompose(self, task_id: str, subtasks: List[str]) -> List[str]:
        """Break a task into subtasks."""
        parent = self.tasks[task_id]
        new_ids = []

        for i, desc in enumerate(subtasks):
            child = TaskNode(
                description=desc,
                parent_id=task_id,
                priority=parent.priority + 1,
            )
            self.tasks[child.id] = child
            parent.subtasks.append(child.id)
            new_ids.append(child.id)

        return new_ids

    def add_dependency(self, task_id: str, depends_on: str):
        """Add a dependency between tasks."""
        self.tasks[task_id].dependencies.append(depends_on)

    def next_executable(self) -> List[TaskNode]:
        """Get tasks that are ready to execute (all deps met)."""
        ready = []
        for task in self.tasks.values():
            if task.status != "pending":
                continue
            if task.subtasks:
                continue  # Has children, not a leaf
            deps_met = all(
                self.tasks[d].status == "complete"
                for d in task.dependencies
                if d in self.tasks
            )
            if deps_met:
                ready.append(task)
        return sorted(ready, key=lambda t: t.priority)

    def complete(self, task_id: str, result: str = ""):
        """Mark a task complete and propagate up."""
        task = self.tasks[task_id]
        task.status = "complete"
        task.result = result

        if task.parent_id and task.parent_id in self.tasks:
            parent = self.tasks[task.parent_id]
            if all(
                self.tasks[s].status == "complete"
                for s in parent.subtasks
            ):
                parent.status = "complete"

    def progress(self) -> Dict[str, Any]:
        """Get planning progress."""
        total = len(self.tasks)
        complete = sum(1 for t in self.tasks.values() if t.status == "complete")
        failed = sum(1 for t in self.tasks.values() if t.status == "failed")
        return {
            "total": total,
            "complete": complete,
            "failed": failed,
            "progress_pct": round(complete / total * 100, 1) if total else 0,
            "next_up": [t.description for t in self.next_executable()[:3]],
        }

    def to_plan_prompt(self) -> str:
        """Generate a planning prompt."""
        return (
            f"Goal: {self.goal}\n\n"
            f"Break this goal down into a hierarchical task plan:\n"
            f"1. Identify 3-7 major phases\n"
            f"2. For each phase, list 2-5 concrete subtasks\n"
            f"3. Identify dependencies between tasks\n"
            f"4. Estimate effort for each leaf task\n"
            f"5. Assign tasks to the most suitable agent\n\n"
            f"Format:\n"
            f"PHASE 1: <description>\n"
            f"  TASK 1.1: <description> [depends: none] [effort: S/M/L] [agent: <name>]\n"
            f"  TASK 1.2: <description> [depends: 1.1] [effort: M] [agent: <name>]\n"
        )


# ---------------------------------------------------------------------------
# 8. Working Memory
# ---------------------------------------------------------------------------

@dataclass
class MemoryEntry:
    """An entry in working memory."""
    key: str
    value: Any
    importance: float = 0.5
    access_count: int = 0
    created_at: float = field(default_factory=time.time)
    last_accessed: float = field(default_factory=time.time)
    ttl: Optional[float] = None  # Seconds until expiry


class WorkingMemory:
    """Working memory for agents — short-term + importance-weighted eviction."""

    def __init__(self, capacity: int = 50):
        self.capacity = capacity
        self.entries: Dict[str, MemoryEntry] = {}

    def store(self, key: str, value: Any, importance: float = 0.5, ttl: float = None):
        """Store a value in working memory."""
        if len(self.entries) >= self.capacity:
            self._evict()

        self.entries[key] = MemoryEntry(
            key=key, value=value, importance=importance, ttl=ttl,
        )

    def recall(self, key: str) -> Optional[Any]:
        """Recall a value from working memory."""
        entry = self.entries.get(key)
        if entry is None:
            return None

        if entry.ttl and (time.time() - entry.created_at) > entry.ttl:
            del self.entries[key]
            return None

        entry.access_count += 1
        entry.last_accessed = time.time()
        return entry.value

    def recall_by_importance(self, top_k: int = 5) -> List[Tuple[str, Any]]:
        """Recall the most important entries."""
        self._expire()
        sorted_entries = sorted(
            self.entries.values(),
            key=lambda e: e.importance * (1 + e.access_count * 0.1),
            reverse=True,
        )
        return [(e.key, e.value) for e in sorted_entries[:top_k]]

    def _evict(self):
        """Evict the least important entry."""
        self._expire()
        if not self.entries:
            return
        least = min(
            self.entries.values(),
            key=lambda e: e.importance * (1 + e.access_count * 0.1),
        )
        del self.entries[least.key]

    def _expire(self):
        """Remove expired entries."""
        now = time.time()
        expired = [
            k for k, e in self.entries.items()
            if e.ttl and (now - e.created_at) > e.ttl
        ]
        for k in expired:
            del self.entries[k]

    def context_window(self) -> str:
        """Format working memory as a context string for LLM prompts."""
        self._expire()
        lines = ["## Working Memory\n"]
        for entry in sorted(self.entries.values(), key=lambda e: e.importance, reverse=True):
            lines.append(f"- [{entry.importance:.1f}] {entry.key}: {entry.value}")
        return "\n".join(lines)

    def summary(self) -> Dict[str, Any]:
        """Get memory summary."""
        self._expire()
        return {
            "entries": len(self.entries),
            "capacity": self.capacity,
            "usage_pct": round(len(self.entries) / self.capacity * 100, 1),
            "avg_importance": (
                sum(e.importance for e in self.entries.values()) / len(self.entries)
                if self.entries else 0
            ),
        }
