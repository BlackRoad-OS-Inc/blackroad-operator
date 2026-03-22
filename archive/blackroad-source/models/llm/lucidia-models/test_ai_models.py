"""Tests for src/ai_models.py — Lucidia AI Model Registry."""
import json
import sys
import urllib.error
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
from ai_models import (
    ModelEntry, ModelVersion, BenchmarkResult,
    ModelMetrics, AIModelRegistry, OllamaRouter, OLLAMA_ALIASES,
)


@pytest.fixture
def registry(tmp_path):
    reg = AIModelRegistry(db_path=tmp_path / "test_registry.db")
    yield reg
    reg.close()


@pytest.fixture
def reg_with_model(registry):
    entry = ModelEntry(
        model_id="llama3-test", name="LLaMA-3 Test",
        provider="meta", architecture="transformer",
        parameter_count="8B",
    )
    registry.register_model(entry)
    return registry, entry


# ── dataclass defaults ────────────────────────────────────────────────────────
def test_model_entry_defaults():
    entry = ModelEntry()
    assert entry.license == "apache-2.0"
    assert entry.tags == []
    assert len(entry.model_id) == 8


def test_model_version_defaults():
    ver = ModelVersion()
    assert ver.version == "1.0.0"
    assert ver.is_latest is True
    assert ver.training_steps == 0


# ── registration ──────────────────────────────────────────────────────────────
def test_register_model_returns_entry(registry):
    entry = ModelEntry(model_id="m1", name="Model One", provider="openai")
    result = registry.register_model(entry)
    assert result.model_id == "m1"


def test_get_model_after_register(registry):
    entry = ModelEntry(model_id="get-test", name="GetTest", provider="google")
    registry.register_model(entry)
    fetched = registry.get_model("get-test")
    assert fetched is not None
    assert fetched.name == "GetTest"
    assert fetched.provider == "google"


def test_get_model_not_found(registry):
    assert registry.get_model("nonexistent") is None


def test_tags_preserved_round_trip(registry):
    entry = ModelEntry(
        model_id="tagged", name="Tagged", provider="hf",
        tags=["chat", "instruct", "rlhf"]
    )
    registry.register_model(entry)
    fetched = registry.get_model("tagged")
    assert fetched.tags == ["chat", "instruct", "rlhf"]


# ── listing ───────────────────────────────────────────────────────────────────
def test_list_models_empty(registry):
    assert registry.list_models() == []


def test_list_models_count(registry):
    for i in range(3):
        registry.register_model(ModelEntry(model_id=f"m{i}", name=f"M{i}", provider="meta"))
    assert len(registry.list_models()) == 3


def test_list_models_filter_by_provider(registry):
    registry.register_model(ModelEntry(model_id="a1", name="A1", provider="openai"))
    registry.register_model(ModelEntry(model_id="b1", name="B1", provider="google"))
    registry.register_model(ModelEntry(model_id="c1", name="C1", provider="openai"))
    openai = registry.list_models(provider="openai")
    assert len(openai) == 2
    assert all(m.provider == "openai" for m in openai)


# ── versioning ────────────────────────────────────────────────────────────────
def test_add_version(reg_with_model):
    registry, entry = reg_with_model
    ver = ModelVersion(model_id=entry.model_id, version="1.0.0", training_steps=1000)
    result = registry.add_version(ver)
    assert result.version == "1.0.0"
    versions = registry.get_versions(entry.model_id)
    assert len(versions) == 1


def test_latest_version_flag_on_second_add(reg_with_model):
    registry, entry = reg_with_model
    registry.add_version(ModelVersion(model_id=entry.model_id, version="1.0.0"))
    registry.add_version(ModelVersion(model_id=entry.model_id, version="2.0.0"))
    versions = registry.get_versions(entry.model_id)
    # Most recent first
    assert versions[0].is_latest is True
    assert versions[1].is_latest is False


def test_get_versions_empty_model(registry):
    assert registry.get_versions("no-model") == []


# ── benchmarking ──────────────────────────────────────────────────────────────
def test_benchmark_model_stores_result(reg_with_model):
    registry, entry = reg_with_model
    bench = BenchmarkResult(
        model_id=entry.model_id, task="mmlu",
        score=72.5, latency_p50_ms=120.0, latency_p99_ms=450.0,
        throughput_rps=8.5,
    )
    result = registry.benchmark_model(bench)
    assert result.score == 72.5


