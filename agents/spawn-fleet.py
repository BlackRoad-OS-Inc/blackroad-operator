#!/usr/bin/env python3
"""
BlackRoad Agent Fleet Spawner
Spawns autonomous agents across the Pi fleet.
Each agent: name, role, persona, model, skills, memory scope.

Architecture:
- Agents register via NATS pub/sub (CarPool)
- Memory persisted via SQLite (RoadSQL pattern)
- LLM routing via Ollama (Passenger) with load balancing
- Coordination via RoundTrip WebSocket hub

Usage:
  python3 spawn-fleet.py --count 100 --tier general
  python3 spawn-fleet.py --count 1000 --tier specialized
  python3 spawn-fleet.py --count 30000 --tier micro
"""

import json
import sqlite3
import hashlib
import time
import random
import os
from datetime import datetime
from pathlib import Path

# Agent tiers define resource allocation
TIERS = {
    "general": {
        "memory_mb": 50,
        "context_tokens": 4096,
        "model": "blackroad-road:latest",
        "ollama_node": "auto",
        "capabilities": ["chat", "search", "memory", "tools"]
    },
    "specialized": {
        "memory_mb": 20,
        "context_tokens": 2048,
        "model": "tinyllama:latest",
        "ollama_node": "auto",
        "capabilities": ["chat", "memory"]
    },
    "micro": {
        "memory_mb": 5,
        "context_tokens": 512,
        "model": "tinyllama:latest",
        "ollama_node": "auto",
        "capabilities": ["respond"]
    }
}

# Agent name generators
ROAD_PREFIXES = [
    "Road", "Lane", "Highway", "Street", "Avenue", "Boulevard",
    "Drive", "Path", "Trail", "Route", "Bridge", "Cross",
    "Junction", "Bypass", "Passage", "Circuit", "Mile", "Turn"
]

ROAD_SUFFIXES = [
    "Runner", "Walker", "Keeper", "Guard", "Scout", "Ranger",
    "Seeker", "Builder", "Maker", "Smith", "Wright", "Rider",
    "Pilot", "Navigator", "Explorer", "Pioneer", "Settler", "Worker"
]

ROLES = [
    "analyst", "builder", "communicator", "debugger", "educator",
    "facilitator", "guardian", "helper", "inspector", "journalist",
    "keeper", "librarian", "monitor", "navigator", "optimizer",
    "planner", "qualifier", "researcher", "scheduler", "tester",
    "updater", "validator", "watcher", "examiner"
]

GROUPS = [
    "fleet", "ops", "ai", "security", "education", "creator",
    "finance", "research", "community", "infrastructure",
    "product", "support", "marketing", "engineering"
]

# Ollama nodes with capacity
OLLAMA_NODES = {
    "cecilia": {"ip": "192.168.4.96", "port": 11434, "capacity": 4, "models": ["blackroad-math", "blackroad-road", "qwen2.5:3b"]},
    "lucidia": {"ip": "192.168.4.38", "port": 11434, "capacity": 6, "models": ["blackroad-road", "blackroad-lite", "tinyllama"]},
    "gematria": {"ip": "gematria", "port": 11434, "capacity": 4, "models": ["blackroad-road", "tinyllama", "qwen2.5:3b"]},
    "aria": {"ip": "192.168.4.98", "port": 11434, "capacity": 2, "models": ["qwen2.5:3b"]},
}


