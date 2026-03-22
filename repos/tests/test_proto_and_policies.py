from __future__ import annotations

from pathlib import Path

from qlm_lab import proto
from qlm_lab.policies import PolicyConfig, PolicyGuard, PolicyError


def test_message_schema() -> None:
    message = proto.new("a", "b", "task", "demo", foo="bar")
    assert message.sender == "a"
    assert message.args["foo"] == "bar"


def test_policy_blocks_network() -> None:
    guard = PolicyGuard()
    try:
        guard.ensure_network_allowed()
    except PolicyError:
        pass
    else:
        raise AssertionError("Network should be disabled")


def test_artifact_size_limit(tmp_path: Path) -> None:
    config = PolicyConfig(max_artifacts_mb=1)
    config.artifact_dir = tmp_path
    guard = PolicyGuard(config)
    large_path = tmp_path / "large.bin"
    guard.ensure_file_write_allowed(large_path, 512_000)
    guard.ensure_file_write_allowed(large_path, 700_000)
    guard.ensure_file_write_allowed(large_path, 1_048_576)
    try:
        guard.ensure_file_write_allowed(large_path, 2_048_000)
    except PolicyError:
        pass
    else:
        raise AssertionError("Should reject oversized artifact")
