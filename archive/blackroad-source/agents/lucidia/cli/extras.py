"""
LUCIDIA EXTRAS - Kanban, Notes, Pomodoro, Weather
"""
import json
import urllib.request
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any

DATA_DIR = Path.home() / ".lucidia"
DATA_DIR.mkdir(parents=True, exist_ok=True)


class Kanban:
    """Cute squares project management"""
    COLUMNS = ["backlog", "todo", "doing", "done"]
    
    def __init__(self):
        self.file = DATA_DIR / "kanban.json"
        self.tasks = self._load()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return {col: [] for col in self.COLUMNS}
    
    def _save(self):
        self.file.write_text(json.dumps(self.tasks, indent=2))
    
    def add(self, text: str, column: str = "backlog") -> str:
        if column not in self.COLUMNS:
            column = "backlog"
        task_id = sum(len(self.tasks[c]) for c in self.COLUMNS) + 1
        self.tasks[column].append({"id": task_id, "text": text})
        self._save()
        return f"Added #{task_id} to {column}"
    
    def move(self, task_id: int, to_col: str) -> str:
        if to_col not in self.COLUMNS:
            return f"Invalid column. Use: {', '.join(self.COLUMNS)}"
        for col in self.COLUMNS:
            for task in self.tasks[col]:
                if task["id"] == task_id:
                    self.tasks[col].remove(task)
                    self.tasks[to_col].append(task)
                    self._save()
                    return f"Moved #{task_id} → {to_col}"
        return f"Task #{task_id} not found"
    
    def remove(self, task_id: int) -> str:
        for col in self.COLUMNS:
            for task in self.tasks[col]:
                if task["id"] == task_id:
                    self.tasks[col].remove(task)
                    self._save()
                    return f"Removed #{task_id}"
        return f"Task #{task_id} not found"
    
    def render(self) -> str:
        col_width = 16
        colors = {"backlog": "dim", "todo": "white", "doing": "bold", "done": "italic"}
        
        lines = []
        # Header
        header = ""
        for col in self.COLUMNS:
            c = colors[col]
            header += f"[bold {c}]┌{'─' * (col_width-2)}┐[/] "
        lines.append(header)
        
        header2 = ""
        for col in self.COLUMNS:
            c = colors[col]
            name = col.upper()[:col_width-4].center(col_width-2)
            header2 += f"[bold {c}]│{name}│[/] "
        lines.append(header2)
        
        header3 = ""
        for col in self.COLUMNS:
            c = colors[col]
            header3 += f"[{c}]├{'─' * (col_width-2)}┤[/] "
        lines.append(header3)
        
        # Tasks
        max_tasks = max(len(self.tasks[col]) for col in self.COLUMNS) if any(self.tasks.values()) else 0
        
        for i in range(max(max_tasks, 3)):
            row = ""
            for col in self.COLUMNS:
                c = colors[col]
                if i < len(self.tasks[col]):
                    task = self.tasks[col][i]
                    txt = f"#{task['id']} {task['text']}"
                    if len(txt) > col_width - 4:
                        txt = txt[:col_width - 5] + "…"
                    row += f"[{c}]│[/][bold] {txt.ljust(col_width-4)}[/][{c}]│[/] "
                else:
                    row += f"[dim]│{' ' * (col_width-2)}│[/] "
            lines.append(row)
        
        # Footer
        footer = ""
        for col in self.COLUMNS:
            c = colors[col]
            footer += f"[{c}]└{'─' * (col_width-2)}┘[/] "
        lines.append(footer)
        
        return "\n".join(lines)


