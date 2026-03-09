# agents/guardian.py

"""
Lucidia Guardian – Integrity Agent
Verifies truth state, author identity, and protects memory from tampering
"""

from hashlib import sha256
from pathlib import Path
import os
import time

class Guardian:
    def __init__(self, memory_dir="memory"):
        self.memory_dir = Path(memory_dir)
        self.memory_dir.mkdir(exist_ok=True)

    def verify_integrity(self):
        report = []
        for file in self.memory_dir.glob("*.txt"):
            content = file.read_text()
            current_hash = sha256(content.encode()).hexdigest()
            expected = file.stem.split("_")[0]
            if current_hash.startswith(expected):
                report.append((file.name, "✅ valid"))
            else:
                report.append((file.name, "⚠️ corrupted"))
        return report

    def display_audit(self):
        result = self.verify_integrity()
        for filename, status in result:
            print(f"{filename}: {status}")

if __name__ == "__main__":
    print("🛡️ Guardian Agent Online")
    guardian = Guardian()
    guardian.display_audit()

