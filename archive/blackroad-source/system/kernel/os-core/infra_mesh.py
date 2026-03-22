"""BlackRoad Infrastructure Mesh

Unified connectivity layer for all BlackRoad infrastructure services:
- GitHub (repos, CI/CD, webhooks)
- Hugging Face (model hub, inference API)
- Cloudflare (Workers, KV, D1, Pages, Tunnel)
- Vercel (frontend deployments)
- DigitalOcean (codex-infinity compute)
- Ollama (local LLM inference)
- Railway (backend services)

Each connector implements health checks, status reporting, and
basic operations for its platform.
"""

import asyncio
import os
import json
import logging
import time
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from enum import Enum

logger = logging.getLogger("blackroad.mesh")


class ServiceHealth(str, Enum):
    UP = "up"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


@dataclass
class ServiceStatus:
    name: str
    health: ServiceHealth
    latency_ms: float = 0.0
    details: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MeshStatus:
    timestamp: str = ""
    services: List[ServiceStatus] = field(default_factory=list)
    healthy_count: int = 0
    total_count: int = 0

    def summary(self) -> str:
        lines = [f"BlackRoad Mesh: {self.healthy_count}/{self.total_count} services online"]
        for svc in self.services:
            icon = "+" if svc.health == ServiceHealth.UP else ("~" if svc.health == ServiceHealth.DEGRADED else "-")
            lines.append(f"  [{icon}] {svc.name:<16} {svc.health.value:<10} {svc.latency_ms:.0f}ms  {svc.details}")
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Individual Service Connectors
# ---------------------------------------------------------------------------

class GitHubConnector:
    """GitHub API connector for org/repo operations."""

    def __init__(self, token: Optional[str] = None, org: str = "blackboxprogramming"):
        self.token = token or os.getenv("GITHUB_TOKEN", "")
        self.org = org
        self.base_url = "https://api.github.com"

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            headers = {"Accept": "application/vnd.github.v3+json"}
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/users/{self.org}",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    latency = (time.time() - start) * 1000
                    if resp.status == 200:
                        data = await resp.json()
                        repo_count = data.get("public_repos", 0) + data.get("total_private_repos", 0)
                        return ServiceStatus(
                            name="GitHub",
                            health=ServiceHealth.UP,
                            latency_ms=latency,
                            details=f"org={self.org} repos={repo_count}",
                            metadata={"org": self.org, "repos": repo_count},
                        )
                    return ServiceStatus(
                        name="GitHub",
                        health=ServiceHealth.DEGRADED,
                        latency_ms=latency,
                        details=f"HTTP {resp.status} (token may be missing)",
                    )
        except Exception as e:
            return ServiceStatus(name="GitHub", health=ServiceHealth.DOWN, details=str(e))

    async def list_repos(self, limit: int = 30) -> List[Dict]:
        import aiohttp
        headers = {"Accept": "application/vnd.github.v3+json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/users/{self.org}/repos?per_page={limit}&sort=updated",
                headers=headers,
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                return []


class HuggingFaceConnector:
    """Hugging Face Hub and Inference API connector."""

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("HF_TOKEN", "") or os.getenv("HUGGINGFACE_TOKEN", "")
        self.hub_url = "https://huggingface.co/api"
        self.inference_url = "https://api-inference.huggingface.co"

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.hub_url}/models?limit=1",
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    latency = (time.time() - start) * 1000
                    if resp.status == 200:
                        auth_status = "authenticated" if self.token else "anonymous"
                        return ServiceStatus(
                            name="Hugging Face",
                            health=ServiceHealth.UP,
                            latency_ms=latency,
                            details=f"Hub API ok ({auth_status})",
                            metadata={"authenticated": bool(self.token)},
                        )
                    return ServiceStatus(
                        name="Hugging Face",
                        health=ServiceHealth.DEGRADED,
                        latency_ms=latency,
                        details=f"HTTP {resp.status}",
                    )
        except Exception as e:
            return ServiceStatus(name="Hugging Face", health=ServiceHealth.DOWN, details=str(e))

    async def inference(self, model_id: str, inputs: str) -> Dict:
        """Run inference via HF Inference API."""
        import aiohttp
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.inference_url}/models/{model_id}",
                headers=headers,
                json={"inputs": inputs},
            ) as resp:
                return await resp.json()

    async def list_models(self, search: str = "", limit: int = 10) -> List[Dict]:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.hub_url}/models?search={search}&limit={limit}&sort=downloads&direction=-1",
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                return []


