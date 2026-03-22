import json
from datetime import datetime, timezone
from pathlib import Path

BEACON_PATH = Path(__file__).resolve().parent.parent / "public" / "sig.beacon.json"


def main() -> None:
    payload = {"ts": datetime.now(timezone.utc).isoformat(), "agent": "LabPack-Gen-0"}
    BEACON_PATH.parent.mkdir(exist_ok=True)
    BEACON_PATH.write_text(json.dumps(payload, indent=2))
    print(f"Beacon written to {BEACON_PATH}")


if __name__ == "__main__":
    main()
