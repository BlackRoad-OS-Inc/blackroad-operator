"""Files - File browser with tree + preview"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Static, DirectoryTree, Label, TextArea
import os

class FilesTab(Horizontal):
    """File manager with tree sidebar + preview"""
    
    DEFAULT_CSS = """
    FilesTab {
        height: 100%;
    }
    FilesTab > .file-tree {
        width: 35;
        border-right: solid gray;
    }
    FilesTab > .file-preview {
        width: 1fr;
    }
    FilesTab > .file-preview > .preview-header {
        height: 3;
        border-bottom: solid gray;
        padding: 1;
    }
    FilesTab > .file-preview > .preview-content {
        height: 1fr;
        padding: 1;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.current_file = None
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("📁 FILES", classes="section-title"),
            DirectoryTree(os.path.expanduser("~"), id="file-tree"),
            classes="file-tree"
        )
        yield Vertical(
            Static("Select a file to preview", id="preview-path", classes="preview-header"),
            Static("", id="preview-content", classes="preview-content"),
            classes="file-preview"
        )
    
    def on_directory_tree_file_selected(self, event: DirectoryTree.FileSelected) -> None:
        path = str(event.path)
        self.current_file = path
        
        header = self.query_one("#preview-path", Static)
        header.update(f"📄 {os.path.basename(path)}")
        
        preview = self.query_one("#preview-content", Static)
        
        # Try to read file
        try:
            size = os.path.getsize(path)
            if size > 50000:
                preview.update(f"[dim]File too large ({size:,} bytes)[/dim]")
                return
            
            with open(path, 'r', errors='replace') as f:
                content = f.read(5000)
                if len(content) >= 5000:
                    content += "\n\n[dim]... (truncated)[/dim]"
                preview.update(content)
        except Exception as e:
            preview.update(f"[red]Cannot preview: {e}[/red]")
