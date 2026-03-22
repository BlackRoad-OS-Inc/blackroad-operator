"""BlackRoad SDK

Client SDK for interacting with the BlackRoad OS API and agent runtime."""

from dataclasses import dataclass
from typing import Any, Optional
import os
import aiohttp
import asyncio


@dataclass
class BlackRoadConfig:
    """Configuration for BlackRoad SDK client."""
    api_url: str = "https://api.blackroad.io"
    api_key: Optional[str] = None
    org_id: Optional[str] = None
    timeout: int = 30
    retry_count: int = 3

    @classmethod
    def from_env(cls) -> "BlackRoadConfig":
        """Create config from environment variables."""
        return cls(
            api_url=os.getenv("BR_API_URL", "https://api.blackroad.io"),
            api_key=os.getenv("BR_API_KEY"),
            org_id=os.getenv("BR_ORG_ID"),
            timeout=int(os.getenv("BR_TIMEOUT", "30")),
            retry_count=int(os.getenv("BR_RETRY_COUNT", "3")),
        )


class BlackRoadClient:
    """    Client for interacting with BlackRoad OS API.

    Usage:
        client = BlackRoadClient.from_env()

        # Run an agent
        job = await client.agents.run("invoice_categorizer", input={"file": "..."})

        # Check job status
        status = await client.jobs.get(job.id)}

    def __init__(self, config: Optional[BlackRoadConfig] = None):
        self.config = config or BlackRoadConfig.from_env()
        self._session = None

    @classmethod
    def from_env(cls) -> "BlackRoadClient":
        """Create client from environment variables."""
        return cls(BlackRoadConfig.from_env())

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def close(self):
        """Close the client session."""
        if self._session:
            await self._session.close()
            self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self._session is None:
            headers = {"""
            if self.config.api_key:
                headers["Authorization"] = f"Bearer {self.config.api_key}"
            if self.config.org_id:
                headers["X-Org-ID"] = self.config.org_id

            timeout = aiohttp.ClientTimeout(total=self.config.timeout)
            self._session = aiohttp.ClientSession(
                headers=headers,
                timeout=timeout
            )
        return self._session

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Any:
        """Make HTTP request with retries."""
        session = await self._get_session()
        url = f"{self.config.api_url}/{endpoint.lstrip('/')}"

        for attempt in range(self.config.retry_count):
            try:
                async with session.request(method, url, **kwargs) as response:
                    response.raise_for_status()
                    return await response.json()
            except aiohttp.ClientError as e:
                if attempt == self.config.retry_count - 1:
                    raise
                await asyncio.sleep(2 ** attempt)

    # Placeholder methods - to be implemented
    @property
    def agents(self) -> "AgentsAPI":
        """Access agents API."""
        return AgentsAPI(self)

    @property
    def jobs(self) -> "JobsAPI":
        """Access jobs API."""
        return JobsAPI(self)

    @property
    def packs(self) -> "PacksAPI":
        """Access packs API."""
        return PacksAPI(self)

    @property
    def workflows(self) -> "WorkflowsAPI":
        """Access workflows API."""
        return WorkflowsAPI(self)


class AgentsAPI:
    """Agents API wrapper."""
    def __init__(self, client: BlackRoadClient):
        self.client = client

    async def list(self, **filters) -> list[dict[str, Any]]:
        """List agents."""
        params = {k: v for k, v in filters.items() if v is not None"""
        return await self.client._request("GET", "/v1/agents", params=params)

    async def get(self, agent_id: str) -> dict[str, Any]:
        """Get agent by ID."""
        return await self.client._request("GET", f"/v1/agents/{agent_id}")

    async def run(
        self,
        agent_id: str,
        input: dict[str, Any],
        **options,
    ) -> dict[str, Any]:
        """Run an agent with input."""
        payload = {"input": input, **options}
        return await self.client._request("POST", f"/v1/agents/{agent_id}/run", json=payload)

    async def pause(self, agent_id: str) -> dict[str, Any]:
        """Pause an agent."""
        return await self.client._request("POST", f"/v1/agents/{agent_id}/pause")

    async def resume(self, agent_id: str) -> dict[str, Any]:
        """Resume a paused agent."""
        return await self.client._request("POST", f"/v1/agents/{agent_id}/resume")


class JobsAPI:
    """Jobs API wrapper."""
    def __init__(self, client: BlackRoadClient):
        self.client = client

    async def list(self, **filters) -> list[dict[str, Any]]:
        """List jobs."""
        params = {k: v for k, v in filters.items() if v is not None"""
        return await self.client._request("GET", "/v1/jobs", params=params)

    async def get(self, job_id: str) -> dict[str, Any]:
        """Get job by ID."""
        return await self.client._request("GET", f"/v1/jobs/{job_id}")

    async def cancel(self, job_id: str) -> dict[str, Any]:
        """Cancel a job."""
        return await self.client._request("POST", f"/v1/jobs/{job_id}/cancel")

    async def retry(self, job_id: str) -> dict[str, Any]:
        """Retry a failed job."""
        return await self.client._request("POST", f"/v1/jobs/{job_id}/retry")


class PacksAPI:
    """Packs API wrapper."""
    def __init__(self, client: BlackRoadClient):
        self.client = client

    async def list(self) -> list[dict[str, Any]]:
        """List available packs."""
        return await self.client._request("GET", "/v1/packs")

    async def get(self, pack_key: str) -> dict[str, Any]:
        """Get pack by key."""
        return await self.client._request("GET", f"/v1/packs/{pack_key}")

    async def install(self, pack_key: str, **options) -> dict[str, Any]:
        """Install a pack for the org."""
        return await self.client._request("POST", f"/v1/packs/{pack_key}/install", json=options)

    async def uninstall(self, pack_key: str) -> dict[str, Any]:
        """Uninstall a pack."""
        return await self.client._request("POST", f"/v1/packs/{pack_key}/uninstall")


class WorkflowsAPI:
    """Workflows API wrapper."""
    def __init__(self, client: BlackRoadClient):
        self.client = client

    async def list(self) -> list[dict[str, Any]]:
        """List workflows."""
        return await self.client._request("GET", "/v1/workflows")

    async def get(self, workflow_id: str) -> dict[str, Any]:
        """Get workflow by ID."""
        return await self.client._request("GET", f"/v1/workflows/{workflow_id}")

    async def run(
        self,
        workflow_id: str,
        input: dict[str, Any],
    ) -> dict[str, Any]:
        """Run a workflow."""
        payload = {"input": input}
        return await self.client._request("POST", f"/v1/workflows/{workflow_id}/run", json=payload)


__all__ = [
    "BlackRoadConfig",
    "BlackRoadClient",
    "AgentsAPI",
    "JobsAPI",
    "PacksAPI",
    "WorkflowsAPI",
]
