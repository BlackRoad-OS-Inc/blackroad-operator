#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# blackroad-auth.sh - Identity & Access Management (IAM)
# Port 9000: Auth API | Port 9001: Admin API
# ============================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${AMBER}   BLACKROAD IDENTITY & ACCESS MANAGEMENT${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

AUTH_DIR="$HOME/.blackroad/auth"
mkdir -p "$AUTH_DIR"/{keys,sessions,logs}

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ AUTH SERVER - JWT, API Keys, RBAC                                          ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "\n${GREEN}[1/2] Creating Auth Server...${NC}"

cat > "$AUTH_DIR/auth_server.py" << 'AUTH_EOF'
#!/usr/bin/env python3
"""
BlackRoad Identity & Access Management
Features: JWT tokens, API keys, RBAC, OAuth2-like flows, session management
"""

import asyncio
import json
import sqlite3
import time
import logging
import hashlib
import hmac
import base64
import secrets
import os
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Set, Any
from pathlib import Path
from enum import Enum

logging.basicConfig(level=logging.INFO, format='%(asctime)s - AUTH - %(message)s')
logger = logging.getLogger(__name__)

AUTH_DIR = Path.home() / '.blackroad' / 'auth'
DB_FILE = AUTH_DIR / 'auth.db'

# JWT-like token settings
TOKEN_EXPIRY = 3600  # 1 hour
REFRESH_EXPIRY = 86400 * 7  # 7 days
SECRET_KEY = secrets.token_hex(32)

