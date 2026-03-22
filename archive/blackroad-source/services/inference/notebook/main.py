#!/usr/bin/env python3
"""
BlackRoad Notebook Server - Jupyter notebook server with AI kernels
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


# ─────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────

DB_PATH = Path(os.environ.get("NOTEBOOK_DB", "~/.blackroad/notebooks.db")).expanduser()


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS notebooks (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                path        TEXT NOT NULL UNIQUE,
                kernel      TEXT NOT NULL DEFAULT 'python3',
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL,
                cell_count  INTEGER NOT NULL DEFAULT 0,
                metadata    TEXT NOT NULL DEFAULT '{}'
            );
            CREATE TABLE IF NOT EXISTS executions (
                id           TEXT PRIMARY KEY,
                notebook_id  TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
                cell_index   INTEGER NOT NULL,
                source       TEXT NOT NULL,
                output       TEXT,
                status       TEXT NOT NULL DEFAULT 'pending',
                started_at   TEXT,
                finished_at  TEXT,
                duration_ms  INTEGER
            );
            CREATE TABLE IF NOT EXISTS kernels (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL UNIQUE,
                language    TEXT NOT NULL,
                display_name TEXT NOT NULL,
                argv        TEXT NOT NULL,
                created_at  TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_exec_nb ON executions(notebook_id);
        """)


# ─────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────

@dataclass
class Cell:
    cell_type: str          # 'code' | 'markdown' | 'raw'
    source: str
    outputs: list[dict] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    execution_count: Optional[int] = None

    def to_ipynb(self) -> dict:
        base: dict[str, Any] = {
            "cell_type": self.cell_type,
            "source": self.source.splitlines(keepends=True),
            "metadata": self.metadata,
        }
        if self.cell_type == "code":
            base["outputs"] = self.outputs
            base["execution_count"] = self.execution_count
        return base

    @classmethod
    def from_ipynb(cls, data: dict) -> "Cell":
        src = data.get("source", "")
        if isinstance(src, list):
            src = "".join(src)
        return cls(
            cell_type=data.get("cell_type", "code"),
            source=src,
            outputs=data.get("outputs", []),
            metadata=data.get("metadata", {}),
            execution_count=data.get("execution_count"),
        )


