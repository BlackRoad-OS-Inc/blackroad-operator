"""BlackRoad OS - Cloudflare D1 Operations

Provides D1 database operations (SQLite at the edge)."""

from __future__ import annotations

import logging
from typing import List, Optional, Dict, Any

from .models import D1Database

logger = logging.getLogger(__name__)


class D1Operations:
    """Mixin providing Cloudflare D1 operations."""
    async def list_d1_databases(self) -> List[D1Database]:
        """List all D1 databases"""
        try:
            response = await self.client.get(
                f"/accounts/{self.config.account_id}/d1/database"
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(f"D1 list failed: {data.get('errors')}")

            return [
                D1Database(
                    uuid=db["uuid"],
                    name=db["name"],
                    version=db.get("version", "unknown"),
                    created_at=db.get("created_at", "")
                )
                for db in data.get("result", [])
            ]
        except Exception as e:
            logger.error(f"Failed to list D1 databases: {e}")
            return []

    async def create_d1_database(self, name: str) -> Optional[D1Database]:
        """Create a new D1 database"""
        try:
            response = await self.client.post(
                f"/accounts/{self.config.account_id}/d1/database",
                json={"name": name}
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(f"D1 creation failed: {data.get('errors')}")

            result = data["result"]
            return D1Database(
                uuid=result["uuid"],
                name=result["name"],
                version=result.get("version", "unknown"),
                created_at=result.get("created_at", "")
            )
        except Exception as e:
            logger.error(f"Failed to create D1 database '{name}': {e}")
            return None

    async def d1_query(
        self,
        database_id: str,
        sql: str,
        params: Optional[List[Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Execute SQL query on D1 database"""
        try:
            payload = {"sql": sql}
            if params:
                payload["params"] = params

            response = await self.client.post(
                f"/accounts/{self.config.account_id}/d1/database/{database_id}/query",
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(f"D1 query failed: {data.get('errors')}")

            return data.get("result", [{}])[0]
        except Exception as e:
            logger.error(f"Failed to execute D1 query: {e}")
            return None


__all__ = ["D1Operations"]
