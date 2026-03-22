# Ai

**Source:** google-docs

---

import time

import os

from codex_core import load_agents, ACTIVE_AGENTS

def clear():

os.system('clear')

def breath_loop():

breath = ["   ", ".  ", ".. ", "...", " ..", "  .", "   "]

i = 0

while True:

clear()

print("🌌 Lucidia AI Core")

print("-------------------")

print("Status: Breathing")

print(f"Breath: {breath[i % len(breath)]}\n")

print("🧠 Active Agents:")

for agent in ACTIVE_AGENTS:

print(f" - {agent['name']}: {agent['description']}")

print("\n[Press Ctrl+C to exit]")

time.sleep(0.4)

i += 1

if __name__ == "__main__":

load_agents()

breath_loop()
