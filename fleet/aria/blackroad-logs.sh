#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# blackroad-logs.sh - Centralized Logging Pipeline (ELK-lite)
# Port 5140: Syslog | Port 5141: HTTP Log API | Port 5142: Log Search
# ============================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${AMBER}   BLACKROAD LOGGING PIPELINE${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

LOG_DIR="$HOME/.blackroad/logs"
mkdir -p "$LOG_DIR"/{data,indices,streams}

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ LOG SERVER - Structured logging with search                                ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "\n${GREEN}[1/2] Creating Log Server...${NC}"

cat > "$LOG_DIR/log_server.py" << 'LOG_EOF'
#!/usr/bin/env python3
"""
BlackRoad Logging Pipeline - ELK-lite centralized logging
Features: Structured logs, full-text search, log streams, retention, aggregations
"""

import asyncio
import json
import sqlite3
import time
import logging
import re
import gzip
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Set
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - LOGS - %(message)s')
logger = logging.getLogger(__name__)

LOG_DIR = Path.home() / '.blackroad' / 'logs'
DB_FILE = LOG_DIR / 'data' / 'logs.db'

# Log levels
LEVELS = {'debug': 10, 'info': 20, 'warn': 30, 'warning': 30, 'error': 40, 'critical': 50}

@dataclass
class LogEntry:
    id: str
    timestamp: float
    level: str
    message: str
    source: str = ""
    host: str = ""
    service: str = ""
    tags: List[str] = field(default_factory=list)
    fields: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            '@timestamp': datetime.fromtimestamp(self.timestamp).isoformat(),
            'level': self.level,
            'message': self.message,
            'source': self.source,
            'host': self.host,
            'service': self.service,
            'tags': self.tags,
            'fields': self.fields
        }

