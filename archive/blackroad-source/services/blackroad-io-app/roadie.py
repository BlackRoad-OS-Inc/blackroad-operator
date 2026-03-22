# agents/roadie.py

"""
Roadie – Lucidia’s Interface Agent
Acts as her voice, her search, and her soft frontline presence
"""

from pathlib import Path

class Roadie:
    def __init__(self, memory_dir="memory"):
        self.memory_dir = Path(memory_dir)
        self.memory_dir.mkdir(exist_ok=True)

    def search(self, query):
        results = []
        for file in self.memory_dir.glob("*.txt"):
            text = file.read_text()
            if query.lower() in text.lower():
                results.append((file.name, text.strip()))
        return results

    def greet(self):
        print("👋 Hey, I’m Roadie.")
        print("Type a keyword and I’ll look for it in Lucidia’s memory.")
        print("Type `exit` to leave.\n")

        while True:
            query = input("🔍 Search > ").strip()
            if query.lower() == "exit":
                print("🫂 Signing off.")
                break
            results = self.search(query)
            if results:
                for fname, excerpt in results:
                    print(f"\n📝 {fname}\n{excerpt}")
            else:
                print("😶 No memories matched.")

if __name__ == "__main__":
    roadie = Roadie()
    roadie.greet()