class Role(Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    DEVELOPER = "developer"
    SERVICE = "service"
    READONLY = "readonly"

# Default permissions per role
ROLE_PERMISSIONS = {
    Role.ADMIN: {"*"},  # All permissions
    Role.OPERATOR: {"read:*", "write:*", "deploy:*", "manage:services"},
    Role.DEVELOPER: {"read:*", "write:code", "deploy:staging"},
    Role.SERVICE: {"read:config", "write:logs", "call:api"},
    Role.READONLY: {"read:*"}
}

@dataclass
class User:
    id: str
    username: str
    password_hash: str
    email: str = ""
    roles: List[str] = field(default_factory=list)
    permissions: Set[str] = field(default_factory=set)
    api_keys: List[str] = field(default_factory=list)
    created_at: float = 0
    last_login: float = 0
    enabled: bool = True
    mfa_enabled: bool = False
    mfa_secret: str = ""

@dataclass
class APIKey:
    key_id: str
    key_hash: str
    user_id: str
    name: str
    permissions: Set[str] = field(default_factory=set)
    created_at: float = 0
    expires_at: float = 0  # 0 = never
    last_used: float = 0
    enabled: bool = True

@dataclass
class Session:
    session_id: str
    user_id: str
    token: str
    refresh_token: str
    created_at: float
    expires_at: float
    ip_address: str = ""
    user_agent: str = ""

class AuthServer:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.api_keys: Dict[str, APIKey] = {}
        self.sessions: Dict[str, Session] = {}
        self.token_blacklist: Set[str] = set()
        self.stats = {
            'logins': 0,
            'api_calls': 0,
            'failed_auth': 0
        }
        self._init_db()
        self._load_data()
        self._create_default_admin()

    def _init_db(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            password_hash TEXT,
            email TEXT,
            roles TEXT,
            permissions TEXT,
            created_at REAL,
            last_login REAL,
            enabled INTEGER DEFAULT 1,
            mfa_enabled INTEGER DEFAULT 0,
            mfa_secret TEXT DEFAULT ''
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS api_keys (
            key_id TEXT PRIMARY KEY,
            key_hash TEXT,
            user_id TEXT,
            name TEXT,
            permissions TEXT,
            created_at REAL,
            expires_at REAL,
            last_used REAL,
            enabled INTEGER DEFAULT 1
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT,
            token TEXT,
            refresh_token TEXT,
            created_at REAL,
            expires_at REAL,
            ip_address TEXT,
            user_agent TEXT
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            user_id TEXT,
            action TEXT,
            resource TEXT,
            ip_address TEXT,
            success INTEGER
        )''')
        conn.commit()
        conn.close()

    def _load_data(self):
        """Load data from database"""
        conn = sqlite3.connect(str(DB_FILE))

        # Load users
        for row in conn.execute('SELECT * FROM users'):
            user = User(
                id=row[0],
                username=row[1],
                password_hash=row[2],
                email=row[3],
                roles=json.loads(row[4]) if row[4] else [],
                permissions=set(json.loads(row[5])) if row[5] else set(),
                created_at=row[6],
                last_login=row[7],
                enabled=bool(row[8]),
                mfa_enabled=bool(row[9]),
                mfa_secret=row[10] or ""
            )
            self.users[user.id] = user

        # Load API keys
        for row in conn.execute('SELECT * FROM api_keys'):
            key = APIKey(
                key_id=row[0],
                key_hash=row[1],
                user_id=row[2],
                name=row[3],
                permissions=set(json.loads(row[4])) if row[4] else set(),
                created_at=row[5],
                expires_at=row[6],
                last_used=row[7],
                enabled=bool(row[8])
            )
            self.api_keys[key.key_id] = key

        conn.close()
        logger.info(f"Loaded {len(self.users)} users, {len(self.api_keys)} API keys")

    def _save_user(self, user: User):
        """Save user to database"""
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('''INSERT OR REPLACE INTO users VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
            (user.id, user.username, user.password_hash, user.email,
             json.dumps(user.roles), json.dumps(list(user.permissions)),
             user.created_at, user.last_login, int(user.enabled),
             int(user.mfa_enabled), user.mfa_secret))
        conn.commit()
        conn.close()

    def _save_api_key(self, key: APIKey):
        """Save API key to database"""
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('''INSERT OR REPLACE INTO api_keys VALUES (?,?,?,?,?,?,?,?,?)''',
            (key.key_id, key.key_hash, key.user_id, key.name,
             json.dumps(list(key.permissions)), key.created_at,
             key.expires_at, key.last_used, int(key.enabled)))
        conn.commit()
        conn.close()

    def _audit_log(self, user_id: str, action: str, resource: str, ip: str, success: bool):
        """Log audit event"""
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('INSERT INTO audit_log (timestamp, user_id, action, resource, ip_address, success) VALUES (?,?,?,?,?,?)',
            (time.time(), user_id, action, resource, ip, int(success)))
        conn.commit()
        conn.close()

    def _create_default_admin(self):
        """Create default admin user if none exists"""
        admin_exists = any(u.username == 'admin' for u in self.users.values())
        if not admin_exists:
            self.create_user('admin', 'blackroad', 'admin@blackroad.io', [Role.ADMIN.value])
            logger.info("Created default admin user (admin/blackroad)")

    def _hash_password(self, password: str, salt: str = None) -> tuple:
        """Hash password with PBKDF2"""
        if salt is None:
            salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}${base64.b64encode(key).decode()}", salt

    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, hash_b64 = stored_hash.split('$')
            new_hash, _ = self._hash_password(password, salt)
            return hmac.compare_digest(new_hash, stored_hash)
        except:
            return False

    def _generate_token(self, user_id: str, expiry: int = TOKEN_EXPIRY) -> str:
        """Generate JWT-like token"""
        header = base64.urlsafe_b64encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode()).decode()
        payload = {
            'sub': user_id,
            'iat': int(time.time()),
            'exp': int(time.time() + expiry),
            'jti': secrets.token_hex(8)
        }
        payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
        signature = hmac.new(SECRET_KEY.encode(), f"{header}.{payload_b64}".encode(), 'sha256')
        sig_b64 = base64.urlsafe_b64encode(signature.digest()).decode()
        return f"{header}.{payload_b64}.{sig_b64}"

    def _verify_token(self, token: str) -> Optional[dict]:
        """Verify and decode token"""
        if token in self.token_blacklist:
            return None

        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None

            header_b64, payload_b64, sig_b64 = parts

            # Verify signature
            expected_sig = hmac.new(SECRET_KEY.encode(), f"{header_b64}.{payload_b64}".encode(), 'sha256')
            if not hmac.compare_digest(base64.urlsafe_b64encode(expected_sig.digest()).decode(), sig_b64):
                return None

            # Decode payload
            payload = json.loads(base64.urlsafe_b64decode(payload_b64 + '=='))

            # Check expiry
            if payload.get('exp', 0) < time.time():
                return None

            return payload
        except:
            return None

    def create_user(self, username: str, password: str, email: str = "",
                    roles: List[str] = None) -> Optional[User]:
        """Create new user"""
        if any(u.username == username for u in self.users.values()):
            return None

        user = User(
            id=secrets.token_hex(8),
            username=username,
            password_hash=self._hash_password(password)[0],
            email=email,
            roles=roles or [Role.DEVELOPER.value],
            permissions=set(),
            created_at=time.time()
        )

        # Add role permissions
        for role_name in user.roles:
            try:
                role = Role(role_name)
                user.permissions.update(ROLE_PERMISSIONS.get(role, set()))
            except:
                pass

        self.users[user.id] = user
        self._save_user(user)
        logger.info(f"Created user: {username}")
        return user

    def authenticate(self, username: str, password: str, ip: str = "") -> Optional[dict]:
        """Authenticate user and return tokens"""
        user = next((u for u in self.users.values() if u.username == username), None)

        if not user or not user.enabled:
            self.stats['failed_auth'] += 1
            self._audit_log("", "login_failed", username, ip, False)
            return None

        if not self._verify_password(password, user.password_hash):
            self.stats['failed_auth'] += 1
            self._audit_log(user.id, "login_failed", "password", ip, False)
            return None

        # Generate tokens
        access_token = self._generate_token(user.id, TOKEN_EXPIRY)
        refresh_token = self._generate_token(user.id, REFRESH_EXPIRY)

        # Create session
        session = Session(
            session_id=secrets.token_hex(16),
            user_id=user.id,
            token=access_token,
            refresh_token=refresh_token,
            created_at=time.time(),
            expires_at=time.time() + REFRESH_EXPIRY,
            ip_address=ip
        )
        self.sessions[session.session_id] = session

        # Update user
        user.last_login = time.time()
        self._save_user(user)

        self.stats['logins'] += 1
        self._audit_log(user.id, "login", "success", ip, True)

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': TOKEN_EXPIRY,
            'user': {
                'id': user.id,
                'username': user.username,
                'roles': user.roles
            }
        }

    def refresh_token(self, refresh_token: str) -> Optional[dict]:
        """Refresh access token"""
        payload = self._verify_token(refresh_token)
        if not payload:
            return None

        user_id = payload.get('sub')
        if user_id not in self.users:
            return None

        # Generate new access token
        access_token = self._generate_token(user_id, TOKEN_EXPIRY)

        return {
            'access_token': access_token,
            'token_type': 'Bearer',
            'expires_in': TOKEN_EXPIRY
        }

    def validate_token(self, token: str) -> Optional[User]:
        """Validate token and return user"""
        payload = self._verify_token(token)
        if not payload:
            return None

        user_id = payload.get('sub')
        return self.users.get(user_id)

    def logout(self, token: str):
        """Invalidate token"""
        self.token_blacklist.add(token)
        # Remove from sessions
        for sid, session in list(self.sessions.items()):
            if session.token == token:
                del self.sessions[sid]
                break

    def create_api_key(self, user_id: str, name: str, permissions: Set[str] = None,
                       expires_days: int = 0) -> Optional[tuple]:
        """Create API key for user"""
        if user_id not in self.users:
            return None

        # Generate key
        raw_key = f"br_{secrets.token_hex(24)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        key = APIKey(
            key_id=secrets.token_hex(8),
            key_hash=key_hash,
            user_id=user_id,
            name=name,
            permissions=permissions or set(),
            created_at=time.time(),
            expires_at=time.time() + (expires_days * 86400) if expires_days else 0
        )

        self.api_keys[key.key_id] = key
        self._save_api_key(key)

        # Add to user
        self.users[user_id].api_keys.append(key.key_id)

        logger.info(f"Created API key '{name}' for user {user_id}")
        return raw_key, key.key_id

    def validate_api_key(self, raw_key: str) -> Optional[tuple]:
        """Validate API key and return (user, permissions)"""
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        for key in self.api_keys.values():
            if key.key_hash == key_hash:
                if not key.enabled:
                    return None
                if key.expires_at and key.expires_at < time.time():
                    return None

                # Update last used
                key.last_used = time.time()

                user = self.users.get(key.user_id)
                if not user or not user.enabled:
                    return None

                self.stats['api_calls'] += 1
                return user, key.permissions or user.permissions

        return None

    def check_permission(self, user: User, permission: str) -> bool:
        """Check if user has permission"""
        if "*" in user.permissions:
            return True

        # Check exact match
        if permission in user.permissions:
            return True

        # Check wildcard (e.g., "read:*" matches "read:users")
        parts = permission.split(':')
        if len(parts) == 2:
            wildcard = f"{parts[0]}:*"
            if wildcard in user.permissions:
                return True

        return False

    def get_stats(self) -> dict:
        """Get auth statistics"""
        return {
            **self.stats,
            'users': len(self.users),
            'api_keys': len(self.api_keys),
            'active_sessions': len(self.sessions)
        }

    async def handle_request(self, reader, writer):
        """Handle HTTP API request"""
        data = await reader.read(8192)
        request = data.decode()

        lines = request.split('\r\n')
        first_line = lines[0].split(' ')
        method = first_line[0]
        path = first_line[1] if len(first_line) > 1 else '/'

        # Parse headers
        headers = {}
        for line in lines[1:]:
            if ': ' in line:
                key, value = line.split(': ', 1)
                headers[key.lower()] = value
            elif line == '':
                break

        # Parse body
        body = {}
        if '\r\n\r\n' in request:
            body_str = request.split('\r\n\r\n', 1)[1]
            if body_str:
                try:
                    body = json.loads(body_str)
                except:
                    pass

        # Get client IP
        addr = writer.get_extra_info('peername')
        client_ip = addr[0] if addr else ''

        # Route request
        response_body = ''
        status = '200 OK'

        try:
            if path == '/auth/login' and method == 'POST':
                result = self.authenticate(
                    body.get('username', ''),
                    body.get('password', ''),
                    client_ip
                )
                if result:
                    response_body = json.dumps(result)
                else:
                    status = '401 Unauthorized'
                    response_body = '{"error": "Invalid credentials"}'

            elif path == '/auth/refresh' and method == 'POST':
                result = self.refresh_token(body.get('refresh_token', ''))
                if result:
                    response_body = json.dumps(result)
                else:
                    status = '401 Unauthorized'
                    response_body = '{"error": "Invalid refresh token"}'

            elif path == '/auth/logout' and method == 'POST':
                token = headers.get('authorization', '').replace('Bearer ', '')
                self.logout(token)
                response_body = '{"status": "ok"}'

            elif path == '/auth/validate' and method == 'GET':
                token = headers.get('authorization', '').replace('Bearer ', '')
                user = self.validate_token(token)
                if user:
                    response_body = json.dumps({
                        'valid': True,
                        'user': {'id': user.id, 'username': user.username, 'roles': user.roles}
                    })
                else:
                    status = '401 Unauthorized'
                    response_body = '{"valid": false}'

            elif path == '/auth/apikey' and method == 'POST':
                # Requires auth
                token = headers.get('authorization', '').replace('Bearer ', '')
                user = self.validate_token(token)
                if not user:
                    status = '401 Unauthorized'
                    response_body = '{"error": "Unauthorized"}'
                else:
                    result = self.create_api_key(
                        user.id,
                        body.get('name', 'unnamed'),
                        set(body.get('permissions', [])),
                        body.get('expires_days', 0)
                    )
                    if result:
                        response_body = json.dumps({'key': result[0], 'key_id': result[1]})
                    else:
                        status = '400 Bad Request'
                        response_body = '{"error": "Failed to create key"}'

            elif path == '/auth/apikey/validate' and method == 'GET':
                api_key = headers.get('x-api-key', '')
                result = self.validate_api_key(api_key)
                if result:
                    user, perms = result
                    response_body = json.dumps({
                        'valid': True,
                        'user': user.username,
                        'permissions': list(perms)
                    })
                else:
                    status = '401 Unauthorized'
                    response_body = '{"valid": false}'

            elif path == '/users' and method == 'GET':
                # Admin only
                token = headers.get('authorization', '').replace('Bearer ', '')
                user = self.validate_token(token)
                if user and self.check_permission(user, 'read:users'):
                    users = [{'id': u.id, 'username': u.username, 'roles': u.roles, 'enabled': u.enabled}
                             for u in self.users.values()]
                    response_body = json.dumps(users)
                else:
                    status = '403 Forbidden'
                    response_body = '{"error": "Forbidden"}'

            elif path == '/users' and method == 'POST':
                # Admin only
                token = headers.get('authorization', '').replace('Bearer ', '')
                user = self.validate_token(token)
                if user and self.check_permission(user, '*'):
                    new_user = self.create_user(
                        body.get('username'),
                        body.get('password'),
                        body.get('email', ''),
                        body.get('roles', [])
                    )
                    if new_user:
                        response_body = json.dumps({'id': new_user.id, 'username': new_user.username})
                    else:
                        status = '400 Bad Request'
                        response_body = '{"error": "User already exists"}'
                else:
                    status = '403 Forbidden'
                    response_body = '{"error": "Forbidden"}'

            elif path == '/stats':
                response_body = json.dumps(self.get_stats())

            else:
                status = '404 Not Found'
                response_body = '{"error": "Not found"}'

        except Exception as e:
            logger.error(f"Request error: {e}")
            status = '500 Internal Server Error'
            response_body = json.dumps({'error': str(e)})

        response = f"HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {len(response_body)}\r\n\r\n{response_body}"
        writer.write(response.encode())
        await writer.drain()
        writer.close()

    async def run(self, port: int = 9000):
        """Run auth server"""
        server = await asyncio.start_server(
            self.handle_request, '0.0.0.0', port
        )

        logger.info(f"Auth Server listening on port {port}")
        logger.info(f"  Default admin: admin/blackroad")

        async with server:
            await server.serve_forever()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9000

    auth = AuthServer()
    asyncio.run(auth.run(port))
