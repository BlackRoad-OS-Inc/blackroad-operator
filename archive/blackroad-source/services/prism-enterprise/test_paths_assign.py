import json

from enablement import paths
from enablement.utils import ART
from tools import storage


def test_path_and_assign(tmp_path):
    storage.write(str(ART / "assignments.json"), "[]")
    storage.write(str(ART / "history" / "assignments.json"), "[]")
    storage.write(str(ART / "actions.jsonl"), "")
    p = paths.new_path("SE Onboarding", "Solutions Engineer", ["C101", "C201"], 85)
    assert p.id == "SE_ONB"
    a = paths.assign(
        "U_SE01",
        p.id,
        "2025-10-30",
        "Route through core labs for onboarding week.",
        "model-1.0.0",
    )
    assert a.path_id == p.id
    assert a.rationale == "Route through core labs for onboarding week."
    data = json.loads(storage.read(str(ART / "assignments.json")))
    assert data[-1]["rationale"] == "Route through core labs for onboarding week."
    assert data[-1]["model_version"] == "model-1.0.0"

    paths.assign(
        "U_SE02",
        p.id,
        "2025-11-01",
        "Pair second cohort with mentor-led labs.",
        "model-1.0.0",
    )
    restored = paths.undo_last_assignment("lucidia", "Back out test cohort", "model-1.0.0")
    assert isinstance(restored, list)
    updated = json.loads(storage.read(str(ART / "assignments.json")))
    assert len(updated) == 1


def test_assign_backfills_legacy_records(tmp_path):
    legacy_record = {
        "user_id": "legacy-1",
        "path_id": "PATH-LEGACY",
        "due_date": "2023-01-01",
        "progress": {},
    }
    storage.write(str(ART / "assignments.json"), json.dumps([legacy_record]))
    storage.write(str(ART / "history" / "assignments.json"), "[]")
    storage.write(str(ART / "actions.jsonl"), "")

    paths.assign(
        "user-new",
        "PATH-LEGACY",
        "2025-01-01",
        "Initial rationale",
        "model-2.0.0",
    )

    records = json.loads(storage.read(str(ART / "assignments.json")))
    assert all(record.get("rationale") for record in records)
    assert all(record.get("model_version") for record in records)


def test_undo_restores_legacy_records_with_defaults(tmp_path):
    storage.write(
        str(ART / "assignments.json"),
        json.dumps(
            [
                {
                    "user_id": "current",
                    "path_id": "P1",
                    "due_date": "2024-01-01",
                    "progress": {},
                    "rationale": "Recorded rationale",
                    "model_version": "model-1.0.0",
                }
            ]
        ),
    )
    history_payload = [
        {
            "timestamp": "2024-01-01T00:00:00Z",
            "data": [
                {
                    "user_id": "legacy-undo",
                    "path_id": "P0",
                    "due_date": "2023-06-01",
                    "progress": {},
                }
            ],
        }
    ]
    storage.write(
        str(ART / "history" / "assignments.json"), json.dumps(history_payload)
    )
    storage.write(str(ART / "actions.jsonl"), "")

    restored = paths.undo_last_assignment(
        "lucidia", "Revert legacy", "model-2.0.0"
    )

    assert restored
    assert all(record.get("rationale") for record in restored)
    assert all(record.get("model_version") for record in restored)

    stored = json.loads(storage.read(str(ART / "assignments.json")))
    assert stored == restored
