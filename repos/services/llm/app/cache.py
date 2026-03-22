"""Response caching with Redis."""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class ResponseCache:
    """Response cache using Redis."""

    def __init__(self, redis_url: str | None, ttl: int = 3600, enabled: bool = True):
        """Initialize response cache.

        Args:
            redis_url: Redis connection URL
            ttl: Cache TTL in seconds
            enabled: Whether caching is enabled
        """
        self.enabled = enabled and redis_url is not None
        self.ttl = ttl
        self.redis: aioredis.Redis | None = None

        if self.enabled and redis_url:
            try:
                self.redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
                logger.info(f"Response cache initialized with TTL={ttl}s")
            except Exception as e:
                logger.error(f"Failed to initialize Redis cache: {e}")
                self.enabled = False

    def _generate_key(self, provider: str, messages: list[dict], model: str, **kwargs) -> str:
        """Generate cache key from request parameters.

        Args:
            provider: Provider name
            messages: Chat messages
            model: Model name
            **kwargs: Additional parameters

        Returns:
            Cache key
        """
        # Create deterministic hash of request
        params = {
            "provider": provider,
            "messages": messages,
            "model": model,
            **{k: v for k, v in sorted(kwargs.items()) if k in ["temperature", "max_tokens", "top_p"]},
        }
        params_json = json.dumps(params, sort_keys=True)
        key_hash = hashlib.sha256(params_json.encode()).hexdigest()
        return f"llm:response:{provider}:{key_hash}"

    async def get(self, provider: str, messages: list[dict], model: str, **kwargs) -> dict | None:
        """Get cached response.

        Args:
            provider: Provider name
            messages: Chat messages
            model: Model name
            **kwargs: Additional parameters

        Returns:
            Cached response or None
        """
        if not self.enabled or not self.redis:
            return None

        try:
            key = self._generate_key(provider, messages, model, **kwargs)
            data = await self.redis.get(key)
            if data:
                logger.debug(f"Cache hit for key={key}")
                return json.loads(data)
            logger.debug(f"Cache miss for key={key}")
        except Exception as e:
            logger.error(f"Cache get error: {e}")

        return None

    async def set(self, provider: str, messages: list[dict], model: str, response: dict, **kwargs) -> None:
        """Cache response.

        Args:
            provider: Provider name
            messages: Chat messages
            model: Model name
            response: Response to cache
            **kwargs: Additional parameters
        """
        if not self.enabled or not self.redis:
            return

        try:
            key = self._generate_key(provider, messages, model, **kwargs)
            data = json.dumps(response)
            await self.redis.setex(key, self.ttl, data)
            logger.debug(f"Cached response with key={key}")
        except Exception as e:
            logger.error(f"Cache set error: {e}")

    async def clear(self, pattern: str = "llm:response:*") -> int:
        """Clear cached responses.

        Args:
            pattern: Key pattern to clear

        Returns:
            Number of keys cleared
        """
        if not self.enabled or not self.redis:
            return 0

        try:
            keys = []
            async for key in self.redis.scan_iter(match=pattern):
                keys.append(key)

            if keys:
                count = await self.redis.delete(*keys)
                logger.info(f"Cleared {count} cached responses")
                return count
        except Exception as e:
            logger.error(f"Cache clear error: {e}")

        return 0

    async def close(self) -> None:
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()
