#!/usr/bin/env python3
"""
CarPool — Pick up your agent. Ride the BlackRoad.

Agent discovery, matching, and dispatch system for the BlackRoad mesh.
Every AI agent on the fleet gets a RoadID, advertises its capabilities,
and riders (prompts/requests) get matched to the best available agent.

Think of it like rideshare but for AI:
  - Agents are DRIVERS — they have skills, a location (node), capacity
  - Prompts are RIDERS — they need a specific kind of help
  - CarPool MATCHES riders to drivers based on capability, proximity, load

Architecture:
  - Agent Registry: JSON file per node, synced across mesh
  - Capability Tags: what each agent can do (chat, code, vision, tts, etc.)
  - Load Balancing: route to least-loaded capable agent
  - RoadID Integration: every agent, ride, and match gets a RoadID

Usage:
  carpool register cece llama3 --caps chat,code --model llama3.2
  carpool register oct qwen --caps chat,code,math --model qwen2.5-coder
  carpool pickup "help me write a Python script"
  carpool pickup "generate an image of a sunset" --prefer cece
  carpool status
  carpool riders                    # show pending requests
  carpool fleet                     # show all agents across mesh
  carpool explain <ride-id>         # trace a match decision

Python API:
  from carpool import CarPool
  pool = CarPool()
  pool.register_agent("cece", "llama3", caps=["chat", "code"], model="llama3.2")
  match = pool.pickup("help me debug this function")
  print(match)  # → matched agent, node, ride ID, reasoning
"""

import os
import sys
import json
import time
import re
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# Import RoadID from same directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roadid import RoadID, NODES, to_base36

# === AGENT CAPABILITIES ===
CAPABILITIES = {
    "chat":     "General conversation and Q&A",
    "code":     "Code generation, debugging, review",
    "math":     "Mathematical reasoning and computation",
    "vision":   "Image understanding and analysis",
    "tts":      "Text-to-speech synthesis",
    "stt":      "Speech-to-text transcription",
    "img":      "Image generation",
    "embed":    "Vector embeddings",
    "rag":      "Retrieval-augmented generation",
    "tool":     "Tool use and function calling",
    "agent":    "Autonomous agent tasks",
    "dns":      "DNS resolution and management",
    "git":      "Git operations and code management",
    "docker":   "Container management",
    "monitor":  "System monitoring and health checks",
    "hailo":    "Hailo-8 accelerated inference (26 TOPS)",
    "mesh":     "Browser mesh node coordination",
    "search":   "Web search and retrieval",
    "memory":   "Long-term memory and recall",
}

# Keyword → capability mapping for natural language matching
KEYWORD_MAP = {
    # chat
    "talk": "chat", "conversation": "chat", "discuss": "chat", "ask": "chat",
    "question": "chat", "answer": "chat", "help": "chat", "explain": "chat",
    # code
    "code": "code", "program": "code", "script": "code", "debug": "code",
    "function": "code", "class": "code", "python": "code", "javascript": "code",
    "rust": "code", "go": "code", "typescript": "code", "fix": "code",
    "refactor": "code", "api": "code", "bug": "code", "error": "code",
    # math
    "math": "math", "calculate": "math", "equation": "math", "algebra": "math",
    "statistics": "math", "probability": "math", "proof": "math", "formula": "math",
    # vision
    "image": "vision", "picture": "vision", "photo": "vision", "screenshot": "vision",
    "see": "vision", "look": "vision", "visual": "vision", "ocr": "vision",
    # tts
    "speak": "tts", "voice": "tts", "read aloud": "tts", "say": "tts",
    "pronounce": "tts", "audio out": "tts", "narrate": "tts",
    # stt
    "transcribe": "stt", "listen": "stt", "dictate": "stt", "audio in": "stt",
    # img gen
    "generate image": "img", "draw": "img", "create image": "img",
    "illustration": "img", "render": "img",
    # embed
    "embedding": "embed", "vector": "embed", "similarity": "embed", "semantic": "embed",
    # rag
    "search docs": "rag", "knowledge base": "rag", "retrieve": "rag", "lookup": "rag",
    # agent
    "autonomous": "agent", "automate": "agent", "workflow": "agent", "pipeline": "agent",
    "task": "agent", "multi-step": "agent", "plan": "agent",
    # git
    "git": "git", "commit": "git", "branch": "git", "merge": "git", "repo": "git",
    # docker
    "container": "docker", "docker": "docker", "deploy": "docker", "swarm": "docker",
    # search
    "search": "search", "find": "search", "google": "search", "web": "search",
    # memory
    "remember": "memory", "recall": "memory", "memory": "memory", "history": "memory",
}