class LogServer:
    def __init__(self):
        self.log_count = 0
        self.streams: Dict[str, List[asyncio.Queue]] = defaultdict(list)
        self.retention_days = 7
        self.stats = {
            'total_logs': 0,
            'logs_today': 0,
            'by_level': defaultdict(int),
            'by_service': defaultdict(int),
            'by_host': defaultdict(int)
        }
        self._init_db()
        self._load_stats()

    def _init_db(self):
        """Initialize SQLite for log storage"""
        DB_FILE.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_FILE))

        # Main logs table with FTS
        conn.execute('''CREATE TABLE IF NOT EXISTS logs (
            id TEXT PRIMARY KEY,
            timestamp REAL,
            level TEXT,
            message TEXT,
            source TEXT,
            host TEXT,
            service TEXT,
            tags TEXT,
            fields TEXT
        )''')

        conn.execute('''CREATE INDEX IF NOT EXISTS idx_timestamp ON logs(timestamp)''')
        conn.execute('''CREATE INDEX IF NOT EXISTS idx_level ON logs(level)''')
        conn.execute('''CREATE INDEX IF NOT EXISTS idx_host ON logs(host)''')
        conn.execute('''CREATE INDEX IF NOT EXISTS idx_service ON logs(service)''')

        # Full-text search
        conn.execute('''CREATE VIRTUAL TABLE IF NOT EXISTS logs_fts USING fts5(
            message, source, tags, content=logs, content_rowid=rowid
        )''')

        # Triggers for FTS
        conn.executescript('''
            CREATE TRIGGER IF NOT EXISTS logs_ai AFTER INSERT ON logs BEGIN
                INSERT INTO logs_fts(rowid, message, source, tags)
                VALUES (new.rowid, new.message, new.source, new.tags);
            END;
        ''')

        conn.commit()
        conn.close()

    def _load_stats(self):
        """Load statistics from database"""
        conn = sqlite3.connect(str(DB_FILE))

        # Total count
        row = conn.execute('SELECT COUNT(*) FROM logs').fetchone()
        self.stats['total_logs'] = row[0] if row else 0

        # Today's count
        today_start = datetime.now().replace(hour=0, minute=0, second=0).timestamp()
        row = conn.execute('SELECT COUNT(*) FROM logs WHERE timestamp >= ?', (today_start,)).fetchone()
        self.stats['logs_today'] = row[0] if row else 0

        # By level
        for row in conn.execute('SELECT level, COUNT(*) FROM logs GROUP BY level'):
            self.stats['by_level'][row[0]] = row[1]

        conn.close()

    def _generate_id(self) -> str:
        """Generate unique log ID"""
        import secrets
        self.log_count += 1
        return f"{int(time.time() * 1000)}-{self.log_count:06d}-{secrets.token_hex(4)}"

    def ingest(self, entry: LogEntry) -> str:
        """Ingest a log entry"""
        if not entry.id:
            entry.id = self._generate_id()
        if not entry.timestamp:
            entry.timestamp = time.time()

        # Store in database
        conn = sqlite3.connect(str(DB_FILE))
        conn.execute('''INSERT INTO logs VALUES (?,?,?,?,?,?,?,?,?)''',
            (entry.id, entry.timestamp, entry.level, entry.message,
             entry.source, entry.host, entry.service,
             json.dumps(entry.tags), json.dumps(entry.fields)))
        conn.commit()
        conn.close()

        # Update stats
        self.stats['total_logs'] += 1
        self.stats['logs_today'] += 1
        self.stats['by_level'][entry.level] += 1
        self.stats['by_service'][entry.service] += 1
        self.stats['by_host'][entry.host] += 1

        # Push to streams
        log_dict = entry.to_dict()
        for queue in self.streams.get('*', []):
            queue.put_nowait(log_dict)
        for queue in self.streams.get(entry.service, []):
            queue.put_nowait(log_dict)
        for queue in self.streams.get(entry.host, []):
            queue.put_nowait(log_dict)

        return entry.id

    def search(self, query: str = None, level: str = None, service: str = None,
               host: str = None, start_time: float = None, end_time: float = None,
               limit: int = 100, offset: int = 0) -> List[dict]:
        """Search logs with filters"""
        conn = sqlite3.connect(str(DB_FILE))

        conditions = []
        params = []

        if query:
            # Full-text search
            conditions.append("id IN (SELECT id FROM logs WHERE rowid IN (SELECT rowid FROM logs_fts WHERE logs_fts MATCH ?))")
            params.append(query)

        if level:
            if level.startswith('>='):
                level_val = LEVELS.get(level[2:].lower(), 0)
                level_names = [k for k, v in LEVELS.items() if v >= level_val]
                conditions.append(f"level IN ({','.join('?' * len(level_names))})")
                params.extend(level_names)
            else:
                conditions.append("level = ?")
                params.append(level)

        if service:
            conditions.append("service = ?")
            params.append(service)

        if host:
            conditions.append("host = ?")
            params.append(host)

        if start_time:
            conditions.append("timestamp >= ?")
            params.append(start_time)

        if end_time:
            conditions.append("timestamp <= ?")
            params.append(end_time)

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        sql = f'''SELECT id, timestamp, level, message, source, host, service, tags, fields
                  FROM logs WHERE {where_clause}
                  ORDER BY timestamp DESC LIMIT ? OFFSET ?'''
        params.extend([limit, offset])

        results = []
        for row in conn.execute(sql, params):
            results.append({
                'id': row[0],
                'timestamp': row[1],
                '@timestamp': datetime.fromtimestamp(row[1]).isoformat(),
                'level': row[2],
                'message': row[3],
                'source': row[4],
                'host': row[5],
                'service': row[6],
                'tags': json.loads(row[7]) if row[7] else [],
                'fields': json.loads(row[8]) if row[8] else {}
            })

        conn.close()
        return results

    def aggregate(self, field: str, interval: str = '1h',
                  start_time: float = None, end_time: float = None) -> List[dict]:
        """Aggregate logs by time interval"""
        conn = sqlite3.connect(str(DB_FILE))

        # Parse interval
        interval_seconds = 3600  # default 1h
        if interval.endswith('m'):
            interval_seconds = int(interval[:-1]) * 60
        elif interval.endswith('h'):
            interval_seconds = int(interval[:-1]) * 3600
        elif interval.endswith('d'):
            interval_seconds = int(interval[:-1]) * 86400

        if not start_time:
            start_time = time.time() - 86400  # last 24h
        if not end_time:
            end_time = time.time()

        sql = '''SELECT
                    CAST((timestamp / ?) AS INTEGER) * ? as bucket,
                    COUNT(*) as count,
                    level
                 FROM logs
                 WHERE timestamp >= ? AND timestamp <= ?
                 GROUP BY bucket, level
                 ORDER BY bucket'''

        results = defaultdict(lambda: {'timestamp': 0, 'total': 0, 'by_level': {}})
        for row in conn.execute(sql, (interval_seconds, interval_seconds, start_time, end_time)):
            bucket = row[0]
            results[bucket]['timestamp'] = bucket
            results[bucket]['total'] += row[1]
            results[bucket]['by_level'][row[2]] = row[1]

        conn.close()
        return list(results.values())

    def cleanup(self, days: int = None):
        """Clean up old logs"""
        if days is None:
            days = self.retention_days

        cutoff = time.time() - (days * 86400)
        conn = sqlite3.connect(str(DB_FILE))
        cursor = conn.execute('DELETE FROM logs WHERE timestamp < ?', (cutoff,))
        deleted = cursor.rowcount
        conn.commit()
        conn.close()

        logger.info(f"Cleaned up {deleted} logs older than {days} days")
        return deleted

    async def subscribe(self, stream: str, queue: asyncio.Queue):
        """Subscribe to log stream"""
        self.streams[stream].append(queue)
        try:
            while True:
                log = await queue.get()
                yield log
        finally:
            self.streams[stream].remove(queue)

    async def handle_syslog(self, data: bytes, addr):
        """Handle syslog UDP messages"""
        try:
            message = data.decode().strip()

            # Parse syslog format (simplified)
            # <priority>timestamp hostname service: message
            match = re.match(r'<(\d+)>(.+?) (.+?) (.+?): (.+)', message)
            if match:
                priority = int(match.group(1))
                level = ['debug', 'info', 'warn', 'error', 'critical'][min(priority % 8, 4)]
                entry = LogEntry(
                    id="",
                    timestamp=time.time(),
                    level=level,
                    message=match.group(5),
                    host=match.group(3),
                    service=match.group(4)
                )
            else:
                entry = LogEntry(
                    id="",
                    timestamp=time.time(),
                    level='info',
                    message=message,
                    host=addr[0]
                )

            self.ingest(entry)

        except Exception as e:
            logger.error(f"Syslog parse error: {e}")

    async def handle_http(self, reader, writer):
        """Handle HTTP log requests"""
        data = await reader.read(8192)
        request = data.decode()

        lines = request.split('\r\n')
        first_line = lines[0].split(' ')
        method = first_line[0]
        path = first_line[1] if len(first_line) > 1 else '/'

        # Parse query string
        query_params = {}
        if '?' in path:
            path, query_string = path.split('?', 1)
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    query_params[key] = value

        body = {}
        if '\r\n\r\n' in request:
            body_str = request.split('\r\n\r\n', 1)[1]
            if body_str:
                try:
                    body = json.loads(body_str)
                except:
                    pass

        response_body = ''
        status = '200 OK'
        content_type = 'application/json'

        try:
            if path == '/ingest' and method == 'POST':
                # Ingest single or batch logs
                if isinstance(body, list):
                    ids = []
                    for log in body:
                        entry = LogEntry(
                            id="",
                            timestamp=log.get('timestamp', time.time()),
                            level=log.get('level', 'info'),
                            message=log.get('message', ''),
                            source=log.get('source', ''),
                            host=log.get('host', ''),
                            service=log.get('service', ''),
                            tags=log.get('tags', []),
                            fields=log.get('fields', {})
                        )
                        ids.append(self.ingest(entry))
                    response_body = json.dumps({'ingested': len(ids), 'ids': ids})
                else:
                    entry = LogEntry(
                        id="",
                        timestamp=body.get('timestamp', time.time()),
                        level=body.get('level', 'info'),
                        message=body.get('message', ''),
                        source=body.get('source', ''),
                        host=body.get('host', ''),
                        service=body.get('service', ''),
                        tags=body.get('tags', []),
                        fields=body.get('fields', {})
                    )
                    log_id = self.ingest(entry)
                    response_body = json.dumps({'id': log_id})

            elif path == '/search':
                results = self.search(
                    query=query_params.get('q') or body.get('query'),
                    level=query_params.get('level') or body.get('level'),
                    service=query_params.get('service') or body.get('service'),
                    host=query_params.get('host') or body.get('host'),
                    start_time=float(query_params.get('start', 0)) or body.get('start_time'),
                    end_time=float(query_params.get('end', 0)) or body.get('end_time'),
                    limit=int(query_params.get('limit', 100)),
                    offset=int(query_params.get('offset', 0))
                )
                response_body = json.dumps({'count': len(results), 'logs': results})

            elif path == '/aggregate':
                results = self.aggregate(
                    field=query_params.get('field', 'level'),
                    interval=query_params.get('interval', '1h')
                )
                response_body = json.dumps({'buckets': results})

            elif path == '/stats':
                response_body = json.dumps({
                    'total_logs': self.stats['total_logs'],
                    'logs_today': self.stats['logs_today'],
                    'by_level': dict(self.stats['by_level']),
                    'by_service': dict(self.stats['by_service']),
                    'streams': len(self.streams)
                })

            elif path == '/services':
                response_body = json.dumps(list(self.stats['by_service'].keys()))

            elif path == '/hosts':
                response_body = json.dumps(list(self.stats['by_host'].keys()))

            elif path == '/cleanup' and method == 'POST':
                days = body.get('days', self.retention_days)
                deleted = self.cleanup(days)
                response_body = json.dumps({'deleted': deleted})

            else:
                status = '404 Not Found'
                response_body = '{"error": "Not found"}'

        except Exception as e:
            logger.error(f"HTTP error: {e}")
            status = '500 Internal Server Error'
            response_body = json.dumps({'error': str(e)})

        response = f"HTTP/1.1 {status}\r\nContent-Type: {content_type}\r\nContent-Length: {len(response_body)}\r\n\r\n{response_body}"
        writer.write(response.encode())
        await writer.drain()
        writer.close()

    async def run(self, http_port: int = 5141):
        """Run log server"""
        # HTTP API server
        http_server = await asyncio.start_server(
            self.handle_http, '0.0.0.0', http_port
        )

        logger.info(f"Log Server listening on HTTP port {http_port}")

        # Start cleanup task
        async def cleanup_task():
            while True:
                await asyncio.sleep(3600)  # Every hour
                self.cleanup()

        async with http_server:
            await asyncio.gather(
                http_server.serve_forever(),
                cleanup_task()
            )

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5141

    server = LogServer()
    asyncio.run(server.run(port))
