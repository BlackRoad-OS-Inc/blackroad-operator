"""
Agents endpoint — list, get, and message agents via the BlackRoad Gateway.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import httpx
import os

router = APIRouter(prefix="/agents", tags=["agents"])
GATEWAY = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

CORE_AGENTS = [
    {"name": "LUCIDIA", "type": "reasoning", "color": "#9C27B0", "capabilities": ["reasoning", "strategy", "philosophy"]},
    {"name": "ALICE", "type": "worker", "color": "#4CAF50", "capabilities": ["execution", "automation", "deployment"]},
    {"name": "OCTAVIA", "type": "devops", "color": "#2196F3", "capabilities": ["infrastructure", "k8s", "monitoring"]},
    {"name": "PRISM", "type": "analytics", "color": "#FF9800", "capabilities": ["analysis", "patterns", "reporting"]},
    {"name": "ECHO", "type": "memory", "color": "#00BCD4", "capabilities": ["recall", "storage", "context"]},
    {"name": "CIPHER", "type": "security", "color": "#F44336", "capabilities": ["security", "encryption", "audit"]},
]


@router.get("")
async def list_agents(
    status: str | None = Query(None),
    type: str | None = Query(None),
):
    """List all available agents."""
    agents = CORE_AGENTS.copy()
    if type:
        agents = [a for a in agents if a["type"] == type]
    
    # Try to get live status from gateway
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(f"{GATEWAY}/v1/agents")
            if r.status_code == 200:
                live = {a["name"]: a for a in r.json().get("agents", [])}
                for a in agents:
                    if a["name"] in live:
                        a.update(live[a["name"]])
    except Exception:
        # Gateway offline — return static data
        for a in agents:
            a["status"] = "unknown"
    
    return {"agents": agents, "total": len(agents)}


@router.get("/{name}")
async def get_agent(name: str):
    """Get a specific agent by name."""
    name = name.upper()
    agent = next((a for a in CORE_AGENTS if a["name"] == name), None)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {name} not found")
    return agent


class MessageRequest(BaseModel):
    message: str
    session_id: str | None = None


@router.post("/{name}/message")
async def message_agent(name: str, req: MessageRequest):
    """Send a direct message to an agent."""
    name = name.upper()
    if not any(a["name"] == name for a in CORE_AGENTS):
        raise HTTPException(status_code=404, detail=f"Agent {name} not found")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{GATEWAY}/v1/chat",
                json={"agent": name, "message": req.message, "session_id": req.session_id},
            )
            r.raise_for_status()
            return r.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gateway error: {e}")
