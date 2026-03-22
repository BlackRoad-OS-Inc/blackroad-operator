import logging
import os
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Lucidia LLM Bridge", version="0.2.0")

# Set LUCIDIA_BACKEND_URL to your local model server (e.g. Ollama at http://127.0.0.1:11434).
# Requests are forwarded to <LUCIDIA_BACKEND_URL>/api/chat (Ollama format) when set.
# When unset the bridge returns a plaintext echo so the API still starts without a GPU.
BACKEND_URL = os.environ.get("LUCIDIA_BACKEND_URL", "")
BACKEND_MODEL = os.environ.get("LUCIDIA_BACKEND_MODEL", "llama3")


class ChatRequest(BaseModel):
    prompt: str
    system: Optional[str] = None
    stream: Optional[bool] = False


class ChatResponse(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Forward the chat request to the configured local backend, or echo when no backend is set."""
    if not BACKEND_URL:
        # Offline / stub mode — no external calls
        prefix = (req.system + " ") if req.system else ""
        return {"text": f"{prefix}[lucidia-stub] {req.prompt}"}

    payload = {
        "model": BACKEND_MODEL,
        "messages": [{"role": "user", "content": req.prompt}],
        "stream": False,
    }
    if req.system:
        payload["messages"].insert(0, {"role": "system", "content": req.system})

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{BACKEND_URL}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = (
                data.get("message", {}).get("content")
                or data.get("response")
                or data.get("text")
            )
            if text is None:
                logging.getLogger("lucidia.bridge").warning(
                    "Backend response had no recognised text field; fields=%s", list(data.keys())
                )
                text = ""
            return {"text": text}
    except httpx.HTTPStatusError as exc:
        detail = f"{exc}"
        try:
            detail = f"{exc}: {exc.response.text}"
        except Exception:
            pass
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Backend unreachable: {exc}") from exc

