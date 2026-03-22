from __future__ import annotations

from pathlib import Path

import pytest

from qlm_lab.policies import Policy, enforce_file_caps
from qlm_lab.proto import Msg, new


def test_message_round_trip() -> None:
    message = new("planner", "qlm", "task", "prove_chsh", shots=128)
    clone = Msg(**message.__dict__)
    assert clone == message


def test_policy_defaults() -> None:
    policy = Policy()
    assert policy.allow_network is False
    assert policy.max_artifacts_mb == 20


def test_enforce_file_caps(tmp_path: Path) -> None:
    payload = tmp_path / "huge.bin"
    payload.write_bytes(b"x" * 2048)
    with pytest.raises(RuntimeError):
        enforce_file_caps(tmp_path, Policy(max_artifacts_mb=0))
    payload.unlink()
    enforce_file_caps(tmp_path, Policy(max_artifacts_mb=1))
