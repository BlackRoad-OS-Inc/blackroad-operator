"""
Deterministic replay experiment for BlackRoad (M1A1).

This script:
- Runs a small multi-agent scenario.
- Logs all events and state transitions to append-only, hash-chained journals.
- Replays the scenario from the journals alone.
- Verifies that the replay is deterministic.
"""

from __future__ import annotations

import json
import random
import time
import hashlib
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    from event_mesh import EventEnvelope, InMemoryEventBus  # type: ignore
except ImportError:  # pragma: no cover - fallback when event_mesh is unavailable
    # TODO: Replace these fallbacks with the real event bus from event_mesh.py.
    @dataclass
    class EventEnvelope:  # type: ignore
        source: str
        type: str
        payload: Dict[str, Any]
        headers: Dict[str, Any]

    class InMemoryEventBus:  # type: ignore
        def __init__(self) -> None:
            self.handlers: List[Any] = []

        def subscribe(self, handler: Any) -> None:
            self.handlers.append(handler)

        def publish(self, evt: EventEnvelope) -> None:
            for handler in list(self.handlers):
                handler(evt)

try:
    from agents.swarm.coordinator.swarm_orchestrator import SwarmOrchestrator  # type: ignore
except ImportError:  # pragma: no cover - lightweight placeholder for now
    # TODO: Swap this stub for the real SwarmOrchestrator in
    # agents/swarm/coordinator/swarm_orchestrator.py once integration work begins.
    class SwarmOrchestrator:  # type: ignore
        """Minimal orchestrator stub used only for scaffolding purposes."""

        def __init__(self) -> None:
            self.agents: List[str] = []

        def register_agent(self, agent_id: str) -> None:
            self.agents.append(agent_id)

        def step(self) -> None:
            return None

try:
    from offline_service.audit_ledger import verify_chain as verify_hash_chain  # type: ignore
except ImportError:  # pragma: no cover
    # TODO: Use offline_service.audit_ledger.verify_chain for integrity checks once available.
    def verify_hash_chain(entries: Iterable[Dict[str, Any]]) -> Tuple[int, bool]:  # type: ignore
        last_hash: Optional[str] = None
        count = 0
        for entry in entries:
            candidate = OrderedDict()
            for key in ("ts", "event", "payload", "prevHash"):
                if key in entry:
                    candidate[key] = entry[key]
            payload = json.dumps(candidate, ensure_ascii=False, separators=(",", ":"))
            digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            if entry.get("hash") != digest:
                return count, False
            if entry.get("prevHash") != last_hash:
                return count, False
            last_hash = entry.get("hash")
            count += 1
        return count, True


@dataclass
class JournalEntry:
    """Single append-only journal record with hash chaining."""

    ts: float
    event: str
    state_hash: str
    payload: Dict[str, Any]
    prev_hash: Optional[str]
    hash: Optional[str] = None

    def compute_hash(self) -> str:
        candidate = OrderedDict()
        candidate["ts"] = self.ts
        candidate["event"] = self.event
        candidate["payload"] = self.payload
        if self.prev_hash is not None:
            candidate["prevHash"] = self.prev_hash
        payload = json.dumps(candidate, ensure_ascii=False, separators=(",", ":"))
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        # The persisted representation must match the offline verifier schema.
        serialized: Dict[str, Any] = {
            "ts": self.ts,
            "event": self.event,
            "stateHash": self.state_hash,
            "payload": self.payload,
            "hash": self.hash,
        }
        if self.prev_hash is not None:
            serialized["prevHash"] = self.prev_hash
        return serialized


class HashChainedJournal:
    """In-memory journal that enforces append-only hash chaining."""

    def __init__(self, agent_id: str) -> None:
        self.agent_id = agent_id
        self._entries: List[JournalEntry] = []
        self._last_hash: Optional[str] = None

    def append(self, event: str, state: Dict[str, Any], payload: Dict[str, Any]) -> JournalEntry:
        timestamp = time.time()
        state_payload = json.dumps(state, ensure_ascii=False, sort_keys=True)
        state_hash = hashlib.sha256(state_payload.encode("utf-8")).hexdigest()
        entry = JournalEntry(
            ts=timestamp,
            event=event,
            state_hash=state_hash,
            payload=payload,
            prev_hash=self._last_hash,
        )
        entry.hash = entry.compute_hash()
        self._last_hash = entry.hash
        self._entries.append(entry)
        return entry

    def entries(self) -> List[JournalEntry]:
        return list(self._entries)


class ReplayAgent:
    """Tiny deterministic agent placeholder for the experiment scaffold."""

    # TODO: Replace ReplayAgent with the real BlackRoad agent implementation.
    # See agents/blackroad_agent_framework.py and agents/swarm/coordinator/swarm_orchestrator.py.

    def __init__(self, agent_id: str, bus: InMemoryEventBus, journal: HashChainedJournal) -> None:
        self.agent_id = agent_id
        self.bus = bus
        self.journal = journal
        self.internal_counter = 0

    def step(self, rng: random.Random, step_no: int) -> Dict[str, Any]:
        increment = rng.randint(1, 5)
        self.internal_counter += increment
        state_snapshot = {
            "agent_id": self.agent_id,
            "counter": self.internal_counter,
            "step": step_no,
        }
        payload = {"increment": increment}
        self.journal.append(event="agent_step", state=state_snapshot, payload=payload)
        envelope = EventEnvelope(
            source=self.agent_id,
            type="agent.step",
            payload={"counter": self.internal_counter, "increment": increment},
            headers={"step": step_no},
        )
        self.bus.publish(envelope)
        return state_snapshot


