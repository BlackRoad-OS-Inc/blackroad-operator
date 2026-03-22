"""
BlackRoad OS - Complete Backend API
FastAPI backend with auth, payments, AI chat, agents, blockchain
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import jwt
import hashlib
import secrets
import time
from datetime import datetime, timedelta
import os
import asyncio

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "blackroad-secret-key-change-in-production")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Initialize FastAPI
app = FastAPI(
    title="BlackRoad OS API",
    description="Complete backend for BlackRoad Operating System",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
users_db = {}
sessions_db = {}
agents_db = {}
blockchain_db = {"blocks": [], "transactions": []}
conversations_db = {}

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class AgentSpawn(BaseModel):
    role: str
    capabilities: List[str]
    pack: Optional[str] = None

class Transaction(BaseModel):
    from_address: str
    to_address: str
    amount: float
    currency: str = "RoadCoin"

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.InvalidTokenError:
        return None

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    if not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    return verify_token(token)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "blackroad-os-api", "timestamp": datetime.utcnow().isoformat()}

@app.get("/ready")
async def readiness_check():
    return {"status": "ready", "version": "1.0.0"}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = f"user-{secrets.token_hex(16)}"
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "name": user.name or user.email.split("@")[0],
        "password_hash": hash_password(user.password),
        "created_at": datetime.utcnow().isoformat(),
        "subscription_tier": "free"
    }

    token = create_token(user_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user.email,
            "name": users_db[user.email]["name"]
        }
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = users_db.get(credentials.email)
    if not user or user["password_hash"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }

@app.get("/api/auth/me")
async def get_current_user_info(user_id: Optional[str] = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    for email, user in users_db.items():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "subscription_tier": user.get("subscription_tier", "free")
            }

    raise HTTPException(status_code=404, detail="User not found")

# AI Chat endpoints
@app.post("/api/ai-chat/chat")
async def chat(message: ChatMessage, user_id: Optional[str] = Depends(get_current_user)):
    conversation_id = message.conversation_id or f"conv-{secrets.token_hex(8)}"

    if conversation_id not in conversations_db:
        conversations_db[conversation_id] = {
            "id": conversation_id,
            "user_id": user_id,
            "messages": [],
            "created_at": datetime.utcnow().isoformat()
        }

    # Add user message
    user_msg = {
        "role": "user",
        "content": message.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    conversations_db[conversation_id]["messages"].append(user_msg)

    # Generate AI response (mock - replace with real LLM)
    ai_response = f"I'm BlackRoad OS. You said: '{message.message}'. I have 30,000 agents ready to help!"

    ai_msg = {
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.utcnow().isoformat()
    }
    conversations_db[conversation_id]["messages"].append(ai_msg)

    return {
        "conversation_id": conversation_id,
        "message": ai_response,
        "messages": conversations_db[conversation_id]["messages"]
    }

@app.get("/api/ai-chat/conversations")
async def list_conversations(user_id: Optional[str] = Depends(get_current_user)):
    user_convos = [
        conv for conv in conversations_db.values()
        if conv.get("user_id") == user_id or user_id is None
    ]
    return {"conversations": user_convos}

# Agents endpoints
@app.post("/api/agents/spawn")
async def spawn_agent(agent: AgentSpawn, user_id: Optional[str] = Depends(get_current_user)):
    agent_id = f"agent-{secrets.token_hex(16)}"
    agents_db[agent_id] = {
        "id": agent_id,
        "role": agent.role,
        "capabilities": agent.capabilities,
        "pack": agent.pack,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "created_by": user_id
    }

    return {
        "agent_id": agent_id,
        "status": "spawned",
        "agent": agents_db[agent_id]
    }

@app.get("/api/agents/list")
async def list_agents(user_id: Optional[str] = Depends(get_current_user)):
    user_agents = [
        agent for agent in agents_db.values()
        if agent.get("created_by") == user_id or user_id is None
    ]
    return {
        "total_agents": len(agents_db),
        "user_agents": len(user_agents),
        "agents": user_agents[:100]  # Limit to 100 for performance
    }

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    agent = agents_db.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@app.delete("/api/agents/{agent_id}")
async def terminate_agent(agent_id: str, user_id: Optional[str] = Depends(get_current_user)):
    agent = agents_db.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.get("created_by") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    agent["status"] = "terminated"
    agent["terminated_at"] = datetime.utcnow().isoformat()
    return {"status": "terminated", "agent_id": agent_id}

# Blockchain endpoints
@app.get("/api/blockchain/blocks")
async def get_blocks(limit: int = 10):
    return {
        "blocks": blockchain_db["blocks"][-limit:],
        "total_blocks": len(blockchain_db["blocks"])
    }

@app.post("/api/blockchain/transaction")
async def create_transaction(tx: Transaction, user_id: Optional[str] = Depends(get_current_user)):
    tx_id = f"tx-{secrets.token_hex(16)}"
    transaction = {
        "id": tx_id,
        "from": tx.from_address,
        "to": tx.to_address,
        "amount": tx.amount,
        "currency": tx.currency,
        "status": "pending",
        "timestamp": datetime.utcnow().isoformat(),
        "created_by": user_id
    }
    blockchain_db["transactions"].append(transaction)

    return {"transaction_id": tx_id, "status": "pending", "transaction": transaction}

@app.get("/api/blockchain/transactions")
async def get_transactions(limit: int = 10):
    return {
        "transactions": blockchain_db["transactions"][-limit:],
        "total_transactions": len(blockchain_db["transactions"])
    }

# Stripe payment endpoints
@app.post("/api/payments/create-checkout-session")
async def create_checkout_session(data: Dict[str, Any]):
    # Mock Stripe checkout session
    session_id = f"cs_test_{secrets.token_hex(24)}"
    sessions_db[session_id] = {
        "id": session_id,
        "amount": data.get("amount", 4900),
        "currency": "usd",
        "tier": data.get("tier", "starter"),
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }

    return {
        "sessionId": session_id,
        "url": f"https://checkout.stripe.com/pay/{session_id}"
    }

@app.post("/api/payments/verify-payment")
async def verify_payment(data: Dict[str, Any], user_id: Optional[str] = Depends(get_current_user)):
    session_id = data.get("session_id")
    session = sessions_db.get(session_id)

    if not session:
        return {"success": False, "message": "Session not found"}

    # Update user subscription
    for email, user in users_db.items():
        if user["id"] == user_id:
            user["subscription_tier"] = session.get("tier", "starter")
            break

    return {
        "success": True,
        "tier": session.get("tier"),
        "message": "Payment verified"
    }

# Files endpoints
@app.get("/api/files/list")
async def list_files(user_id: Optional[str] = Depends(get_current_user)):
    return {
        "files": [],
        "total_files": 0,
        "storage_used": 0,
        "storage_limit": 10 * 1024 * 1024 * 1024  # 10GB
    }

# Social endpoints
@app.get("/api/social/feed")
async def get_social_feed(limit: int = 20):
    return {
        "posts": [],
        "total_posts": 0
    }

# System stats
@app.get("/api/system/stats")
async def get_system_stats():
    return {
        "total_users": len(users_db),
        "total_agents": len(agents_db),
        "active_agents": sum(1 for a in agents_db.values() if a["status"] == "active"),
        "total_conversations": len(conversations_db),
        "total_blocks": len(blockchain_db["blocks"]),
        "total_transactions": len(blockchain_db["transactions"]),
        "uptime": "100%",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
