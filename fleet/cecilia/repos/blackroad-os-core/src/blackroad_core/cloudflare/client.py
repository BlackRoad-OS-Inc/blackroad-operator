"""BlackRoad OS - Cloudflare Base Client

Provides the base HTTP client for Cloudflare API operations."""

from __future__ import annotations

import logging
import httpx

from .models import CloudflareConfig

logger = logging.getLogger(__name__)


class CloudflareClient:
    """    Base client for Cloudflare API operations.

    Provides HTTP client setup and health check functionality.
    Service-specific operations are provided by mixins/modules."""

    def __init__(self, config: CloudflareConfig):
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=config.api_base_url,
            headers={
                "Authorization": f"Bearer {config.api_token}",
                "Content-Type": "application/json",
            },
            timeout=30.0
        )

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    async def health_check(self) -> bool:
        """Check Cloudflare API connectivity"""
        try:
            response = await self.client.get(
                f"/accounts/{self.config.account_id}"
            )
            response.raise_for_status()
            return response.json().get("success", False)
        except Exception as e:
            logger.error(f"Cloudflare health check failed: {e}")
            return False


__all__ = ["CloudflareClient"]
