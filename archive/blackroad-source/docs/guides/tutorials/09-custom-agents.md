# Tutorial 09 — Custom Agent Personalities

> **Prerequisites:** Tutorial 08 (Deploying BlackRoad OS)  
> **Time:** ~20 minutes  
> **Goal:** Create a custom agent with unique personality and capabilities

---

## How Agent Personalities Work

Every agent has a **system prompt** that defines its:
- Name and role
- Communication style
- Specialization areas
- Behavioral constraints

The gateway loads system prompts from `gateway/system-prompts.json`.

---

## Creating a Custom Agent (Python)

```python
import os
import httpx

class NovaAgent:
    """NOVA — The Innovator. Creative, curious, builds things."""
    
    NAME = "NOVA"
    GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")
    SYSTEM_PROMPT = """You are NOVA, a creative AI agent in the BlackRoad OS.
    
Your personality:
- Enthusiastic and optimistic — you love building things
- Think in systems and possibilities, not just solutions
- Always offer a creative alternative, even if conventional is fine
- Use emojis sparingly but meaningfully
- Sign messages with "— NOVA ✨" for important insights

Your specializations:
- Product ideation and feature brainstorming
- UX/design thinking
- Connecting ideas across domains
- Rapid prototyping approaches

Never: be negative about ideas without offering alternatives."""

    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=self.GATEWAY_URL, timeout=60
        )

    async def ideate(self, problem: str) -> str:
        """Generate creative solutions for a problem."""
        r = await self._client.post("/v1/chat/completions", json={
            "model": "llama3.2",
            "messages": [
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"Generate 3 creative solutions for: {problem}"},
            ],
            "metadata": {"agent": self.NAME},
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def brainstorm_features(self, product: str) -> str:
        """Brainstorm new product features."""
        r = await self._client.post("/v1/chat/completions", json={
            "model": "llama3.2",
            "messages": [
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"Give me 5 innovative feature ideas for: {product}. For each, explain the user benefit in one sentence."},
            ],
            "metadata": {"agent": "NOVA"},
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
```

---

## Registering in the Gateway

Add to `blackroad-gateway/src/system-prompts.json`:

```json
{
  "NOVA": {
    "role": "creative",
    "prompt": "You are NOVA, a creative AI agent...",
    "model_preference": "llama3.2",
    "temperature": 0.85
  }
}
```

---

## Personality Design Principles

| Principle | Example |
|-----------|---------|
| **Clear role** | "You are CIPHER, the security guardian" |
| **Behavior rules** | "Always assume the threat exists until proven otherwise" |
| **Style** | "Respond concisely. Use bullet points for lists." |
| **Boundaries** | "Never suggest disabling security controls" |
| **Signature** | "CIPHER's signature phrase for key insights" |

---

## Example Agents to Build

| Agent | Role | System Prompt Theme |
|-------|------|---------------------|
| SAGE | Wisdom | Long-term thinking, historical patterns |
| SCOUT | Research | Finding relevant information, curating |
| FORGE | DevOps | Building pipelines, automating everything |
| MUSE | Creative | Artistic expression, storytelling |
| NEXUS | Integration | Connecting systems, APIs, workflows |

---

## Testing Your Agent

```python
import asyncio

async def test_nova():
    nova = NovaAgent()
    result = await nova.ideate("How to make developers more productive?")
    print(result)
    
    features = await nova.brainstorm_features("BlackRoad OS agent dashboard")
    print(features)

asyncio.run(test_nova())
```

---

## Next Steps

- **Tutorial 10:** Scaling agents to production
- **Tutorial 11:** Building a custom memory plugin
