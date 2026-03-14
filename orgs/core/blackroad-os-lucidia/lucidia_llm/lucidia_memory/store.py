"""Memory store for Lucidia: handles storing and retrieving embeddings.

Supports two backends:
  - QdrantMemoryStore: Vector search via Qdrant (production)
  - LocalMemoryStore: NumPy-based in-memory store (development/fallback)
"""

import json
import os
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional, Tuple


class MemoryStore:
    """Abstract base class for memory stores."""

    def __init__(self, storage_path):
        self.storage_path = storage_path

    def add(self, key, embedding, metadata=None):
        """Add an embedding to the store."""
        raise NotImplementedError("Memory add method not implemented")

    def query(self, embedding, top_k=5, filter_by=None):
        """Query the store with an embedding."""
        raise NotImplementedError("Memory query method not implemented")

    def delete(self, key):
        """Delete an entry by key."""
        raise NotImplementedError("Memory delete method not implemented")

    def count(self):
        """Return the number of stored entries."""
        raise NotImplementedError("Memory count method not implemented")


class QdrantMemoryStore(MemoryStore):
    """Qdrant-backed vector memory store."""

    def __init__(self, storage_path, host=None, collection=None, dim=768):
        super().__init__(storage_path)
        self.host = host or os.environ.get("QDRANT_HOST", "http://192.168.4.49:6333")
        self.collection = collection or os.environ.get("LUCIDIA_COLLECTION", "lucidia-memory")
        self.dim = dim
        self._ensure_collection()

    def _request(self, path, data=None, method="GET"):
        headers = {"Content-Type": "application/json"}
        body = json.dumps(data).encode() if data else None
        req = urllib.request.Request(
            f"{self.host}{path}", data=body, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except (urllib.error.HTTPError, urllib.error.URLError) as e:
            raise ConnectionError(f"Qdrant request failed: {e}")

    def _ensure_collection(self):
        try:
            resp = self._request(f"/collections/{self.collection}")
            if resp.get("status") == "ok":
                return
        except ConnectionError:
            pass

        self._request(f"/collections/{self.collection}", {
            "vectors": {"size": self.dim, "distance": "Cosine"},
        }, method="PUT")

        # Index metadata fields
        for field in ["key", "type", "source"]:
            try:
                self._request(f"/collections/{self.collection}/index", {
                    "field_name": field,
                    "field_schema": "keyword",
                }, method="PUT")
            except ConnectionError:
                pass

    def _key_to_id(self, key):
        """Convert string key to integer ID via hash."""
        return abs(hash(key)) % (2**63)

    def add(self, key, embedding, metadata=None):
        """Add an embedding with optional metadata."""
        payload = {"key": key}
        if metadata:
            payload.update(metadata)

        self._request(f"/collections/{self.collection}/points", {
            "points": [{
                "id": self._key_to_id(key),
                "vector": embedding if isinstance(embedding, list) else embedding.tolist(),
                "payload": payload,
            }],
        }, method="PUT")

    def query(self, embedding, top_k=5, filter_by=None):
        """Query for similar vectors. Returns list of (key, score, metadata)."""
        search_params = {
            "vector": embedding if isinstance(embedding, list) else embedding.tolist(),
            "limit": top_k,
            "with_payload": True,
        }

        if filter_by:
            conditions = []
            for field, value in filter_by.items():
                conditions.append({"key": field, "match": {"value": value}})
            search_params["filter"] = {"must": conditions}

        resp = self._request(
            f"/collections/{self.collection}/points/search",
            search_params,
            method="POST",
        )

        results = []
        for point in resp.get("result", []):
            payload = point.get("payload", {})
            key = payload.pop("key", "")
            results.append((key, point.get("score", 0), payload))

        return results

    def delete(self, key):
        """Delete a point by key."""
        self._request(f"/collections/{self.collection}/points/delete", {
            "filter": {
                "must": [{"key": "key", "match": {"value": key}}],
            },
        }, method="POST")

    def count(self):
        """Return point count."""
        try:
            resp = self._request(f"/collections/{self.collection}")
            return resp.get("result", {}).get("points_count", 0)
        except ConnectionError:
            return 0


class LocalMemoryStore(MemoryStore):
    """NumPy-based local memory store for development/fallback."""

    def __init__(self, storage_path):
        super().__init__(storage_path)
        self._store: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _store_file(self):
        return os.path.join(self.storage_path, "memory_store.json")

    def _load(self):
        path = self._store_file()
        if os.path.exists(path):
            with open(path) as f:
                self._store = json.load(f)

    def _save(self):
        os.makedirs(self.storage_path, exist_ok=True)
        with open(self._store_file(), "w") as f:
            json.dump(self._store, f)

    def add(self, key, embedding, metadata=None):
        """Add an embedding."""
        vec = embedding if isinstance(embedding, list) else embedding.tolist()
        entry = {"embedding": vec}
        if metadata:
            entry["metadata"] = metadata
        self._store[key] = entry
        self._save()

    def query(self, embedding, top_k=5, filter_by=None):
        """Brute-force cosine similarity search."""
        import numpy as np

        query_vec = np.array(embedding)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            return []

        scores = []
        for key, entry in self._store.items():
            if filter_by:
                meta = entry.get("metadata", {})
                if not all(meta.get(k) == v for k, v in filter_by.items()):
                    continue

            doc_vec = np.array(entry["embedding"])
            doc_norm = np.linalg.norm(doc_vec)
            if doc_norm == 0:
                continue
            score = float(np.dot(query_vec, doc_vec) / (query_norm * doc_norm))
            scores.append((key, score, entry.get("metadata", {})))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def delete(self, key):
        """Delete an entry."""
        if key in self._store:
            del self._store[key]
            self._save()

    def count(self):
        return len(self._store)


def create_memory_store(storage_path=None, backend="auto", **kwargs):
    """Factory function to create a memory store.

    Args:
        storage_path: Path for local storage
        backend: "qdrant", "local", or "auto" (tries qdrant, falls back to local)
        **kwargs: Passed to the store constructor (host, collection, dim)
    """
    if storage_path is None:
        storage_path = os.path.expanduser("~/.blackroad/lucidia-memory")

    if backend == "qdrant":
        return QdrantMemoryStore(storage_path, **kwargs)
    elif backend == "local":
        return LocalMemoryStore(storage_path)
    else:
        # Auto: try Qdrant, fall back to local
        try:
            store = QdrantMemoryStore(storage_path, **kwargs)
            store.count()  # Test connectivity
            return store
        except (ConnectionError, Exception):
            return LocalMemoryStore(storage_path)
