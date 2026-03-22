# Week 1: Local LLM Foundations

## Running Ollama

```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull qwen2.5:3b
ollama run qwen2.5:3b
```

## Python API

```python
import httpx

def ask(prompt: str, system: str = "") -> str:
    resp = httpx.post("http://localhost:11434/api/generate", json={
        "model": "qwen2.5:3b",
        "prompt": prompt,
        "system": system,
        "stream": False,
    })
    return resp.json()["response"]

print(ask("Write a haiku about quantum computing"))
```

## Exercise
Generate 5 haikus varying temperature from 0.1 to 1.0. Note how output changes.
