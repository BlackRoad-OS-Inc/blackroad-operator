"""
Media & Fun: Music, RSS, Chat
"""
import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
import subprocess

DATA_DIR = Path.home() / ".lucidia"
DATA_DIR.mkdir(exist_ok=True)


class Music:
    """Simple music player (uses mpv/ffplay)"""
    
    def __init__(self):
        self.file = DATA_DIR / "playlist.json"
        self.playlist = self._load()
        self.current_idx = 0
        self.playing = False
        self.process = None
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return [
            {"name": "Lo-Fi Beats", "url": "https://streams.ilovemusic.de/iloveradio17.mp3"},
            {"name": "Chillhop", "url": "https://streams.fluxfm.de/Chillhop/mp3-320"},
            {"name": "Jazz", "url": "https://streaming.radio.co/s774887f7b/listen"}
        ]
    
    def _save(self):
        self.file.write_text(json.dumps(self.playlist, indent=2))
    
    def add(self, name: str, url: str) -> str:
        self.playlist.append({"name": name, "url": url})
        self._save()
        return f"Added: {name}"
    
    def remove(self, idx: int) -> str:
        if 0 <= idx < len(self.playlist):
            removed = self.playlist.pop(idx)
            self._save()
            return f"Removed: {removed['name']}"
        return "Invalid index"
    
    def play(self, idx: int = None) -> str:
        if idx is not None:
            self.current_idx = idx
        
        if not self.playlist:
            return "Playlist empty"
        
        if self.current_idx >= len(self.playlist):
            self.current_idx = 0
        
        track = self.playlist[self.current_idx]
        
        # Stop current
        self.stop()
        
        # Try mpv, then ffplay
        for player in ["mpv", "ffplay"]:
            try:
                args = [player, "--no-video", "-really-quiet", track["url"]] if player == "mpv" else [player, "-nodisp", "-autoexit", track["url"]]
                self.process = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                self.playing = True
                return f"▶ Playing: {track['name']}"
            except FileNotFoundError:
                continue
        
        return "[dim]No player found (install mpv or ffplay)[/]"
    
    def stop(self) -> str:
        if self.process:
            self.process.terminate()
            self.process = None
        self.playing = False
        return "⏹ Stopped"
    
    def next(self) -> str:
        self.current_idx = (self.current_idx + 1) % len(self.playlist)
        return self.play()
    
    def prev(self) -> str:
        self.current_idx = (self.current_idx - 1) % len(self.playlist)
        return self.play()
    
    def render(self) -> str:
        lines = [
            "[bold]🎵 MUSIC[/]",
            ""
        ]
        
        if self.playing and self.playlist:
            track = self.playlist[self.current_idx]
            lines.append(f"[bold]▶ Now Playing:[/] {track['name']}")
        else:
            lines.append("[dim]⏹ Stopped[/]")
        
        lines.append("")
        lines.append("[bold]Playlist:[/]")
        for i, t in enumerate(self.playlist):
            marker = "▶" if i == self.current_idx and self.playing else " "
            lines.append(f"  {marker} {i}. {t['name']}")
        
        lines.append("")
        lines.append("[dim]play <n> | stop | next | prev | add <n> <url>[/]")
        
        return "\n".join(lines)