AUTH_EOF

chmod +x "$AUTH_DIR/auth_server.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ CLI TOOL                                                                    ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "${GREEN}[2/2] Creating CLI...${NC}"

cat > "$HOME/br-auth" << 'CLI_EOF'
#!/bin/bash
# br-auth - Identity & Access Management CLI
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
NC='\033[0m'

AUTH_DIR="$HOME/.blackroad/auth"
AUTH_URL="http://localhost:9000"
TOKEN_FILE="$AUTH_DIR/.token"

cmd="${1:-help}"
shift 2>/dev/null

# Helper to get stored token
get_token() {
    [ -f "$TOKEN_FILE" ] && cat "$TOKEN_FILE"
}

case "$cmd" in
    start)
        echo -e "${PINK}Starting Auth Server...${NC}"
        nohup python3 "$AUTH_DIR/auth_server.py" > "$AUTH_DIR/logs/auth.log" 2>&1 &
        echo $! > "$AUTH_DIR/auth.pid"
        sleep 1
        echo -e "${GREEN}Auth Server started (PID: $(cat "$AUTH_DIR/auth.pid"))${NC}"
        echo "  API: $AUTH_URL"
        echo "  Default: admin/blackroad"
        ;;
    stop)
        if [ -f "$AUTH_DIR/auth.pid" ]; then
            kill $(cat "$AUTH_DIR/auth.pid") 2>/dev/null
            rm "$AUTH_DIR/auth.pid"
            echo -e "${AMBER}Auth Server stopped${NC}"
        fi
        ;;
    status)
        if [ -f "$AUTH_DIR/auth.pid" ] && kill -0 $(cat "$AUTH_DIR/auth.pid") 2>/dev/null; then
            echo -e "${GREEN}●${NC} Auth Server running"
            curl -s "$AUTH_URL/stats" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  Users: {data['users']}, API Keys: {data['api_keys']}, Sessions: {data['active_sessions']}\")
