#!/usr/bin/env python3
"""Lucidia CLI - Terminal OS for BlackRoad"""

import click
import sqlite3
from pathlib import Path

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.widgets import Header, Footer, TabbedContent, TabPane

from components.shell import ShellTab
from components.web import WebTab
from components.files import FilesTab
from components.agents import AgentsTab
from components.apps_tab import AppsTab

# ─── Database ────────────────────────────────────────────────────────────────

DB_PATH = Path.home() / ".blackroad" / "index" / "blackroad.db"


def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            url TEXT,
            description TEXT,
            metadata TEXT,
            indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_type ON resources(type)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_name ON resources(name)')
    conn.commit()
    conn.close()


# ─── TUI App ──────────────────────────────────────────────────────────────────

class LucidiaApp(App):
    """Lucidia Terminal OS — multi-tab TUI"""

    TITLE = "Lucidia"
    SUB_TITLE = "Terminal OS · BlackRoad OS, Inc."

    CSS = """
    TabbedContent {
        height: 1fr;
    }
    TabPane {
        padding: 0;
    }
    """

    BINDINGS = [
        Binding("ctrl+1", "switch_tab('shell')", "Shell", show=True),
        Binding("ctrl+2", "switch_tab('web')", "Web", show=True),
        Binding("ctrl+3", "switch_tab('files')", "Files", show=True),
        Binding("ctrl+4", "switch_tab('agents')", "Agents", show=True),
        Binding("ctrl+5", "switch_tab('apps')", "Apps", show=True),
        Binding("ctrl+q", "quit", "Quit", show=True),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        with TabbedContent(id="tabs"):
            with TabPane("Shell [1]", id="shell"):
                yield ShellTab()
            with TabPane("Web [2]", id="web"):
                yield WebTab()
            with TabPane("Files [3]", id="files"):
                yield FilesTab()
            with TabPane("Agents [4]", id="agents"):
                yield AgentsTab()
            with TabPane("Apps [5]", id="apps"):
                yield AppsTab()
        yield Footer()

    def action_switch_tab(self, tab_id: str) -> None:
        self.query_one(TabbedContent).active = tab_id


# ─── CLI Commands ─────────────────────────────────────────────────────────────

@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx):
    """Lucidia CLI - Terminal OS for BlackRoad"""
    init_db()
    if ctx.invoked_subcommand is None:
        LucidiaApp().run()


@cli.command()
def chat():
    """Agent chat interface"""
    click.echo("💬 Lucidia chat coming soon...")


@cli.group()
def index():
    """Index BlackRoad ecosystem"""
    pass


@index.command('status')
def index_status():
    """Show index stats"""
    conn = get_db()
    counts = conn.execute('''
        SELECT type, COUNT(*) as count
        FROM resources
        GROUP BY type
    ''').fetchall()
    conn.close()

    if not counts:
        click.echo("Index empty. Run 'lucidia index github' to start.")
        return

    click.echo("📊 Index Status:")
    for row in counts:
        click.echo(f"  {row['type']}: {row['count']}")


@index.command('search')
@click.argument('query')
def index_search(query):
    """Search indexed resources"""
    conn = get_db()
    results = conn.execute('''
        SELECT type, name, url, description
        FROM resources
        WHERE name LIKE ? OR description LIKE ?
        LIMIT 20
    ''', (f'%{query}%', f'%{query}%')).fetchall()
    conn.close()

    if not results:
        click.echo("No results found.")
        return

    for row in results:
        click.echo(f"[{row['type']}] {row['name']}")
        if row['description']:
            click.echo(f"  {row['description'][:60]}")
        click.echo(f"  {row['url']}")


def main():
    cli()


if __name__ == '__main__':
    main()
