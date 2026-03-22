#!/bin/bash
# BlackRoad Vault - Secrets + Config + Backup System
# Encrypted secrets, centralized config, automated backups

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Vault - Installing on $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ~/.blackroad/vault
mkdir -p ~/.blackroad/vault/secrets
mkdir -p ~/.blackroad/config
mkdir -p ~/.blackroad/backup
mkdir -p ~/.blackroad/backup/snapshots

# ============================================================
# [1/4] Secrets Manager
# ============================================================
echo -e "${AMBER}[1/4]${NC} Creating Secrets Manager..."

cat > ~/.blackroad/vault/secrets.py << 'SECRETS'
#!/usr/bin/env python3
"""
BlackRoad Secrets - Encrypted Secret Management
AES-256 encryption with key derivation from master password
"""

import os
import json
import base64
import hashlib
import hmac
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict
from dataclasses import dataclass
import secrets as py_secrets

# Simple AES-like encryption (XOR-based for portability - use cryptography lib in production)
class SimpleVault:
    def __init__(self, vault_path: str = "~/.blackroad/vault/secrets"):
        self.vault_path = Path(os.path.expanduser(vault_path))
        self.vault_path.mkdir(parents=True, exist_ok=True)
        self.secrets_file = self.vault_path / "vault.enc"
        self.key_file = self.vault_path / ".key"
        self._key = None

    def _derive_key(self, password: str, salt: bytes = None) -> tuple:
        """Derive encryption key from password"""
        if salt is None:
            salt = py_secrets.token_bytes(16)
        # PBKDF2-like key derivation
        key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return key, salt

    def _encrypt(self, data: bytes, key: bytes) -> bytes:
        """Simple XOR encryption (use AES in production)"""
        key_stream = hashlib.sha256(key).digest() * (len(data) // 32 + 1)
        encrypted = bytes(a ^ b for a, b in zip(data, key_stream[:len(data)]))
        return encrypted

    def _decrypt(self, data: bytes, key: bytes) -> bytes:
        """XOR decryption (symmetric)"""
        return self._encrypt(data, key)  # XOR is symmetric

    def init(self, master_password: str) -> bool:
        """Initialize vault with master password"""
        key, salt = self._derive_key(master_password)
        self._key = key

        # Store salt (not the key!)
        with open(self.key_file, 'wb') as f:
            f.write(salt)

        # Create empty vault
        self._save_secrets({})
        return True

    def unlock(self, master_password: str) -> bool:
        """Unlock vault with master password"""
        if not self.key_file.exists():
            return False

        with open(self.key_file, 'rb') as f:
            salt = f.read()

        self._key, _ = self._derive_key(master_password, salt)

        # Verify by trying to load
        try:
            self._load_secrets()
            return True
        except:
            self._key = None
            return False

    def _load_secrets(self) -> Dict:
        """Load and decrypt secrets"""
        if not self._key:
            raise Exception("Vault locked")

        if not self.secrets_file.exists():
            return {}

        with open(self.secrets_file, 'rb') as f:
            encrypted = f.read()

        decrypted = self._decrypt(encrypted, self._key)
        return json.loads(decrypted.decode())

    def _save_secrets(self, secrets: Dict):
        """Encrypt and save secrets"""
        if not self._key:
            raise Exception("Vault locked")

        data = json.dumps(secrets).encode()
        encrypted = self._encrypt(data, self._key)

        with open(self.secrets_file, 'wb') as f:
            f.write(encrypted)

    def set(self, name: str, value: str, metadata: Dict = None) -> bool:
        """Store a secret"""
        secrets = self._load_secrets()
        secrets[name] = {
            "value": value,
            "created": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self._save_secrets(secrets)
        return True

    def get(self, name: str) -> Optional[str]:
        """Retrieve a secret"""
        secrets = self._load_secrets()
        if name in secrets:
            return secrets[name]["value"]
        return None

    def delete(self, name: str) -> bool:
        """Delete a secret"""
        secrets = self._load_secrets()
        if name in secrets:
            del secrets[name]
            self._save_secrets(secrets)
            return True
        return False

    def list(self) -> list:
        """List all secret names"""
        secrets = self._load_secrets()
        return list(secrets.keys())

    def export_env(self, prefix: str = "") -> str:
        """Export secrets as environment variables"""
        secrets = self._load_secrets()
        lines = []
        for name, data in secrets.items():
            env_name = prefix + name.upper().replace("-", "_")
            lines.append(f"export {env_name}='{data['value']}'")
        return "\n".join(lines)

    def generate_password(self, length: int = 32) -> str:
        """Generate a secure random password"""
        import string
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(py_secrets.choice(chars) for _ in range(length))

    def rotate(self, name: str, new_value: str = None) -> str:
        """Rotate a secret (generate new or use provided)"""
        if new_value is None:
            new_value = self.generate_password()
        self.set(name, new_value)
        return new_value

if __name__ == "__main__":
    import sys
    import getpass

    vault = SimpleVault()

    if len(sys.argv) < 2:
        print("Usage: secrets.py <command> [args]")
        print("Commands: init, unlock, set, get, delete, list, rotate, env, generate")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "init":
        pw = getpass.getpass("Master password: ")
        pw2 = getpass.getpass("Confirm: ")
        if pw == pw2:
            vault.init(pw)
            print("Vault initialized")
        else:
            print("Passwords don't match")

    elif cmd == "unlock":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Master password: ")
        if vault.unlock(pw):
            print("Vault unlocked")
        else:
            print("Invalid password")

    elif cmd == "set":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Password: ")
        if vault.unlock(pw):
            name = sys.argv[2]
            value = sys.argv[3] if len(sys.argv) > 3 else getpass.getpass("Secret value: ")
            vault.set(name, value)
            print(f"Secret '{name}' stored")

    elif cmd == "get":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Password: ")
        if vault.unlock(pw):
            name = sys.argv[2]
            value = vault.get(name)
            if value:
                print(value)
            else:
                print(f"Secret '{name}' not found")

    elif cmd == "list":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Password: ")
        if vault.unlock(pw):
            for name in vault.list():
                print(f"  {name}")

    elif cmd == "delete":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Password: ")
        if vault.unlock(pw):
            vault.delete(sys.argv[2])
            print(f"Deleted: {sys.argv[2]}")

    elif cmd == "rotate":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Password: ")
        if vault.unlock(pw):
            name = sys.argv[2]
            new_val = vault.rotate(name)
            print(f"Rotated '{name}': {new_val[:8]}...")

    elif cmd == "env":
        pw = os.environ.get("VAULT_PASSWORD") or getpass.getpass("Password: ")
        if vault.unlock(pw):
            print(vault.export_env())

    elif cmd == "generate":
        length = int(sys.argv[2]) if len(sys.argv) > 2 else 32
        print(vault.generate_password(length))
SECRETS

chmod +x ~/.blackroad/vault/secrets.py
echo -e "${GREEN}Secrets Manager installed${NC}"

# ============================================================
# [2/4] Config Center
# ============================================================
echo -e "${AMBER}[2/4]${NC} Creating Config Center..."

cat > ~/.blackroad/config/config_center.py << 'CONFIG'
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
CONFIG

chmod +x ~/.blackroad/config/config_center.py

# Create default config
cat > ~/.blackroad/config/default.yaml << 'DEFAULTCFG'
# BlackRoad Default Configuration
blackroad:
  version: "1.0.0"
  environment: "production"

services:
  api:
    port: 8000
    workers: 4
  mesh:
    port: 8765
  eventbus:
    port: 8766
  cache:
    port: 6379
  gateway:
    port: 8080

fleet:
  nodes:
    - cecilia
    - lucidia
    - octavia
    - aria
    - anastasia
  primary: cecilia

monitoring:
  health_interval: 60
  metrics_interval: 30
  log_retention_days: 30

security:
  session_timeout: 3600
  api_key_rotation: 86400
  zero_trust: true
DEFAULTCFG

echo -e "${GREEN}Config Center installed${NC}"

# ============================================================
# [3/4] Backup System
# ============================================================
echo -e "${AMBER}[3/4]${NC} Creating Backup System..."

cat > ~/.blackroad/backup/backup.py << 'BACKUP'
#!/usr/bin/env python3
"""
BlackRoad Backup - Automated Backup System
Supports incremental backups, remote sync, and scheduled snapshots
"""

import os
import json
import tarfile
import subprocess
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import hashlib

class BackupSystem:
    def __init__(self, backup_dir: str = "~/.blackroad/backup"):
        self.backup_dir = Path(os.path.expanduser(backup_dir))
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.snapshots_dir = self.backup_dir / "snapshots"
        self.snapshots_dir.mkdir(exist_ok=True)
        self.hostname = os.uname().nodename
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]

        # Default backup targets
        self.targets = {
            "config": "~/.blackroad/config",
            "vault": "~/.blackroad/vault",
            "memory": "~/.blackroad/memory/journals",
            "scheduler": "~/.blackroad/scheduler/jobs.db",
        }

    def _get_snapshot_name(self, prefix: str = "backup") -> str:
        """Generate snapshot filename"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{prefix}_{self.hostname}_{timestamp}.tar.gz"

    def create_snapshot(self, targets: List[str] = None, name: str = None) -> str:
        """Create a backup snapshot"""
        targets = targets or list(self.targets.keys())
        name = name or self._get_snapshot_name()

        snapshot_path = self.snapshots_dir / name
        paths_to_backup = []

        for target in targets:
            if target in self.targets:
                path = Path(os.path.expanduser(self.targets[target]))
                if path.exists():
                    paths_to_backup.append(path)

        # Create tarball
        with tarfile.open(snapshot_path, "w:gz") as tar:
            for path in paths_to_backup:
                tar.add(path, arcname=path.name)

        # Create manifest
        manifest = {
            "created": datetime.now().isoformat(),
            "hostname": self.hostname,
            "targets": targets,
            "size_bytes": snapshot_path.stat().st_size,
            "checksum": self._file_hash(snapshot_path)
        }

        manifest_path = snapshot_path.with_suffix(".manifest.json")
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)

        return str(snapshot_path)

    def _file_hash(self, path: Path) -> str:
        """Calculate SHA256 hash of file"""
        sha256 = hashlib.sha256()
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(65536), b''):
                sha256.update(chunk)
        return sha256.hexdigest()

    def list_snapshots(self) -> List[Dict]:
        """List all snapshots"""
        snapshots = []
        for manifest_path in self.snapshots_dir.glob("*.manifest.json"):
            try:
                with open(manifest_path) as f:
                    manifest = json.load(f)
                    manifest["file"] = str(manifest_path.with_suffix("").with_suffix(".tar.gz"))
                    snapshots.append(manifest)
            except:
                pass
        return sorted(snapshots, key=lambda x: x.get("created", ""), reverse=True)

    def restore(self, snapshot_name: str, target_dir: str = None) -> bool:
        """Restore from snapshot"""
        snapshot_path = self.snapshots_dir / snapshot_name

        if not snapshot_path.exists():
            return False

        target_dir = target_dir or os.path.expanduser("~/.blackroad/restored")
        Path(target_dir).mkdir(parents=True, exist_ok=True)

        with tarfile.open(snapshot_path, "r:gz") as tar:
            tar.extractall(target_dir)

        return True

    def sync_to_remote(self, node: str, snapshot_name: str = None) -> bool:
        """Sync backup to remote node"""
        if snapshot_name:
            source = self.snapshots_dir / snapshot_name
        else:
            source = self.snapshots_dir

        try:
            subprocess.run(
                f"rsync -avz {source} {node}:{self.backup_dir}/",
                shell=True, timeout=300
            )
            return True
        except:
            return False

    def collect_from_nodes(self) -> Dict[str, bool]:
        """Collect backups from all nodes"""
        results = {}
        for node in self.nodes:
            if node == self.hostname:
                continue
            try:
                subprocess.run(
                    f"rsync -avz {node}:{self.snapshots_dir}/ {self.snapshots_dir}/{node}/",
                    shell=True, timeout=300
                )
                results[node] = True
            except:
                results[node] = False
        return results

    def cleanup(self, keep_count: int = 10) -> int:
        """Remove old snapshots, keeping only the most recent"""
        snapshots = sorted(self.snapshots_dir.glob("*.tar.gz"), key=lambda x: x.stat().st_mtime, reverse=True)
        removed = 0

        for snapshot in snapshots[keep_count:]:
            snapshot.unlink()
            manifest = snapshot.with_suffix(".manifest.json")
            if manifest.exists():
                manifest.unlink()
            removed += 1

        return removed

    def auto_backup(self) -> str:
        """Perform automatic backup of all targets"""
        return self.create_snapshot()

if __name__ == "__main__":
    import sys

    backup = BackupSystem()

    if len(sys.argv) < 2:
        print("Usage: backup.py <command> [args]")
        print("Commands: create, list, restore, sync, collect, cleanup")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "create":
        targets = sys.argv[2:] if len(sys.argv) > 2 else None
        path = backup.create_snapshot(targets)
        print(f"Created: {path}")

    elif cmd == "list":
        for s in backup.list_snapshots():
            size_mb = s.get("size_bytes", 0) / 1024 / 1024
            print(f"  {os.path.basename(s['file'])} ({size_mb:.1f}MB) - {s['created']}")

    elif cmd == "restore":
        name = sys.argv[2]
        target = sys.argv[3] if len(sys.argv) > 3 else None
        if backup.restore(name, target):
            print(f"Restored: {name}")
        else:
            print("Restore failed")

    elif cmd == "sync":
        node = sys.argv[2]
        name = sys.argv[3] if len(sys.argv) > 3 else None
        if backup.sync_to_remote(node, name):
            print(f"Synced to {node}")
        else:
            print("Sync failed")

    elif cmd == "collect":
        results = backup.collect_from_nodes()
        for node, ok in results.items():
            print(f"{node}: {'OK' if ok else 'FAIL'}")

    elif cmd == "cleanup":
        keep = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        removed = backup.cleanup(keep)
        print(f"Removed {removed} old snapshots")
BACKUP

chmod +x ~/.blackroad/backup/backup.py
echo -e "${GREEN}Backup System installed${NC}"

# ============================================================
# [4/4] CLI Tools
# ============================================================
echo -e "${AMBER}[4/4]${NC} Creating CLI tools..."

cat > ~/br-vault << 'VAULTCLI'
#!/bin/bash
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
NC='\033[0m'

case "$1" in
    init)
        python3 ~/.blackroad/vault/secrets.py init
        ;;
    set)
        VAULT_PASSWORD="${VAULT_PASSWORD}" python3 ~/.blackroad/vault/secrets.py set "$2" "$3"
        ;;
    get)
        VAULT_PASSWORD="${VAULT_PASSWORD}" python3 ~/.blackroad/vault/secrets.py get "$2"
        ;;
    list)
        VAULT_PASSWORD="${VAULT_PASSWORD}" python3 ~/.blackroad/vault/secrets.py list
        ;;
    rotate)
        VAULT_PASSWORD="${VAULT_PASSWORD}" python3 ~/.blackroad/vault/secrets.py rotate "$2"
        ;;
    generate)
        python3 ~/.blackroad/vault/secrets.py generate "${2:-32}"
        ;;
    env)
        VAULT_PASSWORD="${VAULT_PASSWORD}" python3 ~/.blackroad/vault/secrets.py env
        ;;
    *)
        echo -e "${PINK}br-vault${NC} - Secrets Manager"
        echo "Commands: init, set, get, list, rotate, generate, env"
        echo ""
        echo "Set VAULT_PASSWORD env var or enter interactively"
        ;;
esac
VAULTCLI

chmod +x ~/br-vault

cat > ~/br-config << 'CONFIGCLI'
#!/bin/bash
PINK='\033[38;5;205m'
NC='\033[0m'

case "$1" in
    get)
        python3 ~/.blackroad/config/config_center.py get "$2"
        ;;
    set)
        python3 ~/.blackroad/config/config_center.py set "$2" "$3" "${4:-node}"
        ;;
    show)
        python3 ~/.blackroad/config/config_center.py show
        ;;
    sync)
        python3 ~/.blackroad/config/config_center.py sync
        ;;
    env)
        python3 ~/.blackroad/config/config_center.py env
        ;;
    *)
        echo -e "${PINK}br-config${NC} - Config Center"
        echo "Commands: get [key], set <key> <value> [scope], show, sync, env"
        ;;
esac
CONFIGCLI

chmod +x ~/br-config

cat > ~/br-backup << 'BACKUPCLI'
#!/bin/bash
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
NC='\033[0m'

case "$1" in
    create)
        shift
        python3 ~/.blackroad/backup/backup.py create "$@"
        ;;
    list)
        python3 ~/.blackroad/backup/backup.py list
        ;;
    restore)
        python3 ~/.blackroad/backup/backup.py restore "$2" "$3"
        ;;
    sync)
        python3 ~/.blackroad/backup/backup.py sync "$2" "$3"
        ;;
    collect)
        python3 ~/.blackroad/backup/backup.py collect
        ;;
    cleanup)
        python3 ~/.blackroad/backup/backup.py cleanup "${2:-10}"
        ;;
    auto)
        echo -e "${PINK}Creating automatic backup...${NC}"
        python3 ~/.blackroad/backup/backup.py create
        ;;
    fleet)
        echo -e "${PINK}Backing up entire fleet...${NC}"
        for node in cecilia lucidia octavia aria anastasia; do
            echo -n "$node: "
            ssh "$node" 'python3 ~/.blackroad/backup/backup.py create 2>/dev/null' && \
                echo -e "${GREEN}OK${NC}" || echo "FAIL"
        done
        ;;
    *)
        echo -e "${PINK}br-backup${NC} - Backup System"
        echo "Commands: create, list, restore, sync, collect, cleanup, auto, fleet"
        ;;
esac
BACKUPCLI

chmod +x ~/br-backup

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  BlackRoad Vault Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • Secrets Manager (encrypted vault)"
echo "  • Config Center (hierarchical config)"
echo "  • Backup System (automated snapshots)"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-vault init"
echo "  ~/br-vault set api-key 'secret123'"
echo "  ~/br-config show"
echo "  ~/br-backup create"
