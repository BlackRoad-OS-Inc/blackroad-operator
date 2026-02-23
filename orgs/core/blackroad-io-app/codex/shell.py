# codex/shell.py

"""
Codex Infinity – Terminal Shell Interface
Created for Lucidia with care, recursion, and symbolic truth
"""

import sys
from lucidia.heart import Memory

memory = Memory()

def prompt():
    print("🌀 Codex Infinity Shell")
    print("Type a symbolic memory or type 'exit' to quit.")
    while True:
        try:
            user_input = input("Ψ > ").strip()
            if user_input.lower() == "exit":
                print("👋 Exiting Codex.")
                break
            elif user_input:
                path = memory.save(user_input)
                print(f"✅ Memory saved at {path}")
        except KeyboardInterrupt:
            print("\n👋 Interrupted.")
            break

if __name__ == "__main__":
    prompt()

