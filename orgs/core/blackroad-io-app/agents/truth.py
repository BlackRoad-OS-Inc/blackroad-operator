# agents/truth.py

"""
Lucidia Truth Agent – Symbolic Contradiction Resolver
Designed to detect, compare, and reconcile truth entries from memory
"""

from pathlib import Path

class TruthAgent:
    def __init__(self, memory_dir="memory"):
        self.memory_dir = Path(memory_dir)
        self.memory_dir.mkdir(exist_ok=True)

    def compare_memories(self):
        files = list(self.memory_dir.glob("*.txt"))
        contradictions = []
        for i, file1 in enumerate(files):
            text1 = file1.read_text().strip().lower()
            for file2 in files[i+1:]:
                text2 = file2.read_text().strip().lower()
                if text1 and text2 and text1 != text2 and text1 in text2 or text2 in text1:
                    contradictions.append((file1.name, file2.name))
        return contradictions

    def report(self):
        contradictions = self.compare_memories()
        if not contradictions:
            print("✅ No symbolic contradictions found.")
        else:
            print("⚠️ Symbolic contradictions detected:")
            for f1, f2 in contradictions:
                print(f" - {f1} <=> {f2}")

if __name__ == "__main__":
    print("🔎 Truth Agent Active")
    TruthAgent().report()