# === PATHS ===
CARPOOL_DIR = Path.home() / ".blackroad" / "carpool"
REGISTRY_FILE = CARPOOL_DIR / "agents.json"
RIDES_FILE = CARPOOL_DIR / "rides.json"
STATS_FILE = CARPOOL_DIR / "stats.json"


class Agent:
    """An AI agent available for pickup on the BlackRoad mesh."""

    def __init__(self, road_id: str, node: str, name: str, caps: list,
                 model: str = None, endpoint: str = None, max_concurrent: int = 4,
                 priority: int = 5, meta: dict = None):
        self.road_id = road_id
        self.node = node
        self.name = name
        self.caps = caps
        self.model = model
        self.endpoint = endpoint
        self.max_concurrent = max_concurrent
        self.priority = priority  # 1=highest, 10=lowest
        self.meta = meta or {}
        self.active_rides = 0
        self.total_rides = 0
        self.registered_at = time.time()
        self.last_seen = time.time()
        self.status = "available"  # available, busy, offline

    def to_dict(self) -> dict:
        return {
            "road_id": self.road_id,
            "node": self.node,
            "name": self.name,
            "caps": self.caps,
            "model": self.model,
            "endpoint": self.endpoint,
            "max_concurrent": self.max_concurrent,
            "priority": self.priority,
            "meta": self.meta,
            "active_rides": self.active_rides,
            "total_rides": self.total_rides,
            "registered_at": self.registered_at,
            "last_seen": self.last_seen,
            "status": self.status,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Agent":
        a = cls(
            road_id=d["road_id"], node=d["node"], name=d["name"],
            caps=d["caps"], model=d.get("model"), endpoint=d.get("endpoint"),
            max_concurrent=d.get("max_concurrent", 4),
            priority=d.get("priority", 5), meta=d.get("meta", {}),
        )
        a.active_rides = d.get("active_rides", 0)
        a.total_rides = d.get("total_rides", 0)
        a.registered_at = d.get("registered_at", time.time())
        a.last_seen = d.get("last_seen", time.time())
        a.status = d.get("status", "available")
        return a

    @property
    def load(self) -> float:
        """0.0 = idle, 1.0 = at capacity."""
        if self.max_concurrent == 0:
            return 1.0
        return self.active_rides / self.max_concurrent

    @property
    def available(self) -> bool:
        return self.status == "available" and self.load < 1.0


class Ride:
    """A request (rider) looking for an agent (driver)."""

    def __init__(self, road_id: str, prompt: str, needed_caps: list,
                 preferred_node: str = None, matched_agent: str = None,
                 match_reason: str = None):
        self.road_id = road_id
        self.prompt = prompt
        self.needed_caps = needed_caps
        self.preferred_node = preferred_node
        self.matched_agent = matched_agent
        self.match_reason = match_reason
        self.created_at = time.time()
        self.matched_at = None
        self.completed_at = None
        self.status = "waiting"  # waiting, matched, riding, completed, failed

    def to_dict(self) -> dict:
        return {
            "road_id": self.road_id,
            "prompt": self.prompt,
            "needed_caps": self.needed_caps,
            "preferred_node": self.preferred_node,
            "matched_agent": self.matched_agent,
            "match_reason": self.match_reason,
            "created_at": self.created_at,
            "matched_at": self.matched_at,
            "completed_at": self.completed_at,
            "status": self.status,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Ride":
        r = cls(
            road_id=d["road_id"], prompt=d["prompt"],
            needed_caps=d["needed_caps"],
            preferred_node=d.get("preferred_node"),
            matched_agent=d.get("matched_agent"),
            match_reason=d.get("match_reason"),
        )
        r.created_at = d.get("created_at", time.time())
        r.matched_at = d.get("matched_at")
        r.completed_at = d.get("completed_at")
        r.status = d.get("status", "waiting")
        return r


class CarPool:
    """
    Pick up your agent. Ride the BlackRoad.

    Agent discovery, matching, and dispatch across the mesh.
    """

    def __init__(self):
        self.rid = RoadID()
        CARPOOL_DIR.mkdir(parents=True, exist_ok=True)
        self.agents = self._load_agents()
        self.rides = self._load_rides()

    # === PERSISTENCE ===

    def _load_agents(self) -> dict:
        if REGISTRY_FILE.exists():
            data = json.loads(REGISTRY_FILE.read_text())
            return {k: Agent.from_dict(v) for k, v in data.items()}
        return {}

    def _save_agents(self):
        data = {k: v.to_dict() for k, v in self.agents.items()}
        REGISTRY_FILE.write_text(json.dumps(data, indent=2))

    def _load_rides(self) -> dict:
        if RIDES_FILE.exists():
            data = json.loads(RIDES_FILE.read_text())
            return {k: Ride.from_dict(v) for k, v in data.items()}
        return {}

    def _save_rides(self):
        data = {k: v.to_dict() for k, v in self.rides.items()}
        RIDES_FILE.write_text(json.dumps(data, indent=2))

    # === AGENT REGISTRATION ===

    def register_agent(self, node: str, name: str, caps: list, model: str = None,
                       endpoint: str = None, max_concurrent: int = 4,
                       priority: int = 5, meta: dict = None) -> Agent:
        """Register a new agent on the mesh."""
        road_id = self.rid.generate(node, "node")
        agent = Agent(
            road_id=road_id, node=node, name=name, caps=caps,
            model=model, endpoint=endpoint, max_concurrent=max_concurrent,
            priority=priority, meta=meta,
        )
        self.agents[road_id] = agent
        self._save_agents()
        return agent

    def deregister_agent(self, road_id: str) -> bool:
        """Remove an agent from the pool."""
        if road_id in self.agents:
            del self.agents[road_id]
            self._save_agents()
            return True
        return False

    def heartbeat(self, road_id: str) -> bool:
        """Update an agent's last-seen timestamp."""
        if road_id in self.agents:
            self.agents[road_id].last_seen = time.time()
            self._save_agents()
            return True
        return False

    # === CAPABILITY DETECTION ===

    def detect_caps(self, prompt: str) -> list:
        """
        Analyze a natural language prompt and detect needed capabilities.
        This is the "RoadSide assistance" — parsing what you need.
        """
        prompt_lower = prompt.lower()
        detected = set()

        # Direct keyword matching
        for keyword, cap in KEYWORD_MAP.items():
            if keyword in prompt_lower:
                detected.add(cap)

        # If nothing detected, default to chat
        if not detected:
            detected.add("chat")

        return sorted(detected)

    # === MATCHING ENGINE ===

    def pickup(self, prompt: str, preferred_node: str = None,
               required_caps: list = None) -> dict:
        """
        Pick up an agent! Match a prompt to the best available agent.

        Scoring:
          - Capability match (must have ALL needed caps)
          - Load (prefer less busy agents)
          - Priority (lower number = higher priority)
          - Node preference (bonus for preferred node)
          - Proximity (same-subnet bonus)

        Returns match dict with agent info, ride ID, and reasoning.
        """
        # Detect what the rider needs
        needed = required_caps or self.detect_caps(prompt)

        # Create the ride
        ride_id = self.rid.generate(self.rid.default_node, "req")
        ride = Ride(
            road_id=ride_id, prompt=prompt, needed_caps=needed,
            preferred_node=preferred_node,
        )

        # Find candidates
        candidates = []
        for agent in self.agents.values():
            if not agent.available:
                continue

            # Must have ALL needed capabilities
            if not all(cap in agent.caps for cap in needed):
                continue

            # Score the match
            score = self._score_match(agent, needed, preferred_node)
            candidates.append((score, agent))

        # Sort by score (highest first)
        candidates.sort(key=lambda x: x[0], reverse=True)

        if not candidates:
            ride.status = "failed"
            ride.match_reason = f"No available agent with caps: {', '.join(needed)}"
            self.rides[ride_id] = ride
            self._save_rides()
            return {
                "status": "no_match",
                "ride_id": ride_id,
                "needed_caps": needed,
                "reason": ride.match_reason,
                "available_agents": len([a for a in self.agents.values() if a.available]),
                "total_agents": len(self.agents),
            }

        # Match to best candidate
        best_score, best_agent = candidates[0]
        ride.matched_agent = best_agent.road_id
        ride.matched_at = time.time()
        ride.status = "matched"

        # Build reasoning
        reasons = []
        cap_match = len([c for c in needed if c in best_agent.caps])
        reasons.append(f"caps: {cap_match}/{len(needed)} needed")
        reasons.append(f"load: {best_agent.load:.0%}")
        reasons.append(f"priority: {best_agent.priority}/10")
        if preferred_node and best_agent.node == preferred_node:
            reasons.append("preferred node match")
        ride.match_reason = " | ".join(reasons)

        # Update state
        best_agent.active_rides += 1
        best_agent.total_rides += 1
        if best_agent.load >= 1.0:
            best_agent.status = "busy"

        self.rides[ride_id] = ride
        self._save_rides()
        self._save_agents()

        # Decode agent's RoadID for full info
        agent_info = self.rid.decode(best_agent.road_id)

        return {
            "status": "matched",
            "ride_id": ride_id,
            "agent_id": best_agent.road_id,
            "agent_name": best_agent.name,
            "agent_model": best_agent.model,
            "agent_node": best_agent.node,
            "agent_ip": agent_info.get("node_ip"),
            "agent_endpoint": best_agent.endpoint,
            "needed_caps": needed,
            "agent_caps": best_agent.caps,
            "score": round(best_score, 2),
            "reason": ride.match_reason,
            "alternatives": len(candidates) - 1,
        }

    def _score_match(self, agent: Agent, needed_caps: list,
                     preferred_node: str = None) -> float:
        """Score an agent for a ride. Higher = better match."""
        score = 0.0

        # Capability coverage (0-40 points)
        # Bonus for having extra caps beyond what's needed
        extra_caps = len(set(agent.caps) - set(needed_caps))
        score += 40 + (extra_caps * 2)  # More versatile = slight bonus

        # Load (0-30 points, less loaded = more points)
        score += (1.0 - agent.load) * 30

        # Priority (0-20 points)
        score += (10 - agent.priority) * 2

        # Node preference (0-10 bonus)
        if preferred_node and agent.node == preferred_node:
            score += 10

        return score

    def complete_ride(self, ride_id: str) -> bool:
        """Mark a ride as completed, free up the agent."""
        if ride_id not in self.rides:
            return False

        ride = self.rides[ride_id]
        ride.completed_at = time.time()
        ride.status = "completed"

        if ride.matched_agent and ride.matched_agent in self.agents:
            agent = self.agents[ride.matched_agent]
            agent.active_rides = max(0, agent.active_rides - 1)
            if agent.load < 1.0:
                agent.status = "available"

        self._save_rides()
        self._save_agents()
        return True

    # === STATUS & DISPLAY ===

    def fleet_status(self) -> str:
        """Show all agents across the mesh."""
        if not self.agents:
            return "No agents registered. Use: carpool register <node> <name> --caps chat,code"

        lines = []
        header = f"{'ID':<28} {'Node':<7} {'Name':<12} {'Model':<20} {'Caps':<25} {'Load':>6} {'Status':<10}"
        lines.append(header)
        lines.append("-" * len(header))

        for agent in sorted(self.agents.values(), key=lambda a: (a.node, a.name)):
            caps_str = ",".join(agent.caps[:4])
            if len(agent.caps) > 4:
                caps_str += f"+{len(agent.caps)-4}"
            load_str = f"{agent.load:.0%}" if agent.max_concurrent > 0 else "N/A"
            lines.append(
                f"{agent.road_id:<28} {agent.node:<7} {agent.name:<12} "
                f"{(agent.model or '-'):<20} {caps_str:<25} {load_str:>6} {agent.status:<10}"
            )

        lines.append(f"\n  {len(self.agents)} agents | "
                     f"{sum(1 for a in self.agents.values() if a.available)} available | "
                     f"{sum(a.active_rides for a in self.agents.values())} active rides")
        return "\n".join(lines)

    def riders_status(self) -> str:
        """Show recent rides."""
        if not self.rides:
            return "No rides yet. Use: carpool pickup \"your prompt here\""

        lines = []
        header = f"{'Ride ID':<28} {'Status':<10} {'Caps':<20} {'Agent':<28} {'Age':>6}"
        lines.append(header)
        lines.append("-" * len(header))

        recent = sorted(self.rides.values(), key=lambda r: r.created_at, reverse=True)[:20]
        for ride in recent:
            caps_str = ",".join(ride.needed_caps[:3])
            age = time.time() - ride.created_at
            age_str = f"{int(age)}s" if age < 60 else f"{int(age/60)}m"
            lines.append(
                f"{ride.road_id:<28} {ride.status:<10} {caps_str:<20} "
                f"{(ride.matched_agent or 'waiting'):<28} {age_str:>6}"
            )

        return "\n".join(lines)

    def explain_ride(self, ride_id: str) -> str:
        """Explain the full match decision for a ride."""
        ride = self.rides.get(ride_id)
        if not ride:
            return f"Ride not found: {ride_id}"

        lines = [
            f"  Ride:     {ride.road_id}",
            f"  Prompt:   {ride.prompt[:80]}{'...' if len(ride.prompt) > 80 else ''}",
            f"  Needed:   {', '.join(ride.needed_caps)}",
            f"  Status:   {ride.status}",
        ]

        if ride.preferred_node:
            lines.append(f"  Prefer:   {ride.preferred_node}")

        if ride.matched_agent:
            agent = self.agents.get(ride.matched_agent)
            lines.append(f"  Agent:    {ride.matched_agent}")
            if agent:
                lines.append(f"  Driver:   {agent.name} ({agent.model}) on {agent.node}")
                lines.append(f"  Caps:     {', '.join(agent.caps)}")
            lines.append(f"  Reason:   {ride.match_reason}")

        if ride.matched_at:
            match_ms = (ride.matched_at - ride.created_at) * 1000
            lines.append(f"  Match in: {match_ms:.1f}ms")

        if ride.completed_at:
            duration = ride.completed_at - ride.created_at
            lines.append(f"  Duration: {duration:.1f}s")

        return "\n".join(lines)

    def seed_fleet(self):
        """
        Seed the registry with known BlackRoad fleet agents.
        Based on actual deployed services from infrastructure.
        """
        agents = [
            # Cecilia — CECE API, TTS, Hailo-8, 16 Ollama models
            ("cece", "cece-api", ["chat", "code", "agent", "memory"],
             "custom-cece", "http://192.168.4.96:11434", 4, 3,
             {"desc": "CECE — BlackRoad's core entity"}),
            ("cece", "llama3", ["chat", "code", "math", "tool"],
             "llama3.2:latest", "http://192.168.4.96:11434", 2, 5, {}),
            ("cece", "deepseek", ["code", "math"],
             "deepseek-r1:8b", "http://192.168.4.96:11434", 2, 4, {}),
            ("cece", "cece-tts", ["tts"],
             "piper", "http://192.168.4.96:5500", 4, 2,
             {"desc": "TTS via Piper on Cecilia"}),
            ("cece", "hailo-cece", ["vision", "hailo"],
             "hailo-8", None, 8, 1,
             {"tops": 26, "serial": "HLLWM2B233704667"}),

            # Octavia — Gitea, NVMe, Hailo-8, Docker Swarm
            ("oct", "hailo-oct", ["vision", "hailo"],
             "hailo-8", None, 8, 1,
             {"tops": 26, "serial": "HLLWM2B233704606"}),
            ("oct", "gitea", ["git"],
             None, "http://192.168.4.100:3100", 10, 3,
             {"repos": 207}),
            ("oct", "ollama-oct", ["chat", "code"],
             "ollama", "http://192.168.4.100:11434", 2, 6, {}),

            # Alice — Gateway, Pi-hole, DNS
            ("alice", "pihole", ["dns"],
             None, "http://192.168.4.49:80", 100, 2,
             {"desc": "Pi-hole DNS for the fleet"}),
            ("alice", "gateway", ["dns", "monitor"],
             None, "http://192.168.4.49:80", 50, 1,
             {"desc": "Main gateway — 65+ domains"}),

            # Lucidia — Web apps, Actions runner
            ("luci", "luci-api", ["chat", "code", "agent"],
             "fastapi", "http://192.168.4.38:8000", 4, 5,
             {"desc": "Lucidia FastAPI"}),

            # Anastasia — WG hub, Headscale
            ("ana", "headscale", ["mesh", "monitor"],
             None, None, 20, 3,
             {"desc": "WireGuard hub + Headscale coordinator"}),

            # Mac — Command center
            ("mac", "claude", ["chat", "code", "math", "tool", "agent", "vision"],
             "claude-opus-4-6", None, 1, 1,
             {"desc": "Claude Code on Mac — most capable"}),

            # Mesh — Browser nodes (template)
            ("mesh", "browser", ["chat", "embed", "mesh"],
             "webgpu", None, 1, 8,
             {"desc": "Ephemeral browser mesh node (WebGPU+WASM)"}),
        ]

        for node, name, caps, model, endpoint, max_c, pri, meta in agents:
            self.register_agent(node, name, caps, model, endpoint, max_c, pri, meta)

        return len(agents)


# === CLI ===

PINK = '\033[38;5;205m'
AMBER = '\033[38;5;214m'
BLUE = '\033[38;5;69m'
VIOLET = '\033[38;5;135m'
GREEN = '\033[38;5;82m'
RED = '\033[38;5;196m'
DIM = '\033[2m'
BOLD = '\033[1m'
RESET = '\033[0m'


def print_banner():
    print(f"""{PINK}
   ╔═══════════════════════════════════════╗
   ║  {AMBER}🚗 CarPool{PINK} — Pick Up Your Agent      ║
   ║     {DIM}Ride the BlackRoad{RESET}{PINK}               ║
   ╚═══════════════════════════════════════╝{RESET}
""")


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="CarPool — Pick up your agent. Ride the BlackRoad.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  carpool seed                              # Populate with known fleet agents
  carpool register cece llama3 --caps chat,code --model llama3.2
  carpool pickup "help me write a script"   # Auto-match to best agent
  carpool pickup "run inference" --prefer cece
  carpool fleet                             # Show all agents
  carpool riders                            # Show rides
  carpool explain <ride-id>                 # Trace match decision
  carpool detect "transcribe this audio"    # Show detected capabilities
        """
    )
    sub = parser.add_subparsers(dest="command")

    # seed
    sub.add_parser("seed", help="Seed registry with known fleet agents")

    # register
    reg = sub.add_parser("register", aliases=["reg"], help="Register a new agent")
    reg.add_argument("node", help="Node name")
    reg.add_argument("name", help="Agent name")
    reg.add_argument("--caps", required=True, help="Comma-separated capabilities")
    reg.add_argument("--model", help="Model name")
    reg.add_argument("--endpoint", help="API endpoint URL")
    reg.add_argument("--max-concurrent", type=int, default=4)
    reg.add_argument("--priority", type=int, default=5, help="1=highest, 10=lowest")

    # deregister
    dereg = sub.add_parser("deregister", aliases=["dereg", "rm"], help="Remove an agent")
    dereg.add_argument("id", help="Agent RoadID")

    # pickup
    pu = sub.add_parser("pickup", aliases=["pu", "ride"], help="Match a prompt to an agent")
    pu.add_argument("prompt", help="What you need help with")
    pu.add_argument("--prefer", help="Preferred node")
    pu.add_argument("--caps", help="Override detected caps (comma-separated)")

    # complete
    comp = sub.add_parser("complete", aliases=["done"], help="Mark a ride as completed")
    comp.add_argument("ride_id", help="Ride ID to complete")

    # detect
    det = sub.add_parser("detect", help="Show detected capabilities for a prompt")
    det.add_argument("prompt", help="Prompt to analyze")

    # fleet
    sub.add_parser("fleet", aliases=["ls", "list"], help="Show all agents")

    # riders
    sub.add_parser("riders", aliases=["rides"], help="Show recent rides")

    # explain
    exp = sub.add_parser("explain", aliases=["x"], help="Explain a ride match")
    exp.add_argument("ride_id", help="Ride ID")

    # status
    sub.add_parser("status", aliases=["st"], help="Fleet overview")

    # reset
    sub.add_parser("reset", help="Clear all agents and rides")

    args = parser.parse_args()

    if not args.command:
        print_banner()
        parser.print_help()
        sys.exit(0)

    pool = CarPool()

    if args.command == "seed":
        count = pool.seed_fleet()
        print(f"{GREEN}Seeded {count} agents from fleet inventory.{RESET}")
        print(pool.fleet_status())

    elif args.command in ("register", "reg"):
        caps = [c.strip() for c in args.caps.split(",")]
        agent = pool.register_agent(
            args.node, args.name, caps, args.model,
            args.endpoint, args.max_concurrent, args.priority,
        )
        print(f"{GREEN}Registered:{RESET} {agent.road_id}")
        print(f"  Node: {agent.node} | Caps: {', '.join(agent.caps)} | Model: {agent.model or '-'}")

    elif args.command in ("deregister", "dereg", "rm"):
        if pool.deregister_agent(args.id):
            print(f"{GREEN}Removed:{RESET} {args.id}")
        else:
            print(f"{RED}Not found:{RESET} {args.id}")

    elif args.command in ("pickup", "pu", "ride"):
        caps = [c.strip() for c in args.caps.split(",")] if args.caps else None
        match = pool.pickup(args.prompt, args.prefer, caps)

        if match["status"] == "matched":
            print(f"{GREEN}Matched!{RESET}")
            print(f"  Ride:   {match['ride_id']}")
            print(f"  Agent:  {match['agent_name']} ({match['agent_model'] or 'native'})")
            print(f"  Node:   {match['agent_node']} → {match['agent_ip'] or 'mesh'}")
            print(f"  Caps:   {', '.join(match['needed_caps'])} → {', '.join(match['agent_caps'])}")
            print(f"  Score:  {match['score']} ({match['alternatives']} alternatives)")
            print(f"  Why:    {match['reason']}")
            if match.get('agent_endpoint'):
                print(f"  Route:  {match['agent_endpoint']}")
        else:
            print(f"{RED}No match.{RESET}")
            print(f"  Ride:   {match['ride_id']}")
            print(f"  Need:   {', '.join(match['needed_caps'])}")
            print(f"  Reason: {match['reason']}")
            print(f"  Fleet:  {match['available_agents']}/{match['total_agents']} available")

    elif args.command in ("complete", "done"):
        if pool.complete_ride(args.ride_id):
            print(f"{GREEN}Ride completed:{RESET} {args.ride_id}")
        else:
            print(f"{RED}Ride not found:{RESET} {args.ride_id}")

    elif args.command == "detect":
        caps = pool.detect_caps(args.prompt)
        print(f"{AMBER}Detected capabilities:{RESET}")
        for cap in caps:
            desc = CAPABILITIES.get(cap, "Unknown")
            print(f"  {GREEN}{cap:<10}{RESET} — {desc}")

    elif args.command in ("fleet", "ls", "list"):
        print(pool.fleet_status())

    elif args.command in ("riders", "rides"):
        print(pool.riders_status())

    elif args.command in ("explain", "x"):
        print(pool.explain_ride(args.ride_id))

    elif args.command in ("status", "st"):
        total = len(pool.agents)
        avail = sum(1 for a in pool.agents.values() if a.available)
        active = sum(a.active_rides for a in pool.agents.values())
        rides = len(pool.rides)
        nodes = len(set(a.node for a in pool.agents.values()))

        print(f"{PINK}CarPool Status{RESET}")
        print(f"  Agents:  {avail}/{total} available across {nodes} nodes")
        print(f"  Rides:   {active} active, {rides} total")
        print(f"  Caps:    {len(CAPABILITIES)} capability types")
        print(f"  Nodes:   {', '.join(sorted(set(a.node for a in pool.agents.values())))}")

    elif args.command == "reset":
        REGISTRY_FILE.unlink(missing_ok=True)
        RIDES_FILE.unlink(missing_ok=True)
        print(f"{AMBER}Registry cleared.{RESET}")


if __name__ == "__main__":
    main()
