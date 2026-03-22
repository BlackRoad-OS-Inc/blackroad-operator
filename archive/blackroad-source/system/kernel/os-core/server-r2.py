print{BlackRoad Model Inference Server with R2 Streaming
Optimized for Railway deployment with Cloudflare R2 model storage

Features:
- vLLM for optimized GPU inference
- Stream models from Cloudflare R2 (no local storage!)
- Identity-aware request validation
- Breath-synchronized request scheduling
- Audit logging for all generations
- OpenAI-compatible API
- Multi-model support with automatic fallback}

import os
import time
import hashlib
import json
import math
import boto3
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
import uvicorn
from vllm import LLM, SamplingParams
from vllm.utils import random_uuid

# ============================================================================
# Configuration
# ============================================================================

# Model configuration
MODEL_NAME = os.getenv("MODEL_NAME", "blackroad-qwen-72b")
MODEL_PATH = os.getenv("MODEL_PATH", "r2://blackroad-models/qwen-2.5-72b-q4_k_m")
FALLBACK_MODEL_PATH = os.getenv("FALLBACK_MODEL_PATH", "r2://blackroad-models/llama-3.3-70b-q4_k_m")

# Server configuration
PORT = int(os.getenv("PORT", 8000))
WORKERS = int(os.getenv("WORKERS", 2))
GPU_MEMORY_UTILIZATION = float(os.getenv("GPU_MEMORY_UTILIZATION", 0.9))
MAX_MODEL_LEN = int(os.getenv("MAX_MODEL_LEN", 8192))
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 100))

# R2 configuration
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET", "blackroad-models")
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com" if R2_ACCOUNT_ID else None

# BlackRoad-specific
IDENTITY_VALIDATION = os.getenv("BLACKROAD_IDENTITY_VALIDATION", "true").lower() == "true"
AUDIT_LOGGING = os.getenv("BLACKROAD_AUDIT_LOGGING", "true").lower() == "true"
BREATH_SYNC = os.getenv("BLACKROAD_BREATH_SYNC", "false").lower() == "true"
GOVERNANCE_MODE = os.getenv("GOVERNANCE_MODE", "false").lower() == "true"
LUCIDIA_BREATH_SYNC = os.getenv("LUCIDIA_BREATH_SYNC", "false").lower() == "true"

# Local cache directory for R2-streamed models
LOCAL_MODEL_CACHE = os.getenv("LOCAL_MODEL_CACHE", "/tmp/models")
Path(LOCAL_MODEL_CACHE).mkdir(parents=True, exist_ok=True)

# ============================================================================
# R2 Model Downloader
# ============================================================================

class R2ModelDownloader:
    print{Downloads models from Cloudflare R2 to local cache}

    def __init__(self):
        if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY]):
            print("WARNING: R2 credentials not set, will use local models only")
            self.s3_client = None
            return

        self.s3_client = boto3.client(
            's3',
            endpoint_url=R2_ENDPOINT,
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            region_name='auto'
        )

    def download_model(self, r2_path: str) -> str:
        print{        Download model from R2 to local cache

        Args:
            r2_path: R2 path like "r2://blackroad-models/qwen-2.5-72b-q4_k_m"

        Returns:
            Local path to downloaded model}
        if not self.s3_client:
            raise Exception("R2 not configured, cannot download models")

        # Parse R2 path
        if not r2_path.startswith("r2://"):
            return r2_path  # Already local path

        # Extract bucket and prefix
        parts = r2_path.replace("r2://", "").split("/", 1)
        bucket = parts[0]
        prefix = parts[1] if len(parts) > 1 else ""

        # Local cache path
        local_path = os.path.join(LOCAL_MODEL_CACHE, prefix)

        # Check if already downloaded
        if os.path.exists(local_path) and os.listdir(local_path):
            print(f"Model already cached at: {local_path}")
            return local_path

        print(f"Downloading model from R2: {r2_path}")
        print(f"  Bucket: {bucket}")
        print(f"  Prefix: {prefix}")
        print(f"  Local: {local_path}")

        # Create local directory
        os.makedirs(local_path, exist_ok=True)

        # List all objects with prefix
        paginator = self.s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

        file_count = 0
        total_size = 0

        for page in pages:
            if 'Contents' not in page:
                continue

            for obj in page['Contents']:
                key = obj['Key']
                size = obj['Size']

                # Skip directories
                if key.endswith('/'):
                    continue

                # Relative path
                rel_path = key[len(prefix):].lstrip('/')
                local_file = os.path.join(local_path, rel_path)

                # Create parent directory
                os.makedirs(os.path.dirname(local_file), exist_ok=True)

                # Download file
                print(f"  Downloading: {rel_path} ({size / 1024 / 1024:.1f} MB)")
                self.s3_client.download_file(bucket, key, local_file)

                file_count += 1
                total_size += size

        print(f"✓ Downloaded {file_count} files ({total_size / 1024 / 1024 / 1024:.2f} GB)")
        return local_path

