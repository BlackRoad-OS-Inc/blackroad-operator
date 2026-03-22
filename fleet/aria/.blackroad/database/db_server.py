#!/usr/bin/env python3
"""
BlackRoad Distributed Database - SQLite cluster with replication
Features: SQL interface, write-ahead log, leader election, read replicas
"""

import asyncio
import json
import sqlite3
import time
import logging
import hashlib
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from enum import Enum
import threading

logging.basicConfig(level=logging.INFO, format='%(asctime)s - DB - %(message)s')
logger = logging.getLogger(__name__)

DB_DIR = Path.home() / '.blackroad' / 'database'
DATA_DIR = DB_DIR / 'data'
WAL_DIR = DB_DIR / 'wal'

# Cluster nodes
NODES = ['cecilia', 'lucidia', 'octavia', 'aria']

class NodeRole(Enum):
    LEADER = "leader"
    FOLLOWER = "follower"
    CANDIDATE = "candidate"

@dataclass
class WALEntry:
    sequence: int
    timestamp: float
    operation: str
    sql: str
    params: tuple
    checksum: str

@dataclass
class Database:
    name: str
    path: Path
    connection: sqlite3.Connection = None

class DistributedDB:
    def __init__(self, node_id: str = None):
        self.node_id = node_id or os.uname().nodename
        self.role = NodeRole.FOLLOWER
        self.leader = None
        self.term = 0
        self.databases: Dict[str, Database] = {}
        self.wal_sequence = 0
        self.wal_file = WAL_DIR / f"{self.node_id}.wal"
        self.peers: Dict[str, Tuple[str, int]] = {}
        self.stats = {
            'queries': 0,
            'writes': 0,
            'reads': 0,
            'replicated': 0
        }

        DATA_DIR.mkdir(parents=True, exist_ok=True)
        WAL_DIR.mkdir(parents=True, exist_ok=True)

        self._init_system_db()
        self._load_wal()

    def _init_system_db(self):
        """Initialize system database"""
        system_db = DATA_DIR / 'system.db'
        conn = sqlite3.connect(str(system_db))
        conn.execute('''CREATE TABLE IF NOT EXISTS _databases (
            name TEXT PRIMARY KEY,
            created_at REAL,
            size_bytes INTEGER DEFAULT 0
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS _tables (
            database TEXT,
            name TEXT,
            sql TEXT,
            PRIMARY KEY (database, name)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS _cluster (
            node_id TEXT PRIMARY KEY,
            role TEXT,
            last_heartbeat REAL,
            wal_sequence INTEGER
        )''')
        conn.commit()

        self.databases['system'] = Database('system', system_db, conn)

    def _load_wal(self):
        """Load WAL and replay if needed"""
        if self.wal_file.exists():
            with open(self.wal_file) as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        self.wal_sequence = max(self.wal_sequence, entry['sequence'])
                    except:
                        pass
            logger.info(f"Loaded WAL, sequence at {self.wal_sequence}")

    def _write_wal(self, operation: str, sql: str, params: tuple = ()):
        """Write to WAL"""
        self.wal_sequence += 1
        entry = WALEntry(
            sequence=self.wal_sequence,
            timestamp=time.time(),
            operation=operation,
            sql=sql,
            params=params,
            checksum=hashlib.sha256(sql.encode()).hexdigest()[:16]
        )

        with open(self.wal_file, 'a') as f:
            f.write(json.dumps({
                'sequence': entry.sequence,
                'timestamp': entry.timestamp,
                'operation': entry.operation,
                'sql': entry.sql,
                'params': list(entry.params),
                'checksum': entry.checksum
            }) + '\n')

        return entry

    def create_database(self, name: str) -> bool:
        """Create a new database"""
        if name in self.databases:
            return False

        db_path = DATA_DIR / f"{name}.db"
        conn = sqlite3.connect(str(db_path))

        self.databases[name] = Database(name, db_path, conn)

        # Register in system
        self.databases['system'].connection.execute(
            'INSERT INTO _databases VALUES (?, ?, 0)',
            (name, time.time())
        )
        self.databases['system'].connection.commit()

        self._write_wal('CREATE_DATABASE', f"CREATE DATABASE {name}")
        logger.info(f"Created database: {name}")
        return True

    def drop_database(self, name: str) -> bool:
        """Drop a database"""
        if name not in self.databases or name == 'system':
            return False

        db = self.databases[name]
        db.connection.close()
        db.path.unlink()
        del self.databases[name]

        self.databases['system'].connection.execute(
            'DELETE FROM _databases WHERE name = ?', (name,)
        )
        self.databases['system'].connection.commit()

        self._write_wal('DROP_DATABASE', f"DROP DATABASE {name}")
        return True

    def use_database(self, name: str) -> Optional[Database]:
        """Get database connection"""
        if name not in self.databases:
            # Try to load
            db_path = DATA_DIR / f"{name}.db"
            if db_path.exists():
                conn = sqlite3.connect(str(db_path))
                self.databases[name] = Database(name, db_path, conn)

        return self.databases.get(name)

    def execute(self, database: str, sql: str, params: tuple = ()) -> dict:
        """Execute SQL statement"""
        db = self.use_database(database)
        if not db:
            return {'error': f'Database not found: {database}'}

        self.stats['queries'] += 1
        sql_upper = sql.strip().upper()

        try:
            cursor = db.connection.cursor()

            # Determine if this is a write operation
            is_write = sql_upper.startswith(('INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'))

            if is_write:
                # Only leader can accept writes
                if self.role != NodeRole.LEADER and self.leader:
                    return {'error': 'Not leader', 'leader': self.leader}

                self.stats['writes'] += 1
                self._write_wal('EXECUTE', sql, params)

                cursor.execute(sql, params)
                db.connection.commit()

                # Track table in system
                if sql_upper.startswith('CREATE TABLE'):
                    table_name = sql.split()[2].strip('(').split('(')[0]
                    self.databases['system'].connection.execute(
                        'INSERT OR REPLACE INTO _tables VALUES (?, ?, ?)',
                        (database, table_name, sql)
                    )
                    self.databases['system'].connection.commit()

                return {
                    'status': 'ok',
                    'rows_affected': cursor.rowcount,
                    'last_rowid': cursor.lastrowid
                }
            else:
                # Read query
                self.stats['reads'] += 1
                cursor.execute(sql, params)

                if sql_upper.startswith('SELECT'):
                    columns = [desc[0] for desc in cursor.description] if cursor.description else []
                    rows = cursor.fetchall()
                    return {
                        'status': 'ok',
                        'columns': columns,
                        'rows': rows,
                        'count': len(rows)
                    }
                else:
                    return {'status': 'ok'}

        except sqlite3.Error as e:
            return {'error': str(e)}

    def get_tables(self, database: str) -> List[str]:
        """Get tables in database"""
        result = self.execute(database, "SELECT name FROM sqlite_master WHERE type='table'")
        if 'rows' in result:
            return [row[0] for row in result['rows']]
        return []

    def describe_table(self, database: str, table: str) -> List[dict]:
        """Describe table schema"""
        result = self.execute(database, f"PRAGMA table_info({table})")
        if 'rows' in result:
            return [
                {'name': row[1], 'type': row[2], 'nullable': not row[3], 'pk': bool(row[5])}
                for row in result['rows']
            ]
        return []

    def replicate_to(self, peer: str, from_sequence: int = 0) -> int:
        """Send WAL entries to peer for replication"""
        entries = []
        if self.wal_file.exists():
            with open(self.wal_file) as f:
                for line in f:
                    entry = json.loads(line)
                    if entry['sequence'] > from_sequence:
                        entries.append(entry)

        # In a real implementation, would send via network
        self.stats['replicated'] += len(entries)
        return len(entries)

    def get_status(self) -> dict:
        """Get cluster status"""
        return {
            'node_id': self.node_id,
            'role': self.role.value,
            'leader': self.leader,
            'term': self.term,
            'wal_sequence': self.wal_sequence,
            'databases': list(self.databases.keys()),
            'stats': self.stats
        }

    async def handle_client(self, reader, writer):
        """Handle SQL client connection"""
        addr = writer.get_extra_info('peername')
        logger.debug(f"Client connected: {addr}")

        current_db = 'system'

        try:
            while True:
                data = await reader.read(8192)
                if not data:
                    break

                try:
                    request = json.loads(data.decode())
                    response = self.process_request(request, current_db)

                    # Track USE DATABASE
                    if request.get('cmd') == 'use':
                        current_db = request.get('database', current_db)

                    writer.write(json.dumps(response).encode() + b'\n')
                    await writer.drain()

                except json.JSONDecodeError:
                    # Try as raw SQL
                    sql = data.decode().strip()
                    if sql:
                        response = self.execute(current_db, sql)
                        writer.write(json.dumps(response).encode() + b'\n')
                        await writer.drain()

        except Exception as e:
            logger.error(f"Client error: {e}")
        finally:
            writer.close()

    def process_request(self, request: dict, current_db: str) -> dict:
        """Process client request"""
        cmd = request.get('cmd', 'query')

        if cmd == 'query' or cmd == 'execute':
            db = request.get('database', current_db)
            sql = request.get('sql', '')
            params = tuple(request.get('params', []))
            return self.execute(db, sql, params)

        elif cmd == 'use':
            db_name = request.get('database')
            if self.use_database(db_name):
                return {'status': 'ok', 'database': db_name}
            return {'error': f'Database not found: {db_name}'}

        elif cmd == 'create_database':
            name = request.get('name')
            if self.create_database(name):
                return {'status': 'ok', 'database': name}
            return {'error': f'Database already exists: {name}'}

        elif cmd == 'drop_database':
            name = request.get('name')
            if self.drop_database(name):
                return {'status': 'ok'}
            return {'error': f'Cannot drop database: {name}'}

        elif cmd == 'list_databases':
            return {'status': 'ok', 'databases': list(self.databases.keys())}

        elif cmd == 'list_tables':
            db = request.get('database', current_db)
            return {'status': 'ok', 'tables': self.get_tables(db)}

        elif cmd == 'describe':
            db = request.get('database', current_db)
            table = request.get('table')
            return {'status': 'ok', 'schema': self.describe_table(db, table)}

        elif cmd == 'status':
            return {'status': 'ok', **self.get_status()}

        return {'error': f'Unknown command: {cmd}'}

    async def api_handler(self, reader, writer):
        """HTTP API handler"""
        data = await reader.read(4096)
        request = data.decode()

        lines = request.split('\r\n')
        method, path, _ = lines[0].split(' ', 2)

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

        if path == '/status':
            response_body = json.dumps(self.get_status(), indent=2)

        elif path == '/databases':
            dbs = []
            for name, db in self.databases.items():
                tables = self.get_tables(name)
                dbs.append({'name': name, 'tables': len(tables)})
            response_body = json.dumps(dbs, indent=2)

        elif path.startswith('/database/') and '/tables' in path:
            db_name = path.split('/')[2]
            tables = self.get_tables(db_name)
            response_body = json.dumps({'tables': tables}, indent=2)

        elif path == '/query' and method == 'POST':
            result = self.execute(
                body.get('database', 'system'),
                body.get('sql', ''),
                tuple(body.get('params', []))
            )
            response_body = json.dumps(result, indent=2)

        else:
            status = '404 Not Found'
            response_body = '{"error": "Not found"}'

        response = f"HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {len(response_body)}\r\n\r\n{response_body}"
        writer.write(response.encode())
        await writer.drain()
        writer.close()

    async def run(self, port: int = 5432, api_port: int = 5433):
        """Run database server"""
        sql_server = await asyncio.start_server(
            self.handle_client, '0.0.0.0', port
        )

        api_server = await asyncio.start_server(
            self.api_handler, '0.0.0.0', api_port
        )

        logger.info(f"Database server on port {port}")
        logger.info(f"API server on port {api_port}")

        # Assume leader for now (would implement Raft in production)
        self.role = NodeRole.LEADER
        self.leader = self.node_id

        async with sql_server, api_server:
            await asyncio.gather(
                sql_server.serve_forever(),
                api_server.serve_forever()
            )

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5432
    api_port = int(sys.argv[2]) if len(sys.argv) > 2 else 5433

    db = DistributedDB()
    asyncio.run(db.run(port, api_port))
