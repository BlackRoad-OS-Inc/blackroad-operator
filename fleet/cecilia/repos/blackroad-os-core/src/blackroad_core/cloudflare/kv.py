"""BlackRoad OS - Cloudflare KV Operations

Provides Workers KV key-value storage operations."""

from __future__ import annotations

import logging
from typing import List, Optional, Dict, Any

from .models import KVNamespace

logger = logging.getLogger(__name__)


class KVOperations:
    """Mixin providing Cloudflare KV operations."""
    async def list_kv_namespaces(self) -> List[KVNamespace]:
        """List all KV namespaces"""
        try:
            response = await self.client.get(
                f"/accounts/{self.config.account_id}/storage/kv/namespaces"
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(f"KV list failed: {data.get('errors')}")

            return [
                KVNamespace(
                    id=ns["id"],
                    title=ns["title"],
                    supports_url_encoding=ns.get("supports_url_encoding", True)
                )
                for ns in data.get("result", [])
            ]
        except Exception as e:
            logger.error(f"Failed to list KV namespaces: {e}")
            return []

    async def create_kv_namespace(self, title: str) -> Optional[KVNamespace]:
        """Create a new KV namespace"""
        try:
            response = await self.client.post(
                f"/accounts/{self.config.account_id}/storage/kv/namespaces",
                json={"title": title}
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(f"KV creation failed: {data.get('errors')}")

            result = data["result"]
            return KVNamespace(
                id=result["id"],
                title=result["title"]
            )
        except Exception as e:
            logger.error(f"Failed to create KV namespace '{title}': {e}")
            return None

    async def kv_get(self, namespace_id: str, key: str) -> Optional[str]:
        """Get value from KV"""
        try:
            response = await self.client.get(
                f"/accounts/{self.config.account_id}/storage/kv/namespaces/{namespace_id}/values/{key}"
            )

            if response.status_code == 404:
                return None

            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Failed to get KV key '{key}': {e}")
            return None

    async def kv_put(
        self,
        namespace_id: str,
        key: str,
        value: str,
        expiration_ttl: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Put value into KV"""
        try:
            import json as json_lib

            data = {"value": value}

            if expiration_ttl:
                data["expiration_ttl"] = expiration_ttl

            if metadata:
                data["metadata"] = json_lib.dumps(metadata)

            response = await self.client.put(
                f"/accounts/{self.config.account_id}/storage/kv/namespaces/{namespace_id}/values/{key}",
                json=data
            )
            response.raise_for_status()

            return response.json().get("success", False)
        except Exception as e:
            logger.error(f"Failed to put KV key '{key}': {e}")
            return False

    async def kv_delete(self, namespace_id: str, key: str) -> bool:
        """Delete key from KV"""
        try:
            response = await self.client.delete(
                f"/accounts/{self.config.account_id}/storage/kv/namespaces/{namespace_id}/values/{key}"
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to delete KV key '{key}': {e}")
            return False

    async def kv_list_keys(
        self,
        namespace_id: str,
        prefix: Optional[str] = None,
        limit: int = 1000
    ) -> List[Dict[str, Any]]:
        """List keys in KV namespace"""
        try:
            params = {"limit": limit}
            if prefix:
                params["prefix"] = prefix

            response = await self.client.get(
                f"/accounts/{self.config.account_id}/storage/kv/namespaces/{namespace_id}/keys",
                params=params
            )
            response.raise_for_status()

            data = response.json()
            return data.get("result", [])
        except Exception as e:
            logger.error(f"Failed to list KV keys: {e}")
            return []


__all__ = ["KVOperations"]
