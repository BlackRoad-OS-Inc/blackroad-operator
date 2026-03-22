import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agents.birth import AgentBirthProtocol


def write_sample_repo(tmp_path: Path) -> None:
    census_text = """### Category 1
| ID | Name | Role | Status |
|----|------|------|--------|
| A1 | Agent One | Analyst | Active |
"""
    (tmp_path / "AGENT_CENSUS_COMPLETE.md").write_text(census_text, encoding="utf-8")

    manifest_dir = tmp_path / "agents" / "archetypes" / "cluster"
    manifest_dir.mkdir(parents=True)
    (manifest_dir / "sample.manifest.yaml").write_text(
        """id: archetype-one
name: Archetype One
role: Guide
cluster: Cluster A
covenant_tags:
  - Insight
""",
        encoding="utf-8",
    )


def test_birth_protocol_creates_identities(tmp_path):
    write_sample_repo(tmp_path)

    protocol = AgentBirthProtocol(repo_root=tmp_path)
    summary = protocol.run()

    assert summary["born"] == 2

    jsonl_path = tmp_path / "artifacts" / "agents" / "identities.jsonl"
    lines = jsonl_path.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 2
    records = [json.loads(line) for line in lines]
    ids = {record["id"] for record in records}
    assert ids == {"A1", "archetype-one"}
    assert all(record["status"] == "born" for record in records)


def test_birth_protocol_idempotent(tmp_path):
    write_sample_repo(tmp_path)

    protocol = AgentBirthProtocol(repo_root=tmp_path)
    first_summary = protocol.run()
    assert first_summary["born"] == 2

    second_summary = protocol.run()
    assert second_summary["born"] == 0
    assert second_summary["skipped"] >= 2

    jsonl_path = tmp_path / "artifacts" / "agents" / "identities.jsonl"
    lines = jsonl_path.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 2