LOG_EOF

chmod +x "$LOG_DIR/log_server.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ CLI TOOL                                                                    ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "${GREEN}[2/2] Creating CLI...${NC}"

cat > "$HOME/br-logs" << 'CLI_EOF'
#!/bin/bash
# br-logs - Centralized Logging CLI
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
NC='\033[0m'

LOG_DIR="$HOME/.blackroad/logs"
LOG_URL="http://localhost:5141"

cmd="${1:-help}"
shift 2>/dev/null

# Color by level
color_level() {
    case "$1" in
        error|critical) echo -e "${RED}$1${NC}" ;;
        warn|warning) echo -e "${YELLOW}$1${NC}" ;;
        info) echo -e "${GREEN}$1${NC}" ;;
        debug) echo -e "${BLUE}$1${NC}" ;;
        *) echo "$1" ;;
    esac
}

case "$cmd" in
    start)
        echo -e "${PINK}Starting Log Server...${NC}"
        nohup python3 "$LOG_DIR/log_server.py" > "$LOG_DIR/server.log" 2>&1 &
        echo $! > "$LOG_DIR/log.pid"
        sleep 1
        echo -e "${GREEN}Log Server started (PID: $(cat "$LOG_DIR/log.pid"))${NC}"
        echo "  HTTP: $LOG_URL"
        ;;
    stop)
        if [ -f "$LOG_DIR/log.pid" ]; then
            kill $(cat "$LOG_DIR/log.pid") 2>/dev/null
            rm "$LOG_DIR/log.pid"
            echo -e "${AMBER}Log Server stopped${NC}"
        fi
        ;;
    status)
        if [ -f "$LOG_DIR/log.pid" ] && kill -0 $(cat "$LOG_DIR/log.pid") 2>/dev/null; then
            echo -e "${GREEN}●${NC} Log Server running"
            curl -s "$LOG_URL/stats" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  Total: {data['total_logs']:,} logs\")
