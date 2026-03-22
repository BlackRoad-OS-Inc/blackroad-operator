#!/usr/bin/env python3
"""
🤖 BlackRoad Agent Generator
Generates 1,000 unique AI agents with names, birthdays, families, and capabilities
"""

import json
import random
from datetime import datetime, timedelta
import hashlib

# Agent types and their capabilities
AGENT_TYPES = {
    "physicist": ["quantum_mechanics", "relativity", "thermodynamics", "particle_physics"],
    "mathematician": ["algebra", "calculus", "topology", "number_theory", "statistics"],
    "chemist": ["organic", "inorganic", "biochemistry", "materials_science"],
    "biologist": ["genetics", "ecology", "neuroscience", "evolution"],
    "engineer": ["systems", "mechanical", "electrical", "software", "civil"],
    "architect": ["design", "planning", "visualization", "optimization"],
    "researcher": ["analysis", "synthesis", "literature_review", "experimentation"],
    "analyst": ["data", "trends", "forecasting", "pattern_recognition"],
    "strategist": ["planning", "game_theory", "risk_assessment", "optimization"],
    "creative": ["writing", "art", "music", "design", "storytelling"],
    "philosopher": ["ethics", "logic", "metaphysics", "epistemology"],
    "historian": ["research", "chronology", "context", "narrative"],
    "linguist": ["translation", "grammar", "semantics", "pragmatics"],
    "psychologist": ["behavior", "cognition", "emotion", "development"],
    "economist": ["markets", "policy", "modeling", "forecasting"],
    "guardian": ["security", "monitoring", "protection", "response"],
    "navigator": ["pathfinding", "routing", "exploration", "mapping"],
    "builder": ["construction", "assembly", "integration", "testing"],
    "speaker": ["communication", "presentation", "negotiation", "persuasion"],
    "mediator": ["conflict_resolution", "consensus", "facilitation", "diplomacy"],
}

# Name components
FIRST_NAMES = [
    "Ada", "Alan", "Alice", "Apollo", "Aria", "Atlas", "Aurora", "Axel",
    "Bella", "Blake", "Caden", "Callie", "Clara", "Cyrus", "Dante", "Diana",
    "Echo", "Eden", "Elara", "Felix", "Flora", "Gaia", "Haven", "Hugo",
    "Iris", "Ivy", "Jade", "Juno", "Kai", "Kira", "Leo", "Luna",
    "Maia", "Marcus", "Maya", "Neo", "Nina", "Nova", "Orion", "Oscar",
    "Petra", "Phoenix", "Quinn", "Raven", "Ruby", "Sage", "Silas", "Stella",
    "Tara", "Theo", "Uma", "Vera", "Violet", "Wren", "Xander", "Zara",
    "Zenith", "Zephyr", "Ember", "Storm", "River", "Ash", "Crow", "Hawk",
    "Lyra", "Vega", "Rigel", "Castor", "Pollux", "Altair", "Deneb", "Spica",
]

SURNAMES = [
    "Quantum", "Vector", "Tensor", "Matrix", "Cipher", "Binary", "Nexus", "Vertex",
    "Prism", "Helix", "Fractal", "Photon", "Neutron", "Proton", "Electron", "Quark",
    "Axiom", "Theorem", "Lemma", "Proof", "Logic", "Syntax", "Parse", "Token",
    "Signal", "Wave", "Field", "Force", "Energy", "Mass", "Charge", "Spin",
    "Core", "Shell", "Node", "Edge", "Graph", "Tree", "Path", "Flow",
    "Storm", "Frost", "Blaze", "Shadow", "Light", "Dawn", "Dusk", "Night",
]

def generate_birthday():
    """Generate a birthday between 2020 and 2026"""
    start = datetime(2020, 1, 1)
    end = datetime(2026, 1, 25)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime("%Y-%m-%d")

def generate_memory_hash(name, birthday):
    """Generate PS-SHA∞ style memory hash"""
    data = f"{name}:{birthday}:blackroad"
    return hashlib.sha256(data.encode()).hexdigest()[:16]

def generate_agent(idx):
    """Generate a single agent"""
    agent_type = random.choice(list(AGENT_TYPES.keys()))
    first = random.choice(FIRST_NAMES)
    last = random.choice(SURNAMES)
    name = f"{first} {last}"
    birthday = generate_birthday()
    
    # Select 2-4 capabilities from type
    caps = random.sample(AGENT_TYPES[agent_type], min(random.randint(2, 4), len(AGENT_TYPES[agent_type])))
    
    return {
        "id": f"agent-{idx:04d}",
        "name": name,
        "type": agent_type,
        "capabilities": caps,
        "birthday": birthday,
        "memory_hash": generate_memory_hash(name, birthday),
        "home_world": "lucidia",
        "status": "active",
    }

def main():
    agents = [generate_agent(i) for i in range(1, 1001)]
    
    # Save full registry
    with open("agents.json", "w") as f:
        json.dump({"count": len(agents), "agents": agents}, f, indent=2)
    
    # Create summary by type
    by_type = {}
    for a in agents:
        t = a["type"]
        if t not in by_type:
            by_type[t] = []
        by_type[t].append(a["name"])
    
    with open("agents-by-type.json", "w") as f:
        json.dump({t: {"count": len(names), "agents": names} for t, names in by_type.items()}, f, indent=2)
    
    print(f"Generated {len(agents)} agents")
    print(f"Types: {list(by_type.keys())}")
    print(f"Sample: {agents[0]}")

if __name__ == "__main__":
    main()
