"""Manual smoke test for the Claude adapter."""

from __future__ import annotations

from pathlib import Path

import pytest

pytest.skip("Example requires external dependencies; ask codex for help", allow_module_level=True)

import os
from dotenv import load_dotenv

from srv.blackroad.lib.llm.claude_adapter import ClaudeClient, ClaudeConfig


def main() -> None:
    load_dotenv("/srv/blackroad/config/.env")
    cfg = ClaudeConfig()
    client = ClaudeClient(cfg)

    system_path = Path("/srv/blackroad/prompts/codex_claude_system.txt")
    system = system_path.read_text(encoding="utf-8") if system_path.exists() else None

    print(f"Provider={cfg.provider}, Model={cfg.model}")
    resp = client.generate(
        text="Say hello to BlackRoad & Lucidia in one sentence.",
        system=system,
        max_tokens=200,
        temperature=0.2,
    )
    print(resp if isinstance(resp, str) else "".join(resp))


if __name__ == "__main__":  # pragma: no cover - manual smoke test
    main()