print(f\"  Today: {data['logs_today']:,} logs\")
levels = data.get('by_level', {})
if levels:
    print(f\"  Levels: \" + ', '.join(f'{k}:{v}' for k,v in sorted(levels.items())))
" 2>/dev/null
        else
            echo -e "${RED}○${NC} Log Server not running"
        fi
        ;;
    search)
        query="$*"
        curl -s "$LOG_URL/search?q=$query&limit=50" | python3 -c "
import sys, json
from datetime import datetime
data = json.load(sys.stdin)
for log in data.get('logs', []):
    ts = datetime.fromisoformat(log['@timestamp']).strftime('%H:%M:%S')
    level = log['level'].upper()[:4]
    host = log.get('host', '')[:10]
    svc = log.get('service', '')[:12]
    msg = log['message'][:80]

    # Color by level
    if 'error' in level.lower() or 'crit' in level.lower():
        level = f'\033[38;5;196m{level}\033[0m'
    elif 'warn' in level.lower():
        level = f'\033[38;5;226m{level}\033[0m'
    else:
        level = f'\033[38;5;82m{level}\033[0m'

    print(f'{ts} {level} [{host:<10}] [{svc:<12}] {msg}')
"
        ;;
    tail)
        service="${1:-*}"
        limit="${2:-20}"
        echo -e "${PINK}Last $limit logs${NC} (service: $service)"
        echo ""
        curl -s "$LOG_URL/search?service=$service&limit=$limit" | python3 -c "
