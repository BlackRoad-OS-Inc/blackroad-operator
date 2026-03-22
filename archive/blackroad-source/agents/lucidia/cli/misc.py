"""Smaller tab components with grids"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, Container, Grid
from textual.widgets import Static, Label, Button, Input, DataTable, RichLog, ListView, ListItem
import json
import os
from datetime import datetime


# ============== WEATHER ==============
class WeatherTab(Container):
    """Weather with current + forecast grid"""
    
    DEFAULT_CSS = """
    WeatherTab {
        layout: grid;
        grid-size: 2 1;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    WeatherTab > .weather-panel {
        border: solid gray;
        padding: 1;
    }
    .temp-display { text-align: center; text-style: bold; }
    """
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("☁ CURRENT", classes="panel-header"),
            Static("--°F", id="current-temp", classes="temp-display"),
            Static("Loading...", id="current-desc"),
            Static("", id="current-details"),
            classes="weather-panel"
        )
        yield Vertical(
            Label("📅 FORECAST", classes="panel-header"),
            Static("", id="forecast"),
            Button("⟳ Refresh", id="btn-refresh-weather"),
            classes="weather-panel"
        )
    
    def on_mount(self) -> None:
        self.fetch_weather()
    
    def fetch_weather(self) -> None:
        # Placeholder - would use wttr.in or similar
        self.query_one("#current-temp", Static).update("[bold]45°F[/bold]")
        self.query_one("#current-desc", Static).update("Partly Cloudy")
        self.query_one("#current-details", Static).update("Humidity: 65%\nWind: 10 mph NW")
        self.query_one("#forecast", Static).update(
            "Thu: 48°/32° ☁\n"
            "Fri: 52°/35° ☀\n"
            "Sat: 45°/30° 🌧"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-refresh-weather":
            self.fetch_weather()


# ============== POMODORO ==============
class PomodoroTab(Container):
    """Pomodoro timer with display + history"""
    
    DEFAULT_CSS = """
    PomodoroTab {
        layout: grid;
        grid-size: 2 1;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    PomodoroTab > .pomo-panel {
        border: solid gray;
        padding: 1;
    }
    .timer-display { text-align: center; text-style: bold; }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.time_left = 25 * 60
        self.running = False
        self.sessions = 0
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("🍅 TIMER", classes="panel-header"),
            Static("25:00", id="timer-display", classes="timer-display"),
            Horizontal(
                Button("▶ Start", id="btn-start", variant="success"),
                Button("⏸ Pause", id="btn-pause"),
                Button("↺ Reset", id="btn-reset"),
            ),
            classes="pomo-panel"
        )
        yield Vertical(
            Label("📊 STATS", classes="panel-header"),
            Static("Sessions: 0", id="pomo-sessions"),
            Static("Focus time: 0 min", id="pomo-focus"),
            classes="pomo-panel"
        )
    
    def on_mount(self) -> None:
        self.timer_interval = self.set_interval(1.0, self.tick, pause=True)
    
    def tick(self) -> None:
        if self.running and self.time_left > 0:
            self.time_left -= 1
            mins, secs = divmod(self.time_left, 60)
            self.query_one("#timer-display", Static).update(f"{mins:02d}:{secs:02d}")
            
            if self.time_left == 0:
                self.running = False
                self.sessions += 1
                self.query_one("#pomo-sessions", Static).update(f"Sessions: {self.sessions}")
                self.query_one("#pomo-focus", Static).update(f"Focus time: {self.sessions * 25} min")
                self.notify("🍅 Pomodoro complete!", title="Timer")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-start":
            self.running = True
            self.timer_interval.resume()
        elif event.button.id == "btn-pause":
            self.running = False
        elif event.button.id == "btn-reset":
            self.running = False
            self.time_left = 25 * 60
            self.query_one("#timer-display", Static).update("25:00")


# ============== SALES ==============
SALES_FILE = os.path.expanduser("~/.lucidia/sales.json")

class SalesTab(Horizontal):
    """Sales pipeline with stages + deal details"""
    
    DEFAULT_CSS = """
    SalesTab {
        height: 100%;
    }
    SalesTab > .sales-pipeline {
        width: 1fr;
        border-right: solid gray;
    }
    SalesTab > .sales-pipeline > DataTable {
        height: 1fr;
    }
    SalesTab > .sales-details {
        width: 1fr;
        padding: 1;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.deals = self.load_deals()
    
    def load_deals(self):
        if os.path.exists(SALES_FILE):
            try:
                with open(SALES_FILE) as f:
                    return json.load(f)
            except:
                pass
        return [
            {"name": "Acme Corp", "stage": "Proposal", "value": 50000},
            {"name": "TechStart", "stage": "Discovery", "value": 25000},
            {"name": "BigCo", "stage": "Negotiation", "value": 100000},
        ]
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("💰 PIPELINE"),
            DataTable(id="deals-table"),
            classes="sales-pipeline"
        )
        yield Vertical(
            Label("📋 DETAILS"),
            Static("Select a deal", id="deal-details"),
            classes="sales-details"
        )
    
    def on_mount(self) -> None:
        table = self.query_one("#deals-table", DataTable)
        table.add_columns("Deal", "Stage", "Value")
        table.cursor_type = "row"
        for deal in self.deals:
            table.add_row(deal["name"], deal["stage"], f"${deal['value']:,}")


# ============== MUSIC ==============
class MusicTab(Container):
    """Music player with stations + controls"""
    
    DEFAULT_CSS = """
    MusicTab {
        layout: grid;
        grid-size: 2 1;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    MusicTab > .music-panel {
        border: solid gray;
        padding: 1;
    }
    """
    
    STATIONS = [
        ("SomaFM Groove Salad", "https://ice1.somafm.com/groovesalad-128-mp3"),
        ("SomaFM DEF CON", "https://ice1.somafm.com/defcon-128-mp3"),
        ("Lofi Hip Hop", "https://streams.ilovemusic.de/iloveradio17.mp3"),
    ]
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("📻 STATIONS", classes="panel-header"),
            ListView(
                *[ListItem(Label(name), id=f"station-{i}") for i, (name, _) in enumerate(self.STATIONS)],
                id="stations-list"
            ),
            classes="music-panel"
        )
        yield Vertical(
            Label("🎵 NOW PLAYING", classes="panel-header"),
            Static("Select a station", id="now-playing"),
            Horizontal(
                Button("▶ Play", id="btn-play", variant="success"),
                Button("⏹ Stop", id="btn-stop"),
            ),
            classes="music-panel"
        )
    
    def on_list_view_selected(self, event: ListView.Selected) -> None:
        if event.item and event.item.id:
            idx = int(event.item.id.replace("station-", ""))
            name, url = self.STATIONS[idx]
            self.query_one("#now-playing", Static).update(f"[bold]{name}[/bold]\n{url[:50]}...")


# ============== RSS ==============
class RSSTab(Horizontal):
    """RSS feed reader with feeds + articles"""
    
    DEFAULT_CSS = """
    RSSTab {
        height: 100%;
    }
    RSSTab > .rss-feeds {
        width: 30;
        border-right: solid gray;
    }
    RSSTab > .rss-articles {
        width: 1fr;
        padding: 1;
    }
    """
    
    FEEDS = [
        ("Hacker News", "https://news.ycombinator.com/rss"),
        ("Anthropic Blog", "https://www.anthropic.com/feed"),
        ("TechCrunch", "https://techcrunch.com/feed/"),
    ]
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("📰 FEEDS"),
            ListView(
                *[ListItem(Label(name), id=f"feed-{i}") for i, (name, _) in enumerate(self.FEEDS)],
                id="feeds-list"
            ),
            classes="rss-feeds"
        )
        yield Vertical(
            Label("📄 ARTICLES"),
            Static("Select a feed to load articles", id="articles-content"),
            classes="rss-articles"
        )


# ============== LINKS ==============
LINKS_FILE = os.path.expanduser("~/.lucidia/links.json")

class LinksTab(Horizontal):
    """Bookmarks with categories + list"""
    
    DEFAULT_CSS = """
    LinksTab {
        height: 100%;
    }
    LinksTab > .links-sidebar {
        width: 25;
        border-right: solid gray;
    }
    LinksTab > .links-main {
        width: 1fr;
        padding: 1;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.links = self.load_links()
    
    def load_links(self):
        if os.path.exists(LINKS_FILE):
            try:
                with open(LINKS_FILE) as f:
                    return json.load(f)
            except:
                pass
        return [
            {"title": "Claude", "url": "https://claude.ai", "tags": ["ai"]},
            {"title": "GitHub", "url": "https://github.com", "tags": ["dev"]},
            {"title": "BlackRoad", "url": "https://blackroad.io", "tags": ["work"]},
        ]
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("🏷 TAGS"),
            ListView(
                ListItem(Label("All"), id="tag-all"),
                ListItem(Label("ai"), id="tag-ai"),
                ListItem(Label("dev"), id="tag-dev"),
                ListItem(Label("work"), id="tag-work"),
                id="tags-list"
            ),
            classes="links-sidebar"
        )
        yield Vertical(
            Label("🔗 BOOKMARKS"),
            DataTable(id="links-table"),
            Input(placeholder="+ Add URL...", id="link-input"),
            classes="links-main"
        )
    
    def on_mount(self) -> None:
        table = self.query_one("#links-table", DataTable)
        table.add_columns("Title", "URL", "Tags")
        for link in self.links:
            table.add_row(link["title"], link["url"][:30], ", ".join(link.get("tags", [])))


# ============== CONTACTS ==============
CONTACTS_FILE = os.path.expanduser("~/.lucidia/contacts.json")

class ContactsTab(Horizontal):
    """Contacts with list + details"""
    
    DEFAULT_CSS = """
    ContactsTab {
        height: 100%;
    }
    ContactsTab > .contacts-list {
        width: 35;
        border-right: solid gray;
    }
    ContactsTab > .contact-detail {
        width: 1fr;
        padding: 1;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.contacts = self.load_contacts()
    
    def load_contacts(self):
        if os.path.exists(CONTACTS_FILE):
            try:
                with open(CONTACTS_FILE) as f:
                    return json.load(f)
            except:
                pass
        return [
            {"name": "Alice", "email": "alice@blackroad.lan", "role": "Gateway"},
            {"name": "Octavia", "email": "octavia@blackroad.lan", "role": "Worker"},
        ]
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("👥 CONTACTS"),
            ListView(
                *[ListItem(Label(c["name"]), id=f"contact-{i}") for i, c in enumerate(self.contacts)],
                id="contacts-list"
            ),
            classes="contacts-list"
        )
        yield Vertical(
            Label("📇 DETAILS"),
            Static("Select a contact", id="contact-details"),
            classes="contact-detail"
        )
    
    def on_list_view_selected(self, event: ListView.Selected) -> None:
        if event.item and event.item.id:
            idx = int(event.item.id.replace("contact-", ""))
            if 0 <= idx < len(self.contacts):
                c = self.contacts[idx]
                self.query_one("#contact-details", Static).update(
                    f"[bold]{c['name']}[/bold]\n"
                    f"Email: {c.get('email', '-')}\n"
                    f"Role: {c.get('role', '-')}"
                )


# ============== SSH ==============
class SSHTab(Horizontal):
    """SSH manager with connections + terminal"""
    
    DEFAULT_CSS = """
    SSHTab {
        height: 100%;
    }
    SSHTab > .ssh-connections {
        width: 30;
        border-right: solid gray;
    }
    SSHTab > .ssh-terminal {
        width: 1fr;
    }
    """
    
    HOSTS = [
        ("alice", "alice@alice.blackroad.lan"),
        ("octavia", "alexa@octavia.blackroad.lan"),
        ("blackroad os", "root@blackroad os-infinity"),
    ]
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("🔐 CONNECTIONS"),
            ListView(
                *[ListItem(Label(f"{name} → {host}"), id=f"ssh-{i}") for i, (name, host) in enumerate(self.HOSTS)],
                id="ssh-list"
            ),
            classes="ssh-connections"
        )
        yield Vertical(
            Label("💻 TERMINAL"),
            RichLog(id="ssh-output", wrap=True, markup=True),
            Input(placeholder="Command...", id="ssh-input"),
            classes="ssh-terminal"
        )


# ============== APPS ==============
class AppsTab(Container):
    """App launcher grid"""
    
    DEFAULT_CSS = """
    AppsTab {
        layout: grid;
        grid-size: 4 3;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    AppsTab > .app-tile {
        border: solid gray;
        padding: 1;
        text-align: center;
    }
    """
    
    APPS = [
        ("🖥", "Terminal"), ("📁", "Files"), ("🌐", "Browser"), ("📝", "Notes"),
        ("📅", "Calendar"), ("💬", "Chat"), ("📊", "Analytics"), ("⚙", "Settings"),
        ("🎮", "Games"), ("🎵", "Music"), ("📰", "News"), ("🔧", "Tools"),
    ]
    
    def compose(self) -> ComposeResult:
        for icon, name in self.APPS:
            yield Button(f"{icon}\n{name}", id=f"app-{name.lower()}", classes="app-tile")


# ============== GAMES ==============
class GamesTab(Container):
    """Games selection grid"""
    
    DEFAULT_CSS = """
    GamesTab {
        layout: grid;
        grid-size: 3 2;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    GamesTab > .game-tile {
        border: solid gray;
        padding: 1;
        text-align: center;
    }
    """
    
    GAMES = [
        ("🐍", "Snake"), ("💣", "Minesweeper"), ("🎯", "2048"),
        ("♟", "Chess"), ("🎲", "Dice"), ("❓", "Trivia"),
    ]
    
    def compose(self) -> ComposeResult:
        for icon, name in self.GAMES:
            yield Button(f"{icon}\n{name}", id=f"game-{name.lower()}", classes="game-tile")
