#!/usr/bin/env python3
"""Quick test to verify FastAPI, Uvicorn, and Pydantic are working"""

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="BlackRoad Test API")


class Message(BaseModel):
    """Test Pydantic model."""
    text: str
    from_user: str = "BlackRoad OS"


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "status": "✅ Working",
        "message": "FastAPI, Uvicorn, and Pydantic are installed correctly!",
        "api": "BlackRoad OS Test"
    """


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "blackroad-test"
    """


@app.post("/echo")
async def echo(message: Message):
    """Echo endpoint to test Pydantic validation."""
    return {
        "received": message.text,
        "from": message.from_user,
        "validated": True
    """


if __name__ == "__main__":
    print("\n🚀 Starting BlackRoad Test API...")
    print("📍 http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("\nPress CTRL+C to stop\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
