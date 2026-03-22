"""Self-embedding utilities for Lucidia.

Uses Ollama's nomic-embed-text model for generating embeddings.
Falls back to a simple TF-IDF sparse encoding if Ollama is unavailable.
"""

import json
import os
import urllib.request
import urllib.error
from typing import List, Optional

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://192.168.4.96:11434")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")


def embed_text(text, model=None, host=None):
    """Compute embedding for a given text using Ollama.

    Args:
        text: Text to embed (truncated to 8000 chars)
        model: Ollama model name (default: nomic-embed-text)
        host: Ollama host URL

    Returns:
        List of floats (768-dim for nomic-embed-text)
    """
    host = host or OLLAMA_HOST
    model = model or EMBED_MODEL

    data = json.dumps({
        "model": model,
        "prompt": text[:8000],
    }).encode()

    req = urllib.request.Request(
        f"{host}/api/embeddings",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode())
            return result["embedding"]
    except (urllib.error.URLError, urllib.error.HTTPError, KeyError) as e:
        raise RuntimeError(f"Embedding failed ({host}, {model}): {e}")


def embed_batch(texts, model=None, host=None):
    """Compute embeddings for a list of texts.

    Ollama doesn't support native batching, so this is sequential.
    """
    return [embed_text(t, model=model, host=host) for t in texts]


def embed_text_safe(text, model=None, host=None):
    """Embed text with fallback to sparse encoding if Ollama is unavailable.

    Returns a tuple of (embedding, method) where method is 'dense' or 'sparse'.
    """
    try:
        return embed_text(text, model=model, host=host), "dense"
    except RuntimeError:
        return _sparse_embed(text), "sparse"


def _sparse_embed(text, dim=768):
    """Simple hash-based sparse embedding fallback.

    Not semantically meaningful, but allows the system to function
    when Ollama is unavailable. Results won't be as good as dense embeddings.
    """
    import hashlib
    tokens = text.lower().split()
    vec = [0.0] * dim

    for token in tokens:
        h = int(hashlib.md5(token.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0

    # L2 normalize
    norm = sum(v * v for v in vec) ** 0.5
    if norm > 0:
        vec = [v / norm for v in vec]

    return vec
