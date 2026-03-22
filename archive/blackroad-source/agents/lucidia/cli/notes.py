"""Notes - Note list + editor split"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Static, Label, Button, Input, TextArea, ListView, ListItem
import json
import os
from datetime import datetime

NOTES_FILE = os.path.expanduser("~/.lucidia/notes.json")

class NotesTab(Horizontal):
    """Notes with list sidebar + editor"""
    
    DEFAULT_CSS = """
    NotesTab {
        height: 100%;
    }
    NotesTab > .notes-list {
        width: 30;
        border-right: solid gray;
    }
    NotesTab > .notes-list > .list-header {
        height: 3;
        border-bottom: solid gray;
        padding: 1;
    }
    NotesTab > .notes-list > ListView {
        height: 1fr;
    }
    NotesTab > .notes-editor {
        width: 1fr;
    }
    NotesTab > .notes-editor > .editor-header {
        height: 3;
        border-bottom: solid gray;
        padding: 1;
    }
    NotesTab > .notes-editor > TextArea {
        height: 1fr;
    }
    NotesTab > .notes-editor > .editor-actions {
        height: 3;
        border-top: solid gray;
        padding: 0 1;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.notes = self.load_notes()
        self.current_note = None
    
    def load_notes(self):
        if os.path.exists(NOTES_FILE):
            try:
                with open(NOTES_FILE) as f:
                    return json.load(f)
            except:
                pass
        return []
    
    def save_notes(self):
        os.makedirs(os.path.dirname(NOTES_FILE), exist_ok=True)
        with open(NOTES_FILE, 'w') as f:
            json.dump(self.notes, f, indent=2)
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Horizontal(
                Label("📝 NOTES"),
                Button("+ New", id="btn-new-note", variant="success"),
                classes="list-header"
            ),
            ListView(
                *[ListItem(Label(n.get("title", "Untitled")), id=f"note-{i}") for i, n in enumerate(self.notes)],
                id="notes-list"
            ),
            classes="notes-list"
        )
        yield Vertical(
            Horizontal(
                Input(placeholder="Note title...", id="note-title"),
                classes="editor-header"
            ),
            TextArea(id="note-editor"),
            Horizontal(
                Button("💾 Save", id="btn-save-note", variant="primary"),
                Button("🗑 Delete", id="btn-delete-note", variant="error"),
                classes="editor-actions"
            ),
            classes="notes-editor"
        )
    
    def on_list_view_selected(self, event: ListView.Selected) -> None:
        if event.item and event.item.id:
            idx = int(event.item.id.replace("note-", ""))
            if 0 <= idx < len(self.notes):
                note = self.notes[idx]
                self.current_note = idx
                self.query_one("#note-title", Input).value = note.get("title", "")
                self.query_one("#note-editor", TextArea).text = note.get("content", "")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-new-note":
            self.notes.append({
                "title": "New Note",
                "content": "",
                "created": datetime.now().isoformat()
            })
            self.current_note = len(self.notes) - 1
            self.save_notes()
            self.refresh_list()
            self.query_one("#note-title", Input).value = "New Note"
            self.query_one("#note-editor", TextArea).text = ""
        
        elif event.button.id == "btn-save-note" and self.current_note is not None:
            self.notes[self.current_note]["title"] = self.query_one("#note-title", Input).value
            self.notes[self.current_note]["content"] = self.query_one("#note-editor", TextArea).text
            self.notes[self.current_note]["modified"] = datetime.now().isoformat()
            self.save_notes()
            self.refresh_list()
            self.notify("Note saved!", title="Notes")
        
        elif event.button.id == "btn-delete-note" and self.current_note is not None:
            del self.notes[self.current_note]
            self.current_note = None
            self.save_notes()
            self.refresh_list()
            self.query_one("#note-title", Input).value = ""
            self.query_one("#note-editor", TextArea).text = ""
    
    def refresh_list(self) -> None:
        lv = self.query_one("#notes-list", ListView)
        lv.clear()
        for i, n in enumerate(self.notes):
            lv.append(ListItem(Label(n.get("title", "Untitled")), id=f"note-{i}"))
