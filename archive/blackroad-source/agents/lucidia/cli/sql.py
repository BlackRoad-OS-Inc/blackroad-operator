"""SQL - Query interface with input + results"""

from textual.app import ComposeResult
from textual.containers import Vertical, Horizontal
from textual.widgets import Static, Label, Button, TextArea, DataTable, Input
import sqlite3
import os

DB_FILE = os.path.expanduser("~/.lucidia/lucidia.db")

class SQLTab(Vertical):
    """SQL query interface with input + results table"""
    
    DEFAULT_CSS = """
    SQLTab {
        height: 100%;
    }
    SQLTab > .sql-input {
        height: 10;
        border-bottom: solid gray;
    }
    SQLTab > .sql-input > .input-header {
        height: 3;
        padding: 0 1;
    }
    SQLTab > .sql-input > TextArea {
        height: 1fr;
    }
    SQLTab > .sql-results {
        height: 1fr;
    }
    SQLTab > .sql-results > .results-header {
        height: 3;
        border-bottom: solid gray;
        padding: 1;
    }
    SQLTab > .sql-results > DataTable {
        height: 1fr;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ensure_db()
    
    def ensure_db(self):
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        conn = sqlite3.connect(DB_FILE)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY,
                title TEXT,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY,
                title TEXT,
                status TEXT DEFAULT 'todo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Horizontal(
                Label("🗄 SQL Query"),
                Button("▶ Run", id="btn-run-sql", variant="success"),
                Button(".tables", id="btn-show-tables"),
                classes="input-header"
            ),
            TextArea(id="sql-input", language="sql"),
            classes="sql-input"
        )
        yield Vertical(
            Static("Results will appear here", id="results-header", classes="results-header"),
            DataTable(id="sql-results"),
            classes="sql-results"
        )
    
    def on_mount(self) -> None:
        self.query_one("#sql-input", TextArea).text = "SELECT * FROM sqlite_master WHERE type='table';"
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-run-sql":
            self.run_query()
        elif event.button.id == "btn-show-tables":
            self.query_one("#sql-input", TextArea).text = "SELECT name FROM sqlite_master WHERE type='table';"
            self.run_query()
    
    def run_query(self) -> None:
        sql = self.query_one("#sql-input", TextArea).text.strip()
        if not sql:
            return
        
        table = self.query_one("#sql-results", DataTable)
        header = self.query_one("#results-header", Static)
        
        table.clear(columns=True)
        
        try:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.execute(sql)
            
            # Get column names
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                for col in columns:
                    table.add_column(col)
                
                # Fetch rows
                rows = cursor.fetchall()
                for row in rows[:100]:  # Limit to 100 rows
                    table.add_row(*[str(v) for v in row])
                
                header.update(f"[green]✓ {len(rows)} rows returned[/green]")
            else:
                conn.commit()
                header.update(f"[green]✓ Query executed successfully[/green]")
            
            conn.close()
        
        except Exception as e:
            header.update(f"[red]✗ Error: {e}[/red]")
