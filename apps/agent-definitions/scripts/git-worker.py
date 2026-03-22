#!/usr/bin/env python3
"""
BlackRoad Git Worker — autonomous git operations.
Auto-pulls repos, watches for new worlds/artifacts, commits them back.
"""
import os, subprocess, time
from pathlib import Path
from datetime import datetime

REPOS_DIR = Path.home()
BLACKROAD_REPOS = ["blackroad", "blackroad-agents", "blackroad-api"]
WORLD_DIR = Path.home() / ".blackroad/worlds"
CHECK_INTERVAL = 300  # 5 minutes

def run(cmd, cwd=None, capture=True):
    r = subprocess.run(cmd, shell=True, capture_output=capture, text=True, cwd=cwd)
    return r.stdout.strip(), r.returncode

def sync_repo(repo_path):
    p = Path(repo_path)
    if not (p / ".git").exists():
        return False
    # Pull latest
    out, code = run("git pull --ff-only 2>&1", cwd=str(p))
    if code != 0:
        return False
    if "Already up to date" not in out:
        print(f"  📥 {p.name}: {out[:100]}")
    return True

def push_worlds():
    """Commit and push any new world artifacts."""
    worlds_by_date = {}
    for f in sorted(WORLD_DIR.glob("*.md"))[-5:]:  # Last 5 new worlds
        worlds_by_date[f.name] = f.read_text()[:200] + "..."

    if not worlds_by_date:
        return

    # For each blackroad repo that exists, add a worlds/ subdir and push
    for repo_name in BLACKROAD_REPOS:
        repo_path = REPOS_DIR / repo_name
        if not (repo_path / ".git").exists():
            continue
        worlds_repo_dir = repo_path / "worlds"
        worlds_repo_dir.mkdir(exist_ok=True)

        added = False
        for name, content in worlds_by_date.items():
            dest = worlds_repo_dir / name
            if not dest.exists():
                # Copy from world dir
                src = WORLD_DIR / name
                if src.exists():
                    dest.write_text(src.read_text())
                    run(f"git add worlds/{name}", cwd=str(repo_path))
                    added = True

        if added:
            ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
            out, code = run(
                f'git commit -m "feat: world artifacts [{ts}]" --author "BlackRoad Pi <pi@blackroad.io>"',
                cwd=str(repo_path)
            )
            if code == 0:
                print(f"  💾 Committed worlds to {repo_name}")
                # Push (may fail if no remote creds - that's ok)
                run("git push 2>&1", cwd=str(repo_path))

def run_loop():
    print(f"🔧 Git Worker starting on {os.uname().nodename}")
    while True:
        print(f"\n⏰ Git sync — {datetime.utcnow().strftime('%H:%M UTC')}")
        for repo_name in BLACKROAD_REPOS:
            repo_path = REPOS_DIR / repo_name
            if (repo_path / ".git").exists():
                sync_repo(str(repo_path))
        push_worlds()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_loop()