@dataclass
class Notebook:
    id: str
    name: str
    path: str
    kernel: str
    created_at: str
    updated_at: str
    cell_count: int
    metadata: dict
    cells: list[Cell] = field(default_factory=list)

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Notebook":
        return cls(
            id=row["id"],
            name=row["name"],
            path=row["path"],
            kernel=row["kernel"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            cell_count=row["cell_count"],
            metadata=json.loads(row["metadata"]),
        )


@dataclass
class Execution:
    id: str
    notebook_id: str
    cell_index: int
    source: str
    output: Optional[str]
    status: str
    started_at: Optional[str]
    finished_at: Optional[str]
    duration_ms: Optional[int]

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Execution":
        return cls(
            id=row["id"],
            notebook_id=row["notebook_id"],
            cell_index=row["cell_index"],
            source=row["source"],
            output=row["output"],
            status=row["status"],
            started_at=row["started_at"],
            finished_at=row["finished_at"],
            duration_ms=row["duration_ms"],
        )


# ─────────────────────────────────────────────
# Ollama integration
# ─────────────────────────────────────────────

# Mention triggers that route a cell to Ollama instead of the Python kernel.
OLLAMA_MENTIONS = re.compile(
    r"@(?:copilot|lucidia|blackboxprogramming|ollama)\b",
    re.IGNORECASE,
)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")


class OllamaService:
    """Routes AI prompts to a locally-running Ollama instance.

    All @copilot, @lucidia, @blackboxprogramming, and @ollama mentions are
    handled here — no external provider is involved.
    """

    def __init__(self, base_url: str = OLLAMA_URL, model: str = OLLAMA_MODEL) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model

    @staticmethod
    def has_mention(source: str) -> bool:
        """Return True if the source contains an Ollama routing mention."""
        return bool(OLLAMA_MENTIONS.search(source))

    def query(self, prompt: str) -> tuple[str, str]:
        """Send *prompt* to Ollama and return (response_text, status).

        Status is 'success' on HTTP 200, 'error' otherwise.
        The method strips the leading @mention before sending.
        """
        clean_prompt = OLLAMA_MENTIONS.sub("", prompt).strip()
        payload = json.dumps({"model": self.model, "prompt": clean_prompt, "stream": False}).encode()
        req = urllib.request.Request(
            f"{self.base_url}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                body = json.loads(resp.read().decode())
                return body.get("response", ""), "success"
        except urllib.error.HTTPError as exc:
            return f"Ollama HTTP error {exc.code}: {exc.reason}", "error"
        except urllib.error.URLError as exc:
            return f"Ollama connection error: {exc.reason}", "error"
        except Exception as exc:
            return f"Ollama query failed: {exc}", "error"


# ─────────────────────────────────────────────
# JupyterService
# ─────────────────────────────────────────────

class JupyterService:
    """Core service for managing notebooks, kernels, and executions."""

    # ── Kernel management ──────────────────────────────────────────────

    def register_kernel(self, name: str, language: str, display_name: str, argv: list[str]) -> dict:
        """Register a new kernel spec."""
        kid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with get_conn() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO kernels(id, name, language, display_name, argv, created_at) "
                "VALUES (?,?,?,?,?,?)",
                (kid, name, language, display_name, json.dumps(argv), now),
            )
        return {"id": kid, "name": name, "language": language}

    def list_kernels(self) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM kernels ORDER BY name").fetchall()
        return [dict(r) for r in rows]

    # ── Notebook CRUD ──────────────────────────────────────────────────

    def notebook_create(self, name: str, path: str, kernel: str = "python3", cells: Optional[list[dict]] = None) -> Notebook:
        """Create a new notebook and persist it."""
        nid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        resolved = str(Path(path).expanduser().resolve())

        cell_objs: list[Cell] = []
        if cells:
            cell_objs = [Cell(**c) if isinstance(c, dict) else c for c in cells]

        # Write .ipynb file
        nb_path = Path(resolved)
        nb_path.parent.mkdir(parents=True, exist_ok=True)
        nb_path.write_text(json.dumps(self._build_ipynb(cell_objs, kernel), indent=2))

        with get_conn() as conn:
            conn.execute(
                "INSERT INTO notebooks(id, name, path, kernel, created_at, updated_at, cell_count, metadata) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (nid, name, resolved, kernel, now, now, len(cell_objs), "{}"),
            )

        return Notebook(
            id=nid, name=name, path=resolved, kernel=kernel,
            created_at=now, updated_at=now, cell_count=len(cell_objs), metadata={},
        )

    def notebook_load(self, notebook_id: str) -> Notebook:
        """Load notebook from DB and parse cells from .ipynb file."""
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM notebooks WHERE id=?", (notebook_id,)).fetchone()
        if not row:
            raise ValueError(f"Notebook {notebook_id!r} not found")

        nb = Notebook.from_row(row)
        nb_path = Path(nb.path)
        if nb_path.exists():
            data = json.loads(nb_path.read_text())
            nb.cells = [Cell.from_ipynb(c) for c in data.get("cells", [])]
        return nb

    def notebook_execute(self, notebook_id: str, cell_index: Optional[int] = None, timeout: int = 60) -> list[Execution]:
        """Execute one or all cells in a notebook. Returns execution records."""
        nb = self.notebook_load(notebook_id)
        cells_to_run = nb.cells if cell_index is None else [nb.cells[cell_index]]
        indices = list(range(len(nb.cells))) if cell_index is None else [cell_index]

        results: list[Execution] = []
        for idx, cell in zip(indices, cells_to_run):
            if cell.cell_type != "code":
                continue
            exec_id = str(uuid.uuid4())
            started = datetime.utcnow()
            output, status = self._run_cell(cell.source, timeout=timeout)
            finished = datetime.utcnow()
            dur = int((finished - started).total_seconds() * 1000)

            with get_conn() as conn:
                conn.execute(
                    "INSERT INTO executions(id, notebook_id, cell_index, source, output, status, "
                    "started_at, finished_at, duration_ms) VALUES (?,?,?,?,?,?,?,?,?)",
                    (exec_id, notebook_id, idx, cell.source, output, status,
                     started.isoformat(), finished.isoformat(), dur),
                )

            results.append(Execution(
                id=exec_id, notebook_id=notebook_id, cell_index=idx,
                source=cell.source, output=output, status=status,
                started_at=started.isoformat(), finished_at=finished.isoformat(),
                duration_ms=dur,
            ))

        # Bump updated_at
        now = datetime.utcnow().isoformat()
        with get_conn() as conn:
            conn.execute("UPDATE notebooks SET updated_at=? WHERE id=?", (now, notebook_id))

        return results

    def notebook_export(self, notebook_id: str, fmt: str = "ipynb") -> str:
        """Export notebook to a file. Supported: ipynb, html, script."""
        nb = self.notebook_load(notebook_id)
        out_base = Path(nb.path).stem

        if fmt == "ipynb":
            out_path = Path(nb.path)
            data = self._build_ipynb(nb.cells, nb.kernel)
            out_path.write_text(json.dumps(data, indent=2))
            return str(out_path)

        elif fmt == "script":
            out_path = Path(nb.path).parent / f"{out_base}.py"
            lines: list[str] = []
            for i, cell in enumerate(nb.cells):
                if cell.cell_type == "code":
                    lines.append(f"# Cell {i}\n")
                    lines.append(cell.source + "\n\n")
                elif cell.cell_type == "markdown":
                    for line in cell.source.splitlines():
                        lines.append(f"# {line}\n")
                    lines.append("\n")
            out_path.write_text("".join(lines))
            return str(out_path)

        elif fmt == "html":
            out_path = Path(nb.path).parent / f"{out_base}.html"
            html = self._render_html(nb)
            out_path.write_text(html)
            return str(out_path)

        else:
            raise ValueError(f"Unsupported format: {fmt!r}. Choose from: ipynb, script, html")

    def notebook_list(self) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM notebooks ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]

    def notebook_delete(self, notebook_id: str) -> None:
        nb = self.notebook_load(notebook_id)
        nb_path = Path(nb.path)
        if nb_path.exists():
            nb_path.unlink()
        with get_conn() as conn:
            conn.execute("DELETE FROM notebooks WHERE id=?", (notebook_id,))

    def execution_history(self, notebook_id: str, limit: int = 50) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM executions WHERE notebook_id=? ORDER BY started_at DESC LIMIT ?",
                (notebook_id, limit),
            ).fetchall()
        return [dict(r) for r in rows]

    # ── Internal helpers ───────────────────────────────────────────────

    @staticmethod
    def _run_cell(source: str, timeout: int = 60) -> tuple[str, str]:
        """Execute a cell.

        If the source contains an @copilot / @lucidia / @blackboxprogramming /
        @ollama mention the request is routed to the local Ollama instance and
        no external provider is consulted.  Plain code cells are executed in a
        Python subprocess as before.
        """
        if OllamaService.has_mention(source):
            return OllamaService().query(source)
        try:
            result = subprocess.run(
                [sys.executable, "-c", source],
                capture_output=True, text=True, timeout=timeout,
            )
            if result.returncode == 0:
                return result.stdout or "(no output)", "success"
            else:
                return result.stderr or "(error)", "error"
        except subprocess.TimeoutExpired:
            return "Execution timed out", "timeout"
        except Exception as exc:
            return str(exc), "error"

    @staticmethod
    def _build_ipynb(cells: list[Cell], kernel: str) -> dict:
        return {
            "nbformat": 4,
            "nbformat_minor": 5,
            "metadata": {
                "kernelspec": {
                    "display_name": "Python 3",
                    "language": "python",
                    "name": kernel,
                },
                "language_info": {"name": "python", "version": "3.11"},
            },
            "cells": [c.to_ipynb() for c in cells],
        }

    @staticmethod
    def _render_html(nb: Notebook) -> str:
        parts = [
            "<!DOCTYPE html><html><head>",
            f"<title>{nb.name}</title>",
            "<style>body{{font-family:monospace;max-width:900px;margin:auto;padding:2rem}}"
            ".code{{background:#f4f4f4;padding:1rem;border-radius:4px}}"
            ".md{{padding:.5rem 0}}</style></head><body>",
            f"<h1>{nb.name}</h1>",
        ]
        for i, cell in enumerate(nb.cells):
            if cell.cell_type == "code":
                parts.append(f'<div class="code"><pre>[{i}]: {cell.source}</pre></div>')
            elif cell.cell_type == "markdown":
                parts.append(f'<div class="md"><p>{cell.source}</p></div>')
        parts.append("</body></html>")
        return "\n".join(parts)


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def cmd_create(args: argparse.Namespace) -> None:
    svc = JupyterService()
    nb = svc.notebook_create(args.name, args.path, kernel=args.kernel)
    print(json.dumps({"id": nb.id, "name": nb.name, "path": nb.path}, indent=2))


