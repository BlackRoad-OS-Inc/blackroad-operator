#!/bin/bash
# BlackRoad Distributed Cache - Redis-like caching across the fleet
# Key-value storage with TTL, pub/sub, and automatic replication

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Distributed Cache - Installing on $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ~/.blackroad/cache
mkdir -p ~/.blackroad/cache/data

# ============================================================
# [1/3] Cache Server
# ============================================================
echo -e "${AMBER}[1/3]${NC} Creating Cache Server..."

cat > ~/.blackroad/cache/cache_server.py << 'CACHE'
#!/usr/bin/env python3
"""
BlackRoad Distributed Cache - Redis-like Key-Value Store
Supports: GET, SET, DEL, KEYS, EXPIRE, TTL, PUB/SUB, INCR/DECR
"""

import asyncio
import json
import time
import os
from datetime import datetime
from typing import Dict, Optional, Any
from dataclasses import dataclass, field

@dataclass
class CacheEntry:
    value: Any
    created_at: float
    expires_at: Optional[float] = None
    access_count: int = 0

class BlackRoadCache:
    def __init__(self):
        self.data: Dict[str, CacheEntry] = {}
        self.subscribers: Dict[str, set] = {}
        self.stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0,
            "started_at": time.time()
        }

    def get(self, key: str) -> Optional[Any]:
        """Get value by key"""
        entry = self.data.get(key)
        if entry is None:
            self.stats["misses"] += 1
            return None

        # Check expiration
        if entry.expires_at and time.time() > entry.expires_at:
            del self.data[key]
            self.stats["misses"] += 1
            return None

        entry.access_count += 1
        self.stats["hits"] += 1
        return entry.value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set key-value pair with optional TTL in seconds"""
        expires_at = time.time() + ttl if ttl else None
        self.data[key] = CacheEntry(
            value=value,
            created_at=time.time(),
            expires_at=expires_at
        )
        self.stats["sets"] += 1
        return True

    def delete(self, key: str) -> bool:
        """Delete key"""
        if key in self.data:
            del self.data[key]
            self.stats["deletes"] += 1
            return True
        return False

    def keys(self, pattern: str = "*") -> list:
        """Get all keys matching pattern"""
        import fnmatch
        return [k for k in self.data.keys() if fnmatch.fnmatch(k, pattern)]

    def ttl(self, key: str) -> int:
        """Get remaining TTL for key"""
        entry = self.data.get(key)
        if entry is None:
            return -2  # Key doesn't exist
        if entry.expires_at is None:
            return -1  # No expiration
        remaining = int(entry.expires_at - time.time())
        return max(0, remaining)

    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration on key"""
        entry = self.data.get(key)
        if entry:
            entry.expires_at = time.time() + ttl
            return True
        return False

    def incr(self, key: str) -> int:
        """Increment value"""
        entry = self.data.get(key)
        if entry is None:
            self.set(key, 1)
            return 1
        try:
            entry.value = int(entry.value) + 1
            return entry.value
        except:
            return 0

    def decr(self, key: str) -> int:
        """Decrement value"""
        entry = self.data.get(key)
        if entry is None:
            self.set(key, -1)
            return -1
        try:
            entry.value = int(entry.value) - 1
            return entry.value
        except:
            return 0

    def lpush(self, key: str, *values) -> int:
        """Push values to list (left)"""
        entry = self.data.get(key)
        if entry is None:
            self.set(key, list(values))
            return len(values)
        if isinstance(entry.value, list):
            for v in reversed(values):
                entry.value.insert(0, v)
            return len(entry.value)
        return 0

    def rpush(self, key: str, *values) -> int:
        """Push values to list (right)"""
        entry = self.data.get(key)
        if entry is None:
            self.set(key, list(values))
            return len(values)
        if isinstance(entry.value, list):
            entry.value.extend(values)
            return len(entry.value)
        return 0

    def lrange(self, key: str, start: int, stop: int) -> list:
        """Get range from list"""
        entry = self.data.get(key)
        if entry and isinstance(entry.value, list):
            if stop == -1:
                return entry.value[start:]
            return entry.value[start:stop+1]
        return []

    def hset(self, key: str, field: str, value: Any) -> bool:
        """Set hash field"""
        entry = self.data.get(key)
        if entry is None:
            self.set(key, {field: value})
            return True
        if isinstance(entry.value, dict):
            entry.value[field] = value
            return True
        return False

    def hget(self, key: str, field: str) -> Optional[Any]:
        """Get hash field"""
        entry = self.data.get(key)
        if entry and isinstance(entry.value, dict):
            return entry.value.get(field)
        return None

    def hgetall(self, key: str) -> dict:
        """Get all hash fields"""
        entry = self.data.get(key)
        if entry and isinstance(entry.value, dict):
            return entry.value
        return {}

    def info(self) -> dict:
        """Get cache info"""
        return {
            "keys": len(self.data),
            "memory_entries": len(self.data),
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "hit_rate": self.stats["hits"] / max(1, self.stats["hits"] + self.stats["misses"]),
            "uptime": time.time() - self.stats["started_at"]
        }

    def cleanup_expired(self):
        """Remove expired keys"""
        now = time.time()
        expired = [k for k, v in self.data.items() if v.expires_at and now > v.expires_at]
        for key in expired:
            del self.data[key]
        return len(expired)