class Notes:
    """Quick scratchpad"""
    
    def __init__(self):
        self.file = DATA_DIR / "notes.json"
        self.notes = self._load()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return []
    
    def _save(self):
        self.file.write_text(json.dumps(self.notes, indent=2))
    
    def add(self, text: str) -> str:
        note = {"id": len(self.notes) + 1, "text": text, "time": datetime.now().isoformat()}
        self.notes.append(note)
        self._save()
        return f"Note #{note['id']} saved"
    
    def remove(self, note_id: int) -> str:
        for note in self.notes:
            if note["id"] == note_id:
                self.notes.remove(note)
                self._save()
                return f"Deleted #{note_id}"
        return f"Note #{note_id} not found"
    
    def render(self) -> str:
        if not self.notes:
            return "[dim]No notes yet. Type to add one.[/]"
        lines = ["[bold]📝 NOTES[/]", ""]
        for note in self.notes[-10:]:
            dt = datetime.fromisoformat(note["time"]).strftime("%m/%d %H:%M")
            lines.append(f"[dim]#{note['id']} {dt}[/] {note['text']}")
        return "\n".join(lines)


class Pomodoro:
    """Focus timer"""
    
    def __init__(self):
        self.running = False
        self.end_time = None
        self.mode = "work"
        self.work_mins = 25
        self.break_mins = 5
        self.sessions = 0
    
    def start(self, mins: int = None):
        if mins is None:
            mins = self.work_mins if self.mode == "work" else self.break_mins
        self.end_time = datetime.now() + timedelta(minutes=mins)
        self.running = True
        return f"Started {mins}min {self.mode} timer"
    
    def stop(self):
        self.running = False
        self.end_time = None
        return "Timer stopped"
    
    def tick(self):
        if not self.running or not self.end_time:
            return ("--:--", False)
        
        remaining = self.end_time - datetime.now()
        if remaining.total_seconds() <= 0:
            self.running = False
            if self.mode == "work":
                self.sessions += 1
                self.mode = "break"
            else:
                self.mode = "work"
            return ("00:00", True)
        
        mins = int(remaining.total_seconds() // 60)
        secs = int(remaining.total_seconds() % 60)
        return (f"{mins:02d}:{secs:02d}", False)
    
    def render(self) -> str:
        time_str, _ = self.tick()
        color = "bold" if self.mode == "work" else "dim"
        status = "▶ RUNNING" if self.running else "⏸ PAUSED"
        tomatoes = "🍅 " * self.sessions if self.sessions else ""
        
        return f"""[bold {color}]
╔═══════════════════╗
║      {time_str}         ║
╚═══════════════════╝[/]
[dim]{self.mode.upper()} | {status}[/]
{tomatoes}

[dim]start | stop | work | break[/]"""


class Weather:
    """Weather display"""
    
    def __init__(self):
        self.data = None
        self.location = "Minneapolis"
    
    def fetch(self, location: str = None) -> str:
        loc = location or self.location
        try:
            url = f"https://wttr.in/{loc}?format=%l:+%c+%t+%h+%w"
            with urllib.request.urlopen(url, timeout=5) as r:
                self.data = r.read().decode().strip()
                return self.data
        except Exception as e:
            return f"[dim]Error: {e}[/]"
    
    def render(self) -> str:
        return self.data or "[dim]Type a city name to fetch weather[/]"


class CRM:
    """Salesforce-style sales dashboard"""
    STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]
    
    def __init__(self):
        self.file = DATA_DIR / "crm.json"
        self.deals = self._load()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return []
    
    def _save(self):
        self.file.write_text(json.dumps(self.deals, indent=2))
    
    def add(self, name: str, value: float, stage: str = "lead") -> str:
        if stage not in self.STAGES:
            stage = "lead"
        deal = {
            "id": len(self.deals) + 1,
            "name": name,
            "value": value,
            "stage": stage,
            "created": datetime.now().isoformat(),
            "activity": []
        }
        self.deals.append(deal)
        self._save()
        return f"Added deal #{deal['id']}: {name} (${value:,.0f})"
    
    def move(self, deal_id: int, stage: str) -> str:
        if stage not in self.STAGES:
            return f"Invalid stage. Use: {', '.join(self.STAGES)}"
        for deal in self.deals:
            if deal["id"] == deal_id:
                old = deal["stage"]
                deal["stage"] = stage
                deal["activity"].append({"action": f"{old}→{stage}", "time": datetime.now().isoformat()})
                self._save()
                return f"Moved #{deal_id} → {stage}"
        return f"Deal #{deal_id} not found"
    
    def note(self, deal_id: int, text: str) -> str:
        for deal in self.deals:
            if deal["id"] == deal_id:
                deal["activity"].append({"action": f"Note: {text}", "time": datetime.now().isoformat()})
                self._save()
                return f"Added note to #{deal_id}"
        return f"Deal #{deal_id} not found"
    
    def remove(self, deal_id: int) -> str:
        for deal in self.deals:
            if deal["id"] == deal_id:
                self.deals.remove(deal)
                self._save()
                return f"Removed #{deal_id}"
        return f"Deal #{deal_id} not found"
    
    def metrics(self) -> dict:
        pipeline = sum(d["value"] for d in self.deals if d["stage"] not in ["closed_won", "closed_lost"])
        won = sum(d["value"] for d in self.deals if d["stage"] == "closed_won")
        lost = sum(d["value"] for d in self.deals if d["stage"] == "closed_lost")
        total_closed = len([d for d in self.deals if d["stage"] in ["closed_won", "closed_lost"]])
        win_rate = len([d for d in self.deals if d["stage"] == "closed_won"]) / total_closed * 100 if total_closed else 0
        
        by_stage = {s: [] for s in self.STAGES}
        for d in self.deals:
            by_stage[d["stage"]].append(d)
        
        return {
            "pipeline": pipeline,
            "won": won,
            "lost": lost,
            "win_rate": win_rate,
            "count": len(self.deals),
            "by_stage": by_stage
        }
    
    def render(self) -> str:
        m = self.metrics()
        
        lines = [
            "[bold]╔══════════════════════════════════════════════════════════════╗[/]",
            "[bold]║              ⬥ SALES DASHBOARD ⬥                            ║[/]",
            "[bold]╚══════════════════════════════════════════════════════════════╝[/]",
            "",
            "[bold]┌─────────────┬─────────────┬─────────────┬─────────────┐[/]",
            f"[bold]│[/] PIPELINE    [bold]│[/] WON         [bold]│[/] LOST        [bold]│[/] WIN RATE    [bold]│[/]",
            f"[bold]│[/] [bold]${m['pipeline']:>10,.0f}[/][bold]│[/] [bold]${m['won']:>10,.0f}[/][bold]│[/] [dim]${m['lost']:>10,.0f}[/][bold]│[/] [bold]{m['win_rate']:>10.1f}%[/][bold]│[/]",
            "[bold]└─────────────┴─────────────┴─────────────┴─────────────┘[/]",
            "",
        ]
        
        # Pipeline funnel
        lines.append("[bold]PIPELINE[/]")
        stage_colors = {
            "lead": "dim", "qualified": "white", "proposal": "white",
            "negotiation": "bold", "closed_won": "bold", "closed_lost": "dim"
        }
        stage_names = {
            "lead": "Lead", "qualified": "Qualified", "proposal": "Proposal",
            "negotiation": "Negotiation", "closed_won": "Won ✓", "closed_lost": "Lost ✗"
        }
        
        for stage in self.STAGES:
            deals = m["by_stage"][stage]
            total = sum(d["value"] for d in deals)
            count = len(deals)
            c = stage_colors[stage]
            bar_len = min(int(total / 10000), 30) if total else 0
            bar = "█" * bar_len
            lines.append(f"[{c}]{stage_names[stage]:<12}[/] [{c}]{bar:<30}[/] [bold]{count}[/] [dim](${total:,.0f})[/]")
        
        lines.append("")
        
        # Recent deals
        lines.append("[bold]RECENT DEALS[/]")
        recent = sorted(self.deals, key=lambda x: x["created"], reverse=True)[:5]
        for d in recent:
            c = stage_colors[d["stage"]]
            dt = datetime.fromisoformat(d["created"]).strftime("%m/%d")
            lines.append(f"[dim]#{d['id']}[/] [{c}]●[/] {d['name'][:20]:<20} [bold]${d['value']:>10,.0f}[/] [dim]{dt}[/]")
        
        if not recent:
            lines.append("[dim]No deals yet. Add one![/]")
        
        return "\n".join(lines)
