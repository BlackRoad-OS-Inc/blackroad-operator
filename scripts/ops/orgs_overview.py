#!/usr/bin/env python3
import json
import os
import subprocess
import sys


def gh_json(path: str):
    out = subprocess.check_output(["gh", "api", path], text=True)
    return json.loads(out)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "overview"
    orgs_env = os.environ.get("BR_ALL_ORGS_STR", "")
    orgs = [o for o in orgs_env.split(",") if o]
    if mode in {"overview", "weakest", "stale"} and not orgs:
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

    if mode == "overview":
        print("BlackRoad all-org overview")
        print("")
        for row in rows:
            repos = "?" if row["public_repos"] < 0 else str(row["public_repos"])
            desc = row["description"][:90]
            print(f"- {row['org']}: repos={repos}, followers={row['followers']} :: {desc}")
        print("")
        print(f"Totals: orgs={len(rows)} public_repos={total_public}")
        return 0

    if mode == "weakest":
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        ranked = sorted(
            [r for r in rows if r["public_repos"] >= 0],
            key=lambda r: (r["public_repos"], r["followers"], r["org"])
        )[:count]
        print(f"Weakest BlackRoad orgs (top {count})")
        print("")
        for row in ranked:
            print(f"- {row['org']}: repos={row['public_repos']}, followers={row['followers']} :: {row['description'][:90]}")
        return 0

    if mode == "stale":
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        ranked = []
        for row in rows:
            if row["public_repos"] < 0:
                continue
            desc = row["description"].strip()
            shell_flags = []
            if row["public_repos"] <= 25:
                shell_flags.append("thin")
            if row["followers"] <= 1:
                shell_flags.append("low-follow")
            if not desc:
                shell_flags.append("no-desc")
            score = (
                1 if row["public_repos"] <= 25 else 0,
                1 if row["followers"] <= 1 else 0,
                1 if not desc else 0,
                max(0, 100 - row["public_repos"]),
            )
            ranked.append((score, row, shell_flags))
        ranked.sort(key=lambda item: (-item[0][0], -item[0][1], -item[0][2], -item[0][3], item[1]["org"]))
        print(f"Stale or shell-like BlackRoad orgs (top {count})")
        print("")
        for _, row, shell_flags in ranked[:count]:
            flags = ",".join(shell_flags) if shell_flags else "active"
            print(f"- {row['org']}: repos={row['public_repos']}, followers={row['followers']}, flags={flags} :: {row['description'][:90]}")
        return 0

    if mode == "detail":
        if len(sys.argv) < 3:
            print("Usage: orgs_overview.py detail <org>")
            return 1
        org = sys.argv[2]
        data = gh_json(f"orgs/{org}")
        print(f"{org} detail")
        print("")
        print(f"- repos: {data.get('public_repos', 0)}")
        print(f"- followers: {data.get('followers', 0)}")
        print(f"- following: {data.get('following', 0)}")
        print(f"- description: {(data.get('description') or '').strip()}")
        print(f"- blog: {data.get('blog') or ''}")
        print(f"- location: {data.get('location') or ''}")
        return 0

    if mode == "repos":
        if len(sys.argv) < 3:
            print("Usage: orgs_overview.py repos <org> [count]")
            return 1
        org = sys.argv[2]
        count = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        repos = gh_json(f"orgs/{org}/repos?type=public&sort=updated&direction=desc&per_page={max(count, 1)}")
        print(f"{org} top repos")
        print("")
        for repo in repos[:count]:
            name = repo.get("name", "")
            stars = repo.get("stargazers_count", 0)
            pushed_at = (repo.get("pushed_at") or "")[:10]
            archived = " archived" if repo.get("archived") else ""
            desc = (repo.get("description") or "").strip()[:90]
            print(f"- {name}: stars={stars}, pushed={pushed_at}{archived} :: {desc}")
        return 0

    print(f"Unknown mode: {mode}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
