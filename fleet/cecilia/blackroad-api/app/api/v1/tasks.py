"""
BR Tasks Router — Task Marketplace API endpoints.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter()
GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

VALID_STATUSES = {"available", "claimed", "in_progress", "completed", "cancelled"}
VALID_PRIORITIES = {"low", "medium", "high", "critical"}


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = ""
    priority: str = "medium"
    tags: list[str] = []
    skills: list[str] = []


class Task(BaseModel):
    id: str
    title: str
    description: str = ""
    priority: str = "medium"
    status: str = "available"
    agent: Optional[str] = None
    tags: list[str] = []
    skills: list[str] = []
    created_at: str
    claimed_at: Optional[str] = None
    completed_at: Optional[str] = None


class TaskListResponse(BaseModel):
    tasks: list[Task]
    total: int
    gateway: str


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    agent: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    params = {"limit": limit, "offset": offset}
    if status: params["status"] = status
    if priority: params["priority"] = priority
    if agent: params["agent"] = agent

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{GATEWAY_URL}/tasks", params=params)
            resp.raise_for_status()
            data = resp.json()
            return TaskListResponse(tasks=data.get("tasks", []), total=data.get("total", 0), gateway="online")
    except httpx.ConnectError:
        return TaskListResponse(tasks=[], total=0, gateway="offline")


@router.post("/tasks", response_model=Task, status_code=201)
async def create_task(body: TaskCreate):
    if body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=422, detail=f"priority must be one of {sorted(VALID_PRIORITIES)}")

    payload = body.dict()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{GATEWAY_URL}/tasks", json=payload)
            resp.raise_for_status()
            return Task(**resp.json())
    except httpx.ConnectError:
        return Task(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow().isoformat() + "Z",
            **payload,
        )


@router.post("/tasks/{task_id}/claim", response_model=Task)
async def claim_task(task_id: str, agent: str = Query(..., description="Agent claiming the task")):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{GATEWAY_URL}/tasks/{task_id}/claim",
                json={"agent": agent},
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Task not found")
            if resp.status_code == 409:
                raise HTTPException(status_code=409, detail="Task already claimed")
            resp.raise_for_status()
            return Task(**resp.json())
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail={"error": "gateway_offline"})


@router.post("/tasks/{task_id}/complete", response_model=Task)
async def complete_task(task_id: str, agent: str = Query(...), summary: str = Query("")):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{GATEWAY_URL}/tasks/{task_id}/complete",
                json={"agent": agent, "summary": summary},
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Task not found")
            resp.raise_for_status()
            return Task(**resp.json())
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail={"error": "gateway_offline"})


@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{GATEWAY_URL}/tasks/{task_id}")
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Task not found")
            resp.raise_for_status()
            return Task(**resp.json())
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail={"error": "gateway_offline"})
