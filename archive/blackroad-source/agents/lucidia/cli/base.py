"""Base component with grid layout support for Lucidia CLI v0.7"""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical, Grid
from textual.widgets import Static, Label, Button, Input, DataTable, TextArea
from textual.widget import Widget

class PanelBox(Static):
    """A styled panel with title"""
    
    DEFAULT_CSS = """
    PanelBox {
        border: solid gray;
        padding: 0 1;
        margin: 0;
    }
    PanelBox > .panel-title {
        dock: top;
        text-style: bold;
        color: white;
        background: gray;
        padding: 0 1;
    }
    PanelBox > .panel-content {
        padding: 1;
    }
    """
    
    def __init__(self, title: str = "", content: str = "", **kwargs):
        super().__init__(**kwargs)
        self.panel_title = title
        self.panel_content = content
    
    def compose(self) -> ComposeResult:
        if self.panel_title:
            yield Label(self.panel_title, classes="panel-title")
        yield Static(self.panel_content, classes="panel-content")


class GridPanel(Container):
    """Base grid panel for tabs"""
    
    DEFAULT_CSS = """
    GridPanel {
        layout: grid;
        grid-size: 2 2;
        grid-gutter: 1;
        padding: 1;
    }
    """


class TwoColumnLayout(Horizontal):
    """Two column layout - sidebar + main"""
    
    DEFAULT_CSS = """
    TwoColumnLayout {
        height: 100%;
    }
    TwoColumnLayout > .sidebar {
        width: 30;
        border-right: solid gray;
    }
    TwoColumnLayout > .main {
        width: 1fr;
    }
    """


class ThreeColumnLayout(Horizontal):
    """Three column layout - Kanban style"""
    
    DEFAULT_CSS = """
    ThreeColumnLayout {
        height: 100%;
    }
    ThreeColumnLayout > .column {
        width: 1fr;
        border: solid gray;
        margin: 0 1;
    }
    """


class TopBottomLayout(Vertical):
    """Top panel + bottom panel"""
    
    DEFAULT_CSS = """
    TopBottomLayout {
        height: 100%;
    }
    TopBottomLayout > .top {
        height: 1fr;
        border-bottom: solid gray;
    }
    TopBottomLayout > .bottom {
        height: auto;
        max-height: 10;
    }
    """


class QuadrantLayout(Container):
    """Four quadrant grid"""
    
    DEFAULT_CSS = """
    QuadrantLayout {
        layout: grid;
        grid-size: 2 2;
        grid-gutter: 1;
        height: 100%;
    }
    QuadrantLayout > .quad {
        border: solid gray;
        padding: 1;
    }
    """
