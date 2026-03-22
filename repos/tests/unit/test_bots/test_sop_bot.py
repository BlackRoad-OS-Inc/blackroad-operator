"""S&OP bot tests."""

from __future__ import annotations

from datetime import datetime

from bots.sop_bot import SopBot
from orchestrator import Task, TaskPriority


def test_sop_bot_allocations(grant_full_consent):
    bot = SopBot()
    task = Task(
        id="TSK-SOP",
        goal="Replan S&OP for Q3",
        owner="supply",
        priority=TaskPriority.MEDIUM,
        created_at=datetime.utcnow(),
    )
    grant_full_consent(task.owner, bot.metadata.name)
    response = bot.run(task)
    assert response.ok
    assert response.metrics["service_level"] == 0.96
