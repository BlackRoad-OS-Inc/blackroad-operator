from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

app = FastAPI(
    title="RoadCoin",
    description="Non-IPO Funding Platform with Crypto Integration",
    version="1.0.0"
)

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

class Campaign(BaseModel):
    id: str
    name: str
    description: str
    founder: str
    target_amount: float
    raised_amount: float
    currency: str = "USD"
    status: str
    backers_count: int
    start_date: str
    end_date: str
    
class Investment(BaseModel):
    id: str
    campaign_id: str
    investor: str
    amount: float
    currency: str
    timestamp: str

campaigns = [
    {
        "id": "1",
        "name": "BlackRoad OS",
        "description": "Revolutionary operating system",
        "founder": "Alexa",
        "target_amount": 1000000,
        "raised_amount": 350000,
        "currency": "USD",
        "status": "active",
        "backers_count": 42,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31"
    }
]

investments = []

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "RoadCoin",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health")
async def api_health():
    return {
        "status": "healthy",
        "service": "RoadCoin",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    return {
        "name": "RoadCoin",
        "description": "Non-IPO Funding Platform",
        "features": [
            "Equity crowdfunding",
            "Crypto payments",
            "Smart contract integration",
            "Investor verification",
            "Automated disbursements"
        ],
        "endpoints": {
            "campaigns": "/api/campaigns",
            "investments": "/api/investments",
            "stats": "/api/stats"
        }
    }

@app.get("/api/campaigns")
async def get_campaigns(status: Optional[str] = None):
    filtered = campaigns if not status else [c for c in campaigns if c["status"] == status]
    return {"success": True, "count": len(filtered), "data": filtered}

@app.post("/api/campaigns")
async def create_campaign(campaign: dict):
    campaigns.append(campaign)
    return {"success": True, "data": campaign}

@app.get("/api/investments")
async def get_investments(campaign_id: Optional[str] = None):
    filtered = investments if not campaign_id else [i for i in investments if i["campaign_id"] == campaign_id]
    return {"success": True, "count": len(filtered), "data": filtered}

@app.get("/api/stats")
async def get_stats():
    total_raised = sum(c["raised_amount"] for c in campaigns)
    return {
        "success": True,
        "data": {
            "total_campaigns": len(campaigns),
            "active_campaigns": len([c for c in campaigns if c["status"] == "active"]),
            "total_raised": total_raised,
            "total_backers": sum(c["backers_count"] for c in campaigns)
        }
    }
