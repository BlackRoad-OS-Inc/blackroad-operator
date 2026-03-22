# Module 5: Gateway Setup & Provider Configuration

> **BlackRoad Education** · Series: BlackRoad OS for Developers

This module walks you through running the BlackRoad tokenless gateway
locally and connecting multiple AI providers.

---

## What Is the Gateway?

The gateway is the **only** component that holds API keys.
It sits between your agents and AI providers:

```
[Your Agents]  →  [Gateway :8787]  →  [Ollama / Claude / OpenAI]
```

Agents set `BLACKROAD_GATEWAY_URL` — that's their only configuration.
Zero API keys in agent code. Ever.

---

## Prerequisites

- Node.js 22+
- Docker (for Ollama)
- An Anthropic or OpenAI API key (optional — Ollama works offline)

---

## Step 1: Clone and Install

```bash
git clone https://github.com/BlackRoad-OS-Inc/blackroad-gateway
cd blackroad-gateway
npm install
cp .env.example .env
```

---

## Step 2: Configure Providers

Edit `.env`:

```env
# Required
BLACKROAD_GATEWAY_PORT=8787
BLACKROAD_GATEWAY_BIND=127.0.0.1  # localhost only (security default)
NODE_ENV=development

# At least one AI provider required
BLACKROAD_OLLAMA_URL=http://localhost:11434  # Local, recommended

# Cloud providers (optional)
BLACKROAD_ANTHROPIC_API_KEY=sk-ant-...
BLACKROAD_OPENAI_API_KEY=sk-...
```

---

## Step 3: Start Ollama (Local AI)

```bash
# Install Ollama: https://ollama.ai
ollama pull llama3.2     # 2GB — fast, capable
ollama pull qwen2.5:7b   # 5GB — better reasoning

# Verify
curl http://localhost:11434/api/tags
```

---

## Step 4: Start the Gateway

```bash
npm start
# or: node src/index.js
```

Expected output:
```
[Gateway] BlackRoad Gateway v1.0.0
[Gateway] Listening on http://127.0.0.1:8787
[Provider] Ollama connected (http://localhost:11434)
[Provider] Anthropic connected
```

---

## Step 5: Test the Gateway

```bash
# Health check
curl http://localhost:8787/health | python3 -m json.tool

# Test chat
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "Hello, LUCIDIA!"}]
  }' | python3 -m json.tool

# Test streaming
curl -N -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.2", "messages": [{"role":"user","content":"Count to 5"}], "stream": true}'
```

---

## Step 6: Connect an Agent

With the gateway running, your agents need only one env var:

```bash
export BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787
python3 - << 'EOF'
import asyncio, os, sys
sys.path.insert(0, 'src/agents')
from lucidia import Lucidia

async def main():
    agent = Lucidia()
    reply = await agent.chat("What can you help me with today?")
    print("LUCIDIA:", reply)

asyncio.run(main())
EOF
```

---

## Docker Compose (Full Stack)

Run gateway + Ollama together:

```bash
docker compose up -d
```

The `docker-compose.yml` in the repo starts:
- `blackroad-gateway` on `:8787`  
- `ollama` on `:11434` (localhost-bound)

---

## Production Deployment

For production, set `BLACKROAD_GATEWAY_BIND=0.0.0.0` and put a reverse
proxy (Traefik, Nginx, Cloudflare Tunnel) in front.

**Never expose raw provider keys to the internet.** The gateway handles auth.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED :8787` | Gateway not started |
| `502 Bad Gateway` | Ollama not running (`ollama serve`) |
| `503 No providers` | Check `.env` — at least one provider key needed |
| `429 Too Many Requests` | Rate limit hit — wait 60s or increase `RATE_LIMIT_RPM` |

---

## Next: Module 6 — Memory System Deep Dive →