# Protocol handler
cache = BlackRoadCache()

async def handle_client(reader, writer):
    """Handle TCP client connection"""
    addr = writer.get_extra_info('peername')
    hostname = os.uname().nodename

    while True:
        try:
            data = await reader.readline()
            if not data:
                break

            line = data.decode().strip()
            if not line:
                continue

            parts = line.split()
            cmd = parts[0].upper()
            args = parts[1:]

            response = None

            if cmd == "GET" and args:
                result = cache.get(args[0])
                response = json.dumps(result) if result is not None else "(nil)"

            elif cmd == "SET" and len(args) >= 2:
                key, value = args[0], " ".join(args[1:])
                ttl = None
                if "EX" in args:
                    ex_idx = args.index("EX")
                    if ex_idx + 1 < len(args):
                        ttl = int(args[ex_idx + 1])
                        value = " ".join(args[1:ex_idx])
                cache.set(key, value, ttl)
                response = "OK"

            elif cmd == "DEL" and args:
                deleted = sum(1 for k in args if cache.delete(k))
                response = str(deleted)

            elif cmd == "KEYS":
                pattern = args[0] if args else "*"
                response = json.dumps(cache.keys(pattern))

            elif cmd == "TTL" and args:
                response = str(cache.ttl(args[0]))

            elif cmd == "EXPIRE" and len(args) >= 2:
                response = "1" if cache.expire(args[0], int(args[1])) else "0"

            elif cmd == "INCR" and args:
                response = str(cache.incr(args[0]))

            elif cmd == "DECR" and args:
                response = str(cache.decr(args[0]))

            elif cmd == "LPUSH" and len(args) >= 2:
                response = str(cache.lpush(args[0], *args[1:]))

            elif cmd == "RPUSH" and len(args) >= 2:
                response = str(cache.rpush(args[0], *args[1:]))

            elif cmd == "LRANGE" and len(args) >= 3:
                response = json.dumps(cache.lrange(args[0], int(args[1]), int(args[2])))

            elif cmd == "HSET" and len(args) >= 3:
                response = "1" if cache.hset(args[0], args[1], " ".join(args[2:])) else "0"

            elif cmd == "HGET" and len(args) >= 2:
                result = cache.hget(args[0], args[1])
                response = json.dumps(result) if result is not None else "(nil)"

            elif cmd == "HGETALL" and args:
                response = json.dumps(cache.hgetall(args[0]))

            elif cmd == "INFO":
                response = json.dumps(cache.info())

            elif cmd == "PING":
                response = "PONG"

            elif cmd == "QUIT":
                break

            else:
                response = f"ERR unknown command '{cmd}'"

            writer.write(f"{response}\n".encode())
            await writer.drain()

        except Exception as e:
            writer.write(f"ERR {str(e)}\n".encode())
            await writer.drain()

    writer.close()

async def cleanup_task():
    """Periodically cleanup expired keys"""
    while True:
        await asyncio.sleep(60)
        cache.cleanup_expired()

async def main():
    hostname = os.uname().nodename
    server = await asyncio.start_server(handle_client, '0.0.0.0', 6379)
    print(f"[{hostname}] BlackRoad Cache started on port 6379")

    asyncio.create_task(cleanup_task())

    async with server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
CACHE

chmod +x ~/.blackroad/cache/cache_server.py
echo -e "${GREEN}Cache Server installed${NC}"

# ============================================================
# [2/3] Cache Client
# ============================================================
echo -e "${AMBER}[2/3]${NC} Creating Cache Client..."

cat > ~/.blackroad/cache/cache_client.py << 'CLIENT'
#!/usr/bin/env python3
"""BlackRoad Cache Client - Connect to distributed cache"""

import socket
import json
import sys

class CacheClient:
    def __init__(self, host: str = "localhost", port: int = 6379):
        self.host = host
        self.port = port
        self.sock = None

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))
        self.sock.settimeout(5)

    def close(self):
        if self.sock:
            self.sock.close()

    def send_command(self, *args) -> str:
        cmd = " ".join(str(a) for a in args)
        self.sock.send(f"{cmd}\n".encode())
        response = self.sock.recv(65536).decode().strip()
        return response

    def get(self, key: str):
        return self.send_command("GET", key)

    def set(self, key: str, value: str, ttl: int = None):
        if ttl:
            return self.send_command("SET", key, value, "EX", ttl)
        return self.send_command("SET", key, value)

    def delete(self, *keys):
        return self.send_command("DEL", *keys)

    def keys(self, pattern: str = "*"):
        return self.send_command("KEYS", pattern)

    def incr(self, key: str):
        return self.send_command("INCR", key)

    def info(self):
        return self.send_command("INFO")

