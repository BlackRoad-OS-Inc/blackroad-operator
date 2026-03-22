import json
from pathlib import Path

import pytest

from tools.timemachine.index import build_index


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data), encoding="utf-8")


def write_jsonl(path: Path, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record))
            handle.write("\n")


def test_build_index_with_all_sources(tmp_path: Path):
    lh_data = {"history": [{"ts": "2025-02-20T12:00:00Z", "perf": 0.93}]}
    ci_data = {"runs": [{"run_id": 1, "conclusion": "success"}]}
    k6_data = {"metrics": {"http_req_duration": {"p(95)": 320}}}
    sim_data = {"metrics": {"solid": {"mae": 0.2}}}
    alerts = [{"ts": "2025-02-20T10:00:00Z", "level": "warn"}]

    lh_path = tmp_path / "lh.json"
    ci_path = tmp_path / "ci.json"
    k6_path = tmp_path / "k6.json"
    sim_path = tmp_path / "run_meta.json"
    alerts_path = tmp_path / "alerts.jsonl"
    runtime_dir = tmp_path / "runtime"
    agents_dir = tmp_path / "agents"

    write_json(lh_path, lh_data)
    write_json(ci_path, ci_data)
    write_json(k6_path, k6_data)
    write_json(sim_path, sim_data)
    write_jsonl(alerts_path, alerts)

    runtime_file = runtime_dir / "app.log"
    runtime_file.parent.mkdir(parents=True, exist_ok=True)
    runtime_file.write_text("runtime-log-entry", encoding="utf-8")

    agent_file = agents_dir / "tree.json"
    agent_file.parent.mkdir(parents=True, exist_ok=True)
    agent_file.write_text(json.dumps({"population": {"target": 10}}), encoding="utf-8")

    index = build_index(
        lh_path=lh_path,
        ci_path=ci_path,
        k6_path=k6_path,
        run_meta_path=sim_path,
        alerts_path=alerts_path,
        runtime_path=runtime_dir,
        agents_path=agents_dir,
    )

    assert index["lh"] == lh_data
    assert index["ci"] == ci_data
    assert index["k6"] == k6_data
    assert index["sim"] == sim_data
    assert index["alerts"] == alerts
    assert index["runtime"][0]["path"] == "app.log"
    assert index["agents"][0]["path"] == "tree.json"


def test_build_index_with_missing_sources(tmp_path: Path):
    index = build_index(
        lh_path=tmp_path / "missing.json",
        ci_path=None,
        k6_path=None,
        run_meta_path=None,
        alerts_path=tmp_path / "missing.jsonl",
        runtime_path=tmp_path / "missing_dir",
        agents_path=None,
    )

    assert index["lh"] == {}
    assert index["ci"] == {}
    assert index["alerts"] == []
    assert index["runtime"] == []
    assert index["agents"] == []

    generated = index["generated_at"]
    assert generated.endswith("Z")


if __name__ == "__main__":
    pytest.main([__file__])