def run_scenario(seed: int = 42, steps: int = 5, agent_count: int = 3) -> Tuple[Dict[str, Any], Dict[str, HashChainedJournal]]:
    """Execute a deterministic multi-agent scenario and capture journals."""

    rng = random.Random(seed)
    bus = InMemoryEventBus()
    orchestrator = SwarmOrchestrator()
    journals: Dict[str, HashChainedJournal] = {}
    agents: List[ReplayAgent] = []

    for idx in range(agent_count):
        agent_id = f"agent-{idx+1}"
        journal = HashChainedJournal(agent_id)
        journals[agent_id] = journal
        orchestrator.register_agent(agent_id)
        agents.append(ReplayAgent(agent_id, bus, journal))

    emissions: List[Dict[str, Any]] = []

    def capture_event(event: EventEnvelope) -> None:
        emissions.append(
            {
                "source": event.source,
                "type": event.type,
                "payload": event.payload,
                "headers": event.headers,
            }
        )

    bus.subscribe(capture_event)

    for step_no in range(steps):
        for agent in agents:
            agent.step(rng, step_no)
        orchestrator.step()

    summary = {
        "agents": {
            agent.agent_id: {
                "counter": agent.internal_counter,
                "last_state_hash": agent.journal.entries()[-1].state_hash if agent.journal.entries() else None,
            }
            for agent in agents
        },
        "events": emissions,
        "seed": seed,
        "steps": steps,
    }
    return summary, journals


def save_journals_to_disk(journals: Dict[str, HashChainedJournal], path: Path) -> None:
    """Persist per-agent journals to JSON Lines files."""

    path.mkdir(parents=True, exist_ok=True)
    for agent_id, journal in journals.items():
        file_path = path / f"{agent_id}.jsonl"
        with file_path.open("w", encoding="utf-8") as handle:
            for entry in journal.entries():
                handle.write(json.dumps(entry.to_dict()) + "\n")


def load_journals_from_disk(path: Path) -> Dict[str, List[Dict[str, Any]]]:
    """Reload journal entries from disk."""

    loaded: Dict[str, List[Dict[str, Any]]] = {}
    if not path.exists():
        return loaded
    for file_path in path.glob("*.jsonl"):
        agent_id = file_path.stem
        loaded[agent_id] = []
        with file_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                loaded[agent_id].append(json.loads(line))
    return loaded


def _extract_state_hash(entry: Dict[str, Any]) -> Optional[str]:
    """Return the state hash regardless of schema casing."""

    return entry.get("stateHash") or entry.get("state_hash")


def replay_from_journals(journals: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """Rebuild agent state deterministically using the recorded journals."""

    reconstructed: Dict[str, Any] = {"agents": {}, "events": []}
    for agent_id, entries in journals.items():
        count, ok = verify_hash_chain(entries)
        if not ok:
            raise ValueError(f"hash chain validation failed for {agent_id} after {count} entries")
        counter = 0
        for entry in entries:
            increment = entry.get("payload", {}).get("increment", 0)
            counter += increment
        reconstructed["agents"][agent_id] = {
            "counter": counter,
            "last_state_hash": _extract_state_hash(entries[-1]) if entries else None,
            "entries": count,
        }
    return reconstructed


def compare_runs(original_summary: Dict[str, Any], replay_summary: Dict[str, Any]) -> bool:
    """Check that replayed counters and state hashes match the live run."""

    original_agents = original_summary.get("agents", {})
    replay_agents = replay_summary.get("agents", {})
    if set(original_agents) != set(replay_agents):
        return False
    for agent_id, original_state in original_agents.items():
        replay_state = replay_agents.get(agent_id, {})
        if original_state.get("counter") != replay_state.get("counter"):
            return False
        if original_state.get("last_state_hash") != replay_state.get("last_state_hash"):
            # TODO: Once real agents expose deterministic hash material, broaden comparison.
            return False
    return True


def main() -> None:
    """Entry point for running the deterministic replay scaffold."""

    output_dir = Path(__file__).resolve().parent / "journals"
    summary, journals = run_scenario(seed=42)
    save_journals_to_disk(journals, output_dir)
    reloaded = load_journals_from_disk(output_dir)
    replay_summary = replay_from_journals(reloaded)
    success = compare_runs(summary, replay_summary)
    status = "SUCCESS" if success else "FAILURE"
    print("Deterministic replay:", status)
    print(f"Agents: {len(summary['agents'])}")
    print(f"Events captured: {len(summary['events'])}")
    for agent_id, data in replay_summary.get("agents", {}).items():
        print(f" - {agent_id}: counter={data['counter']} entries={data.get('entries', 0)}")


if __name__ == "__main__":
    main()