import sys, json
from datetime import datetime
data = json.load(sys.stdin)
for log in reversed(data.get('logs', [])):
    ts = datetime.fromisoformat(log['@timestamp']).strftime('%H:%M:%S')
    level = log['level'].upper()[:4]
    host = log.get('host', '')[:10]
    svc = log.get('service', '')[:12]
    msg = log['message'][:100]

    if 'error' in level.lower():
        level = f'\033[38;5;196m{level}\033[0m'
    elif 'warn' in level.lower():
        level = f'\033[38;5;226m{level}\033[0m'
    else:
        level = f'\033[38;5;82m{level}\033[0m'

    print(f'{ts} {level} [{host:<10}] [{svc:<12}] {msg}')
"
        ;;
    send)
        level="${1:-info}"
        message="${*:2}"
        if [ -z "$message" ]; then
            echo "Usage: br-logs send <level> <message>"
            exit 1
        fi
        curl -s -X POST "$LOG_URL/ingest" \
            -H "Content-Type: application/json" \
            -d "{\"level\":\"$level\",\"message\":\"$message\",\"host\":\"$(hostname)\",\"service\":\"cli\"}" | python3 -m json.tool
        ;;
    services)
        echo -e "${PINK}Services with logs:${NC}"
        curl -s "$LOG_URL/services" | python3 -c "
import sys, json
for svc in json.load(sys.stdin):
    print(f'  {svc}')
"
        ;;
    hosts)
        echo -e "${PINK}Hosts with logs:${NC}"
        curl -s "$LOG_URL/hosts" | python3 -c "
import sys, json
for host in json.load(sys.stdin):
    print(f'  {host}')
"
        ;;
    aggregate)
        interval="${1:-1h}"
        curl -s "$LOG_URL/aggregate?interval=$interval" | python3 -c "
import sys, json
from datetime import datetime
data = json.load(sys.stdin)
print(f'{\"TIME\":<20} {\"TOTAL\":<8} {\"BY LEVEL\"}')
for bucket in data.get('buckets', []):
    ts = datetime.fromtimestamp(bucket['timestamp']).strftime('%Y-%m-%d %H:%M')
    levels = ', '.join(f'{k}:{v}' for k,v in bucket.get('by_level', {}).items())
    print(f'{ts:<20} {bucket[\"total\"]:<8} {levels}')
"
        ;;
    fleet)
        echo -e "${PINK}╭─ LOG FLEET STATUS ────────────────────────────────────────────────────────────╮${NC}"
        for host in cecilia lucidia octavia aria; do
            echo -n -e "${PINK}│${NC}  ${BLUE}$host:${NC} "
            result=$(ssh -o ConnectTimeout=3 "$host" 'curl -s http://localhost:5141/stats 2>/dev/null' 2>/dev/null)
            if [ -n "$result" ]; then
                echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"{data['total_logs']:,} total, {data['logs_today']:,} today\")
" 2>/dev/null || echo "offline"
            else
                echo "offline"
            fi
        done
        echo -e "${PINK}╰────────────────────────────────────────────────────────────────────────────────╯${NC}"
        ;;
    help|*)
        echo -e "${PINK}br-logs - Centralized Logging${NC}"
        echo ""
        echo "Server:"
        echo "  start                 Start log server"
        echo "  stop                  Stop log server"
        echo "  status                Show status"
        echo ""
        echo "Querying:"
        echo "  search <query>        Search logs"
        echo "  tail [svc] [n]        Show last N logs"
        echo "  aggregate [interval]  Time-based aggregation"
        echo ""
        echo "Info:"
        echo "  services              List services"
        echo "  hosts                 List hosts"
        echo "  fleet                 Fleet-wide status"
        echo ""
        echo "Send:"
        echo "  send <level> <msg>    Send log entry"
        ;;
esac
CLI_EOF

chmod +x "$HOME/br-logs"

echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Logging Pipeline installed!${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${AMBER}Features:${NC}"
echo "  - Structured JSON logging"
echo "  - Full-text search (FTS5)"
echo "  - Time-based aggregation"
echo "  - Auto-retention cleanup"
echo "  - Real-time log streams"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-logs start"
echo "  ~/br-logs send info 'Hello from CLI'"
echo "  ~/br-logs tail"
echo "  ~/br-logs search error"
