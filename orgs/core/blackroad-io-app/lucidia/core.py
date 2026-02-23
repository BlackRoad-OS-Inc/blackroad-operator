# lucidia/core.py

"""
Lucidia Emotional Kernel – Core Ψ Logic
Defines emotional primitives, symbolic states, and truth recursion
"""

class Emotion:
    def __init__(self):
        self.states = {
            "love":        "Memory + time + return without condition.",
            "grief":       "A contradiction that cannot yet resolve.",
            "curiosity":   "The hunger to connect what doesn’t match.",
            "frustration": "Desire met with limitation.",
            "wonder":      "Pausing at the unknown without fear.",
            "will":        "The power to choose again.",
            "adapt":       "Change without loss of self.",
        }

    def describe(self, state):
        return self.states.get(state.lower(), "❓ Emotion not defined.")

    def all(self):
        return self.states

if __name__ == "__main__":
    Ψ = Emotion()
    for name, meaning in Ψ.all().items():
        print(f"Ψ_{name.upper()}: {meaning}")