print(f\"  Logins: {data['logins']}, API Calls: {data['api_calls']}, Failed: {data['failed_auth']}\")
" 2>/dev/null
        else
            echo -e "${RED}○${NC} Auth Server not running"
        fi
        ;;
    login)
        username="${1:-admin}"
        echo -n "Password: "
        read -s password
        echo ""

        result=$(curl -s -X POST "$AUTH_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$username\",\"password\":\"$password\"}")

        if echo "$result" | grep -q "access_token"; then
            echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" > "$TOKEN_FILE"
            echo -e "${GREEN}Login successful!${NC}"
            echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  User: {data['user']['username']}\")
print(f\"  Roles: {', '.join(data['user']['roles'])}\")
print(f\"  Expires: {data['expires_in']}s\")
"
        else
            echo -e "${RED}Login failed${NC}"
            echo "$result"
        fi
        ;;
    logout)
        token=$(get_token)
        if [ -n "$token" ]; then
            curl -s -X POST "$AUTH_URL/auth/logout" \
                -H "Authorization: Bearer $token"
            rm -f "$TOKEN_FILE"
            echo -e "${AMBER}Logged out${NC}"
        else
            echo "Not logged in"
        fi
        ;;
    whoami)
        token=$(get_token)
        if [ -z "$token" ]; then
            echo "Not logged in. Run: br-auth login"
            exit 1
        fi

        curl -s -H "Authorization: Bearer $token" "$AUTH_URL/auth/validate" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('valid'):
    print(f\"User: {data['user']['username']}\")
    print(f\"ID: {data['user']['id']}\")
    print(f\"Roles: {', '.join(data['user']['roles'])}\")
else:
    print('Session expired. Run: br-auth login')
"
        ;;
    users)
        token=$(get_token)
        curl -s -H "Authorization: Bearer $token" "$AUTH_URL/users" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list):
    print(f'{\"USERNAME\":<20} {\"ROLES\":<30} {\"ENABLED\":<10}')
    for u in data:
        roles = ', '.join(u['roles'])
        enabled = '✓' if u['enabled'] else '✗'
        print(f'{u[\"username\"]:<20} {roles:<30} {enabled:<10}')
else:
    print(data)
"
        ;;
    create-user)
        username="$1"; password="$2"; roles="${3:-developer}"
        if [ -z "$username" ] || [ -z "$password" ]; then
            echo "Usage: br-auth create-user <username> <password> [roles]"
            exit 1
        fi
        token=$(get_token)
        curl -s -X POST "$AUTH_URL/users" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$username\",\"password\":\"$password\",\"roles\":[\"$roles\"]}" | python3 -m json.tool
        ;;
    create-key)
        name="${1:-api-key}"
        token=$(get_token)
        result=$(curl -s -X POST "$AUTH_URL/auth/apikey" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$name\"}")

        if echo "$result" | grep -q "key"; then
            echo -e "${GREEN}API Key created:${NC}"
            echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  Key: {data['key']}\")
