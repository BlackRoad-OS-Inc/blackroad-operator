#!/usr/bin/env python3
"""
BlackRoad Config Center - Centralized Configuration Management
Hierarchical config with environment overrides and live reload
"""

import os
import json
import yaml
from pathlib import Path
from typing import Any, Dict, Optional
from datetime import datetime
import subprocess

class ConfigCenter:
    def __init__(self, config_dir: str = "~/.blackroad/config"):
        self.config_dir = Path(os.path.expanduser(config_dir))
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.hostname = os.uname().nodename
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]

        # Config hierarchy: default < global < node-specific < environment
        self.configs = {
            "default": self.config_dir / "default.yaml",
            "global": self.config_dir / "global.yaml",
            "node": self.config_dir / f"{self.hostname}.yaml",
        }

    def _load_yaml(self, path: Path) -> Dict:
        """Load YAML file"""
        if path.exists():
            with open(path) as f:
                return yaml.safe_load(f) or {}
        return {}

    def _save_yaml(self, path: Path, data: Dict):
        """Save YAML file"""
        with open(path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)

    def _merge_dicts(self, base: Dict, override: Dict) -> Dict:
        """Deep merge dictionaries"""
        result = base.copy()
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_dicts(result[key], value)
            else:
                result[key] = value
        return result

    def get_config(self) -> Dict:
        """Get merged configuration"""
        config = {}

        # Load in order: default < global < node-specific
        for name, path in self.configs.items():
            layer = self._load_yaml(path)
            config = self._merge_dicts(config, layer)

        # Apply environment overrides (CONFIG_* vars)
        for key, value in os.environ.items():
            if key.startswith("CONFIG_"):
                config_key = key[7:].lower().replace("_", ".")
                self._set_nested(config, config_key, value)

        return config

    def _set_nested(self, d: Dict, key: str, value: Any):
        """Set nested dict value with dot notation"""
        keys = key.split(".")
        for k in keys[:-1]:
            d = d.setdefault(k, {})
        d[keys[-1]] = value

    def _get_nested(self, d: Dict, key: str, default=None):
        """Get nested dict value with dot notation"""
        keys = key.split(".")
        for k in keys:
            if isinstance(d, dict) and k in d:
                d = d[k]
            else:
                return default
        return d

    def get(self, key: str, default=None) -> Any:
        """Get config value by key (dot notation)"""
        config = self.get_config()
        return self._get_nested(config, key, default)

    def set(self, key: str, value: Any, scope: str = "node"):
        """Set config value"""
        path = self.configs.get(scope, self.configs["node"])
        config = self._load_yaml(path)
        self._set_nested(config, key, value)
        self._save_yaml(path, config)

    def delete(self, key: str, scope: str = "node"):
        """Delete config key"""
        path = self.configs.get(scope, self.configs["node"])
        config = self._load_yaml(path)

        keys = key.split(".")
        d = config
        for k in keys[:-1]:
            if k in d:
                d = d[k]
            else:
                return False

        if keys[-1] in d:
            del d[keys[-1]]
            self._save_yaml(path, config)
            return True
        return False

    def sync_to_nodes(self) -> Dict[str, bool]:
        """Sync global config to all nodes"""
        results = {}
        for node in self.nodes:
            try:
                subprocess.run(
                    f"rsync -az {self.configs['global']} {node}:{self.config_dir}/",
                    shell=True, timeout=30
                )
                results[node] = True
            except:
                results[node] = False
        return results

    def export_env(self, prefix: str = "BR_") -> str:
        """Export config as environment variables"""
        def flatten(d, parent_key=''):
            items = []
            for k, v in d.items():
                new_key = f"{parent_key}_{k}" if parent_key else k
                if isinstance(v, dict):
                    items.extend(flatten(v, new_key).items())
                else:
                    items.append((new_key.upper(), str(v)))
            return dict(items)

        config = self.get_config()
        flat = flatten(config)
        lines = [f"export {prefix}{k}='{v}'" for k, v in flat.items()]
        return "\n".join(lines)

    def show(self) -> str:
        """Show current config as YAML"""
        return yaml.dump(self.get_config(), default_flow_style=False)

if __name__ == "__main__":
    import sys

    config = ConfigCenter()

    if len(sys.argv) < 2:
        print("Usage: config_center.py <command> [args]")
        print("Commands: get, set, delete, show, sync, env")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "get":
        key = sys.argv[2] if len(sys.argv) > 2 else None
        if key:
            print(config.get(key))
        else:
            print(config.show())

    elif cmd == "set":
        key = sys.argv[2]
        value = sys.argv[3]
        scope = sys.argv[4] if len(sys.argv) > 4 else "node"
        config.set(key, value, scope)
        print(f"Set {key}={value} (scope: {scope})")

    elif cmd == "delete":
        key = sys.argv[2]
        config.delete(key)
        print(f"Deleted: {key}")

    elif cmd == "show":
        print(config.show())

    elif cmd == "sync":
        results = config.sync_to_nodes()
        for node, ok in results.items():
            print(f"{node}: {'OK' if ok else 'FAIL'}")

    elif cmd == "env":
        print(config.export_env())
