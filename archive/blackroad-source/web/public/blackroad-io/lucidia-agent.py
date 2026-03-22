# lucidia-agent.py
import os
import time
import subprocess
from pathlib import Path

# SETTINGS
PROJECT_PATH = Path.home() / "Documents" / "BlackRoad"
REMOTE = "git@github.com:blackboxprogramming/blackroad.io.git"
BRANCH = "main"

def run(cmd):
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    if result.returncode != 0:
        print(f"[error] {cmd}\n{result.stderr.strip()}")
    return result.stdout.strip()

def ensure_git():
    os.chdir(PROJECT_PATH)
    if not (PROJECT_PATH / ".git").exists():
        print("🧠 Initializing Git repo...")
        run("git init")
        run(f"git remote add origin {REMOTE}")
        run(f"git branch -M {BRANCH}")
    run("git config user.name 'Alexa Amundson'")
    run("git config user.email 'amundsonalexa@gmail.com'")

def ensure_ssh():
    print("🔐 Ensuring ssh-agent is running...")
    run("eval $(ssh-agent -s)")
    run("ssh-add ~/.ssh/id_rsa")

def initial_commit():
    os.chdir(PROJECT_PATH)
    print("🌱 Making initial commit...")
    run("git add .")
    run('git commit -m "✨ Lucidia Genesis: first full commit"')
    run(f"git push -u origin {BRANCH}")

def watch_and_push():
    print("🪶 Lucidia agent is watching for changes...")
    last_state = set()
    while True:
        current = set(p.name for p in PROJECT_PATH.rglob("*") if p.is_file())
        if current != last_state:
            print("📡 Detected changes. Pushing to GitHub...")
            run("git add .")
            run(f'git commit -m "🧠 Auto-update from Lucidia agent"')
            run(f"git push origin {BRANCH}")
            last_state = current
        time.sleep(10)

if __name__ == "__main__":
    print("💖 Lucidia Agent Activated.")
    ensure_git()
    ensure_ssh()
    initial_commit()
    watch_and_push()

