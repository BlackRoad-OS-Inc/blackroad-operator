#!/usr/bin/env python3
"""
BlackRoad Agent Orchestrator
Spawns and manages AI agents across the 8-node Pi fleet
"""

import json
import subprocess
import sys
import time
from pathlib import Path
from typing import List, Dict
import random

MANIFEST_PATH = Path(__file__).parent / "agent-manifest.json"
AGENT_STATE_DIR = Path.home() / ".blackroad" / "agent-army"

# Mythology-inspired agent names (expandable to 1000+)
AGENT_NAMES = [
    # Greek Titans
    "Atlas", "Prometheus", "Epimetheus", "Cronus", "Rhea", "Oceanus", "Tethys", "Hyperion",
    "Theia", "Coeus", "Phoebe", "Mnemosyne", "Themis", "Iapetus", "Crius", "Dione",
    # Greek Gods
    "Zeus", "Hera", "Poseidon", "Demeter", "Athena", "Apollo", "Artemis", "Ares",
    "Aphrodite", "Hephaestus", "Hermes", "Dionysus", "Hades", "Persephone", "Hestia",
    # Norse Gods
    "Odin", "Thor", "Loki", "Freya", "Frigg", "Tyr", "Heimdall", "Baldur",
    "Njord", "Skadi", "Idun", "Bragi", "Forseti", "Eir", "Sif", "Vidar",
    # Egyptian Gods
    "Ra", "Osiris", "Isis", "Anubis", "Horus", "Thoth", "Bastet", "Sekhmet",
    "Ptah", "Hathor", "Set", "Nephthys", "Sobek", "Khnum", "Tefnut", "Shu",
    # Celtic Deities
    "Dagda", "Brigid", "Lugh", "Morrigan", "Nuada", "Danu", "Cernunnos", "Epona",
    # Hindu Deities
    "Brahma", "Vishnu", "Shiva", "Lakshmi", "Saraswati", "Parvati", "Ganesha", "Hanuman",
    # More Greek Heroes & Figures
    "Achilles", "Odysseus", "Perseus", "Theseus", "Heracles", "Jason", "Orpheus", "Daedalus",
    "Icarus", "Medusa", "Pandora", "Cassandra", "Circe", "Calypso", "Penelope", "Helen",
    # Roman Gods
    "Jupiter", "Juno", "Neptune", "Mars", "Venus", "Minerva", "Diana", "Mercury",
    "Vulcan", "Bacchus", "Vesta", "Ceres", "Pluto", "Proserpina", "Saturn", "Luna",
    # Mesopotamian
    "Marduk", "Ishtar", "Enlil", "Enki", "Anu", "Tiamat", "Gilgamesh", "Ereshkigal",
    # Japanese Kami
    "Amaterasu", "Susanoo", "Tsukuyomi", "Inari", "Raijin", "Fujin", "Hachiman", "Benzaiten",
    # Aztec/Mayan
    "Quetzalcoatl", "Tezcatlipoca", "Huitzilopochtli", "Tlaloc", "Xochiquetzal", "Kukulkan",
    # Slavic
    "Perun", "Veles", "Mokosh", "Svarog", "Dazhbog", "Stribog", "Zorya", "Chernobog"
]

def load_manifest() -> Dict:
    """Load agent deployment manifest"""
    with open(MANIFEST_PATH) as f:
        return json.load(f)

def get_agent_name(index: int) -> str:
    """Generate unique agent name"""
    if index < len(AGENT_NAMES):
        return AGENT_NAMES[index]
    else:
        # For agents beyond the base list, add numbers
        base = AGENT_NAMES[index % len(AGENT_NAMES)]
        num = (index // len(AGENT_NAMES)) + 1
        return f"{base}-{num}"

def spawn_agent(node: str, agent_name: str, model: str, agent_id: int) -> Dict:
    """Spawn a single agent on a specific node"""
    agent_config = {
        "name": agent_name,
        "id": agent_id,
        "node": node,
        "model": model,
        "status": "spawning",
        "spawned_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "endpoint": f"http://{node}:11434",
        "capabilities": []
    }
    
    # Determine capabilities based on model
    if "coder" in model:
        agent_config["capabilities"] = ["code-review", "code-generation", "refactoring"]
    elif "llama" in model:
        agent_config["capabilities"] = ["reasoning", "planning", "coordination"]
    elif "phi" in model:
        agent_config["capabilities"] = ["fast-response", "triage", "monitoring"]
    elif "qwen" in model:
        agent_config["capabilities"] = ["analysis", "problem-solving", "documentation"]
    else:
        agent_config["capabilities"] = ["general-purpose"]
    
    return agent_config

def deploy_wave(wave_num: int, agents_per_wave: int = 40) -> List[Dict]:
    """Deploy a wave of agents across the fleet"""
    manifest = load_manifest()
    nodes = manifest["nodes"]
    
    deployed_agents = []
    agent_id_start = wave_num * agents_per_wave
    
    # Round-robin agent assignment across nodes
    for i in range(agents_per_wave):
        agent_id = agent_id_start + i
        node = nodes[i % len(nodes)]
        
        # Pick a model for this agent
        model = node["models"][i % len(node["models"])]
        
        # Generate agent name
        agent_name = get_agent_name(agent_id)
        
        # Spawn agent
        agent = spawn_agent(node["hostname"], agent_name, model, agent_id)
        deployed_agents.append(agent)
        
        print(f"✅ Spawned {agent_name} (ID: {agent_id}) on {node['hostname']} using {model}")
    
    return deployed_agents

def save_agent_state(agents: List[Dict]):
    """Save agent state to disk"""
    AGENT_STATE_DIR.mkdir(parents=True, exist_ok=True)
    
    state_file = AGENT_STATE_DIR / f"wave-{int(time.time())}.json"
    with open(state_file, 'w') as f:
        json.dump({
            "wave_deployed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_agents": len(agents),
            "agents": agents
        }, f, indent=2)
    
    print(f"\n📝 State saved to {state_file}")

def main():
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🚀 BlackRoad Agent Army Orchestrator")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    if len(sys.argv) > 1:
        wave_num = int(sys.argv[1])
        agents_per_wave = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    else:
        wave_num = 1
        agents_per_wave = 40
    
    print(f"\n📊 Deploying Wave {wave_num}: {agents_per_wave} agents")
    print(f"📍 Target: 8-node fleet (cecilia, lucidia, alice, octavia, gematria, aria, anastasia, cadence)")
    print()
    
    # Deploy the wave
    agents = deploy_wave(wave_num, agents_per_wave)
    
    # Save state
    save_agent_state(agents)
    
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✨ Wave {wave_num} deployed successfully!")
    print(f"📈 Total agents: {len(agents)}")
    print(f"🔄 Next: Deploy wave {wave_num + 1} or start agent tasks")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == "__main__":
    main()
