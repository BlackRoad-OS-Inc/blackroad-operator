"""Treasury bot tests."""

from __future__ import annotations

from datetime import datetime

from bots.treasury_bot import TreasuryBot
from orchestrator import Task, TaskPriority


def test_treasury_bot_generates_forecast(grant_full_consent):
    bot = TreasuryBot()
    task = Task(
        id="TSK-BOT",
        goal="Build 13-week cash forecast",
        owner="finance",
        priority=TaskPriority.HIGH,
        created_at=datetime.utcnow(),
    )
    grant_full_consent(task.owner, bot.metadata.name)
    response = bot.run(task)
    assert response.ok
    assert len(response.data["weekly_cash"]) == 13