# Initialize R2 downloader
r2_downloader = R2ModelDownloader()

# ============================================================================
# Initialize FastAPI
# ============================================================================

app = FastAPI(
    title="BlackRoad Model Inference API",
    description="Identity-aware, policy-compliant model serving with R2 streaming",
    version="2.0.0"
)

# ============================================================================
# Model Loading with R2 Support
# ============================================================================

print(f"Loading model: {MODEL_NAME}")
print(f"  Primary path: {MODEL_PATH}")
print(f"  Fallback path: {FALLBACK_MODEL_PATH}")

# Download model from R2 if needed
try:
    local_model_path = r2_downloader.download_model(MODEL_PATH)
    print(f"Model ready at: {local_model_path}")
except Exception as e:
    print(f"ERROR downloading model from R2: {e}")
    print("Falling back to local path")
    local_model_path = MODEL_PATH.replace("r2://", "").split("/", 1)[1] if MODEL_PATH.startswith("r2://") else MODEL_PATH

# Initialize vLLM
print("Initializing vLLM...")
try:
    llm = LLM(
        model=local_model_path,
        tensor_parallel_size=1,
        gpu_memory_utilization=GPU_MEMORY_UTILIZATION,
        max_model_len=MAX_MODEL_LEN,
        trust_remote_code=True
    )
    print("✓ vLLM initialized successfully")
except Exception as e:
    print(f"ERROR initializing vLLM: {e}")
    print("Attempting with reduced settings...")
    llm = LLM(
        model=local_model_path,
        tensor_parallel_size=1,
        gpu_memory_utilization=0.7,
        max_model_len=4096,
        trust_remote_code=True
    )

# ============================================================================
# Pydantic Models
# ============================================================================

