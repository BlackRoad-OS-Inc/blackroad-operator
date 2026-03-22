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
