"""Tests for src/vllm_mvp.py — BlackRoad vLLM MVP."""
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
from vllm_mvp import (
    ModelConfig, InferenceRequest, InferenceResponse,
    BatchRequest, VLLMInferenceServer,
)


@pytest.fixture
def tmp_server(tmp_path):
    srv = VLLMInferenceServer(db_path=tmp_path / "vllm_test.db")
    yield srv
    srv.close()


@pytest.fixture
def loaded_server(tmp_server):
    tmp_server.load_model(ModelConfig(model_id="test-llm", name="Test LLM", max_tokens=512))
    return tmp_server


# ── dataclass defaults ────────────────────────────────────────────────────────
def test_model_config_defaults():
    cfg = ModelConfig(model_id="m1", name="M1")
    assert cfg.max_tokens == 2048
    assert cfg.temperature == 0.7
    assert cfg.dtype == "float16"
    assert cfg.quantization is None


def test_inference_request_defaults():
    req = InferenceRequest()
    assert req.max_tokens == 256
    assert req.temperature == 0.7
    assert req.stream is False
    assert len(req.request_id) == 8


# ── model management ──────────────────────────────────────────────────────────
def test_load_model_registers_in_memory(tmp_server):
    cfg = ModelConfig(model_id="llm-a", name="LLM-A")
    tmp_server.load_model(cfg)
    assert "llm-a" in tmp_server._models
    assert tmp_server._models["llm-a"].name == "LLM-A"


def test_list_models_empty(tmp_server):
    assert tmp_server.list_models() == []


def test_list_models_returns_all(tmp_server):
    tmp_server.load_model(ModelConfig(model_id="m1", name="M1"))
    tmp_server.load_model(ModelConfig(model_id="m2", name="M2"))
    models = tmp_server.list_models()
    assert len(models) == 2
    assert {m.model_id for m in models} == {"m1", "m2"}


def test_model_upsert_deduplication(tmp_server):
    tmp_server.load_model(ModelConfig(model_id="dup", name="Original"))
    tmp_server.load_model(ModelConfig(model_id="dup", name="Updated"))
    models = [m for m in tmp_server.list_models() if m.model_id == "dup"]
    assert len(models) == 1


# ── inference ─────────────────────────────────────────────────────────────────
def test_submit_request_returns_response(loaded_server):
    req = InferenceRequest(model_id="test-llm", prompt="Hello world", max_tokens=64)
    resp = loaded_server.submit_request(req)
    assert isinstance(resp, InferenceResponse)
    assert resp.request_id == req.request_id
    assert resp.tokens_generated > 0
    assert resp.latency_ms > 0
    assert resp.finish_reason == "stop"


def test_submit_request_no_model_raises(tmp_server):
    req = InferenceRequest(model_id="nonexistent", prompt="test")
    with pytest.raises(ValueError, match="not loaded"):
        tmp_server.submit_request(req)


def test_submit_request_text_contains_model_id(loaded_server):
    req = InferenceRequest(model_id="test-llm", prompt="ping", max_tokens=16)
    resp = loaded_server.submit_request(req)
    assert "test-llm" in resp.text


# ── batch inference ───────────────────────────────────────────────────────────
def test_batch_inference_count(loaded_server):
    reqs = [InferenceRequest(model_id="test-llm", prompt=f"P{i}") for i in range(4)]
    resps = loaded_server.batch_inference(BatchRequest(requests=reqs, priority=2))
    assert len(resps) == 4


def test_batch_inference_empty(loaded_server):
    batch = BatchRequest(requests=[], priority=1)
    assert loaded_server.batch_inference(batch) == []


def test_batch_all_have_tokens(loaded_server):
    reqs = [InferenceRequest(model_id="test-llm", prompt=f"Q{i}") for i in range(3)]
    for resp in loaded_server.batch_inference(BatchRequest(requests=reqs)):
        assert resp.tokens_generated > 0


# ── streaming ─────────────────────────────────────────────────────────────────
def test_stream_response_yields_tokens(loaded_server):
    req = InferenceRequest(model_id="test-llm", prompt="Stream this", max_tokens=32)
    tokens = list(loaded_server.stream_response(req))
    assert len(tokens) > 0
    assert "test-llm" in "".join(tokens)


# ── stats ─────────────────────────────────────────────────────────────────────
def test_stats_empty(tmp_server):
    stats = tmp_server.get_stats()
    assert stats["total_requests"] == 0
    assert stats["models_loaded"] == 0
    assert stats["batches_run"] == 0


def test_stats_after_requests(loaded_server):
    loaded_server.submit_request(InferenceRequest(model_id="test-llm", prompt="stat test"))
    stats = loaded_server.get_stats()
    assert stats["total_requests"] >= 1
    assert stats["models_loaded"] >= 1
    assert stats["total_tokens"] > 0
