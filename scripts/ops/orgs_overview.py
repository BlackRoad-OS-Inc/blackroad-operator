#!/usr/bin/env python3
import json
import os
import subprocess
import sys


def gh_json(path: str):
    out = subprocess.check_output(["gh", "api", path], text=True)
    return json.loads(out)


def main():
    orgs_env = os.environ.get("BR_ALL_ORGS_STR", "")
    orgs = [o for o in orgs_env.split(",") if o]
    if not orgs:
        print("No org list configured.")
        return 1

    rows = []
    total_repos = 0
    total_public = 0

    for org in orgs:
        try:
            data = gh_json(f"orgs/{org}")
            public_repos = int(data.get("public_repos", 0) or 0)
            total_public += public_repos
            total_repos += public_repos
            rows.append({
                "org": org,
                "public_repos": public_repos,
                "followers": int(data.get("followers", 0) or 0),
                "description": data.get("description") or "",
            })
        except subprocess.CalledProcessError as exc:
            rows.append({
                "org": org,
                "public_repos": -1,
                "followers": 0,
                "description": f"error: gh api failed ({exc.returncode})",
            })

    print("BlackRoad all-org overview")
    print("")
    for row in rows:
        repos = "?" if row["public_repos"] < 0 else str(row["public_repos"])
        desc = row["description"][:90]
        print(f"- {row['org']}: repos={repos}, followers={row['followers']} :: {desc}")
    print("")
    print(f"Totals: orgs={len(rows)} public_repos={total_public}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