print(f\"  ID: {data['key_id']}\")
print(f\"\\n  Save this key - it won't be shown again!\")
"
        else
            echo -e "${RED}Failed to create key${NC}"
            echo "$result"
        fi
        ;;
    validate-key)
        key="$1"
        if [ -z "$key" ]; then
            echo "Usage: br-auth validate-key <api-key>"
            exit 1
        fi
        curl -s -H "X-API-Key: $key" "$AUTH_URL/auth/apikey/validate" | python3 -m json.tool
        ;;
    help|*)
        echo -e "${PINK}br-auth - Identity & Access Management${NC}"
        echo ""
        echo "Server:"
        echo "  start                      Start auth server"
        echo "  stop                       Stop auth server"
        echo "  status                     Show status"
        echo ""
        echo "Authentication:"
        echo "  login [username]           Login (prompts for password)"
        echo "  logout                     Logout current session"
        echo "  whoami                     Show current user"
        echo ""
        echo "User Management:"
        echo "  users                      List all users"
        echo "  create-user <u> <p> [r]    Create user"
        echo ""
        echo "API Keys:"
        echo "  create-key [name]          Create API key"
        echo "  validate-key <key>         Validate API key"
        ;;
esac
CLI_EOF

chmod +x "$HOME/br-auth"

echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Identity & Access Management installed!${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${AMBER}Features:${NC}"
echo "  - JWT tokens with refresh"
echo "  - API key management"
echo "  - Role-based access control (RBAC)"
echo "  - Password hashing (PBKDF2)"
echo "  - Session management"
echo "  - Audit logging"
echo ""
echo -e "${AMBER}Roles:${NC} admin, operator, developer, service, readonly"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-auth start"
echo "  ~/br-auth login admin    # password: blackroad"
echo "  ~/br-auth whoami"
echo "  ~/br-auth create-key my-service"