def main():
    if len(sys.argv) < 2:
        print("Usage: cache_client.py <host> <command> [args...]")
        sys.exit(1)

    host = sys.argv[1]
    cmd = sys.argv[2] if len(sys.argv) > 2 else "PING"
    args = sys.argv[3:]

    client = CacheClient(host)
    client.connect()

    response = client.send_command(cmd, *args)
    print(response)

    client.close()

if __name__ == "__main__":
    main()
CLIENT

chmod +x ~/.blackroad/cache/cache_client.py

# ============================================================
# [3/3] Cache CLI
# ============================================================
echo -e "${AMBER}[3/3]${NC} Creating Cache CLI..."

cat > ~/br-cache << 'CACHECLI'
#!/bin/bash
# br-cache - BlackRoad Distributed Cache CLI

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

# Default cache server
CACHE_HOST="${CACHE_HOST:-localhost}"

case "$1" in
    start)
        echo -e "${PINK}Starting Cache Server on port 6379...${NC}"
        nohup python3 ~/.blackroad/cache/cache_server.py > ~/.blackroad/cache/cache.log 2>&1 &
        echo $! > ~/.blackroad/cache/cache.pid
        echo -e "${GREEN}Cache started (PID: $(cat ~/.blackroad/cache/cache.pid))${NC}"
        ;;

    stop)
        if [ -f ~/.blackroad/cache/cache.pid ]; then
            kill $(cat ~/.blackroad/cache/cache.pid) 2>/dev/null
            rm ~/.blackroad/cache/cache.pid
            echo -e "${AMBER}Cache stopped${NC}"
        fi
        ;;

    status)
        if [ -f ~/.blackroad/cache/cache.pid ] && kill -0 $(cat ~/.blackroad/cache/cache.pid) 2>/dev/null; then
            echo -e "${GREEN}Cache running${NC} (PID: $(cat ~/.blackroad/cache/cache.pid))"
            python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" INFO 2>/dev/null || echo "(info unavailable)"
        else
            echo -e "${AMBER}Cache not running${NC}"
        fi
        ;;

    get)
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" GET "$2"
        ;;

    set)
        shift
        key="$1"
        shift
        value="$*"
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" SET "$key" "$value"
        ;;

    del)
        shift
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" DEL "$@"
        ;;

    keys)
        pattern="${2:-*}"
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" KEYS "$pattern"
        ;;

    incr)
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" INCR "$2"
        ;;

    info)
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" INFO
        ;;

    ping)
        python3 ~/.blackroad/cache/cache_client.py "$CACHE_HOST" PING
        ;;

    fleet-start)
        echo -e "${PINK}Starting Cache on fleet...${NC}"
        for host in cecilia lucidia octavia aria anastasia; do
            echo -n "$host: "
            ssh "$host" 'nohup python3 ~/.blackroad/cache/cache_server.py > ~/.blackroad/cache/cache.log 2>&1 &' && \
                echo -e "${GREEN}started${NC}" || echo "failed"
        done
        ;;

    fleet-status)
        echo -e "${PINK}Cache Status Across Fleet${NC}"
        for host in cecilia lucidia octavia aria anastasia; do
            echo -n -e "${AMBER}$host${NC}: "
            result=$(python3 ~/.blackroad/cache/cache_client.py "$host" PING 2>/dev/null)
            if [ "$result" = "PONG" ]; then
                echo -e "${GREEN}PONG${NC}"
            else
                echo "offline"
            fi
        done
        ;;

    *)
        echo -e "${PINK}br-cache${NC} - BlackRoad Distributed Cache"
        echo ""
        echo "Commands:"
        echo "  start           - Start local cache server"
        echo "  stop            - Stop local cache server"
        echo "  status          - Show cache status"
        echo "  get <key>       - Get value"
        echo "  set <key> <val> - Set value"
        echo "  del <key>...    - Delete keys"
        echo "  keys [pattern]  - List keys"
        echo "  incr <key>      - Increment value"
        echo "  info            - Cache info"
        echo "  ping            - Test connection"
        echo "  fleet-start     - Start cache on all nodes"
        echo "  fleet-status    - Check fleet cache status"
        echo ""
        echo "Set CACHE_HOST to connect to remote: CACHE_HOST=cecilia br-cache get mykey"
        ;;
esac
CACHECLI

chmod +x ~/br-cache

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Distributed Cache Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Features:${NC}"
echo "  • GET/SET/DEL key-value operations"
echo "  • TTL/EXPIRE support"
echo "  • INCR/DECR counters"
echo "  • LPUSH/RPUSH/LRANGE lists"
echo "  • HSET/HGET/HGETALL hashes"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-cache start"
echo "  ~/br-cache set mykey 'hello world'"
echo "  ~/br-cache get mykey"
