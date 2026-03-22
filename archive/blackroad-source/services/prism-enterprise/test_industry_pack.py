from bots import BOT_REGISTRY
from orchestrator import Task


def test_merchandising_bot(grant_full_consent):
    bot = BOT_REGISTRY["Merchandising-BOT"]
    task = Task(id="1", goal="plan", bot="Merchandising-BOT", owner="merchandising")
    grant_full_consent("merchandising", "Merchandising-BOT")
    result = bot.run(task)
    assert "SKU1" in result


def test_store_ops_bot(grant_full_consent):
    bot = BOT_REGISTRY["Store-Ops-BOT"]
    task = Task(id="2", goal="ops", bot="Store-Ops-BOT", owner="store.ops")
    grant_full_consent("store.ops", "Store-Ops-BOT")
    result = bot.run(task)
    assert result["labor_plan"]

