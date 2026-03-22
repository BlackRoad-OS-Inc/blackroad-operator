"""Calendar - Month grid view"""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Static, Label, Button, DataTable
import calendar
from datetime import datetime, date
import json
import os

EVENTS_FILE = os.path.expanduser("~/.lucidia/events.json")

class CalendarTab(Horizontal):
    """Calendar with month grid + events panel"""
    
    DEFAULT_CSS = """
    CalendarTab {
        height: 100%;
    }
    CalendarTab > .cal-grid {
        width: 2fr;
        border-right: solid gray;
        padding: 1;
    }
    CalendarTab > .cal-grid > .cal-header {
        height: 3;
        text-align: center;
    }
    CalendarTab > .cal-grid > .cal-nav {
        height: 3;
    }
    CalendarTab > .cal-grid > DataTable {
        height: 1fr;
    }
    CalendarTab > .cal-events {
        width: 1fr;
        padding: 1;
    }
    CalendarTab > .cal-events > .events-header {
        height: 3;
        border-bottom: solid gray;
        text-style: bold;
    }
    .today-cell { background: #363; }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.current_date = date.today()
        self.view_year = self.current_date.year
        self.view_month = self.current_date.month
        self.events = self.load_events()
    
    def load_events(self):
        if os.path.exists(EVENTS_FILE):
            try:
                with open(EVENTS_FILE) as f:
                    return json.load(f)
            except:
                pass
        return {}
    
    def save_events(self):
        os.makedirs(os.path.dirname(EVENTS_FILE), exist_ok=True)
        with open(EVENTS_FILE, 'w') as f:
            json.dump(self.events, f, indent=2)
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Static(self.get_month_title(), id="cal-title", classes="cal-header"),
            Horizontal(
                Button("◀ Prev", id="btn-prev-month"),
                Button("Today", id="btn-today"),
                Button("Next ▶", id="btn-next-month"),
                classes="cal-nav"
            ),
            DataTable(id="cal-table"),
            classes="cal-grid"
        )
        yield Vertical(
            Static("📅 EVENTS", classes="events-header"),
            Static("", id="events-list"),
            classes="cal-events"
        )
    
    def get_month_title(self) -> str:
        return f"{calendar.month_name[self.view_month]} {self.view_year}"
    
    def on_mount(self) -> None:
        self.render_calendar()
        self.show_today_events()
    
    def render_calendar(self) -> None:
        table = self.query_one("#cal-table", DataTable)
        table.clear(columns=True)
        
        # Add day headers
        for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
            table.add_column(day, width=4)
        
        # Get calendar weeks
        cal = calendar.Calendar(firstweekday=0)
        weeks = cal.monthdayscalendar(self.view_year, self.view_month)
        
        today = date.today()
        
        for week in weeks:
            row = []
            for day in week:
                if day == 0:
                    row.append("")
                else:
                    # Check if today
                    is_today = (day == today.day and 
                               self.view_month == today.month and 
                               self.view_year == today.year)
                    # Check for events
                    date_key = f"{self.view_year}-{self.view_month:02d}-{day:02d}"
                    has_event = date_key in self.events
                    
                    if is_today:
                        row.append(f"[bold green]{day}[/bold green]")
                    elif has_event:
                        row.append(f"[yellow]{day}●[/yellow]")
                    else:
                        row.append(str(day))
            table.add_row(*row)
        
        # Update title
        self.query_one("#cal-title", Static).update(self.get_month_title())
    
    def show_today_events(self) -> None:
        today_key = date.today().strftime("%Y-%m-%d")
        events_widget = self.query_one("#events-list", Static)
        
        if today_key in self.events:
            events_text = "\n".join([f"• {e}" for e in self.events[today_key]])
            events_widget.update(f"[bold]Today:[/bold]\n{events_text}")
        else:
            events_widget.update("[dim]No events today[/dim]")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-prev-month":
            self.view_month -= 1
            if self.view_month < 1:
                self.view_month = 12
                self.view_year -= 1
            self.render_calendar()
        
        elif event.button.id == "btn-next-month":
            self.view_month += 1
            if self.view_month > 12:
                self.view_month = 1
                self.view_year += 1
            self.render_calendar()
        
        elif event.button.id == "btn-today":
            self.view_year = self.current_date.year
            self.view_month = self.current_date.month
            self.render_calendar()