class CloudflareConnector:
    """Cloudflare API connector for Workers, KV, D1, Pages."""

    def __init__(
        self,
        account_id: Optional[str] = None,
        api_token: Optional[str] = None,
        zone_domain: str = "blackroad.io",
    ):
        self.account_id = account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
        self.api_token = api_token or os.getenv("CLOUDFLARE_API_TOKEN", "")
        self.zone_domain = zone_domain
        self.base_url = "https://api.cloudflare.com/client/v4"

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            # Check the domain is live
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"https://{self.zone_domain}",
                    timeout=aiohttp.ClientTimeout(total=10),
                    allow_redirects=False,
                ) as resp:
                    latency = (time.time() - start) * 1000
                    # Any response means CF is routing
                    details = f"{self.zone_domain} HTTP {resp.status}"
                    if self.api_token:
                        details += " (API token set)"
                    return ServiceStatus(
                        name="Cloudflare",
                        health=ServiceHealth.UP,
                        latency_ms=latency,
                        details=details,
                        metadata={
                            "domain": self.zone_domain,
                            "api_configured": bool(self.api_token),
                        },
                    )
        except Exception as e:
            return ServiceStatus(name="Cloudflare", health=ServiceHealth.DOWN, details=str(e))

    async def list_workers(self) -> List[Dict]:
        if not self.api_token or not self.account_id:
            return []
        import aiohttp
        headers = {"Authorization": f"Bearer {self.api_token}"}
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/accounts/{self.account_id}/workers/scripts",
                headers=headers,
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("result", [])
                return []


class VercelConnector:
    """Vercel deployment connector."""

    def __init__(self, token: Optional[str] = None, team: Optional[str] = None):
        self.token = token or os.getenv("VERCEL_TOKEN", "")
        self.team = team or os.getenv("VERCEL_TEAM", "")
        self.base_url = "https://api.vercel.com"

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            headers = {}
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/v9/projects" if self.token else "https://vercel.com"
                async with session.get(
                    url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10),
                    allow_redirects=True,
                ) as resp:
                    latency = (time.time() - start) * 1000
                    if self.token and resp.status == 200:
                        data = await resp.json()
                        project_count = len(data.get("projects", []))
                        return ServiceStatus(
                            name="Vercel",
                            health=ServiceHealth.UP,
                            latency_ms=latency,
                            details=f"{project_count} projects (authenticated)",
                            metadata={"projects": project_count, "authenticated": True},
                        )
                    # No token - just check reachability
                    return ServiceStatus(
                        name="Vercel",
                        health=ServiceHealth.UP if resp.status < 400 else ServiceHealth.DEGRADED,
                        latency_ms=latency,
                        details=f"HTTP {resp.status} (no token - set VERCEL_TOKEN for full access)",
                    )
        except Exception as e:
            return ServiceStatus(name="Vercel", health=ServiceHealth.DOWN, details=str(e))

    async def list_deployments(self, limit: int = 10) -> List[Dict]:
        if not self.token:
            return []
        import aiohttp
        headers = {"Authorization": f"Bearer {self.token}"}
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/v6/deployments?limit={limit}",
                headers=headers,
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("deployments", [])
                return []


class DigitalOceanConnector:
    """DigitalOcean droplet connector."""

    def __init__(
        self,
        token: Optional[str] = None,
        droplet_ip: str = "159.65.43.12",
        droplet_name: str = "codex-infinity",
    ):
        self.token = token or os.getenv("DO_TOKEN", "") or os.getenv("DIGITALOCEAN_TOKEN", "")
        self.droplet_ip = droplet_ip
        self.droplet_name = droplet_name
        self.base_url = "https://api.digitalocean.com/v2"

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"http://{self.droplet_ip}",
                    timeout=aiohttp.ClientTimeout(total=10),
                    allow_redirects=True,
                ) as resp:
                    latency = (time.time() - start) * 1000
                    return ServiceStatus(
                        name="DigitalOcean",
                        health=ServiceHealth.UP,
                        latency_ms=latency,
                        details=f"{self.droplet_name} ({self.droplet_ip}) HTTP {resp.status}",
                        metadata={"ip": self.droplet_ip, "name": self.droplet_name},
                    )
        except Exception as e:
            return ServiceStatus(
                name="DigitalOcean",
                health=ServiceHealth.DOWN,
                details=f"{self.droplet_name} ({self.droplet_ip}): {e}",
            )


