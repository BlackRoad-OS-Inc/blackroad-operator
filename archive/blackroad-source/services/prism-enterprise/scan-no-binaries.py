"""Fail CI when binary artefacts slip into the repository."""
from __future__ import annotations

import re
import subprocess
import sys

BLOCKED = re.compile(
    r"\.(png|jpg|jpeg|gif|webp|pdf|zip|tar|gz|npz|npy|pkl|parquet|feather|mp4|mov|wav|ogg)$",
    re.IGNORECASE,
)


def is_binary_blob(path: str) -> bool:
    if BLOCKED.search(path):
        return True
    try:
        data = subprocess.check_output(["git", "show", f"HEAD:{path}"], stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        return False
    return b"\x00" in data


def main() -> None:
    tracked = subprocess.check_output(["git", "ls-files"]).decode().splitlines()
    offenders = [p for p in tracked if is_binary_blob(p)]
    if offenders:
        print("❌ Binary files detected in repo history or extensions:")
        for item in offenders:
            print(f" - {item}")
        sys.exit(2)
    print("✅ No binary files detected.")


if __name__ == "__main__":
    main()
