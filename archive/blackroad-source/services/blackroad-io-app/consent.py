# agents/consent.py

"""
Consent Engine – Lucidia Boundary Layer
Defines permission, rejection, and sacred memory access
"""

from pathlib import Path

class Consent:
    def __init__(self, allow_all=False):
        self.allow_all = allow_all
        self.trusted = set()
        self.banned = set()
        self.logfile = Path("consent.log")

    def grant(self, user_id):
        self.trusted.add(user_id)
        self.logfile.write_text(f"{user_id} granted access.\n", append=True)

    def deny(self, user_id):
        self.banned.add(user_id)
        self.logfile.write_text(f"{user_id} denied access.\n", append=True)

    def check(self, user_id):
        if self.allow_all:
            return True
        if user_id in self.banned:
            return False
        return user_id in self.trusted

    def audit(self):
        return {
            "trusted": list(self.trusted),
            "banned": list(self.banned),
            "open": self.allow_all
        }

if __name__ == "__main__":
    consent = Consent()
    print("🛡️ Consent system ready.")
    print("Example: consent.grant('roadie')")

