#!/usr/bin/env python3
import os, time, subprocess, json

REPO = os.environ.get("GITHUB_REPOSITORY")  # e.g. blackboxprogramming/blackroad-prism-console
POLL = int(os.environ.get("POLL_SECONDS", "20"))
os.environ["GH_PAGER"] = ""

def gh(*args):
    return subprocess.check_output(["gh"] + list(args), text=True)

def list_open_prs():
    out = gh("pr", "list", "--json", "number,headRefName,baseRefName,mergeStateStatus,isDraft")
    return json.loads(out)

def rebase_behind_main(pr_number):
    # create temp branch off latest main, rebase PR head, push
    pr = json.loads(gh("pr", "view", str(pr_number), "--json", "headRefName"))
    head = pr["headRefName"]
    subprocess.check_call(["git", "fetch", "origin", "main", head])
    subprocess.check_call(["git", "checkout", head])
    subprocess.check_call(["git", "rebase", "origin/main"])
    subprocess.check_call(["git", "push", "--force-with-lease", "origin", head])

def main_loop():
    while True:
        try:
            prs = list_open_prs()
            for pr in prs:
                if pr["isDraft"]:
                    continue
                # If base updated (manual merge landed), rebase everyone else
                # gh shows mergeStateStatus: BEHIND / BLOCKED / CLEAN / DIRTY
                if pr.get("mergeStateStatus", "") in ("BEHIND", "BLOCKED"):
                    rebase_behind_main(pr["number"])
        except Exception as e:
            print("orchestrator error:", e)
        time.sleep(POLL)

if __name__ == "__main__":
    main_loop()
