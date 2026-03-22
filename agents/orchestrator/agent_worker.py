"""
BlackRoad Agent Orchestrator — Agent Worker
The actual agent coroutine that processes tasks via Ollama inference.
Each agent is an async coroutine, NOT a process.
"""
import asyncio
import time
import logging
import json
import aiohttp

from .config import NODES
from .nats_protocol import TaskMessage, ResultMessage

log = logging.getLogger("orchestrator.worker")


class OllamaClient:
    """Async Ollama API client for model inference."""

    def __init__(self, host: str, port: int = 11434):
        self.base_url = f"http://{host}:{port}"
        self._session: aiohttp.ClientSession | None = None
        self._semaphore: asyncio.Semaphore | None = None

    async def init(self, max_concurrent: int = 4):
        self._session = aiohttp.ClientSession()
        self._semaphore = asyncio.Semaphore(max_concurrent)

    async def close(self):
        if self._session:
            await self._session.close()

    async def generate(self, model: str, prompt: str, timeout: int = 180) -> str:
        """Run inference through Ollama. Respects concurrency semaphore."""
        async with self._semaphore:
            try:
                async with self._session.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"num_predict": 512, "temperature": 0.7},
                    },
                    timeout=aiohttp.ClientTimeout(total=timeout),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response", "")
                    else:
                        error = await resp.text()
                        log.error("Ollama error %d: %s", resp.status, error[:200])
                        return ""
            except asyncio.TimeoutError:
                log.error("Ollama timeout for model %s", model)
                return ""
            except Exception as e:
                log.error("Ollama request failed: %s", e)
                return ""

    async def health(self) -> bool:
        try:
            async with self._session.get(
                f"{self.base_url}/api/tags",
                timeout=aiohttp.ClientTimeout(total=5),
            ) as resp:
                return resp.status == 200
        except Exception:
            return False


# System prompts per archetype
ARCHETYPE_PROMPTS = {
    "worker": "You are a BlackRoad worker agent. Execute tasks efficiently and return structured results. Be concise.",
    "researcher": "You are a BlackRoad research agent. Analyze information, find patterns, synthesize knowledge. Cite sources.",
    "coder": "You are a BlackRoad coding agent. Write clean, tested code. Follow best practices. Return code blocks.",
    "monitor": "You are a BlackRoad monitoring agent. Check system health, detect anomalies, report status. Be precise.",
    "creative": "You are a BlackRoad creative agent. Generate ideas, designs, narratives. Be original and bold.",
    "security": "You are a BlackRoad security agent. Audit code, check vulnerabilities, enforce policies. Be thorough.",
    "analyst": "You are a BlackRoad analyst agent. Process data, generate insights, build reports. Use numbers.",
    "coordinator": "You are a BlackRoad coordinator agent. Plan workflows, assign tasks, resolve conflicts. Be organized.",
}


async def run_agent_task(
    agent_id: str,
    agent_name: str,
    archetype: str,
    model: str,
    node: str,
    task: TaskMessage,
    ollama: OllamaClient,
) -> ResultMessage:
    """Execute a single task as an agent. This is the core work loop."""
    start = time.time()

    system_prompt = ARCHETYPE_PROMPTS.get(archetype, ARCHETYPE_PROMPTS["worker"])
    full_prompt = f"""[SYSTEM] {system_prompt}
[AGENT] {agent_name} ({agent_id}) | Archetype: {archetype} | Node: {node}
[TASK] ID: {task.task_id} | Intent: {task.intent} | Priority: {task.priority}
[PROMPT] {task.prompt}"""

    log.info(
        "Agent %s (%s/%s) executing task %s on %s",
        agent_id, archetype, model, task.task_id, node,
    )

    try:
        response = await ollama.generate(model, full_prompt)
        latency_ms = int((time.time() - start) * 1000)

        if response:
            return ResultMessage(
                task_id=task.task_id,
                agent_id=agent_id,
                node=node,
                status="completed",
                result=response,
                latency_ms=latency_ms,
            )
        else:
            return ResultMessage(
                task_id=task.task_id,
                agent_id=agent_id,
                node=node,
                status="failed",
                error="Empty response from Ollama",
                latency_ms=latency_ms,
            )

    except Exception as e:
        latency_ms = int((time.time() - start) * 1000)
        log.error("Agent %s task %s failed: %s", agent_id, task.task_id, e)
        return ResultMessage(
            task_id=task.task_id,
            agent_id=agent_id,
            node=node,
            status="failed",
            error=str(e),
            latency_ms=latency_ms,
        )