def test_benchmark_score_clamped_display(reg_with_model):
    """Score bar should not crash on 0 or 100."""
    registry, entry = reg_with_model
    registry.benchmark_model(BenchmarkResult(model_id=entry.model_id, task="t1", score=0.0))
    registry.benchmark_model(BenchmarkResult(model_id=entry.model_id, task="t2", score=100.0))


# ── metrics ───────────────────────────────────────────────────────────────────
def test_get_metrics_with_data(reg_with_model):
    registry, entry = reg_with_model
    registry.add_version(ModelVersion(model_id=entry.model_id, version="1.0.0"))
    registry.benchmark_model(BenchmarkResult(
        model_id=entry.model_id, task="mmlu",
        score=80.0, latency_p50_ms=100.0
    ))
    metrics = registry.get_metrics(entry.model_id)
    assert metrics is not None
    assert metrics.total_versions == 1
    assert metrics.total_benchmarks == 1
    assert metrics.best_score == 80.0


def test_get_metrics_no_data(registry):
    assert registry.get_metrics("no-such-model") is None


def test_get_metrics_best_score_is_max(reg_with_model):
    registry, entry = reg_with_model
    registry.add_version(ModelVersion(model_id=entry.model_id, version="1.0.0"))
    registry.benchmark_model(BenchmarkResult(model_id=entry.model_id, task="t1", score=60.0))
    registry.benchmark_model(BenchmarkResult(model_id=entry.model_id, task="t2", score=85.0))
    registry.benchmark_model(BenchmarkResult(model_id=entry.model_id, task="t3", score=70.0))
    metrics = registry.get_metrics(entry.model_id)
    assert metrics.best_score == 85.0


# ── OllamaRouter ──────────────────────────────────────────────────────────────
def test_ollama_aliases_contains_all_handles():
    assert "@copilot" in OLLAMA_ALIASES
    assert "@lucidia" in OLLAMA_ALIASES
    assert "@blackboxprogramming" in OLLAMA_ALIASES
    assert "@ollama" in OLLAMA_ALIASES


@pytest.mark.parametrize("prompt", [
    "@copilot what is 2+2?",
    "Hey @lucidia, summarise this for me",
    "@blackboxprogramming write a function",
    "@ollama generate some code",
    "I need @COPILOT to help",          # case-insensitive
])
def test_should_route_returns_true_for_aliases(prompt):
    assert OllamaRouter.should_route(prompt) is True


@pytest.mark.parametrize("prompt", [
    "write me some code",
    "what is the weather today?",
    "help me debug this function",
])
def test_should_route_returns_false_without_aliases(prompt):
    assert OllamaRouter.should_route(prompt) is False


def test_chat_sends_request_to_ollama():
    """OllamaRouter.chat() must POST to /api/generate and return response text."""
    mock_response_body = json.dumps({"response": "Hello from Ollama!"}).encode()
    mock_resp = MagicMock()
    mock_resp.read.return_value = mock_response_body
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)

    with patch("urllib.request.urlopen", return_value=mock_resp) as mock_urlopen:
        router = OllamaRouter(base_url="http://localhost:11434")
        result = router.chat("@ollama say hello", model="llama3")

    assert result == "Hello from Ollama!"
    call_args = mock_urlopen.call_args
    req = call_args[0][0]
    assert req.full_url == "http://localhost:11434/api/generate"
    body = json.loads(req.data.decode())
    assert body["model"] == "llama3"
    assert body["stream"] is False


def test_chat_raises_connection_error_when_ollama_unreachable():
    with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("refused")):
        router = OllamaRouter(base_url="http://localhost:11434")
        with pytest.raises(ConnectionError, match="Cannot reach Ollama"):
            router.chat("@ollama hello")


def test_chat_raises_runtime_error_on_bad_response():
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps({"error": "model not found"}).encode()
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)

    with patch("urllib.request.urlopen", return_value=mock_resp):
        router = OllamaRouter()
        with pytest.raises(RuntimeError, match="Unexpected Ollama response"):
            router.chat("@lucidia test")