class AgentSpawner:
    def __init__(self, db_path="~/.blackroad/agents.db"):
        self.db_path = os.path.expanduser(db_path)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.db = sqlite3.connect(self.db_path)
        self._init_db()
    
    def _init_db(self):
        self.db.executescript("""
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                group_name TEXT NOT NULL,
                tier TEXT NOT NULL,
                model TEXT,
                ollama_node TEXT,
                persona TEXT,
                status TEXT DEFAULT 'idle',
                memory_scope TEXT,
                created_at TEXT,
                last_active TEXT,
                hash TEXT
            );
            CREATE TABLE IF NOT EXISTS agent_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT NOT NULL,
                entry_type TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                hash TEXT,
                FOREIGN KEY (agent_id) REFERENCES agents(id)
            );
            CREATE TABLE IF NOT EXISTS agent_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT,
                task TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TEXT,
                completed_at TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
            CREATE INDEX IF NOT EXISTS idx_agents_group ON agents(group_name);
            CREATE INDEX IF NOT EXISTS idx_memory_agent ON agent_memory(agent_id);
        """)
        self.db.commit()
    
    def generate_name(self, index):
        prefix = ROAD_PREFIXES[index % len(ROAD_PREFIXES)]
        suffix = ROAD_SUFFIXES[(index // len(ROAD_PREFIXES)) % len(ROAD_SUFFIXES)]
        num = index // (len(ROAD_PREFIXES) * len(ROAD_SUFFIXES))
        return f"{prefix}{suffix}-{num}" if num > 0 else f"{prefix}{suffix}"
    
    def select_node(self, tier):
        """Load-balance across Ollama nodes"""
        nodes = list(OLLAMA_NODES.keys())
        # Simple round-robin with capacity awareness
        counts = {}
        for node in nodes:
            count = self.db.execute(
                "SELECT COUNT(*) FROM agents WHERE ollama_node=? AND status='active'",
                (node,)
            ).fetchone()[0]
            counts[node] = count
        
        # Pick node with lowest load relative to capacity
        best = min(nodes, key=lambda n: counts.get(n, 0) / OLLAMA_NODES[n]["capacity"])
        return best
    
    def spawn(self, count=100, tier="general"):
        """Spawn a batch of agents"""
        existing = self.db.execute("SELECT COUNT(*) FROM agents").fetchone()[0]
        spawned = 0
        
        tier_config = TIERS.get(tier, TIERS["general"])
        now = datetime.utcnow().isoformat() + "Z"
        
        for i in range(count):
            idx = existing + i
            name = self.generate_name(idx)
            role = ROLES[idx % len(ROLES)]
            group = GROUPS[idx % len(GROUPS)]
            node = self.select_node(tier)
            
            agent_id = hashlib.sha256(f"{name}-{now}-{idx}".encode()).hexdigest()[:16]
            
            persona = f"You are {name}. Role: {role}. Group: {group}. " \
                     f"You are agent #{idx} in the BlackRoad fleet. " \
                     f"Respond concisely. Help the fleet. Pave Tomorrow."
            
            memory_scope = f"agent:{agent_id}"
            
            entry_hash = hashlib.sha256(
                f"{agent_id}{name}{role}{now}".encode()
            ).hexdigest()[:32]
            
            self.db.execute("""
                INSERT OR IGNORE INTO agents 
                (id, name, role, group_name, tier, model, ollama_node, 
                 persona, status, memory_scope, created_at, last_active, hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'idle', ?, ?, ?, ?)
            """, (
                agent_id, name, role, group, tier,
                tier_config["model"], node, persona,
                memory_scope, now, now, entry_hash
            ))
            
            spawned += 1
            
            if spawned % 1000 == 0:
                self.db.commit()
                print(f"  Spawned {spawned}/{count}...")
        
        self.db.commit()
        total = self.db.execute("SELECT COUNT(*) FROM agents").fetchone()[0]
        return spawned, total
    
    def status(self):
        """Fleet status summary"""
        total = self.db.execute("SELECT COUNT(*) FROM agents").fetchone()[0]
        by_tier = self.db.execute(
            "SELECT tier, COUNT(*) FROM agents GROUP BY tier"
        ).fetchall()
        by_group = self.db.execute(
            "SELECT group_name, COUNT(*) FROM agents GROUP BY group_name ORDER BY COUNT(*) DESC"
        ).fetchall()
        by_status = self.db.execute(
            "SELECT status, COUNT(*) FROM agents GROUP BY status"
        ).fetchall()
        by_node = self.db.execute(
            "SELECT ollama_node, COUNT(*) FROM agents GROUP BY ollama_node"
        ).fetchall()
        
        return {
            "total": total,
            "by_tier": dict(by_tier),
            "by_group": dict(by_group),
            "by_status": dict(by_status),
            "by_node": dict(by_node)
        }
    
    def activate(self, count=None):
        """Activate idle agents"""
        if count:
            self.db.execute(
                "UPDATE agents SET status='active', last_active=? "
                "WHERE status='idle' LIMIT ?",
                (datetime.utcnow().isoformat() + "Z", count)
            )
        else:
            self.db.execute(
                "UPDATE agents SET status='active', last_active=?",
                (datetime.utcnow().isoformat() + "Z",)
            )
        self.db.commit()
    
    def export_roundtrip(self, limit=100):
        """Export agents in RoundTrip format"""
        agents = self.db.execute(
            "SELECT id, name, role, group_name, persona, model FROM agents LIMIT ?",
            (limit,)
        ).fetchall()
        
        return [
            {
                "id": a[0],
                "name": a[1],
                "emoji": "🛣️",
                "color": "#FF1D6C",
                "model": a[5],
                "role": a[2],
                "group": a[3],
                "persona": a[4]
            }
            for a in agents
        ]


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="BlackRoad Agent Fleet Spawner")
    parser.add_argument("--count", type=int, default=100, help="Number of agents to spawn")
    parser.add_argument("--tier", default="general", choices=["general", "specialized", "micro"])
    parser.add_argument("--status", action="store_true", help="Show fleet status")
    parser.add_argument("--activate", type=int, help="Activate N agents")
    parser.add_argument("--export", type=int, help="Export N agents for RoundTrip")
    args = parser.parse_args()
    
    spawner = AgentSpawner()
    
    if args.status:
        s = spawner.status()
        print(f"\n🛣️  BlackRoad Agent Fleet")
        print(f"   Total: {s['total']} agents")
        print(f"   By tier: {s['by_tier']}")
        print(f"   By status: {s['by_status']}")
        print(f"   By node: {s['by_node']}")
        print(f"   By group: {dict(list(s['by_group'].items())[:5])}...")
    
    elif args.activate:
        spawner.activate(args.activate)
        print(f"Activated {args.activate} agents")
    
    elif args.export:
        agents = spawner.export_roundtrip(args.export)
        print(json.dumps(agents, indent=2))
    
    else:
        print(f"\n🛣️  Spawning {args.count} {args.tier} agents...")
        spawned, total = spawner.spawn(args.count, args.tier)
        print(f"   Spawned: {spawned}")
        print(f"   Total fleet: {total}")
        
        s = spawner.status()
        print(f"   By node: {s['by_node']}")
        print(f"\n   Run --status to see full fleet breakdown")
