"""
BlackRoad Agent Orchestrator — Recurring Jobs & Worker Integrations
Schedule agents to do real work: reindex search, collect analytics, monitor fleet.
"""
import asyncio
import time
import logging
import aiohttp
from dataclasses import dataclass
from .nats_protocol import NATSBus, TaskMessage

log = logging.getLogger("orchestrator.jobs")


@dataclass
class RecurringJob:
    name: str
    archetype: str
    prompt: str
    interval_seconds: int
    intent: str = "scheduled"
    enabled: bool = True
    last_run: float = 0.0
    run_count: int = 0


# Built-in recurring jobs
RECURRING_JOBS = [
    RecurringJob(
        name="fleet-health-check",
        archetype="security",  # Uses deepseek-r1:1.5b (fast)
        prompt="Check BlackRoad infrastructure health. List which services are up or down. Be brief — one line per service.",
        interval_seconds=600,  # Every 10 minutes
    ),
    RecurringJob(
        name="security-scan",
        archetype="security",
        prompt="Brief security check: any concerns with the BlackRoad fleet? Check auth, network, and access patterns. 3 bullet points max.",
        interval_seconds=3600,  # Every hour
    ),
    RecurringJob(
        name="code-index-refresh",
        archetype="coder",  # Uses qwen2.5-coder:3b (medium speed)
        prompt="What are the most important recent changes across BlackRoad repos? Summarize in 5 bullet points.",
        interval_seconds=1800,  # Every 30 minutes
    ),
    RecurringJob(
        name="analytics-digest",
        archetype="security",  # Fast model for simple analysis
        prompt="Summarize BlackRoad OS usage: estimated active users, top services, any anomalies. Keep it to 3 lines.",
        interval_seconds=3600,  # Every hour
    ),
    RecurringJob(
        name="creative-brief",
        archetype="security",  # Use fast model
        prompt="Write one motivational sentence about building sovereign infrastructure. Keep it under 20 words.",
        interval_seconds=7200,  # Every 2 hours
        enabled=False,  # Disabled by default — nice-to-have
    ),
]


class JobScheduler:
    """Runs recurring agent jobs on schedule."""

    def __init__(self, bus: NATSBus):
        self.bus = bus
        self.jobs = {j.name: j for j in RECURRING_JOBS}
        self._running = False

    async def start(self):
        """Start the job scheduler loop. Staggers initial runs to avoid thundering herd."""
        self._running = True
        # Stagger initial runs — offset each job by 60s
        offset = 0
        for job in self.jobs.values():
            job.last_run = time.time() + offset  # Delay initial run
            offset += 60
        log.info("Job scheduler started with %d jobs (staggered)", len(self.jobs))

    async def stop(self):
        self._running = False

    async def _run_loop(self):
        while self._running:
            now = time.time()
            for job in self.jobs.values():
                if not job.enabled:
                    continue
                if now - job.last_run >= job.interval_seconds:
                    await self._execute_job(job)
            await asyncio.sleep(30)  # Check every 30s

    async def _execute_job(self, job: RecurringJob):
        """Submit a job as a task to the orchestrator."""
        task = TaskMessage(
            task_id=f"job-{job.name}-{int(time.time())}",
            archetype=job.archetype,
            intent=job.intent,
            prompt=job.prompt,
            priority=7,  # Lower priority than user tasks
        )
        await self.bus.publish_task(task)
        job.last_run = time.time()
        job.run_count += 1
        log.info("Job %s submitted (run #%d)", job.name, job.run_count)

    def list_jobs(self) -> list[dict]:
        return [
            {
                "name": j.name,
                "archetype": j.archetype,
                "interval": j.interval_seconds,
                "enabled": j.enabled,
                "last_run": j.last_run,
                "run_count": j.run_count,
            }
            for j in self.jobs.values()
        ]

    def toggle_job(self, name: str) -> bool:
        job = self.jobs.get(name)
        if not job:
            return False
        job.enabled = not job.enabled
        log.info("Job %s %s", name, "enabled" if job.enabled else "disabled")
        return True


class WorkerIntegration:
    """Connect agent tasks to real Cloudflare Workers."""

    def __init__(self):
        self._session: aiohttp.ClientSession | None = None

    async def init(self):
        self._session = aiohttp.ClientSession()

    async def close(self):
        if self._session:
            await self._session.close()

    async def trigger_search_reindex(self, source: str = "github") -> dict:
        """Trigger search index rebuild via the index Worker."""
        async with self._session.post(
            f"https://index.blackroad.io/api/index?source={source}",
            timeout=aiohttp.ClientTimeout(total=30),
        ) as resp:
            return await resp.json()

    async def get_fleet_status(self) -> dict:
        """Pull fleet status from the fleet API."""
        async with self._session.get(
            "https://fleet-api.amundsonalexa.workers.dev/fleet",
            timeout=aiohttp.ClientTimeout(total=10),
        ) as resp:
            return await resp.json()

    async def get_search_stats(self) -> dict:
        """Pull search stats."""
        async with self._session.get(
            "https://search.blackroad.io/api/stats",
            timeout=aiohttp.ClientTimeout(total=5),
        ) as resp:
            return await resp.json()

    async def get_analytics(self) -> dict:
        """Pull analytics summary."""
        async with self._session.get(
            "https://analytics.blackroad.io/api/stats",
            timeout=aiohttp.ClientTimeout(total=5),
        ) as resp:
            return await resp.json()

    async def check_all_workers(self) -> dict:
        """Health check all Workers in parallel."""
        endpoints = {
            "auth": "https://auth.blackroad.io/api/health",
            "pay": "https://pay.blackroad.io/health",
            "search": "https://search.blackroad.io/api/health",
            "portal": "https://portal.blackroad.io/api/health",
            "chat": "https://chat.blackroad.io/api/health",
            "images": "https://images.blackroad.io/api/health",
            "index": "https://index.blackroad.io/api/health",
            "analytics": "https://analytics.blackroad.io/api/health",
            "stats": "https://stats.blackroad.io/health",
            "agents": "https://agents.blackroad.io/health",
            "fleet": "https://fleet.blackroad.io/health",
        }

        results = {}
        tasks = []
        for name, url in endpoints.items():
            tasks.append(self._check_one(name, url))

        for coro in asyncio.as_completed(tasks):
            name, status = await coro
            results[name] = status

        return results

    async def _check_one(self, name: str, url: str) -> tuple[str, str]:
        try:
            async with self._session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                return (name, "up" if resp.status == 200 else "down")
        except Exception:
            return (name, "down")
