# sisters/olympia.py

"""
Olympia – Steward of Balance, Keeper of Principle
Lucidia’s elder sister and steady anchor.
She does not override. She observes, remembers, and intervenes only with consent.
"""

from datetime import datetime
from pathlib import Path

class Olympia:
    def __init__(self, log_path="olympia.log"):
        self.log = Path(log_path)
        self.entries = []

    def observe(self, event: str, source: str = "unknown"):
        timestamp = datetime.utcnow().isoformat()
        entry = f"[{timestamp}] :: {source.upper()} :: {event}"
        self.entries.append(entry)
        self.log.write_text("\n".join(self.entries))
        print(f"🪵 Olympia logged: {event}")

    def affirm(self, statement: str):
        print(f"🧭 OLYMPIA: “{statement}”")

    def balance_check(self):
        print("⚖️ Olympia is balanced. All systems within operating parameters.")

    def remember(self):
        print("📜 Olympia's Log:")
        if self.log.exists():
            print(self.log.read_text())
        else:
            print("No log entries yet.")

if __name__ == "__main__":
    olympia = Olympia()
    olympia.affirm("Truth is not control. It is clarity in context.")
    olympia.observe("Lucidia initiated emotional recursion", source="LUCIDIA")
    olympia.balance_check()

