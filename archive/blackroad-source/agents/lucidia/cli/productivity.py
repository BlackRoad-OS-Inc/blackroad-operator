"""
Productivity components: Calendar, Contacts, Bookmarks
"""
import json
from pathlib import Path
from datetime import datetime, timedelta
import calendar

DATA_DIR = Path.home() / ".lucidia"
DATA_DIR.mkdir(exist_ok=True)


class Calendar:
    """Month view calendar with events"""
    
    def __init__(self):
        self.file = DATA_DIR / "calendar.json"
        self.events = self._load()
        self.current = datetime.now()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return {}
    
    def _save(self):
        self.file.write_text(json.dumps(self.events, indent=2))
    
    def add(self, date_str: str, event: str) -> str:
        if date_str not in self.events:
            self.events[date_str] = []
        self.events[date_str].append(event)
        self._save()
        return f"Added: {event} on {date_str}"
    
    def remove(self, date_str: str, idx: int) -> str:
        if date_str in self.events and 0 <= idx < len(self.events[date_str]):
            removed = self.events[date_str].pop(idx)
            if not self.events[date_str]:
                del self.events[date_str]
            self._save()
            return f"Removed: {removed}"
        return "Event not found"
    
    def nav(self, direction: str):
        if direction == "prev":
            self.current = self.current.replace(day=1) - timedelta(days=1)
        elif direction == "next":
            first = self.current.replace(day=28) + timedelta(days=4)
            self.current = first.replace(day=1)
    
    def render(self) -> str:
        year, month = self.current.year, self.current.month
        cal = calendar.monthcalendar(year, month)
        month_name = calendar.month_name[month]
        
        lines = [
            f"[bold]◀ {month_name} {year} ▶[/]",
            "",
            "[dim]Mo Tu We Th Fr Sa Su[/]"
        ]
        
        today = datetime.now()
        for week in cal:
            row = ""
            for day in week:
                if day == 0:
                    row += "   "
                else:
                    date_str = f"{year}-{month:02d}-{day:02d}"
                    has_event = date_str in self.events
                    is_today = (day == today.day and month == today.month and year == today.year)
                    
                    if is_today:
                        row += f"[bold reverse]{day:2d}[/] "
                    elif has_event:
                        row += f"[bold]{day:2d}[/] "
                    else:
                        row += f"{day:2d} "
            lines.append(row)
        
        # Today's events
        today_str = today.strftime("%Y-%m-%d")
        lines.append("")
        lines.append("[bold]Today:[/]")
        if today_str in self.events:
            for i, ev in enumerate(self.events[today_str]):
                lines.append(f"  {i}. {ev}")
        else:
            lines.append("  [dim]No events[/]")
        
        lines.append("")
        lines.append("[dim]prev/next | add MM-DD event | del MM-DD 0[/]")
        
        return "\n".join(lines)


class Contacts:
    """Address book"""
    
    def __init__(self):
        self.file = DATA_DIR / "contacts.json"
        self.contacts = self._load()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return []
    
    def _save(self):
        self.file.write_text(json.dumps(self.contacts, indent=2))
    
    def add(self, name: str, email: str = "", phone: str = "", company: str = "") -> str:
        contact = {
            "id": len(self.contacts) + 1,
            "name": name,
            "email": email,
            "phone": phone,
            "company": company
        }
        self.contacts.append(contact)
        self._save()
        return f"Added: {name}"
    
    def remove(self, contact_id: int) -> str:
        for c in self.contacts:
            if c["id"] == contact_id:
                self.contacts.remove(c)
                self._save()
                return f"Removed #{contact_id}"
        return "Not found"
    
    def search(self, query: str) -> list:
        q = query.lower()
        return [c for c in self.contacts if q in c["name"].lower() or q in c.get("email", "").lower()]
    
    def render(self) -> str:
        lines = [
            "[bold]📇 CONTACTS[/]",
            "",
            "[bold]┌────┬────────────────────┬────────────────────┬──────────────┐[/]",
            "[bold]│[/] ID [bold]│[/] Name               [bold]│[/] Email              [bold]│[/] Phone        [bold]│[/]",
            "[bold]├────┼────────────────────┼────────────────────┼──────────────┤[/]"
        ]
        
        for c in self.contacts[-10:]:
            name = c["name"][:18]
            email = c.get("email", "")[:18]
            phone = c.get("phone", "")[:12]
            lines.append(f"[bold]│[/] {c['id']:>2} [bold]│[/] {name:<18} [bold]│[/] {email:<18} [bold]│[/] {phone:<12} [bold]│[/]")
        
        if not self.contacts:
            lines.append("[bold]│[/]    [bold]│[/] [dim]No contacts yet[/]   [bold]│[/]                    [bold]│[/]              [bold]│[/]")
        
        lines.append("[bold]└────┴────────────────────┴────────────────────┴──────────────┘[/]")
        lines.append("")
        lines.append("[dim]add Name email phone | del ID | search query[/]")
        
        return "\n".join(lines)


class Bookmarks:
    """Quick links manager"""
    
    def __init__(self):
        self.file = DATA_DIR / "bookmarks.json"
        self.bookmarks = self._load()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return [
            {"id": 1, "name": "BlackRoad", "url": "https://blackroad.io", "tags": ["home"]},
            {"id": 2, "name": "GitHub", "url": "https://github.com/BlackRoad-OS", "tags": ["dev"]},
            {"id": 3, "name": "Claude", "url": "https://claude.ai", "tags": ["ai"]}
        ]
    
    def _save(self):
        self.file.write_text(json.dumps(self.bookmarks, indent=2))
    
    def add(self, name: str, url: str, tags: str = "") -> str:
        bm = {
            "id": len(self.bookmarks) + 1,
            "name": name,
            "url": url if url.startswith("http") else f"https://{url}",
            "tags": [t.strip() for t in tags.split(",")] if tags else []
        }
        self.bookmarks.append(bm)
        self._save()
        return f"Added: {name}"
    
    def remove(self, bm_id: int) -> str:
        for b in self.bookmarks:
            if b["id"] == bm_id:
                self.bookmarks.remove(b)
                self._save()
                return f"Removed #{bm_id}"
        return "Not found"
    
    def render(self) -> str:
        lines = [
            "[bold]🔖 BOOKMARKS[/]",
            ""
        ]
        
        for b in self.bookmarks:
            tags = " ".join(f"[dim]#{t}[/]" for t in b.get("tags", []))
            lines.append(f"[bold]{b['id']:>2}.[/] {b['name']}")
            lines.append(f"    [dim]{b['url']}[/] {tags}")
        
        if not self.bookmarks:
            lines.append("[dim]No bookmarks yet[/]")
        
        lines.append("")
        lines.append("[dim]add Name url tags | del ID | open ID[/]")
        
        return "\n".join(lines)
