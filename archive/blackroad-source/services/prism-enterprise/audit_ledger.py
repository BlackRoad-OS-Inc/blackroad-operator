#!/usr/bin/env python3
"""Utility helpers for inspecting the offline service audit ledger."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from collections import OrderedDict
from typing import Iterable, Iterator, Tuple

LEDGER_PATH = Path(__file__).with_name("audit.ndjson")


def read_entries(path: Path) -> Iterator[dict]:
  if not path.exists():
    return
  with path.open("r", encoding="utf-8") as handle:
    for line_no, line in enumerate(handle, start=1):
      line = line.strip()
      if not line:
        continue
      try:
        yield json.loads(line)
      except json.JSONDecodeError as exc:
        raise ValueError(f"invalid json on line {line_no}") from exc


def verify_chain(entries: Iterable[dict]) -> Tuple[int, bool]:
  last_hash: str | None = None
  count = 0
  for entry in entries:
    candidate = OrderedDict()
    for key in ("ts", "event", "payload", "prevHash"):
      if key in entry:
        candidate[key] = entry[key]
    payload = json.dumps(candidate, ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    if entry.get("hash") != digest:
      return count, False
    if entry.get("prevHash") != last_hash:
      return count, False
    last_hash = entry.get("hash")
    count += 1
  return count, True


def main() -> None:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("--path", type=Path, default=LEDGER_PATH, help="Path to the audit.ndjson file")
  args = parser.parse_args()
  entries = list(read_entries(args.path))
  count, ok = verify_chain(entries)
  status = "OK" if ok else "BROKEN"
  print(f"Ledger entries: {count}")
  print(f"Chain status: {status}")
  if not ok:
    raise SystemExit(1)


if __name__ == "__main__":
  main()
