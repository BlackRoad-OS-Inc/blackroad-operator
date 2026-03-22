"""
BlackRoad Agent Orchestrator — Task Pipelines
Chain multiple agents together. Output of one feeds into the next.
"""
import asyncio
import uuid
import time
import logging
from dataclasses import dataclass, field
from .nats_protocol import NATSBus, TaskMessage, ResultMessage

log = logging.getLogger("orchestrator.pipelines")


@dataclass
class PipelineStep:
    archetype: str
    prompt_template: str  # Use {input} for previous step's output
    intent: str = "pipeline"
    target_node: str = ""


@dataclass
class Pipeline:
    name: str
    steps: list[PipelineStep]
    pipeline_id: str = ""
    status: str = "pending"
    results: list[ResultMessage] = field(default_factory=list)
    created_at: float = 0.0

    def __post_init__(self):
        if not self.pipeline_id:
            self.pipeline_id = f"pipe-{uuid.uuid4().hex[:12]}"
        if not self.created_at:
            self.created_at = time.time()


# Pre-built pipelines
BUILTIN_PIPELINES = {
    "research-report": Pipeline(
        name="Research Report",
        steps=[
            PipelineStep("researcher", "Research this topic thoroughly: {input}"),
            PipelineStep("analyst", "Analyze these research findings and extract key insights:\n{input}"),
            PipelineStep("creative", "Write a clear, engaging summary report based on this analysis:\n{input}"),
        ],
    ),
    "code-review": Pipeline(
        name="Code Review",
        steps=[
            PipelineStep("coder", "Review this code for bugs and improvements:\n{input}"),
            PipelineStep("security", "Check this code review for security vulnerabilities:\n{input}"),
            PipelineStep("coordinator", "Summarize the code review and security findings into actionable items:\n{input}"),
        ],
    ),
    "fleet-audit": Pipeline(
        name="Fleet Audit",
        steps=[
            PipelineStep("monitor", "Check the status of all BlackRoad infrastructure services: {input}"),
            PipelineStep("security", "Audit these infrastructure findings for security issues:\n{input}"),
            PipelineStep("analyst", "Produce a fleet health score and risk assessment:\n{input}"),
        ],
    ),
    "content-create": Pipeline(
        name="Content Creation",
        steps=[
            PipelineStep("researcher", "Research this topic for a blog post: {input}"),
            PipelineStep("creative", "Write an engaging blog post based on this research:\n{input}"),
            PipelineStep("coder", "Format this blog post as clean HTML with proper headings and structure:\n{input}"),
        ],
    ),
    "bug-fix": Pipeline(
        name="Bug Fix",
        steps=[
            PipelineStep("coder", "Analyze this bug report and identify the root cause:\n{input}"),
            PipelineStep("coder", "Write a fix for this bug based on the analysis:\n{input}"),
            PipelineStep("security", "Verify this fix doesn't introduce new vulnerabilities:\n{input}"),
        ],
    ),
}


class PipelineExecutor:
    """Executes multi-step pipelines by chaining agent tasks."""

    def __init__(self, bus: NATSBus):
        self.bus = bus
        self._active: dict[str, Pipeline] = {}
        self._results: dict[str, ResultMessage] = {}
        self._waiters: dict[str, asyncio.Event] = {}

    async def execute(self, pipeline: Pipeline, initial_input: str) -> Pipeline:
        """Execute a pipeline, chaining results through each step."""
        pipeline.status = "running"
        self._active[pipeline.pipeline_id] = pipeline
        current_input = initial_input

        log.info("Pipeline %s started: %s (%d steps)", pipeline.pipeline_id, pipeline.name, len(pipeline.steps))

        for i, step in enumerate(pipeline.steps):
            step_num = i + 1
            task_id = f"{pipeline.pipeline_id}-step{step_num}"

            # Build prompt from template
            prompt = step.prompt_template.replace("{input}", current_input)

            # Create and publish task
            task = TaskMessage(
                task_id=task_id,
                archetype=step.archetype,
                intent=step.intent,
                prompt=prompt,
                priority=2,
                target_node=step.target_node,
            )

            # Set up waiter
            event = asyncio.Event()
            self._waiters[task_id] = event

            await self.bus.publish_task(task)
            log.info("Pipeline %s step %d/%d: %s task %s", pipeline.pipeline_id, step_num, len(pipeline.steps), step.archetype, task_id)

            # Wait for result (timeout 5 min per step)
            try:
                await asyncio.wait_for(event.wait(), timeout=300)
            except asyncio.TimeoutError:
                log.error("Pipeline %s step %d timed out", pipeline.pipeline_id, step_num)
                pipeline.status = "failed"
                return pipeline

            result = self._results.get(task_id)
            if not result or result.status != "completed":
                log.error("Pipeline %s step %d failed: %s", pipeline.pipeline_id, step_num, result.error if result else "no result")
                pipeline.status = "failed"
                return pipeline

            pipeline.results.append(result)
            current_input = result.result
            log.info("Pipeline %s step %d completed in %dms", pipeline.pipeline_id, step_num, result.latency_ms)

        pipeline.status = "completed"
        log.info("Pipeline %s completed: %d steps, total %dms",
                 pipeline.pipeline_id, len(pipeline.steps),
                 sum(r.latency_ms for r in pipeline.results))

        self._active.pop(pipeline.pipeline_id, None)
        return pipeline

    def on_result(self, result: ResultMessage):
        """Called when a task result arrives. Unblocks pipeline steps."""
        self._results[result.task_id] = result
        event = self._waiters.pop(result.task_id, None)
        if event:
            event.set()

    def list_pipelines(self) -> list[str]:
        return list(BUILTIN_PIPELINES.keys())

    def get_builtin(self, name: str) -> Pipeline | None:
        template = BUILTIN_PIPELINES.get(name)
        if not template:
            return None
        # Return a fresh copy
        return Pipeline(
            name=template.name,
            steps=list(template.steps),
        )
