#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-repo-doctor-report.md}"
touch "$OUT"

section(){ echo -e "\n## $1\n" >> "$OUT"; }
line(){ echo "- $1" >> "$OUT"; }

echo "# Repo Doctor Report" > "$OUT"
echo "_$(date -u '+%Y-%m-%d %H:%M UTC')_" >> "$OUT"

# 1) Tree sanity
section "Tree Sanity"
[ -f apps/quantum/ternary_consciousness_v3.html ] && line "✅ v3 HTML present" || line "❌ v3 HTML missing"
[ -f .github/workflows/deploy-quantum.yml ] && line "✅ Deploy workflow present" || line "❌ Deploy workflow missing"

# 2) HTML validity (tidy if available)
section "HTML Validity"
if command -v tidy >/dev/null 2>&1; then
  tidy -qe apps/quantum/ternary_consciousness_v3.html 2>tidy.log || true
  errs=$(grep -ci "Error:" tidy.log || true)
  line "tidy errors: ${errs:-0} (see artifact tidy.log)"
else
  line "ℹ️ tidy not installed on runner; skipped"
fi

# 3) JS quick syntax
section "JavaScript Syntax"
errs=0
while IFS= read -r f; do
  node -c "$f" >/dev/null 2>&1 || { echo "❌ $f" >> "$OUT"; errs=$((errs+1)); }
done < <(git ls-files '*.js')
done < <(git ls-files -- '*.js')
[ "$errs" = "0" ] && line "✅ no syntax errors detected"

# 4) License headers (sample check)
section "License Headers (sample)"
miss=0
while IFS= read -r f; do
  grep -q "Copyright" "$f" || miss=$((miss+1))
done < <(git ls-files '*.js' '*.yml' '*.yaml' '*.html')
done < <(git ls-files -- '*.js' '*.yml' '*.yaml' '*.html')
line "Files without explicit copyright: ${miss}"

# 5) Big files
section "Large Files (>5MB tracked)"
python3 - "$OUT" <<'PY'
import os
import subprocess
import sys

out_path = sys.argv[1]
threshold = 5 * 1024 * 1024  # 5MB


def iter_paths(stream):
    buffer = bytearray()
    for chunk in iter(lambda: stream.read(65536), b""):
        buffer.extend(chunk)
        start = 0
        while True:
            try:
                end = buffer.index(0, start)
            except ValueError:
                # keep remaining bytes for the next chunk
                if start:
                    del buffer[:start]
                break
            path = buffer[start:end].decode("utf-8", errors="surrogateescape")
            yield path
            start = end + 1
        else:  # pragma: no cover - safety net
            buffer.clear()


found = False
with subprocess.Popen(["git", "ls-files", "-z"], stdout=subprocess.PIPE) as proc:
    with open(out_path, "a", encoding="utf-8") as report:
        for rel_path in iter_paths(proc.stdout):
            if not rel_path:
                continue
            try:
                size = os.path.getsize(rel_path)
            except OSError:
                continue
            if size > threshold:
                size_mb = size / (1024 * 1024)
                report.write(f"- {rel_path} ({size_mb:.1f}MB)\n")
                found = True
        if not found:
            report.write("- ✅ none\n")
    proc.wait()
    if proc.returncode != 0:
        raise subprocess.CalledProcessError(proc.returncode, proc.args)
PY

# 6) Duplicate basenames
section "Duplicate Filenames (basename collisions)"
dups=$(git ls-files | awk -F/ '{print $NF}' | sort | uniq -d)
[ -n "$dups" ] && echo "$dups" | sed 's/^/- /' >> "$OUT" || line "✅ none"

# 7) Orphan workflows (referencing non-existent paths)
section "Orphan Workflows inputs"
for wf in .github/workflows/*.yml; do
  grep -q "apps/quantum/" "$wf" && [ ! -d apps/quantum ] && line "❌ $wf references apps/quantum/ but directory missing"
done

# 8) Badges present
section "README Badges"
if grep -q "BADGES START" apps/quantum/README.md 2>/dev/null; then
  line "✅ README badges block exists"
else
  line "⚠️ README badges not found in apps/quantum/README.md"
fi

# 9) Summary
section "Next Steps"
line "Review errors above. See artifacts for logs."
