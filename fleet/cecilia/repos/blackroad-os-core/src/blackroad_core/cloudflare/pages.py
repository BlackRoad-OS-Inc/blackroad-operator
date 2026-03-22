"""BlackRoad OS - Cloudflare Pages Operations

Provides Cloudflare Pages static site hosting operations."""

from __future__ import annotations

import logging
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)


class PagesOperations:
    """Mixin providing Cloudflare Pages operations."""
    async def list_pages_projects(self) -> List[Dict[str, Any]]:
        """List all Pages projects"""
        try:
            response = await self.client.get(
                f"/accounts/{self.config.account_id}/pages/projects"
            )
            response.raise_for_status()

            data = response.json()
            return data.get("result", [])
        except Exception as e:
            logger.error(f"Failed to list Pages projects: {e}")
            return []

    async def get_pages_project(self, project_name: str) -> Optional[Dict[str, Any]]:
        """Get Pages project details"""
        try:
            response = await self.client.get(
                f"/accounts/{self.config.account_id}/pages/projects/{project_name}"
            )
            response.raise_for_status()

            data = response.json()
            return data.get("result")
        except Exception as e:
            logger.error(f"Failed to get Pages project '{project_name}': {e}")
            return None


__all__ = ["PagesOperations"]
