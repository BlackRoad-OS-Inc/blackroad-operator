"""
LUCIDIA CONFIG
Settings and themes
⬥ BlackRoad OS, Inc.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional


THEMES = {
    "blackroad": {
        "bg": "#0a0a0a",
        "fg": "#ffffff",
        "accent": "#ff8c00",       # Orange
        "accent2": "#ff6b6b",      # Red-orange
        "accent3": "#c678dd",      # Magenta
        "accent4": "#61afef",      # Blue
        "dim": "#666666",
        "border": "#333333",
        "success": "#98c379",
        "warning": "#e5c07b",
        "error": "#e06c75",
    },
    "midnight": {
        "bg": "#0d1117",
        "fg": "#c9d1d9",
        "accent": "#58a6ff",
        "accent2": "#8b949e",
        "accent3": "#d2a8ff",
        "accent4": "#7ee787",
        "dim": "#484f58",
        "border": "#30363d",
        "success": "#3fb950",
        "warning": "#d29922",
        "error": "#f85149",
    },
    "dracula": {
        "bg": "#282a36",
        "fg": "#f8f8f2",
        "accent": "#bd93f9",
        "accent2": "#ff79c6",
        "accent3": "#8be9fd",
        "accent4": "#50fa7b",
        "dim": "#6272a4",
        "border": "#44475a",
        "success": "#50fa7b",
        "warning": "#ffb86c",
        "error": "#ff5555",
    },
    "nord": {
        "bg": "#2e3440",
        "fg": "#eceff4",
        "accent": "#88c0d0",
        "accent2": "#81a1c1",
        "accent3": "#b48ead",
        "accent4": "#a3be8c",
        "dim": "#4c566a",
        "border": "#3b4252",
        "success": "#a3be8c",
        "warning": "#ebcb8b",
        "error": "#bf616a",
    },
    "matrix": {
        "bg": "#000000",
        "fg": "#00ff00",
        "accent": "#00ff00",
        "accent2": "#008800",
        "accent3": "#00ff00",
        "accent4": "#00aa00",
        "dim": "#005500",
        "border": "#003300",
        "success": "#00ff00",
        "warning": "#88ff00",
        "error": "#ff0000",
    },
}


DEFAULT_CONFIG = {
    "theme": "blackroad",
    "shell": {
        "prompt": "$ ",
        "history_size": 1000,
    },
    "web": {
        "user_agent": "Lucidia/0.2 (Terminal Web Engine; BlackRoad OS)",
        "timeout": 10,
        "max_history": 100,
    },
    "agents": {
        "default_model": "llama3.2",
        "timeout": 120,
        "ollama_url": "http://localhost:11434",
    },
    "editor": {
        "tab_size": 4,
        "show_line_numbers": True,
        "auto_save": False,
    },
    "notifications": {
        "enabled": True,
        "default_duration": 5.0,
        "max_visible": 3,
    },
    "ui": {
        "show_status_bar": True,
        "show_clock": True,
        "show_btc": True,
    },
}


class Config:
    """Configuration manager with persistence"""
    
    def __init__(self, path: str = "~/.lucidia/config.json"):
        self.path = Path(path).expanduser()
        self.data: Dict[str, Any] = {}
        self.load()
    
    def load(self):
        """Load config from file"""
        self.data = DEFAULT_CONFIG.copy()
        
        if self.path.exists():
            try:
                with open(self.path) as f:
                    user_config = json.load(f)
                    self._deep_merge(self.data, user_config)
            except:
                pass
    
    def save(self):
        """Save config to file"""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def _deep_merge(self, base: dict, overlay: dict):
        """Deep merge overlay into base"""
        for key, value in overlay.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def get(self, *keys, default=None):
        """Get nested config value"""
        value = self.data
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value
    
    def set(self, *keys_and_value):
        """Set nested config value"""
        *keys, value = keys_and_value
        target = self.data
        for key in keys[:-1]:
            if key not in target:
                target[key] = {}
            target = target[key]
        target[keys[-1]] = value
        self.save()
    
    @property
    def theme(self) -> Dict[str, str]:
        """Get current theme colors"""
        theme_name = self.get("theme", default="blackroad")
        return THEMES.get(theme_name, THEMES["blackroad"])
    
    def set_theme(self, name: str):
        """Set theme by name"""
        if name in THEMES:
            self.set("theme", name)
    
    def list_themes(self) -> list:
        """List available themes"""
        return list(THEMES.keys())
    
    def generate_css(self) -> str:
        """Generate Textual CSS from current theme"""
        t = self.theme
        return f"""
Screen {{ background: {t['bg']}; }}
Header {{ background: {t['border']}; color: {t['accent']}; }}
Footer {{ background: {t['border']}; }}
TabbedContent {{ background: {t['bg']}; }}
TabPane {{ padding: 1; }}
Input {{ background: {t['border']}; border: solid {t['dim']}; color: {t['fg']}; }}
Input:focus {{ border: solid {t['accent']}; }}
RichLog {{ background: {t['bg']}; padding: 1; }}
Static {{ color: {t['fg']}; }}
"""


# Singleton
_config: Optional[Config] = None

def get_config() -> Config:
    global _config
    if _config is None:
        _config = Config()
    return _config


# Test
if __name__ == "__main__":
    cfg = Config()
    print(f"Theme: {cfg.get('theme')}")
    print(f"Colors: {cfg.theme}")
    print(f"Available: {cfg.list_themes()}")
    print(cfg.generate_css())
