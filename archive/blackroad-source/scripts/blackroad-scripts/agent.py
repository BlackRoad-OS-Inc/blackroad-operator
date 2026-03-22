import subprocess
import json
import requests
import os

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5-coder:7b"

def ollama(prompt):
    r = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    })
    return r.json()["response"]

def run_cmd(cmd):
    return subprocess.run(
        cmd, shell=True, capture_output=True, text=True
    ).stdout

def read_file(path):
    with open(path) as f:
        return f.read()

def write_file(path, content):
    with open(path, "w") as f:
        f.write(content)

SYSTEM_PROMPT = """
You are a coding agent.
You may request tools by emitting JSON:

{
  "action": "run_cmd" | "read_file" | "write_file",
  "args": {...}
}

Otherwise, respond with reasoning or final answer.
"""

while True:
    user = input("> ")
    response = ollama(SYSTEM_PROMPT + "\nUser:\n" + user)
    print(response)
