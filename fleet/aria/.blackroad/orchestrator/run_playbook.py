#!/usr/bin/env python3
"""Run BlackRoad deployment playbooks"""

import yaml
import subprocess
import sys
import os

def run_remote(host, cmd, timeout=30):
    try:
        result = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=5", host, cmd],
            capture_output=True, text=True, timeout=timeout
        )
        return result.returncode == 0, result.stdout.strip()
    except:
        return False, ""

def run_playbook(playbook_path):
    with open(playbook_path) as f:
        pb = yaml.safe_load(f)

    print(f"\n=== Running Playbook: {pb['name']} ===\n")

    for target in pb.get("targets", []):
        print(f"\n--- {target} ---")

        for svc in pb.get("services", []):
            print(f"  Starting {svc['name']}...", end=" ")
            ok, _ = run_remote(target, svc["start"])
            print("OK" if ok else "SKIP")

    print("\n--- Post Deploy ---")
    for cmd in pb.get("post_deploy", []):
        print(f"  Running: {cmd}")
        os.system(cmd)

    print("\n=== Playbook Complete ===")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: run_playbook.py <playbook.yaml>")
        sys.exit(1)
    run_playbook(sys.argv[1])