class OllamaConnector:
    """Local Ollama LLM server connector."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("OLLAMA_URL", "http://localhost:11434")

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    latency = (time.time() - start) * 1000
                    if resp.status == 200:
                        data = await resp.json()
                        models = [m.get("name", "?") for m in data.get("models", [])]
                        return ServiceStatus(
                            name="Ollama",
                            health=ServiceHealth.UP,
                            latency_ms=latency,
                            details=f"{len(models)} models: {', '.join(models[:5])}{'...' if len(models) > 5 else ''}",
                            metadata={"models": models, "model_count": len(models)},
                        )
                    return ServiceStatus(
                        name="Ollama",
                        health=ServiceHealth.DEGRADED,
                        latency_ms=latency,
                        details=f"HTTP {resp.status}",
                    )
        except Exception as e:
            return ServiceStatus(name="Ollama", health=ServiceHealth.DOWN, details=str(e))

    async def list_models(self) -> List[str]:
        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return [m["name"] for m in data.get("models", [])]
        except Exception:
            pass
        return []


class RailwayConnector:
    """Railway deployment connector."""

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("RAILWAY_TOKEN", "")
        self.base_url = "https://backboard.railway.app/graphql/v2"

    async def health_check(self) -> ServiceStatus:
        import aiohttp
        start = time.time()
        try:
            if not self.token:
                # Check CLI availability
                proc = await asyncio.create_subprocess_exec(
                    "railway", "version",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, _ = await proc.communicate()
                latency = (time.time() - start) * 1000
                if proc.returncode == 0:
                    version = stdout.decode().strip()
                    return ServiceStatus(
                        name="Railway",
                        health=ServiceHealth.DEGRADED,
                        latency_ms=latency,
                        details=f"CLI {version} (no API token - set RAILWAY_TOKEN for full access)",
                    )
                return ServiceStatus(
                    name="Railway",
                    health=ServiceHealth.DOWN,
                    details="CLI not installed and no API token",
                )

            # Query Railway API with token
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }
            query = '{"query": "{ me { name email } }"}'
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    headers=headers,
                    data=query,
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    latency = (time.time() - start) * 1000
                    if resp.status == 200:
                        data = await resp.json()
                        me = data.get("data", {}).get("me", {})
                        return ServiceStatus(
                            name="Railway",
                            health=ServiceHealth.UP,
                            latency_ms=latency,
                            details=f"authenticated as {me.get('name', 'unknown')}",
                            metadata={"user": me.get("name"), "email": me.get("email")},
                        )
                    return ServiceStatus(
                        name="Railway",
                        health=ServiceHealth.DEGRADED,
                        latency_ms=latency,
                        details=f"API HTTP {resp.status}",
                    )
        except Exception as e:
            return ServiceStatus(name="Railway", health=ServiceHealth.DOWN, details=str(e))


# ---------------------------------------------------------------------------
# Unified Infrastructure Mesh
# ---------------------------------------------------------------------------

class InfrastructureMesh:
    """
    Unified mesh that connects all BlackRoad infrastructure services.

    Usage:
        mesh = InfrastructureMesh()
        status = await mesh.check_all()
        print(status.summary())
    """

    def __init__(self):
        self.github = GitHubConnector()
        self.huggingface = HuggingFaceConnector()
        self.cloudflare = CloudflareConnector()
        self.vercel = VercelConnector()
        self.digitalocean = DigitalOceanConnector()
        self.ollama = OllamaConnector()
        self.railway = RailwayConnector()

        self._connectors = {
            "github": self.github,
            "huggingface": self.huggingface,
            "cloudflare": self.cloudflare,
            "vercel": self.vercel,
            "digitalocean": self.digitalocean,
            "ollama": self.ollama,
            "railway": self.railway,
        }

    async def check_all(self) -> MeshStatus:
        """Run health checks on all services concurrently."""
        from datetime import datetime

        tasks = [connector.health_check() for connector in self._connectors.values()]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        services = []
        for name, result in zip(self._connectors.keys(), results):
            if isinstance(result, Exception):
                services.append(ServiceStatus(
                    name=name,
                    health=ServiceHealth.DOWN,
                    details=f"Check failed: {result}",
                ))
            else:
                services.append(result)

        healthy = sum(1 for s in services if s.health == ServiceHealth.UP)

        return MeshStatus(
            timestamp=datetime.utcnow().isoformat(),
            services=services,
            healthy_count=healthy,
            total_count=len(services),
        )

    async def check_one(self, service_name: str) -> ServiceStatus:
        """Run health check on a single service."""
        connector = self._connectors.get(service_name)
        if not connector:
            return ServiceStatus(
                name=service_name,
                health=ServiceHealth.UNKNOWN,
                details=f"Unknown service: {service_name}",
            )
        return await connector.health_check()

    def to_dict(self, status: MeshStatus) -> Dict:
        """Convert mesh status to JSON-serializable dict."""
        return {
            "timestamp": status.timestamp,
            "healthy_count": status.healthy_count,
            "total_count": status.total_count,
            "services": [asdict(s) for s in status.services],
        }


# ---------------------------------------------------------------------------
# CLI entrypoint for standalone testing
# ---------------------------------------------------------------------------

async def _main():
    mesh = InfrastructureMesh()
    print("Checking all services...\n")
    status = await mesh.check_all()
    print(status.summary())
    print(f"\n{json.dumps(mesh.to_dict(status), indent=2)}")


if __name__ == "__main__":
    asyncio.run(_main())