class RSS:
    """RSS feed reader"""
    
    def __init__(self):
        self.file = DATA_DIR / "rss.json"
        self.feeds = self._load()
        self.articles = []
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return [
            {"name": "HN", "url": "https://news.ycombinator.com/rss"},
            {"name": "Anthropic", "url": "https://www.anthropic.com/rss.xml"},
            {"name": "TechCrunch", "url": "https://techcrunch.com/feed/"}
        ]
    
    def _save(self):
        self.file.write_text(json.dumps(self.feeds, indent=2))
    
    def add(self, name: str, url: str) -> str:
        self.feeds.append({"name": name, "url": url})
        self._save()
        return f"Added: {name}"
    
    def remove(self, name: str) -> str:
        for f in self.feeds:
            if f["name"].lower() == name.lower():
                self.feeds.remove(f)
                self._save()
                return f"Removed: {name}"
        return "Not found"
    
    def fetch(self, name: str = None) -> str:
        self.articles = []
        feeds_to_fetch = self.feeds if not name else [f for f in self.feeds if f["name"].lower() == name.lower()]
        
        for feed in feeds_to_fetch:
            try:
                req = urllib.request.Request(feed["url"], headers={"User-Agent": "Lucidia-CLI/0.5"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    content = resp.read().decode()
                    root = ET.fromstring(content)
                    
                    # Handle both RSS and Atom
                    items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
                    
                    for item in items[:5]:
                        title = item.findtext("title") or item.findtext("{http://www.w3.org/2005/Atom}title") or ""
                        link = item.findtext("link") or ""
                        if not link:
                            link_elem = item.find("{http://www.w3.org/2005/Atom}link")
                            link = link_elem.get("href", "") if link_elem is not None else ""
                        
                        self.articles.append({
                            "feed": feed["name"],
                            "title": title[:60],
                            "link": link
                        })
            except Exception as e:
                self.articles.append({"feed": feed["name"], "title": f"Error: {e}", "link": ""})
        
        return f"Fetched {len(self.articles)} articles"
    
    def render(self) -> str:
        lines = [
            "[bold]📰 RSS FEEDS[/]",
            ""
        ]
        
        # Feeds list
        lines.append("[bold]Feeds:[/] " + " | ".join(f["name"] for f in self.feeds))
        lines.append("")
        
        # Articles
        if self.articles:
            current_feed = None
            for i, a in enumerate(self.articles[:15]):
                if a["feed"] != current_feed:
                    current_feed = a["feed"]
                    lines.append(f"[bold]{current_feed}[/]")
                lines.append(f"  {i}. {a['title']}")
        else:
            lines.append("[dim]Type 'fetch' to load articles[/]")
        
        lines.append("")
        lines.append("[dim]fetch | fetch <name> | add <n> <url> | open <n>[/]")
        
        return "\n".join(lines)


class Chat:
    """Agent-to-agent chat room"""
    
    def __init__(self):
        self.messages = []
        self.agents = ["lucidia", "alice", "octavia", "cece"]
    
    def post(self, agent: str, message: str):
        self.messages.append({
            "agent": agent,
            "message": message,
            "time": datetime.now().strftime("%H:%M")
        })
        # Keep last 50
        self.messages = self.messages[-50:]
    
    def simulate_response(self, agent: str, prompt: str) -> str:
        """Simple response simulation"""
        responses = {
            "lucidia": ["Processing...", "Understood.", "Analyzing patterns.", "Recursive thought engaged."],
            "alice": ["Gateway ready.", "K3s cluster nominal.", "Routing established.", "Redis cache warm."],
            "octavia": ["Hailo inference online.", "Tensor cores active.", "Worker node responding.", "Queue processed."],
            "cece": ["Coherence verified.", "Memory committed.", "Truth state stable.", "Paraconsistent check passed."]
        }
        import random
        return random.choice(responses.get(agent, ["..."]))
    
    def council(self, topic: str) -> list:
        """All agents discuss a topic"""
        results = []
        for agent in self.agents:
            response = self.simulate_response(agent, topic)
            self.post(agent, response)
            results.append((agent, response))
        return results
    
    def render(self) -> str:
        lines = [
            "[bold]💬 AGENT CHAT[/]",
            "",
            "[dim]Agents: " + " ".join(f"@{a}" for a in self.agents) + "[/]",
            "",
            "[bold]─────────────────────────────────[/]"
        ]
        
        for m in self.messages[-12:]:
            lines.append(f"[dim]{m['time']}[/] [bold]@{m['agent']}[/]: {m['message']}")
        
        if not self.messages:
            lines.append("[dim]No messages yet[/]")
        
        lines.append("[bold]─────────────────────────────────[/]")
        lines.append("")
        lines.append("[dim]@agent msg | council <topic> | clear[/]")
        
        return "\n".join(lines)
