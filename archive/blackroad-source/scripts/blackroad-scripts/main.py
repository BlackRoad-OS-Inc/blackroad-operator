import requests
import os

OLLAMA = "http://localhost:11434/api/chat"
CLAUDE_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

def ask_ollama(msg):
    r = requests.post(OLLAMA, json={
        "model": "phi3",
        "messages": [{"role": "user", "content": msg}],
        "stream": False
    })
    return r.json()["message"]["content"]

def ask_claude(msg):
    r = requests.post("https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": CLAUDE_KEY,
            "content-type": "application/json",
            "anthropic-version": "2023-06-01"
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": msg}]
        })
    return r.json()["content"][0]["text"]

def route(msg):
    decision = ask_ollama(f"Should this go to Claude? Answer ONLY 'yes' or 'no': {msg}")
    if "yes" in decision.lower():
        return "claude", ask_claude(msg)
    return "local", ask_ollama(msg)

if __name__ == "__main__":
    while True:
        you = input("\nyou: ")
        if you.lower() in ["q", "quit"]:
            break
        who, answer = route(you)
        print(f"\nlucidia ({who}): {answer}")
```

Save and exit.

Set your key:
```
export ANTHROPIC_API_KEY="your-key-here"
```

Run:
```
python3 main.py
