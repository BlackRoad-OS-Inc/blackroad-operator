# Tutorial 07 — Multi-Agent Coordination

> **Prerequisites:** Tutorial 06 (Memory Deep Dive)  
> **Time:** ~25 minutes  
> **Goal:** Route tasks between agents, run a council vote, broadcast to all agents

---

## The Agent Roster

BlackRoad OS ships with 6 core agents:

| Agent | Specialty | Best For |
|-------|-----------|----------|
| **LUCIDIA** | Reasoning, philosophy | Complex analysis, strategy |
| **ALICE** | Routing, navigation | Task orchestration, decisions |
| **OCTAVIA** | Compute, inference | Heavy computation, code execution |
| **PRISM** | Pattern recognition | Data analysis, anomaly detection |
| **ECHO** | Memory, recall | Context retrieval, session history |
| **CIPHER** | Security | Auth, scanning, encryption advice |

---

## Routing a Task to the Right Agent

```python
from blackroad_sdk import BlackRoadClient

async def route_task():
    async with BlackRoadClient() as client:
        # ALICE handles routing decisions
        recommendation = await client.chat(
            "Which agent should handle: 'Analyze our Q4 revenue trends'?",
            agent="ALICE"
        )
        print(recommendation)  # Suggests PRISM

        # Send to PRISM directly
        analysis = await client.chat(
            "Analyze Q4 revenue trends: $180K → $220K → $310K",
            agent="PRISM"
        )
        print(analysis)
```

---

## Running a Council Vote

The council lets all 6 agents vote on a decision:

```python
async def council_vote():
    question = "Should we deploy the new gateway version today?"
    agents = ["LUCIDIA", "ALICE", "OCTAVIA", "PRISM", "ECHO", "CIPHER"]
    votes = {}

    async with BlackRoadClient() as client:
        for agent in agents:
            response = await client.chat(
                f"Vote YES or NO with one sentence reasoning: {question}",
                agent=agent
            )
            vote = "YES" if "yes" in response.lower() else "NO"
            votes[agent] = {"vote": vote, "reasoning": response}
            print(f"{agent}: {vote}")

    yes = sum(1 for v in votes.values() if v["vote"] == "YES")
    print(f"\nResult: {yes}/6 in favor → {'APPROVED' if yes >= 4 else 'REJECTED'}")
```

---

## Parallel Agent Execution

Run multiple agents concurrently for faster results:

```python
import asyncio

async def parallel_analysis(data: str):
    async with BlackRoadClient() as client:
        # Ask 3 agents simultaneously
        results = await asyncio.gather(
            client.chat(f"Technical analysis: {data}", agent="OCTAVIA"),
            client.chat(f"Pattern analysis: {data}", agent="PRISM"),
            client.chat(f"Security implications: {data}", agent="CIPHER"),
        )
        technical, patterns, security = results
        
        # Synthesize with LUCIDIA
        synthesis = await client.chat(
            f"Synthesize: Technical={technical[:200]}... Patterns={patterns[:200]}... Security={security[:200]}...",
            agent="LUCIDIA"
        )
        return synthesis
```

---

## Saving Coordination State to Memory

```python
import time

async def coordinated_task():
    task_id = f"task.{int(time.time())}"
    async with BlackRoadClient() as client:
        # ALICE plans the task
        plan = await client.chat("Break down: Deploy new ML model to production", agent="ALICE")
        await client.memory_write(f"{task_id}.plan", {"content": plan, "agent": "ALICE"})

        # CIPHER reviews security
        review = await client.chat(f"Security review of plan: {plan[:300]}", agent="CIPHER")
        await client.memory_write(f"{task_id}.security_review", {"content": review, "agent": "CIPHER"})

        # OCTAVIA executes
        result = await client.chat("Execute step 1 of the deployment plan", agent="OCTAVIA")
        await client.memory_write(f"{task_id}.execution_log", {"content": result, "agent": "OCTAVIA"})

        print(f"Task {task_id} complete — 3 entries in memory chain")
```

---

## Next Steps

- **Tutorial 08:** Deploying your own BlackRoad OS instance
- **Tutorial 09:** Custom agent personalities and system prompts