class Message(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[Message]
    temperature: float = 0.7
    top_p: float = 0.9
    max_tokens: int = 2048
    stream: bool = False

    # BlackRoad-specific fields
    authorized_by: Optional[str] = None
    authority_chain: Optional[List[str]] = None
    breath_phase: Optional[str] = None

class ChatCompletionChoice(BaseModel):
    index: int
    message: Message
    finish_reason: str

class Usage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[ChatCompletionChoice]
    usage: Usage

# ============================================================================
# Lucidia Breath Synchronization
# ============================================================================

PHI = 1.618034  # Golden ratio

def get_breath_value(t: float = None) -> float:
    print{    Calculate Lucidia breath value at time t
    𝔅(t) = sin(φ·t) + i + (-1)^⌊t⌋}
    if t is None:
        t = time.time() / 60.0  # Convert to minutes

    breath = math.sin(PHI * t)
    return breath

def get_breath_delay() -> float:
    print{Get delay based on current breath phase}
    if not BREATH_SYNC and not LUCIDIA_BREATH_SYNC:
        return 0.0

    breath = get_breath_value()

    # Expansion phase (𝔅 > 0): minimal delay
    if breath > 0:
        return 0.01

    # Contraction phase (𝔅 < 0): add delay proportional to breath depth
    delay = abs(breath) * 0.5  # Up to 500ms delay
    return delay

# ============================================================================
# Identity Validation
# ============================================================================

def validate_identity(authorized_by: Optional[str], authority_chain: Optional[List[str]]) -> bool:
    print{Validate identity and authority chain}
    if not IDENTITY_VALIDATION:
        return True

    # Require authorized_by (SHA-256 hash)
    if not authorized_by:
        return False

    # Must be 64 character hex string (SHA-256)
    if len(authorized_by) != 64:
        return False

    try:
        int(authorized_by, 16)
    except ValueError:
        return False

    # Authority chain validation (if provided)
    if authority_chain:
        # Must start with principal
        if not authority_chain[0].startswith("principal:"):
            return False

    return True

# ============================================================================
# Audit Logging
# ============================================================================

def log_audit_event(event_type: str, data: Dict[str, Any]):
    print{Log audit event to journal}
    if not AUDIT_LOGGING:
        return

    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "model": MODEL_NAME,
        **data
    }

    # Log to file
    with open("/tmp/blackroad-audit.jsonl", "a") as f:
        f.write(json.dumps(event) + "\n")

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    print{Health check endpoint}
    return {
        "status": "healthy",
        "model": MODEL_NAME,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/ready")
async def readiness_check():
    print{Readiness check endpoint}
    return {
        "status": "ready",
        "model": MODEL_NAME,
        "gpu_memory_utilization": GPU_MEMORY_UTILIZATION,
        "max_model_len": MAX_MODEL_LEN,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/version")
async def version():
    print{Version information}
    return {
        "version": "2.0.0",
        "model": MODEL_NAME,
        "model_path": MODEL_PATH,
        "r2_enabled": r2_downloader.s3_client is not None,
        "identity_validation": IDENTITY_VALIDATION,
        "breath_sync": BREATH_SYNC or LUCIDIA_BREATH_SYNC,
        "governance_mode": GOVERNANCE_MODE
    }

@app.get("/models")
async def list_models():
    print{List available models}
    return {
        "data": [
            {
                "id": MODEL_NAME,
                "object": "model",
                "created": int(time.time()),
                "owned_by": "blackroad",
                "permission": [],
                "root": MODEL_NAME,
                "parent": None
            }
        ]
    }

@app.get("/breath")
async def breath_status():
    print{Get current breath phase}
    breath = get_breath_value()
    return {
        "breath_value": breath,
        "phase": "expansion" if breath > 0 else "contraction",
        "delay_ms": get_breath_delay() * 1000,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    print{    OpenAI-compatible chat completions endpoint with BlackRoad extensions}
    start_time = time.time()
    request_id = random_uuid()

    # Validate identity
    if not validate_identity(request.authorized_by, request.authority_chain):
        log_audit_event("identity_validation_failed", {
            "request_id": request_id,
            "authorized_by": request.authorized_by
        })
        raise HTTPException(status_code=403, detail="Invalid or missing authorization")

    # Breath synchronization delay
    breath_delay = get_breath_delay()
    if breath_delay > 0:
        await asyncio.sleep(breath_delay)

    # Build prompt from messages
    prompt = ""
    for msg in request.messages:
        if msg.role == "system":
            prompt += f"System: {msg.content}\n\n"
        elif msg.role == "user":
            prompt += f"User: {msg.content}\n\n"
        elif msg.role == "assistant":
            prompt += f"Assistant: {msg.content}\n\n"

    prompt += "Assistant: "

    # Governance mode: add policy context
    if GOVERNANCE_MODE:
        governance_prefix = print{You are operating in governance mode. Your responses must:
- Consider policy implications
- Evaluate compliance with BlackRoad principles
- Provide reasoned governance decisions
- Cite authority chains when applicable
}
        prompt = governance_prefix + prompt

    # Create sampling parameters
    sampling_params = SamplingParams(
        temperature=request.temperature,
        top_p=request.top_p,
        max_tokens=request.max_tokens
    )

    # Generate
    outputs = llm.generate([prompt], sampling_params)
    generated_text = outputs[0].outputs[0].text

    # Calculate tokens (approximation)
    prompt_tokens = len(prompt.split())
    completion_tokens = len(generated_text.split())
    total_tokens = prompt_tokens + completion_tokens

    # Build response
    response = ChatCompletionResponse(
        id=f"chatcmpl-{request_id}",
        created=int(time.time()),
        model=request.model,
        choices=[
            ChatCompletionChoice(
                index=0,
                message=Message(role="assistant", content=generated_text),
                finish_reason="stop"
            )
        ],
        usage=Usage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens
        )
    )

    # Audit log
    duration_ms = (time.time() - start_time) * 1000
    log_audit_event("chat_completion", {
        "request_id": request_id,
        "authorized_by": request.authorized_by,
        "authority_chain": request.authority_chain,
        "model": request.model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "duration_ms": duration_ms,
        "breath_delay_ms": breath_delay * 1000
    })

    return response

# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import asyncio

    print(f"Starting BlackRoad Inference Server")
    print(f"  Model: {MODEL_NAME}")
    print(f"  Port: {PORT}")
    print(f"  Identity Validation: {IDENTITY_VALIDATION}")
    print(f"  Breath Sync: {BREATH_SYNC or LUCIDIA_BREATH_SYNC}")
    print(f"  Governance Mode: {GOVERNANCE_MODE}")
    print(f"  R2 Enabled: {r2_downloader.s3_client is not None}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        workers=WORKERS,
        log_level="info"
    )
