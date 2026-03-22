"""Close bot tests."""

from __future__ import annotations

from datetime import datetime

from bots.close_bot import CloseBot
from orchestrator import Task, TaskPriority


def test_close_bot_returns_status(grant_full_consent):
    bot = CloseBot()
    task = Task(
        id="TSK-CLOSE",
        goal="Close status update",
        owner="finance",
        priority=TaskPriority.MEDIUM,
        created_at=datetime.utcnow(),
    )
    grant_full_consent(task.owner, bot.metadata.name)
    response = bot.run(task)
    assert response.ok
    assert any(item["status"] == "pending" for item in response.data["milestones"])
