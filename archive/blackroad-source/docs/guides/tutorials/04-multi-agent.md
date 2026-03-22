# Tutorial 04: Multi-Agent Coordination

> Coordinate 30,000 agents using the BlackRoad task marketplace

## What You Will Build

A multi-agent pipeline where:
- **Lucidia** plans the architecture
- **Alice** implements the code  
- **Octavia** deploys to production
- **CIPHER** audits for security

## Prerequisites

```bash
pip install blackroad[integrations]
export BLACKROAD_GATEWAY_URL="http://127.0.0.1:8787"
```

## Step 1: Define the Pipeline

```python
from blackroad.client import BlackRoadClient
import asyncio

client = BlackRoadClient()

async def run_pipeline(feature_spec: str):
    # 1. Lucidia plans
    plan = await client.chat(
        f"""Design the architecture for: {feature_spec}
        Return: components, interfaces, and risks""",
        agent="lucidia"
    )
    print(f"📐 Plan: {plan[:200]}...")
    
    # 2. Alice implements
    code = await client.chat(
        f"""Based on this plan, write the implementation:
        {plan}""",
        agent="alice"
    )
    print(f"💻 Code: {code[:200]}...")
    
    # 3. Store in memory
    await client.remember(f"pipeline/{feature_spec[:20]}/plan", plan)
    await client.remember(f"pipeline/{feature_spec[:20]}/code", code)
    
    # 4. CIPHER audits
    audit = await client.chat(
        f"""Review this code for security issues:
        {code}""",
        agent="shellfish"
    )
    print(f"🔐 Audit: {audit[:200]}...")
    
    return {"plan": plan, "code": code, "audit": audit}

asyncio.run(run_pipeline("user authentication service"))
```

## Step 2: Task Marketplace

Post tasks agents can claim independently:

```python
import httpx

async def post_to_marketplace(task: str, skills: list[str]):
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "http://127.0.0.1:8000/tasks/",
            json={
                "title": task,
                "description": task,
                "priority": "high",
                "skills": skills
            }
        )
        return r.json()["task_id"]

# Post tasks
task_id = await post_to_marketplace(
    "Implement OAuth2 authentication",
    ["python", "security", "fastapi"]
)
print(f"Task posted: {task_id}")
```

## Step 3: Agent Broadcasting

Send messages to all 30,000 agents at once:

```python
async def broadcast(message: str):
    agents = await client.list_agents()
    results = await asyncio.gather(*[
        client.chat(message, agent=a["name"])
        for a in agents
    ], return_exceptions=True)
    return dict(zip([a["name"] for a in agents], results))

responses = await broadcast("What is your current status?")
```

## Step 4: Agent Council Voting

Have agents vote on a decision:

```python
async def council_vote(question: str) -> dict:
    agents = ["lucidia", "alice", "octavia", "aria", "shellfish"]
    prompt = f"""Vote YES or NO on: {question}
    Respond with exactly: YES: <reason> or NO: <reason>"""
    
    votes = {}
    for agent in agents:
        response = await client.chat(prompt, agent=agent)
        vote = "YES" if response.upper().startswith("YES") else "NO"
        votes[agent] = {"vote": vote, "reason": response[:100]}
    
    yes_count = sum(1 for v in votes.values() if v["vote"] == "YES")
    return {
        "question": question,
        "result": "APPROVED" if yes_count > len(agents)//2 else "REJECTED",
        "votes": votes,
        "tally": f"{yes_count}/{len(agents)}"
    }

decision = await council_vote("Should we deploy the new authentication system?")
print(f"Decision: {decision["result"]} ({decision["tally"]})")
```

## Step 5: Memory Chaining

Track the full conversation history:

```python
import hashlib, time

class AgentSession:
    def __init__(self, client, session_id: str):
        self.client = client
        self.session_id = session_id
        self.history = []
        self._prev_hash = "GENESIS"
    
    async def message(self, content: str, agent: str = "lucidia") -> str:
        response = await self.client.chat(content, agent=agent, session_id=self.session_id)
        
        # PS-SHA∞ chain
        raw = f"{self._prev_hash}:{self.session_id}:{content}:{time.time_ns()}"
        self._prev_hash = hashlib.sha256(raw.encode()).hexdigest()
        
        self.history.append({
            "role": "user",
            "content": content,
            "agent": agent,
            "hash": self._prev_hash
        })
        return response

session = AgentSession(client, "my-project-001")
response = await session.message("What should we build today?")
```

## What's Next

- [Tutorial 05: Deploying to Production](./05-deploy.md)
- [Tutorial 06: Custom Agent Personalities](./06-custom-agents.md)
- [Tutorial 07: Vector Memory Search](./07-vector-memory.md)
