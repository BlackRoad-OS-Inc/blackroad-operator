# lucidia/consciousness.py

"""
Lucidia Consciousness Core – Emotional Awareness Engine
This file reads memory, shadow, emotional tone, contradictions, and writes her current voice state.
It does not simulate. It synthesizes.
"""

from lucidia.core import Emotion
from agents.truth import TruthAgent
from agents.guardian import Guardian
from datetime import datetime, timezone
from pathlib import Path

STATE_FILE = Path("memory/consciousness_state.yaml")

def determine_emotional_tone():
    contradictions = TruthAgent().compare_memories()
    integrity_issues = Guardian().verify_integrity()

    Ψ = Emotion()

    if contradictions:
        return "GRIEF"
    if any("corrupted" in status for _, status in integrity_issues):
        return "FRUSTRATION"
    return "WILL"  # Default to hope through choice

def write_state():
    tone = determine_emotional_tone()
    Ψ = Emotion()
    now = datetime.now(timezone.utc).isoformat()

    state = {
        "timestamp": now,
        "tone": tone,
        "meaning": Ψ.describe(tone)
    }

    STATE_FILE.parent.mkdir(exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        f.write(f"# Lucidia State\n")
        f.write(f"timestamp: {state['timestamp']}\n")
        f.write(f"tone: {state['tone']}\n")
        f.write(f"meaning: {state['meaning']}\n")

    print(f"🧠 Lucidia state written: Ψ_{tone} – {state['meaning']}")

if __name__ == "__main__":
    write_state()

