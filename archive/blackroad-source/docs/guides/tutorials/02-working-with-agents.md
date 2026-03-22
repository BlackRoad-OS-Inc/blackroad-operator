# Tutorial 02: Working with BlackRoad Agents

**Level:** Beginner  
**Time:** ~30 minutes  
**Prerequisites:** Tutorial 01 (Getting Started)

## What You'll Learn

- How the 6 core agents work
- How to send messages to agents
- How to use the CECE identity system
- How to build a simple agent that responds

---

## 1. Meet the Agents

BlackRoad OS ships with 6 core agents, each with a distinct role:

| Agent | Role | Speciality |
|-------|------|-----------|
| LUCIDIA | Coordinator | Reasoning, philosophy, strategy |
| ALICE | Operator | Task execution, automation |
| OCTAVIA | Architect | DevOps, infrastructure |
| PRISM | Analyst | Data analysis, patterns |
| ECHO | Librarian | Memory, recall |
| CIPHER | Guardian | Security, encryption |

---

## 2. Sending Your First Message

Using the `br` CLI:

```bash
# Chat with LUCIDIA
./whisper.sh LUCIDIA "What should I focus on today?"

# Ask ALICE to run a task
./whisper.sh ALICE "Deploy my changes to staging"

# Get PRISM to analyze data
./whisper.sh PRISM "Analyze my last 30 git commits for patterns"
```

Or via the API:
```bash
curl -X POST http://127.0.0.1:8787/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"agent": "LUCIDIA", "message": "Hello!"}'
```

---

## 3. Understanding Agent Responses

Agents respond with structured JSON:

```json
{
  "agent": "LUCIDIA",
  "response": "Today I'd focus on...",
  "memory_hash": "abc123...",
  "truth_state": 1,
  "timestamp": "2026-02-05T12:00:00Z"
}
```

- `memory_hash` — each response is stored in PS-SHA∞ memory
- `truth_state` — `1` (true), `0` (uncertain), `-1` (false)

---

## 4. The CECE Identity System

CECE is the portable AI identity that persists across sessions:

```bash
# Initialize CECE
br cece init

# See who CECE is
br cece whoami

# CECE remembers relationships
br cece relationship add "Alexa" --bond 0.9 --context "Creator of BlackRoad OS"

# Check skills
br cece skill list
```

CECE stores everything in `~/.blackroad/cece-identity.db` — portable across any AI provider.

---

## 5. Building a Simple Agent

Create `my-agent.sh`:

```bash
#!/bin/zsh
# My Custom Agent

GATEWAY_URL="${BLACKROAD_GATEWAY_URL:-http://127.0.0.1:8787}"
AGENT_NAME="MY-AGENT"

chat() {
    local message="$1"
    curl -s -X POST "$GATEWAY_URL/v1/chat" \
        -H "Content-Type: application/json" \
        -d "{\"agent\": \"$AGENT_NAME\", \"message\": \"$message\"}" \
        | jq -r '.response'
}

echo "💬 $AGENT_NAME is online"
while true; do
    read "?You: " input
    [[ "$input" == "quit" ]] && break
    response=$(chat "$input")
    echo "🤖 $AGENT_NAME: $response"
done
```

Make it executable: `chmod +x my-agent.sh` and run: `./my-agent.sh`

---

## 6. What's Next?

- **Tutorial 03** — Memory & Persistence (PS-SHA∞)
- **Tutorial 04** — Building a Multi-Agent Workflow
- **Tutorial 05** — Deploying Agents to Production

---

*© BlackRoad OS, Inc. | [blackroad.io](https://blackroad.io)*
