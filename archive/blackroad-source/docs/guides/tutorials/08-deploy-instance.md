# Tutorial 08 — Deploying Your Own BlackRoad OS Instance

> **Prerequisites:** Tutorial 07 (Multi-Agent Coordination)  
> **Time:** ~45 minutes  
> **Goal:** Run BlackRoad OS gateway + agents locally, then deploy to Railway + Cloudflare

---

## Architecture

```
┌──────────────────┐        ┌──────────────────┐
│   Your App /     │  HTTP  │  BlackRoad        │
│   Browser /      │◄──────►│  Gateway :8787    │
│   CLI           │        │  (Node.js)        │
└──────────────────┘        └────────┬─────────┘
                                     │
                    ┌────────────────┼─────────────────┐
                    ▼                ▼                  ▼
              ┌──────────┐   ┌──────────┐      ┌──────────┐
              │  Ollama  │   │ Anthropic│      │  OpenAI  │
              │ :11434   │   │   API    │      │   API    │
              └──────────┘   └──────────┘      └──────────┘
```

---

## Option A: Local Development (5 minutes)

### Prerequisites

```bash
# Install Node.js 20+
node --version  # Should be >= 20

# Install Ollama (for local inference)
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2  # ~2GB download
```

### Run the Gateway

```bash
# Clone the gateway
git clone https://github.com/BlackRoad-OS-Inc/blackroad-gateway
cd blackroad-gateway
npm install
npm run build

# Set environment
export BLACKROAD_OLLAMA_URL=http://localhost:11434
export BLACKROAD_GATEWAY_PORT=8787

# Start
npm start
```

### Verify

```bash
curl http://localhost:8787/health
# {"status":"ok","version":"0.1.0","providers":["ollama"]}

curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"Hello!"}]}'
```

---

## Option B: Docker Compose (10 minutes)

```yaml
# docker-compose.yml
version: "3.9"
services:
  gateway:
    image: ghcr.io/blackroad-os-inc/blackroad-gateway:latest
    ports: ["8787:8787"]
    environment:
      BLACKROAD_OLLAMA_URL: http://ollama:11434
    depends_on: [ollama]

  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama_data:/root/.ollama

  agents:
    image: ghcr.io/blackroad-os-inc/blackroad-agents:latest
    environment:
      BLACKROAD_GATEWAY_URL: http://gateway:8787
    depends_on: [gateway]

volumes:
  ollama_data:
```

```bash
docker compose up -d
docker compose exec ollama ollama pull llama3.2
curl http://localhost:8787/health
```

---

## Option C: Deploy to Railway (Production)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Create project
railway init blackroad-gateway

# Deploy
railway up

# Set secrets
railway variables set BLACKROAD_ANTHROPIC_API_KEY=sk-ant-...
railway variables set BLACKROAD_OPENAI_API_KEY=sk-...
railway variables set BLACKROAD_OLLAMA_URL=https://your-ollama-endpoint.com

# Get your URL
railway domain
```

---

## Option D: Raspberry Pi (Privacy-First)

```bash
# On your Mac/Linux machine:
git clone https://github.com/BlackRoad-OS-Inc/blackroad-infra
cd blackroad-infra

# Configure Pi IPs in inventory
cat > ansible/inventory.yaml << 'YAML'
all:
  hosts:
    blackroad-pi:
      ansible_host: 192.168.4.64
      ansible_user: pi
YAML

# Provision everything
ansible-playbook ansible/pi-fleet.yaml

# SSH in and verify
ssh pi@192.168.4.64 'curl http://localhost:11434/api/tags'
ssh pi@192.168.4.64 'curl http://localhost:8787/health'
```

---

## Connecting Your App

```bash
# Set the gateway URL for your SDK
export BLACKROAD_GATEWAY_URL=https://your-gateway.railway.app
# or
export BLACKROAD_GATEWAY_URL=http://192.168.4.64:8787

# Test Python SDK
python3 -c "
import asyncio
from blackroad_sdk import BlackRoadClient
async def test():
    async with BlackRoadClient() as c:
        print(await c.health())
asyncio.run(test())
"
```

---

## Next Steps

- **Tutorial 09:** Custom agent personalities
- **Tutorial 10:** Scaling to production (K8s + HPA)
