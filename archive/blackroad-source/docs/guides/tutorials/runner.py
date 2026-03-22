#!/usr/bin/env python3
"""
BlackRoad Education — Tutorial Runner
Runs interactive coding tutorials from markdown files.
"""
import sys
import re
import subprocess
import tempfile
from pathlib import Path

TUTORIAL_DIR = Path(__file__).parent.parent


def list_tutorials() -> list[Path]:
    """List all tutorial markdown files."""
    tutorials = sorted(TUTORIAL_DIR.glob("*.md"))
    return [t for t in tutorials if t.name != "README.md"]


def extract_code_blocks(md_text: str) -> list[tuple[str, str]]:
    """Extract fenced code blocks: returns list of (language, code)."""
    pattern = r"```(\w+)\n(.*?)```"
    return re.findall(pattern, md_text, re.DOTALL)


def run_tutorial(path: Path) -> None:
    """Run all executable code blocks in a tutorial."""
    text = path.read_text()
    blocks = extract_code_blocks(text)
    runnable = [(lang, code) for lang, code in blocks if lang in ("python", "bash", "sh")]

    print(f"\n📚 {path.stem}")
    print("─" * 60)

    if not runnable:
        print("(No executable code blocks in this tutorial)")
        return

    for i, (lang, code) in enumerate(runnable, 1):
        print(f"\n[{i}/{len(runnable)}] {lang.upper()} block:")
        print(f"  {code.strip()[:80]}{... if len(code) > 80 else }")

        run = input("  Run this block? [y/N] ").strip().lower()
        if run != "y":
            continue

        if lang == "python":
            with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
                f.write(code)
                f.flush()
                result = subprocess.run([sys.executable, f.name], capture_output=True, text=True)
        else:
            result = subprocess.run(code, shell=True, capture_output=True, text=True)

        if result.stdout:
            print(f"  📤 {result.stdout.strip()}")
        if result.returncode != 0:
            print(f"  ❌ Error: {result.stderr.strip()}")
        else:
            print(f"  ✅ OK (exit 0)")


def main():
    tutorials = list_tutorials()
    if not tutorials:
        print("No tutorials found.")
        return

    print("🎓 BlackRoad Education — Tutorial Runner")
    print("=" * 60)
    for i, t in enumerate(tutorials, 1):
        print(f"  {i}. {t.stem}")

    choice = input("\nSelect tutorial (number): ").strip()
    try:
        idx = int(choice) - 1
        run_tutorial(tutorials[idx])
    except (ValueError, IndexError):
        print("Invalid selection.")


if __name__ == "__main__":
    main()

