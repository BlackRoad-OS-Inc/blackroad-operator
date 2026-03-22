"""Kanban - Three column board"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, Container
from textual.widgets import Static, Label, Button, Input, ListView, ListItem
import json
import os

KANBAN_FILE = os.path.expanduser("~/.lucidia/kanban.json")

class KanbanTab(Container):
    """Kanban board with Todo/Doing/Done columns"""
    
    DEFAULT_CSS = """
    KanbanTab {
        layout: grid;
        grid-size: 3 1;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    KanbanTab > .kanban-column {
        border: solid gray;
        height: 100%;
    }
    KanbanTab > .kanban-column > .column-header {
        height: 3;
        text-align: center;
        text-style: bold;
        border-bottom: solid gray;
        padding: 1;
    }
    KanbanTab > .kanban-column > .column-items {
        height: 1fr;
        padding: 1;
    }
    KanbanTab > .kanban-column > .column-input {
        height: 3;
        border-top: solid gray;
    }
    .todo-header { background: #633; }
    .doing-header { background: #663; }
    .done-header { background: #363; }
    .task-item { padding: 0 1; margin: 0 0 1 0; border: solid #444; }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.data = self.load_data()
    
    def load_data(self):
        if os.path.exists(KANBAN_FILE):
            try:
                with open(KANBAN_FILE) as f:
                    return json.load(f)
            except:
                pass
        return {"todo": [], "doing": [], "done": []}
    
    def save_data(self):
        os.makedirs(os.path.dirname(KANBAN_FILE), exist_ok=True)
        with open(KANBAN_FILE, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def compose(self) -> ComposeResult:
        # Todo column
        yield Vertical(
            Static(f"📋 TODO ({len(self.data['todo'])})", id="todo-header", classes="column-header todo-header"),
            Container(*[Static(f"□ {t}", classes="task-item") for t in self.data["todo"]], id="todo-items", classes="column-items"),
            Input(placeholder="+ Add task...", id="todo-input", classes="column-input"),
            classes="kanban-column", id="col-todo"
        )
        # Doing column
        yield Vertical(
            Static(f"🔄 DOING ({len(self.data['doing'])})", id="doing-header", classes="column-header doing-header"),
            Container(*[Static(f"◐ {t}", classes="task-item") for t in self.data["doing"]], id="doing-items", classes="column-items"),
            Input(placeholder="+ Add task...", id="doing-input", classes="column-input"),
            classes="kanban-column", id="col-doing"
        )
        # Done column
        yield Vertical(
            Static(f"✓ DONE ({len(self.data['done'])})", id="done-header", classes="column-header done-header"),
            Container(*[Static(f"✓ {t}", classes="task-item") for t in self.data["done"]], id="done-items", classes="column-items"),
            Button("Clear Done", id="btn-clear-done", variant="warning"),
            classes="kanban-column", id="col-done"
        )
    
    def on_input_submitted(self, event: Input.Submitted) -> None:
        task = event.value.strip()
        if not task:
            return
        
        event.input.value = ""
        
        if event.input.id == "todo-input":
            self.data["todo"].append(task)
        elif event.input.id == "doing-input":
            self.data["doing"].append(task)
        
        self.save_data()
        self.refresh_board()
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-clear-done":
            self.data["done"] = []
            self.save_data()
            self.refresh_board()
    
    def refresh_board(self) -> None:
        # Update headers
        self.query_one("#todo-header", Static).update(f"📋 TODO ({len(self.data['todo'])})")
        self.query_one("#doing-header", Static).update(f"🔄 DOING ({len(self.data['doing'])})")
        self.query_one("#done-header", Static).update(f"✓ DONE ({len(self.data['done'])})")
        
        # Refresh items
        for col, icon in [("todo", "□"), ("doing", "◐"), ("done", "✓")]:
            container = self.query_one(f"#{col}-items", Container)
            container.remove_children()
            for task in self.data[col]:
                container.mount(Static(f"{icon} {task}", classes="task-item"))