def cmd_list(args: argparse.Namespace) -> None:
    svc = JupyterService()
    items = svc.notebook_list()
    print(json.dumps(items, indent=2))


def cmd_execute(args: argparse.Namespace) -> None:
    svc = JupyterService()
    idx = args.cell if args.cell is not None else None
    results = svc.notebook_execute(args.id, cell_index=idx, timeout=args.timeout)
    for r in results:
        status_icon = "✓" if r.status == "success" else "✗"
        print(f"{status_icon} Cell {r.cell_index} [{r.status}] ({r.duration_ms}ms)")
        if r.output:
            print(f"   {r.output[:200]}")


def cmd_export(args: argparse.Namespace) -> None:
    svc = JupyterService()
    out = svc.notebook_export(args.id, fmt=args.format)
    print(f"Exported to: {out}")


def cmd_history(args: argparse.Namespace) -> None:
    svc = JupyterService()
    hist = svc.execution_history(args.id, limit=args.limit)
    print(json.dumps(hist, indent=2))


def cmd_kernels(args: argparse.Namespace) -> None:
    svc = JupyterService()
    kernels = svc.list_kernels()
    if not kernels:
        print("No kernels registered. Default: python3")
    else:
        print(json.dumps(kernels, indent=2))


def cmd_ollama(args: argparse.Namespace) -> None:
    """Send a prompt directly to Ollama and print the response."""
    svc = OllamaService(
        base_url=args.url or OLLAMA_URL,
        model=args.model or OLLAMA_MODEL,
    )
    response, status = svc.query(args.prompt)
    if status == "success":
        print(response)
    else:
        print(f"Error: {response}", file=sys.stderr)
        sys.exit(1)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="notebook-server",
        description="BlackRoad Notebook Server — Jupyter-compatible notebook management",
    )
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    # create
    p = sub.add_parser("create", help="Create a new notebook")
    p.add_argument("name", help="Notebook display name")
    p.add_argument("path", help="File path (e.g. notebooks/demo.ipynb)")
    p.add_argument("--kernel", default="python3", help="Kernel name [default: python3]")
    p.set_defaults(func=cmd_create)

    # list
    p = sub.add_parser("list", help="List all notebooks")
    p.set_defaults(func=cmd_list)

    # execute
    p = sub.add_parser("execute", help="Execute notebook cells")
    p.add_argument("id", help="Notebook ID")
    p.add_argument("--cell", type=int, default=None, help="Execute single cell by index")
    p.add_argument("--timeout", type=int, default=60, help="Timeout per cell in seconds")
    p.set_defaults(func=cmd_execute)

    # export
    p = sub.add_parser("export", help="Export notebook")
    p.add_argument("id", help="Notebook ID")
    p.add_argument("--format", choices=["ipynb", "html", "script"], default="ipynb")
    p.set_defaults(func=cmd_export)

    # history
    p = sub.add_parser("history", help="Show execution history")
    p.add_argument("id", help="Notebook ID")
    p.add_argument("--limit", type=int, default=50)
    p.set_defaults(func=cmd_history)

    # kernels
    p = sub.add_parser("kernels", help="List registered kernels")
    p.set_defaults(func=cmd_kernels)

    # ollama
    p = sub.add_parser("ollama", help="Send a prompt directly to the local Ollama instance")
    p.add_argument("prompt", help="Prompt text (may include @mention or plain text)")
    p.add_argument("--url", default=None, help=f"Ollama base URL [default: {OLLAMA_URL}]")
    p.add_argument("--model", default=None, help=f"Ollama model name [default: {OLLAMA_MODEL}]")
    p.set_defaults(func=cmd_ollama)

    return parser


def main() -> None:
    init_db()
    parser = build_parser()
    args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        sys.exit(1)
    args.func(args)


if __name__ == "__main__":
    main()
